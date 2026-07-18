package com.microscore.loan_service.service;

import com.microscore.loan_service.client.RepaymentServiceClient;
import com.microscore.loan_service.client.ScoringClient;
import com.microscore.loan_service.client.UserClient;
import com.microscore.loan_service.dto.CreerPretRequest;
import com.microscore.loan_service.dto.DeciderStatutRequest;
import com.microscore.loan_service.dto.EnregistrerScoreRequest;
import com.microscore.loan_service.dto.GenererGrilleClientRequest;
import com.microscore.loan_service.dto.PretResponse;
import com.microscore.loan_service.dto.ScoreResponseDTO;
import com.microscore.loan_service.dto.ScoringRequestDTO;
import com.microscore.loan_service.dto.UserDTO;
import com.microscore.loan_service.entity.Pret;
import com.microscore.loan_service.entity.StatutPret;
import com.microscore.loan_service.exception.PretNotFoundException;
import com.microscore.loan_service.exception.StatutInvalideException;
import com.microscore.loan_service.mapper.PretMapper;
import com.microscore.loan_service.repository.PretRepository;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PretServiceImpl implements PretService {

    private final PretRepository pretRepository;
    private final PretMapper pretMapper;
    private final RepaymentServiceClient repaymentServiceClient;
    private final ParametreService parametreService;
    private final UserClient userClient;


    // ===================== CRÉER UN PRÊT =====================
    @Override
    @Transactional
    public PretResponse creerPret(CreerPretRequest request) {
        Pret pret = Pret.builder()
                .idClient(request.getIdClient())
                .motif(request.getMotif())
                .montant(request.getMontant())
                .dureeRemboursementMois(request.getDureeRemboursementMois())
                .scoreTotal(0.0)
                .statut(StatutPret.EN_ATTENTE)
                .build();
        Pret pretSauvegarde = pretRepository.save(pret);

        try {
            autoCalculerScore(pretSauvegarde);
        } catch (Exception e) {
            log.warn("Impossible de calculer automatiquement le score pour le prêt id={}: {}", pretSauvegarde.getIdPret(), e.getMessage());
        }

        return pretMapper.toResponse(pretSauvegarde);
    }

    private void autoCalculerScore(Pret pret) {
        try {
            UserDTO user = userClient.getUserById(pret.getIdClient());

            Integer age = (user.getDateNaissance() != null)
                ? Period.between(user.getDateNaissance(), LocalDate.now()).getYears()
                : 30;

            String situationMatrimoniale = normaliserSituationMatrimoniale(user.getSituationMatrimoniale());
            String niveauEducation = normaliserNiveauEducation(user.getNiveauEducation());
            Integer personnesACharge = user.getPersonnesACharge() != null ? user.getPersonnesACharge() : 0;

            Integer dureeMois = pret.getDureeRemboursementMois() > 0 ? pret.getDureeRemboursementMois() : 12;
            double revenuEstime = pret.getMontant() / dureeMois * 2;

            ScoringRequestDTO scoringRequest = ScoringRequestDTO.builder()
                    .clientId(pret.getIdClient())
                    .age(age)
                    .situationMatrimoniale(situationMatrimoniale)
                    .niveauEducation(niveauEducation)
                    .ancienneteResidenceMois(12)
                    .nombrePersonnesACharge(personnesACharge)
                    .revenuMensuelNet(Math.max(revenuEstime, 1.0))
                    .chargesFixes(0.0)
                    .fluxTresorerieActivite(0.0)
                    .montant(pret.getMontant())
                    .dureeRemboursementMois(pret.getDureeRemboursementMois())
                    .nombreRetardsAnterieurs(0)
                    .nombrePretsEnCours(0)
                    .ancienneteClientMois(6)
                    .typeActivite("AUTRE")
                    .ancienneteEntrepriseMois(0)
                    .chiffreAffairesMensuel(0.0)
                    .secteurActivite("RISQUE_MOYEN")
                    .garantiePersonnelle(false)
                    .garantieMaterielle(false)
                    .epargneConstituee(0.0)
                    .noteMotivationEntretien(5)
                    .reputationCommunaute("MOYEN")
                    .regulariteEpargne("MOYEN")
                    .build();

            ScoreResponseDTO scoreResponse = scoringClient.calculerScore(pret.getIdPret(), scoringRequest);

            pret.setScoreTotal(scoreResponse.getScoreTotal());
            pretRepository.save(pret);

            log.info("Score auto-calculé pour le prêt id={} (client {}): {} / 100",
                    pret.getIdPret(), pret.getIdClient(), scoreResponse.getScoreTotal());
        } catch (FeignException e) {
            log.warn("Le scoring-service n'a pas pu calculer le score pour le prêt id={}. HTTP status: {}",
                    pret.getIdPret(), e.status());
        } catch (Exception e) {
            log.warn("Erreur lors du calcul automatique du score pour le prêt id={}: {}", pret.getIdPret(), e.getMessage());
        }
    }


    // ===================== ENREGISTRER SCORE (depuis scoring-service via Feign) =====================
    private final ScoringClient scoringClient;

    @Override
    @Transactional
    public PretResponse enregistrerScore(EnregistrerScoreRequest request) {
        Double score = request.getScoreTotal() != null ? request.getScoreTotal() : 0.0;

        if (pretRepository.existsById(request.getIdPret())) {
            // Le prêt existe déjà → mettre à jour le score
            Pret existing = pretRepository.findByIdPret(request.getIdPret())
                    .orElseThrow(() -> new RuntimeException("Prêt introuvable"));
            existing.setScoreTotal(score);
            log.info("Score mis à jour pour le prêt id={}: {}", existing.getIdPret(), score);
            return pretMapper.toResponse(pretRepository.save(existing));
        }

        // Créer un nouveau prêt avec le score (l'ID est généré automatiquement)
        Pret pret = Pret.builder()
                .idClient(request.getIdClient())
                .scoreTotal(score)
                .montant(request.getMontant())
                .dureeRemboursementMois(request.getDureeRemboursementMois())
                .statut(StatutPret.EN_ATTENTE)
                .build();

        Pret pretSauvegarde = pretRepository.save(pret);
        log.info("Prêt créé avec score pour id={}: {}", pretSauvegarde.getIdPret(), score);
        return pretMapper.toResponse(pretSauvegarde);
    }


    // ===================== RÉCUPÉRER TOUS LES PRÊTS =====================
    @Override
    public List<PretResponse> getAllPrets() {
        return pretRepository.findAll().stream()
                .map(pretMapper::toResponse)
                .toList();
    }

    @Override
    public Page<PretResponse> getAllPrets(Pageable pageable) {
        return pretRepository.findAll(pageable)
                .map(pretMapper::toResponse);
    }


    // ===================== RÉCUPÉRER UN PRÊT PAR SON ID =====================
    @Override
    public PretResponse getPretById(Long idPret) {
        Pret pret = pretRepository.findByIdPret(idPret)
                .orElseThrow(() -> new PretNotFoundException(
                        "Aucun prêt trouvé avec idPret=" + idPret));
        if (pret.getScoreTotal() == null || pret.getScoreTotal() == 0.0) {
            autoCalculerScore(pret);
        }
        return pretMapper.toResponse(pret);
    }


    // ===================== RÉCUPÉRER LES PRÊTS D'UN CLIENT =====================
    @Override
    public List<PretResponse> getPretsByClientId(Long idClient) {
        List<Pret> prets = pretRepository.findByIdClient(idClient);
        for (Pret pret : prets) {
            if (pret.getScoreTotal() == null || pret.getScoreTotal() == 0.0) {
                autoCalculerScore(pret);
            }
        }
        return prets.stream()
                .map(pretMapper::toResponse)
                .toList();
    }

    @Override
    public Page<PretResponse> getPretsByClientId(Long idClient, Pageable pageable) {
        return pretRepository.findByIdClient(idClient, pageable)
                .map(pret -> {
                    if (pret.getScoreTotal() == null || pret.getScoreTotal() == 0.0) {
                        autoCalculerScore(pret);
                    }
                    return pretMapper.toResponse(pret);
                });
    }


    // ===================== RÉCUPÉRER LES PRÊTS PAR STATUT =====================
    @Override
    public List<PretResponse> getPretsByStatut(StatutPret statut) {
        return pretRepository.findByStatut(statut).stream()
                .map(pretMapper::toResponse)
                .toList();
    }


    // ===================== RÉCUPÉRER LES PRÊTS FILTRÉS AVEC PAGINATION =====================
    private PretResponse enrichirAvecNom(Pret pret) {
        try {
            UserDTO user = userClient.getUserById(pret.getIdClient());
            String nom = (user.getPrenom() != null ? user.getPrenom() + " " : "")
                       + (user.getNom() != null ? user.getNom() : "");
            return pretMapper.toResponse(pret, nom.isBlank() ? "Client #" + pret.getIdClient() : nom);
        } catch (Exception e) {
            log.warn("Impossible de récupérer le nom du client {} pour le prêt {}", pret.getIdClient(), pret.getIdPret());
            return pretMapper.toResponse(pret, "Client #" + pret.getIdClient());
        }
    }

    @Override
    public Page<PretResponse> getPretsFiltered(StatutPret statut, String motif, LocalDateTime dateDebut, LocalDateTime dateFin, Pageable pageable) {
        return pretRepository.findFiltered(statut, motif, dateDebut, dateFin, pageable)
                .map(this::enrichirAvecNom);
    }


    // ===================== ANNULER UN PRÊT (CLIENT) =====================
    @Override
    @Transactional
    public PretResponse annulerPret(Long idPret, Long idClient) {
        Pret pret = pretRepository.findByIdPret(idPret)
                .orElseThrow(() -> new PretNotFoundException(
                        "Aucun prêt trouvé avec idPret=" + idPret));

        if (!pret.getIdClient().equals(idClient)) {
            throw new RuntimeException("Ce prêt ne vous appartient pas.");
        }

        if (pret.getStatut() != StatutPret.EN_ATTENTE) {
            throw new StatutInvalideException(
                    "Seuls les prêts en attente peuvent être annulés.");
        }

        pret.setStatut(StatutPret.ANNULE);
        pret.setDateDecision(LocalDateTime.now());
        Pret pretAnnule = pretRepository.save(pret);
        log.info("Prêt annulé par le client id={} pour le prêt id={}", idClient, idPret);
        return pretMapper.toResponse(pretAnnule);
    }


    // ===================== SUPPRIMER UN PRÊT (CLIENT) =====================
    @Override
    @Transactional
    public void supprimerPret(Long idPret, Long idClient) {
        Pret pret = pretRepository.findByIdPret(idPret)
                .orElseThrow(() -> new PretNotFoundException(
                        "Aucun prêt trouvé avec idPret=" + idPret));

        if (!pret.getIdClient().equals(idClient)) {
            throw new RuntimeException("Ce prêt ne vous appartient pas.");
        }

        if (pret.getStatut() != StatutPret.EN_ATTENTE) {
            throw new StatutInvalideException(
                    "Seuls les prêts en attente peuvent être supprimés.");
        }

        pretRepository.delete(pret);
        log.info("Prêt supprimé par le client id={} pour le prêt id={}", idClient, idPret);
    }


    // ===================== DÉCIDER DU STATUT (GESTIONNAIRE) =====================
    @Override
    @Transactional
    public PretResponse deciderStatut(Long idPret, DeciderStatutRequest request) {

        Pret pret = pretRepository.findByIdPret(idPret)
                .orElseThrow(() -> new PretNotFoundException(
                        "Aucun prêt trouvé avec idPret=" + idPret));

        if (request.getStatut() == StatutPret.EN_ATTENTE) {
            throw new StatutInvalideException(
                    "Impossible de remettre un prêt à EN_ATTENTE manuellement.");
        }

        pret.setStatut(request.getStatut());
        pret.setDateDecision(LocalDateTime.now());
        if (request.getStatut() == StatutPret.APPROUVE) {
            String tauxStr = parametreService.getValeur("TAUX_INTERET_GLOBAL");
            String typeTauxStr = parametreService.getValeur("TYPE_TAUX_GLOBAL");
            Double taux = (tauxStr != null) ? Double.parseDouble(tauxStr) : 2.0;
            String typeTaux = (typeTauxStr != null) ? typeTauxStr : "ANNUEL";
            pret.setTauxInteret(taux);
            pret.setTypeTaux(typeTaux);
        }

        Pret pretMisAJour = pretRepository.save(pret);

        // Si le prêt est APPROUVE, générer automatiquement la grille d'amortissement
        if (request.getStatut() == StatutPret.APPROUVE) {
            notifierRepaymentService(pretMisAJour);
        }

        return pretMapper.toResponse(pretMisAJour);
    }


    // ===================== APPEL FEIGN VERS REPAYMENT-SERVICE =====================
    private void notifierRepaymentService(Pret pret) {
        try {
            GenererGrilleClientRequest requete = GenererGrilleClientRequest.builder()
                    .idPret(pret.getIdPret())
                    .montant(pret.getMontant())
                    .dureeRemboursementMois(pret.getDureeRemboursementMois())
                    // La première échéance commence le 1er du mois suivant la décision
                    .dateDebut(LocalDate.now().plusMonths(1)
                            .withDayOfMonth(1).toString())
                    .tauxInteret(pret.getTauxInteret())
                    .typeTaux(pret.getTypeTaux())
                    .build();

            repaymentServiceClient.genererGrille(requete);
            log.info("Grille d'amortissement générée avec succès pour le prêt id={}",
                    pret.getIdPret());

        } catch (FeignException ex) {
            // Best-effort : l'échec ne doit pas annuler la décision d'acceptation
            log.error("Échec de la génération de la grille pour le prêt id={}. " +
                    "La grille devra être générée manuellement via POST " +
                    "/api/remboursements/generer-grille.", pret.getIdPret(), ex);
        }
    }

    private String normaliserSituationMatrimoniale(String valeur) {
        if (valeur == null || valeur.isBlank()) return "CELIBATAIRE";
        String v = valeur.toUpperCase().replaceAll("[^A-Z_]", "");
        if (v.contains("MARIE") || v.contains("MARI")) return "MARIE";
        if (v.contains("DIVORCE") || v.contains("DIVOR")) return "DIVORCE";
        if (v.contains("VEUF") || v.contains("VEUV")) return "VEUF";
        return "CELIBATAIRE";
    }

    private String normaliserNiveauEducation(String valeur) {
        if (valeur == null || valeur.isBlank()) return "SUPERIEUR";
        String v = valeur.toUpperCase();
        if (v.contains("PRIMAIRE")) return "PRIMAIRE";
        if (v.contains("SECONDAIRE")) return "SECONDAIRE";
        if (v.contains("AUCUN")) return "AUCUN";
        return "SUPERIEUR";
    }
}