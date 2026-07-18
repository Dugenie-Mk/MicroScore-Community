package com.microscore.scoring_service.service;

import com.microscore.scoring_service.dto.DemandeScoringRequest;
import com.microscore.scoring_service.dto.ScoreDetailResponse;
import com.microscore.scoring_service.dto.ScoreResponse;
import com.microscore.scoring_service.entity.*;
import com.microscore.scoring_service.exception.ScoreNotFoundException;
import com.microscore.scoring_service.exception.ScoringConfigurationException;
import com.microscore.scoring_service.mapper.ScoreMapper;
import com.microscore.scoring_service.repository.DetailScoreRepository;
import com.microscore.scoring_service.repository.ScoreRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ScoringServiceImpl implements ScoringService {

    private final ScoreRepository scoreRepository;
    private final DetailScoreRepository detailScoreRepository;
    private final ScoreMapper scoreMapper;
    private final ParametreDeScoringService parametreDeScoringService;

    private static final String AGE = "Âge";
    private static final String SITUATION_MATRIMONIALE = "Situation matrimoniale";
    private static final String NIVEAU_EDUCATION = "Niveau d'éducation";
    private static final String STABILITE_RESIDENTIELLE = "Stabilité résidentielle";
    private static final String PERSONNES_A_CHARGE = "Nombre de personnes à charge";

    private static final String REVENUS_MENSUELS = "Revenus mensuels nets";
    private static final String CHARGES_FIXES = "Charges fixes";
    private static final String TAUX_ENDETTEMENT = "Taux d'endettement";
    private static final String FLUX_TRESORERIE = "Flux de trésorerie de l'activité";

    private static final String MONTANT_PRET = "Montant du prêt";
    private static final String DUREE_REMBOURSEMENT = "Durée de remboursement";

    private static final String COMPORTEMENT_PRETS = "Comportement sur prêts précédents";
    private static final String PRETS_EN_COURS = "Nombre de prêts en cours";
    private static final String ANCIENNETE_CLIENT = "Ancienneté client microfinance";

    private static final String TYPE_ACTIVITE = "Type d'activité";
    private static final String ANCIENNETE_ENTREPRISE = "Ancienneté de l'entreprise";
    private static final String CHIFFRE_AFFAIRES = "Chiffre d'affaires / bénéfices estimés";
    private static final String SECTEUR_ACTIVITE = "Secteur d'activité";

    private static final String GARANTIE_PERSONNELLE = "Garantie personnelle";
    private static final String GARANTIE_MATERIELLE = "Garantie matérielle";
    private static final String EPARGNE_CONSTITUEE = "Épargne constituée";

    private static final String MOTIVATION = "Motivation et projet clair";
    private static final String REPUTATION = "Réputation dans la communauté";
    private static final String REGULARITE_EPARGNE = "Régularité de l'épargne";


    // ===================== MÉTHODE PRINCIPALE =====================
    @Override
    @Transactional
    public ScoreDetailResponse calculerScore(Long pretId, DemandeScoringRequest request) {

        Map<String, Double> poids = parametreDeScoringService.chargerPoidsActifs();
        List<DetailScore> tousDetails = new ArrayList<>();

        BlocResult profil = calculerBlocProfilSociodemographique(request, poids);
        BlocResult capacite = calculerBlocCapaciteRemboursement(request, poids);
        BlocResult montantDuree = calculerBlocMontantDuree(request, poids);
        BlocResult historique = calculerBlocHistoriqueCredit(request, poids);
        BlocResult activite = calculerBlocActiviteEconomique(request, poids);
        BlocResult garanties = calculerBlocGaranties(request, poids);
        BlocResult comportement = calculerBlocFacteursComportementaux(request, poids);

        double scoreTotal = profil.total + capacite.total + montantDuree.total
                + historique.total + activite.total + garanties.total + comportement.total;

        Score score = Score.builder()
                .pretId(pretId)
                .clientId(request.getClientId())
                .scoreTotal(arrondir(scoreTotal))
                .build();

        Score scoreSauvegarde = scoreRepository.save(score);

        tousDetails.addAll(profil.details);
        tousDetails.addAll(capacite.details);
        tousDetails.addAll(montantDuree.details);
        tousDetails.addAll(historique.details);
        tousDetails.addAll(activite.details);
        tousDetails.addAll(garanties.details);
        tousDetails.addAll(comportement.details);

        tousDetails.forEach(d -> d.setScoreId(scoreSauvegarde.getId()));
        detailScoreRepository.saveAll(tousDetails);

        return scoreMapper.toDetailResponse(scoreSauvegarde, tousDetails);
    }

    @Override
    public ScoreResponse getScoreByPretId(Long pretId) {
        Score score = scoreRepository.findByPretId(pretId)
                .orElseThrow(() -> new ScoreNotFoundException(
                        "Aucun score trouvé pour le prêt id=" + pretId));
        return scoreMapper.toResponse(score);
    }

    @Override
    public ScoreResponse getScoreById(Long scoreId) {
        Score score = scoreRepository.findById(scoreId)
                .orElseThrow(() -> new ScoreNotFoundException(
                        "Aucun score trouvé avec id=" + scoreId));
        return scoreMapper.toResponse(score);
    }

    @Override
    public ScoreDetailResponse getScoreDetailById(Long scoreId) {
        Score score = scoreRepository.findById(scoreId)
                .orElseThrow(() -> new ScoreNotFoundException(
                        "Aucun score trouvé avec id=" + scoreId));
        List<DetailScore> details = detailScoreRepository.findByScoreId(scoreId);
        return scoreMapper.toDetailResponse(score, details);
    }

    @Override
    public List<ScoreResponse> getAllScores() {
        return scoreRepository.findAll().stream()
                .map(scoreMapper::toResponse)
                .toList();
    }

    @Override
    public List<ScoreResponse> getScoresByClientId(Long clientId) {
        return scoreRepository.findByClientIdOrderByDateCalculDesc(clientId).stream()
                .map(scoreMapper::toResponse)
                .toList();
    }

    @Override
    public ScoreDetailResponse getLatestScoreByClientId(Long clientId) {
        List<Score> scores = scoreRepository.findByClientIdOrderByDateCalculDesc(clientId);
        if (scores.isEmpty()) {
            throw new ScoreNotFoundException("Aucun score trouvé pour le client id=" + clientId);
        }
        Score latest = scores.get(0);
        List<DetailScore> details = detailScoreRepository.findByScoreId(latest.getId());
        return scoreMapper.toDetailResponse(latest, details);
    }


    // ===================== BLOC 1 : PROFIL SOCIODÉMOGRAPHIQUE =====================
    private BlocResult calculerBlocProfilSociodemographique(DemandeScoringRequest req,
                                                            Map<String, Double> poids) {
        List<DetailScore> details = new ArrayList<>();
        double total = 0.0;

        double poidsAge = getPoids(poids, AGE);
        int age = req.getAge();
        double pointsAge;
        if (age > 80) {
            pointsAge = poidsAge / 1.25;
        } else if (age < 35) {
            pointsAge = poidsAge / 1.5;
        } else {
            pointsAge = poidsAge;
        }
        total += pointsAge;
        details.add(detail(AGE, poidsAge, pointsAge));

        double poidsSituation = getPoids(poids, SITUATION_MATRIMONIALE);
        double pointsSituation;
        if (req.getSituationMatrimoniale() == SituationMatrimoniale.CELIBATAIRE) {
            pointsSituation = poidsSituation / 1.25;
        } else {
            pointsSituation = poidsSituation;
        }
        total += pointsSituation;
        details.add(detail(SITUATION_MATRIMONIALE, poidsSituation, pointsSituation));

        double poidsEducation = getPoids(poids, NIVEAU_EDUCATION);
        total += poidsEducation;
        details.add(detail(NIVEAU_EDUCATION, poidsEducation, poidsEducation));

        double poidsResidence = getPoids(poids, STABILITE_RESIDENTIELLE);
        Integer ancienneteResidence = req.getAncienneteResidenceMois();
        double pointsResidence;
        if (ancienneteResidence == null) {
            pointsResidence = 0.0;
        } else if (ancienneteResidence >= 60) {
            pointsResidence = poidsResidence;
        } else if (ancienneteResidence >= 24) {
            pointsResidence = poidsResidence * 0.7;
        } else {
            pointsResidence = poidsResidence * 0.4;
        }
        total += pointsResidence;
        details.add(detail(STABILITE_RESIDENTIELLE, poidsResidence, pointsResidence));

        double poidsPersonnes = getPoids(poids, PERSONNES_A_CHARGE);
        int nbPersonnes = req.getNombrePersonnesACharge() == null
                ? 0 : req.getNombrePersonnesACharge();
        double pointsPersonnes;
        if (nbPersonnes <= 2) {
            pointsPersonnes = poidsPersonnes;
        } else if (nbPersonnes <= 4) {
            pointsPersonnes = poidsPersonnes * 0.6;
        } else {
            pointsPersonnes = poidsPersonnes * 0.3;
        }
        total += pointsPersonnes;
        details.add(detail(PERSONNES_A_CHARGE, poidsPersonnes, pointsPersonnes));

        return new BlocResult(total, details);
    }


    // ===================== BLOC 2 : CAPACITÉ DE REMBOURSEMENT =====================
    private BlocResult calculerBlocCapaciteRemboursement(DemandeScoringRequest req,
                                                          Map<String, Double> poids) {
        List<DetailScore> details = new ArrayList<>();
        double total = 0.0;

        double revenu = req.getRevenuMensuelNet();
        double chargesFixes = req.getChargesFixes() == null ? 0.0 : req.getChargesFixes();
        double fluxTresorerie = req.getFluxTresorerieActivite() == null
                ? 0.0 : req.getFluxTresorerieActivite();
        double mensualitePret = req.getMontant() / req.getDureeRemboursementMois();

        double poidsRevenu = getPoids(poids, REVENUS_MENSUELS);
        double ratioMensualiteRevenu = mensualitePret / revenu;
        double pointsRevenu;
        if (ratioMensualiteRevenu > 0.5) {
            pointsRevenu = poidsRevenu * 0.5;
        } else {
            pointsRevenu = poidsRevenu * (1.0 - ratioMensualiteRevenu);
        }
        total += pointsRevenu;
        details.add(detail(REVENUS_MENSUELS, poidsRevenu, pointsRevenu));

        double poidsCharges = getPoids(poids, CHARGES_FIXES);
        double ratioChargesRevenu = chargesFixes / revenu;
        double pointsCharges;
        if (ratioChargesRevenu > 0.5) {
            pointsCharges = poidsCharges * 0.3;
        } else if (ratioChargesRevenu > 0.3) {
            pointsCharges = poidsCharges * 0.6;
        } else {
            pointsCharges = poidsCharges;
        }
        total += pointsCharges;
        details.add(detail(CHARGES_FIXES, poidsCharges, pointsCharges));

        double poidsEndettement = getPoids(poids, TAUX_ENDETTEMENT);
        double tauxEndettement = (chargesFixes + mensualitePret) / revenu;
        double pointsEndettement;
        if (tauxEndettement > 0.5) {
            pointsEndettement = poidsEndettement * 0.3;
        } else if (tauxEndettement >= 0.3) {
            pointsEndettement = poidsEndettement * 0.5;
        } else {
            pointsEndettement = poidsEndettement;
        }
        total += pointsEndettement;
        details.add(detail(TAUX_ENDETTEMENT, poidsEndettement, pointsEndettement));

        double poidsFlux = getPoids(poids, FLUX_TRESORERIE);
        double pointsFlux;
        if (fluxTresorerie <= 0) {
            pointsFlux = poidsFlux * 0.4;
        } else if (fluxTresorerie >= mensualitePret * 2) {
            pointsFlux = poidsFlux;
        } else if (fluxTresorerie >= mensualitePret) {
            pointsFlux = poidsFlux * 0.7;
        } else {
            pointsFlux = poidsFlux * 0.3;
        }
        total += pointsFlux;
        details.add(detail(FLUX_TRESORERIE, poidsFlux, pointsFlux));

        return new BlocResult(total, details);
    }


    // ===================== BLOC 3 : MONTANT ET DURÉE DU PRÊT =====================
    private BlocResult calculerBlocMontantDuree(DemandeScoringRequest req,
                                                Map<String, Double> poids) {
        List<DetailScore> details = new ArrayList<>();
        double total = 0.0;

        double revenu = req.getRevenuMensuelNet();
        double mensualite = req.getMontant() / req.getDureeRemboursementMois();
        double ratio = mensualite / revenu;

        double poidsMontant = getPoids(poids, MONTANT_PRET);
        double pointsMontant;
        if (ratio > 0.5) {
            pointsMontant = poidsMontant * 0.5;
        } else {
            pointsMontant = poidsMontant * (1.0 - ratio);
        }
        total += pointsMontant;
        details.add(detail(MONTANT_PRET, poidsMontant, pointsMontant));

        double poidsDuree = getPoids(poids, DUREE_REMBOURSEMENT);
        double pointsDuree;
        if (ratio > 0.5) {
            pointsDuree = poidsDuree * 0.5;
        } else {
            pointsDuree = poidsDuree * (1.0 - ratio);
        }
        total += pointsDuree;
        details.add(detail(DUREE_REMBOURSEMENT, poidsDuree, pointsDuree));

        return new BlocResult(total, details);
    }


    // ===================== BLOC 4 : HISTORIQUE DE CRÉDIT =====================
    private BlocResult calculerBlocHistoriqueCredit(DemandeScoringRequest req,
                                                    Map<String, Double> poids) {
        List<DetailScore> details = new ArrayList<>();
        double total = 0.0;

        double poidsComportement = getPoids(poids, COMPORTEMENT_PRETS);
        int retards = req.getNombreRetardsAnterieurs() == null
                ? 0 : req.getNombreRetardsAnterieurs();
        double pointsComportement;
        if (retards == 0) {
            pointsComportement = poidsComportement;
        } else if (retards <= 2) {
            pointsComportement = poidsComportement * 0.5;
        } else {
            pointsComportement = poidsComportement * 0.1;
        }
        total += pointsComportement;
        details.add(detail(COMPORTEMENT_PRETS, poidsComportement, pointsComportement));

        double poidsPretsEnCours = getPoids(poids, PRETS_EN_COURS);
        int pretsEnCours = req.getNombrePretsEnCours() == null
                ? 0 : req.getNombrePretsEnCours();
        double pointsPretsEnCours;
        if (pretsEnCours == 0) {
            pointsPretsEnCours = poidsPretsEnCours;
        } else if (pretsEnCours == 1) {
            pointsPretsEnCours = poidsPretsEnCours * 0.6;
        } else {
            pointsPretsEnCours = poidsPretsEnCours * 0.2;
        }
        total += pointsPretsEnCours;
        details.add(detail(PRETS_EN_COURS, poidsPretsEnCours, pointsPretsEnCours));

        double poidsAncienneteClient = getPoids(poids, ANCIENNETE_CLIENT);
        int ancienneteClient = req.getAncienneteClientMois() == null
                ? 0 : req.getAncienneteClientMois();
        double pointsAnciennete;
        if (ancienneteClient >= 36) {
            pointsAnciennete = poidsAncienneteClient;
        } else if (ancienneteClient >= 12) {
            pointsAnciennete = poidsAncienneteClient * 0.6;
        } else {
            pointsAnciennete = poidsAncienneteClient * 0.3;
        }
        total += pointsAnciennete;
        details.add(detail(ANCIENNETE_CLIENT, poidsAncienneteClient, pointsAnciennete));

        return new BlocResult(total, details);
    }


    // ===================== BLOC 5 : ACTIVITÉ ÉCONOMIQUE =====================
    private BlocResult calculerBlocActiviteEconomique(DemandeScoringRequest req,
                                                      Map<String, Double> poids) {
        List<DetailScore> details = new ArrayList<>();
        double total = 0.0;

        double poidsType = getPoids(poids, TYPE_ACTIVITE);
        TypeActivite type = req.getTypeActivite();
        double pointsType;
        if (type != null) {
            pointsType = switch (type) {
                case SALARIE, SERVICE -> poidsType;
                case COMMERCE -> poidsType * 0.8;
                case ARTISANAT -> poidsType * 0.6;
                case AGRICULTURE -> poidsType * 0.5;
                default -> poidsType * 0.4;
            };
        } else {
            pointsType = 0.0;
        }
        total += pointsType;
        details.add(detail(TYPE_ACTIVITE, poidsType, pointsType));

        double poidsAncienneteEntreprise = getPoids(poids, ANCIENNETE_ENTREPRISE);
        int ancienneteEntreprise = req.getAncienneteEntrepriseMois() == null
                ? 0 : req.getAncienneteEntrepriseMois();
        double pointsAncienneteEntreprise;
        if (ancienneteEntreprise >= 36) {
            pointsAncienneteEntreprise = poidsAncienneteEntreprise;
        } else if (ancienneteEntreprise >= 12) {
            pointsAncienneteEntreprise = poidsAncienneteEntreprise * 0.6;
        } else {
            pointsAncienneteEntreprise = poidsAncienneteEntreprise * 0.3;
        }
        total += pointsAncienneteEntreprise;
        details.add(detail(ANCIENNETE_ENTREPRISE, poidsAncienneteEntreprise, pointsAncienneteEntreprise));

        double poidsCA = getPoids(poids, CHIFFRE_AFFAIRES);
        double ca = req.getChiffreAffairesMensuel() == null
                ? 0.0 : req.getChiffreAffairesMensuel();
        double mensualitePret = req.getMontant() / req.getDureeRemboursementMois();
        double pointsCA = 0.0;
        if (ca > 0) {
            if (ca >= mensualitePret * 3) {
                pointsCA = poidsCA;
            } else if (ca >= mensualitePret * 1.5) {
                pointsCA = poidsCA * 0.6;
            } else {
                pointsCA = poidsCA * 0.3;
            }
        }
        total += pointsCA;
        details.add(detail(CHIFFRE_AFFAIRES, poidsCA, pointsCA));

        double poidsSecteur = getPoids(poids, SECTEUR_ACTIVITE);
        SecteurActivite secteur = req.getSecteurActivite();
        double pointsSecteur;
        if (secteur != null) {
            pointsSecteur = switch (secteur) {
                case FAIBLE_RISQUE -> poidsSecteur;
                case RISQUE_MOYEN -> poidsSecteur * 0.6;
                default -> poidsSecteur * 0.3;
            };
        } else {
            pointsSecteur = 0.0;
        }
        total += pointsSecteur;
        details.add(detail(SECTEUR_ACTIVITE, poidsSecteur, pointsSecteur));

        return new BlocResult(total, details);
    }


    // ===================== BLOC 6 : GARANTIES ET COLLATÉRAUX =====================
    private BlocResult calculerBlocGaranties(DemandeScoringRequest req,
                                             Map<String, Double> poids) {
        List<DetailScore> details = new ArrayList<>();
        double total = 0.0;

        double poidsGarantiePerso = getPoids(poids, GARANTIE_PERSONNELLE);
        boolean garantiePersonnelle = req.getGarantiePersonnelle() != null
                && req.getGarantiePersonnelle();
        double pointsGarantiePerso = garantiePersonnelle ? poidsGarantiePerso : poidsGarantiePerso * 0.2;
        total += pointsGarantiePerso;
        details.add(detail(GARANTIE_PERSONNELLE, poidsGarantiePerso, pointsGarantiePerso));

        double poidsGarantieMaterielle = getPoids(poids, GARANTIE_MATERIELLE);
        boolean garantieMaterielle = req.getGarantieMaterielle() != null
                && req.getGarantieMaterielle();
        double pointsGarantieMaterielle = garantieMaterielle ? poidsGarantieMaterielle : poidsGarantieMaterielle * 0.2;
        total += pointsGarantieMaterielle;
        details.add(detail(GARANTIE_MATERIELLE, poidsGarantieMaterielle, pointsGarantieMaterielle));

        double poidsEpargne = getPoids(poids, EPARGNE_CONSTITUEE);
        double epargne = req.getEpargneConstituee() == null ? 0.0 : req.getEpargneConstituee();
        double ratioEpargne = epargne / req.getMontant();
        double pointsEpargne;
        if (ratioEpargne >= 0.3) {
            pointsEpargne = poidsEpargne;
        } else if (ratioEpargne >= 0.1) {
            pointsEpargne = poidsEpargne * 0.6;
        } else {
            pointsEpargne = poidsEpargne * 0.2;
        }
        total += pointsEpargne;
        details.add(detail(EPARGNE_CONSTITUEE, poidsEpargne, pointsEpargne));

        return new BlocResult(total, details);
    }


    // ===================== BLOC 7 : FACTEURS COMPORTEMENTAUX =====================
    private BlocResult calculerBlocFacteursComportementaux(DemandeScoringRequest req,
                                                           Map<String, Double> poids) {
        List<DetailScore> details = new ArrayList<>();
        double total = 0.0;

        double poidsMotivation = getPoids(poids, MOTIVATION);
        int noteMotivationBrute = req.getNoteMotivationEntretien() == null
                ? 0 : req.getNoteMotivationEntretien();
        double pointsMotivation = poidsMotivation * (noteMotivationBrute / 10.0);
        total += pointsMotivation;
        details.add(detail(MOTIVATION, poidsMotivation, pointsMotivation));

        double poidsReputation = getPoids(poids, REPUTATION);
        double pointsReputation = appliquerGrilleQualitative(req.getReputationCommunaute(), poidsReputation);
        total += pointsReputation;
        details.add(detail(REPUTATION, poidsReputation, pointsReputation));

        double poidsRegulariteEpargne = getPoids(poids, REGULARITE_EPARGNE);
        double pointsRegularite = appliquerGrilleQualitative(req.getRegulariteEpargne(), poidsRegulariteEpargne);
        total += pointsRegularite;
        details.add(detail(REGULARITE_EPARGNE, poidsRegulariteEpargne, pointsRegularite));

        return new BlocResult(total, details);
    }


    // ===================== MÉTHODES UTILITAIRES =====================
    private static final Map<String, String> CRITERE_TO_BLOC = Map.ofEntries(
            Map.entry(AGE, "PROFIL_SOCIODEMOGRAPHIQUE"),
            Map.entry(SITUATION_MATRIMONIALE, "PROFIL_SOCIODEMOGRAPHIQUE"),
            Map.entry(NIVEAU_EDUCATION, "PROFIL_SOCIODEMOGRAPHIQUE"),
            Map.entry(STABILITE_RESIDENTIELLE, "PROFIL_SOCIODEMOGRAPHIQUE"),
            Map.entry(PERSONNES_A_CHARGE, "PROFIL_SOCIODEMOGRAPHIQUE"),
            Map.entry(REVENUS_MENSUELS, "CAPACITE_REMBOURSEMENT"),
            Map.entry(CHARGES_FIXES, "CAPACITE_REMBOURSEMENT"),
            Map.entry(TAUX_ENDETTEMENT, "CAPACITE_REMBOURSEMENT"),
            Map.entry(FLUX_TRESORERIE, "CAPACITE_REMBOURSEMENT"),
            Map.entry(MONTANT_PRET, "MONTANT_DUREE"),
            Map.entry(DUREE_REMBOURSEMENT, "MONTANT_DUREE"),
            Map.entry(COMPORTEMENT_PRETS, "HISTORIQUE_CREDIT"),
            Map.entry(PRETS_EN_COURS, "HISTORIQUE_CREDIT"),
            Map.entry(ANCIENNETE_CLIENT, "HISTORIQUE_CREDIT"),
            Map.entry(TYPE_ACTIVITE, "ACTIVITE_ECONOMIQUE"),
            Map.entry(ANCIENNETE_ENTREPRISE, "ACTIVITE_ECONOMIQUE"),
            Map.entry(CHIFFRE_AFFAIRES, "ACTIVITE_ECONOMIQUE"),
            Map.entry(SECTEUR_ACTIVITE, "ACTIVITE_ECONOMIQUE"),
            Map.entry(GARANTIE_PERSONNELLE, "GARANTIES"),
            Map.entry(GARANTIE_MATERIELLE, "GARANTIES"),
            Map.entry(EPARGNE_CONSTITUEE, "GARANTIES"),
            Map.entry(MOTIVATION, "FACTEURS_COMPORTEMENTAUX"),
            Map.entry(REPUTATION, "FACTEURS_COMPORTEMENTAUX"),
            Map.entry(REGULARITE_EPARGNE, "FACTEURS_COMPORTEMENTAUX")
    );

    private DetailScore detail(String nomCritere, Double poids, Double points) {
        return DetailScore.builder()
                .blocCritere(CRITERE_TO_BLOC.get(nomCritere))
                .nomCritere(nomCritere)
                .poids(poids)
                .pointsObtenus(arrondir(points))
                .build();
    }

    private double getPoids(Map<String, Double> poids, String nomCritere) {
        Double valeur = poids.get(nomCritere);
        if (valeur == null) {
            throw new ScoringConfigurationException(
                    "Critère de scoring manquant ou inactif en base : \"" + nomCritere + "\". " +
                            "Vérifiez la table parametre_de_scoring.");
        }
        return valeur;
    }

    private double appliquerGrilleQualitative(NiveauQualitatif niveau, double poidsUnitaire) {
        if (niveau == null) return 0.0;
        return switch (niveau) {
            case EXCELLENT -> poidsUnitaire;
            case BON -> poidsUnitaire * 0.7;
            case MOYEN -> poidsUnitaire * 0.4;
            case FAIBLE -> poidsUnitaire * 0.1;
        };
    }

    private double arrondir(double valeur) {
        return Math.round(valeur * 100.0) / 100.0;
    }


    private record BlocResult(double total, List<DetailScore> details) {}
}
