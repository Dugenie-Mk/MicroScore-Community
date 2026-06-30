package com.microscore.scoring_service.service;

import com.microscore.scoring_service.client.LoanServiceClient;
import com.microscore.scoring_service.dto.DemandeScoringRequest;
import com.microscore.scoring_service.dto.EnregistrerScoreClientRequest;
import com.microscore.scoring_service.dto.ScoreResponse;
import com.microscore.scoring_service.entity.*;
import com.microscore.scoring_service.exception.ScoreNotFoundException;
import com.microscore.scoring_service.exception.ScoringConfigurationException;
import com.microscore.scoring_service.mapper.ScoreMapper;
import com.microscore.scoring_service.repository.ScoreRepository;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ScoringServiceImpl implements ScoringService {

    private final ScoreRepository scoreRepository;
    private final ScoreMapper scoreMapper;
    private final ParametreDeScoringService parametreDeScoringService;
    private final LoanServiceClient loanServiceClient;

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
    public ScoreResponse calculerScore(Long pretId, DemandeScoringRequest request) {

        Map<String, Double> poids = parametreDeScoringService.chargerPoidsActifs();

        double scoreTotal = 0.0;
        scoreTotal += calculerBlocProfilSociodemographique(request, poids);
        scoreTotal += calculerBlocCapaciteRemboursement(request, poids);
        scoreTotal += calculerBlocMontantDuree(request, poids);
        scoreTotal += calculerBlocHistoriqueCredit(request, poids);
        scoreTotal += calculerBlocActiviteEconomique(request, poids);
        scoreTotal += calculerBlocGaranties(request, poids);
        scoreTotal += calculerBlocFacteursComportementaux(request, poids);

        Score score = Score.builder()
                .pretId(pretId)
                .clientId(request.getClientId())
                .scoreTotal(arrondir(scoreTotal))
                .build();

        Score scoreSauvegarde = scoreRepository.save(score);

        // Appel best-effort à loan-service : un échec ne doit pas annuler le score déjà calculé
        notifierLoanService(scoreSauvegarde);

        return scoreMapper.toResponse(scoreSauvegarde);
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


    // ===================== NOTIFICATION VERS LOAN-SERVICE =====================
    private void notifierLoanService(Score score) {
        try {
            EnregistrerScoreClientRequest requeteLoanService = EnregistrerScoreClientRequest.builder()
                    .idPret(score.getPretId())
                    .idClient(score.getClientId())
                    .scoreTotal(score.getScoreTotal())
                    .build();

            loanServiceClient.enregistrerScore(requeteLoanService);

        } catch (FeignException ex) {
            log.error("Échec de la transmission du score à loan-service pour le prêt id={}. " +
                            "Le score reste enregistré dans scoring-service et devra être retransmis manuellement.",
                    score.getPretId(), ex);
        }
    }


    // ===================== BLOC 1 : PROFIL SOCIODÉMOGRAPHIQUE (20%) =====================
    private double calculerBlocProfilSociodemographique(DemandeScoringRequest req, Map<String, Double> poids) {
        double total = 0.0;

        double poidsAge = getPoids(poids, AGE);
        int age = req.getAge();
        if (age > 80) {
            total += poidsAge / 1.25;
        } else if (age < 35) {
            total += poidsAge / 1.5;
        } else {
            total += poidsAge;
        }

        double poidsSituation = getPoids(poids, SITUATION_MATRIMONIALE);
        if (req.getSituationMatrimoniale() == SituationMatrimoniale.CELIBATAIRE) {
            total += poidsSituation / 1.25;
        } else {
            total += poidsSituation;
        }

        total += getPoids(poids, NIVEAU_EDUCATION);

        double poidsResidence = getPoids(poids, STABILITE_RESIDENTIELLE);
        Integer ancienneteResidence = req.getAncienneteResidenceMois();
        if (ancienneteResidence == null) {
            total += 0.0;
        } else if (ancienneteResidence >= 60) {
            total += poidsResidence;
        } else if (ancienneteResidence >= 24) {
            total += poidsResidence * 0.7;
        } else {
            total += poidsResidence * 0.4;
        }

        double poidsPersonnes = getPoids(poids, PERSONNES_A_CHARGE);
        int nbPersonnes = req.getNombrePersonnesACharge() == null ? 0 : req.getNombrePersonnesACharge();
        if (nbPersonnes <= 2) {
            total += poidsPersonnes;
        } else if (nbPersonnes <= 4) {
            total += poidsPersonnes * 0.6;
        } else {
            total += poidsPersonnes * 0.3;
        }

        return total;
    }


    // ===================== BLOC 2 : CAPACITÉ DE REMBOURSEMENT (35%) =====================
    private double calculerBlocCapaciteRemboursement(DemandeScoringRequest req, Map<String, Double> poids) {
        double total = 0.0;

        double revenu = req.getRevenuMensuelNet();
        double chargesFixes = req.getChargesFixes() == null ? 0.0 : req.getChargesFixes();
        double fluxTresorerie = req.getFluxTresorerieActivite() == null ? 0.0 : req.getFluxTresorerieActivite();
        double mensualitePret = req.getMontant() / req.getDureeRemboursementMois();

        double poidsRevenu = getPoids(poids, REVENUS_MENSUELS);
        double ratioMensualiteRevenu = mensualitePret / revenu;
        if (ratioMensualiteRevenu > 0.5) {
            total += poidsRevenu * 0.5;
        } else {
            total += poidsRevenu * (1.0 - ratioMensualiteRevenu);
        }

        double poidsCharges = getPoids(poids, CHARGES_FIXES);
        double ratioChargesRevenu = chargesFixes / revenu;
        if (ratioChargesRevenu > 0.5) {
            total += poidsCharges * 0.3;
        } else if (ratioChargesRevenu > 0.3) {
            total += poidsCharges * 0.6;
        } else {
            total += poidsCharges;
        }

        double poidsEndettement = getPoids(poids, TAUX_ENDETTEMENT);
        double tauxEndettement = (chargesFixes + mensualitePret) / revenu;
        if (tauxEndettement > 0.5) {
            total += poidsEndettement * 0.3;
        } else if (tauxEndettement >= 0.3) {
            total += poidsEndettement * 0.5;
        } else {
            total += poidsEndettement;
        }

        double poidsFlux = getPoids(poids, FLUX_TRESORERIE);
        if (fluxTresorerie <= 0) {
            total += poidsFlux * 0.4;
        } else if (fluxTresorerie >= mensualitePret * 2) {
            total += poidsFlux;
        } else if (fluxTresorerie >= mensualitePret) {
            total += poidsFlux * 0.7;
        } else {
            total += poidsFlux * 0.3;
        }

        return total;
    }


    // ===================== BLOC 3 : MONTANT ET DURÉE DU PRÊT (15% + 15%) =====================
    private double calculerBlocMontantDuree(DemandeScoringRequest req, Map<String, Double> poids) {
        double total = 0.0;

        double revenu = req.getRevenuMensuelNet();
        double mensualite = req.getMontant() / req.getDureeRemboursementMois();
        double ratio = mensualite / revenu;

        double poidsMontant = getPoids(poids, MONTANT_PRET);
        if (ratio > 0.5) {
            total += poidsMontant * 0.5;
        } else {
            total += poidsMontant * (1.0 - ratio);
        }

        double poidsDuree = getPoids(poids, DUREE_REMBOURSEMENT);
        if (ratio > 0.5) {
            total += poidsDuree * 0.5;
        } else {
            total += poidsDuree * (1.0 - ratio);
        }

        return total;
    }


    // ===================== BLOC 4 : HISTORIQUE DE CRÉDIT (15%) =====================
    private double calculerBlocHistoriqueCredit(DemandeScoringRequest req, Map<String, Double> poids) {
        double total = 0.0;

        double poidsComportement = getPoids(poids, COMPORTEMENT_PRETS);
        int retards = req.getNombreRetardsAnterieurs() == null ? 0 : req.getNombreRetardsAnterieurs();
        if (retards == 0) {
            total += poidsComportement;
        } else if (retards <= 2) {
            total += poidsComportement * 0.5;
        } else {
            total += poidsComportement * 0.1;
        }

        double poidsPretsEnCours = getPoids(poids, PRETS_EN_COURS);
        int pretsEnCours = req.getNombrePretsEnCours() == null ? 0 : req.getNombrePretsEnCours();
        if (pretsEnCours == 0) {
            total += poidsPretsEnCours;
        } else if (pretsEnCours == 1) {
            total += poidsPretsEnCours * 0.6;
        } else {
            total += poidsPretsEnCours * 0.2;
        }

        double poidsAncienneteClient = getPoids(poids, ANCIENNETE_CLIENT);
        int ancienneteClient = req.getAncienneteClientMois() == null ? 0 : req.getAncienneteClientMois();
        if (ancienneteClient >= 36) {
            total += poidsAncienneteClient;
        } else if (ancienneteClient >= 12) {
            total += poidsAncienneteClient * 0.6;
        } else {
            total += poidsAncienneteClient * 0.3;
        }

        return total;
    }


    // ===================== BLOC 5 : ACTIVITÉ ÉCONOMIQUE / BUSINESS (15%) =====================
    private double calculerBlocActiviteEconomique(DemandeScoringRequest req, Map<String, Double> poids) {
        double total = 0.0;

        double poidsType = getPoids(poids, TYPE_ACTIVITE);
        TypeActivite type = req.getTypeActivite();
        if (type != null) {
            switch (type) {
                case SALARIE:
                case SERVICE:
                    total += poidsType;
                    break;
                case COMMERCE:
                    total += poidsType * 0.8;
                    break;
                case ARTISANAT:
                    total += poidsType * 0.6;
                    break;
                case AGRICULTURE:
                    total += poidsType * 0.5;
                    break;
                default:
                    total += poidsType * 0.4;
            }
        }

        double poidsAncienneteEntreprise = getPoids(poids, ANCIENNETE_ENTREPRISE);
        int ancienneteEntreprise = req.getAncienneteEntrepriseMois() == null ? 0 : req.getAncienneteEntrepriseMois();
        if (ancienneteEntreprise >= 36) {
            total += poidsAncienneteEntreprise;
        } else if (ancienneteEntreprise >= 12) {
            total += poidsAncienneteEntreprise * 0.6;
        } else {
            total += poidsAncienneteEntreprise * 0.3;
        }

        double poidsCA = getPoids(poids, CHIFFRE_AFFAIRES);
        double ca = req.getChiffreAffairesMensuel() == null ? 0.0 : req.getChiffreAffairesMensuel();
        double mensualitePret = req.getMontant() / req.getDureeRemboursementMois();
        if (ca > 0) {
            if (ca >= mensualitePret * 3) {
                total += poidsCA;
            } else if (ca >= mensualitePret * 1.5) {
                total += poidsCA * 0.6;
            } else {
                total += poidsCA * 0.3;
            }
        }

        double poidsSecteur = getPoids(poids, SECTEUR_ACTIVITE);
        SecteurActivite secteur = req.getSecteurActivite();
        if (secteur != null) {
            switch (secteur) {
                case FAIBLE_RISQUE:
                    total += poidsSecteur;
                    break;
                case RISQUE_MOYEN:
                    total += poidsSecteur * 0.6;
                    break;
                default:
                    total += poidsSecteur * 0.3;
            }
        }

        return total;
    }


    // ===================== BLOC 6 : GARANTIES ET COLLATÉRAUX (10%) =====================
    private double calculerBlocGaranties(DemandeScoringRequest req, Map<String, Double> poids) {
        double total = 0.0;

        double poidsGarantiePerso = getPoids(poids, GARANTIE_PERSONNELLE);
        boolean garantiePersonnelle = req.getGarantiePersonnelle() != null && req.getGarantiePersonnelle();
        total += garantiePersonnelle ? poidsGarantiePerso : poidsGarantiePerso * 0.2;

        double poidsGarantieMaterielle = getPoids(poids, GARANTIE_MATERIELLE);
        boolean garantieMaterielle = req.getGarantieMaterielle() != null && req.getGarantieMaterielle();
        total += garantieMaterielle ? poidsGarantieMaterielle : poidsGarantieMaterielle * 0.2;

        double poidsEpargne = getPoids(poids, EPARGNE_CONSTITUEE);
        double epargne = req.getEpargneConstituee() == null ? 0.0 : req.getEpargneConstituee();
        double ratioEpargne = epargne / req.getMontant();
        if (ratioEpargne >= 0.3) {
            total += poidsEpargne;
        } else if (ratioEpargne >= 0.1) {
            total += poidsEpargne * 0.6;
        } else {
            total += poidsEpargne * 0.2;
        }

        return total;
    }


    // ===================== BLOC 7 : FACTEURS COMPORTEMENTAUX ET QUALITATIFS (5%) =====================
    private double calculerBlocFacteursComportementaux(DemandeScoringRequest req, Map<String, Double> poids) {
        double total = 0.0;

        double poidsMotivation = getPoids(poids, MOTIVATION);
        int noteMotivationBrute = req.getNoteMotivationEntretien() == null ? 0 : req.getNoteMotivationEntretien();
        total += poidsMotivation * (noteMotivationBrute / 10.0);

        double poidsReputation = getPoids(poids, REPUTATION);
        total += appliquerGrilleQualitative(req.getReputationCommunaute(), poidsReputation);

        double poidsRegulariteEpargne = getPoids(poids, REGULARITE_EPARGNE);
        total += appliquerGrilleQualitative(req.getRegulariteEpargne(), poidsRegulariteEpargne);

        return total;
    }


    // ===================== MÉTHODES UTILITAIRES =====================

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
}