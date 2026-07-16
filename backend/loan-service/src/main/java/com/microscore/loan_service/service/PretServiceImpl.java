package com.microscore.loan_service.service;

import com.microscore.loan_service.client.RepaymentServiceClient;
import com.microscore.loan_service.client.ScoringClient;
import com.microscore.loan_service.dto.DeciderStatutRequest;
import com.microscore.loan_service.dto.EnregistrerScoreRequest;
import com.microscore.loan_service.dto.GenererGrilleClientRequest;
import com.microscore.loan_service.dto.PretResponse;
import com.microscore.loan_service.dto.ScoreResponseDTO;
import com.microscore.loan_service.dto.ScoringRequestDTO;
import com.microscore.loan_service.entity.Pret;
import com.microscore.loan_service.entity.StatutPret;
import com.microscore.loan_service.exception.PretDejaExistantException;
import com.microscore.loan_service.exception.PretNotFoundException;
import com.microscore.loan_service.exception.StatutInvalideException;
import com.microscore.loan_service.mapper.PretMapper;
import com.microscore.loan_service.repository.PretRepository;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PretServiceImpl implements PretService {

    private final PretRepository pretRepository;
    private final PretMapper pretMapper;
    private final RepaymentServiceClient repaymentServiceClient;


    // ===================== ENREGISTRER SCORE + CRÉER LE PRÊT =====================
    private final ScoringClient scoringClient;

@Override
@Transactional
public PretResponse enregistrerScore(EnregistrerScoreRequest request) {

    if (pretRepository.existsById(request.getIdPret())) {
        throw new PretDejaExistantException(
                "Un score a déjà été enregistré pour le prêt id=" + request.getIdPret());
    }

    // Appel automatique au scoring-service
    ScoringRequestDTO scoringRequest = ScoringRequestDTO.builder()
            .clientId(request.getIdClient())
            .age(request.getAge())
            .situationMatrimoniale(request.getSituationMatrimoniale())
            .niveauEducation(request.getNiveauEducation())
            .ancienneteResidenceMois(request.getAncienneteResidenceMois())
            .nombrePersonnesACharge(request.getNombrePersonnesACharge())
            .revenuMensuelNet(request.getRevenuMensuelNet())
            .chargesFixes(request.getChargesFixes())
            .fluxTresorerieActivite(request.getFluxTresorerieActivite())
            .montant(request.getMontant())
            .dureeRemboursementMois(request.getDureeRemboursementMois())
            .nombreRetardsAnterieurs(request.getNombreRetardsAnterieurs())
            .nombrePretsEnCours(request.getNombrePretsEnCours())
            .ancienneteClientMois(request.getAncienneteClientMois())
            .typeActivite(request.getTypeActivite())
            .ancienneteEntrepriseMois(request.getAncienneteEntrepriseMois())
            .chiffreAffairesMensuel(request.getChiffreAffairesMensuel())
            .secteurActivite(request.getSecteurActivite())
            .garantiePersonnelle(request.getGarantiePersonnelle())
            .garantieMaterielle(request.getGarantieMaterielle())
            .epargneConstituee(request.getEpargneConstituee())
            .noteMotivationEntretien(request.getNoteMotivationEntretien())
            .reputationCommunaute(request.getReputationCommunaute())
            .regulariteEpargne(request.getRegulariteEpargne())
            .build();

    // Récupérer le score calculé automatiquement
    ScoreResponseDTO scoreResponse = scoringClient.calculerScore(
            request.getIdPret(), scoringRequest);

    // Créer le prêt avec le score calculé automatiquement
    Pret pret = Pret.builder()
            .idPret(request.getIdPret())
            .idClient(request.getIdClient())
            .scoreTotal(scoreResponse.getScoreTotal())
            .montant(request.getMontant())
            .dureeRemboursementMois(request.getDureeRemboursementMois())
            .statut(StatutPret.EN_ATTENTE)
            .build();

    Pret pretSauvegarde = pretRepository.save(pret);
    return pretMapper.toResponse(pretSauvegarde);
}


    // ===================== RÉCUPÉRER UN PRÊT PAR SON ID =====================
    @Override
    public PretResponse getPretById(Long idPret) {
        Pret pret = pretRepository.findByIdPret(idPret)
                .orElseThrow(() -> new PretNotFoundException(
                        "Aucun prêt trouvé avec idPret=" + idPret));
        return pretMapper.toResponse(pret);
    }


    // ===================== RÉCUPÉRER LES PRÊTS D'UN CLIENT =====================
    @Override
    public List<PretResponse> getPretsByClientId(Long idClient) {
        return pretRepository.findByIdClient(idClient).stream()
                .map(pretMapper::toResponse)
                .toList();
    }


    // ===================== RÉCUPÉRER LES PRÊTS PAR STATUT =====================
    @Override
    public List<PretResponse> getPretsByStatut(StatutPret statut) {
        return pretRepository.findByStatut(statut).stream()
                .map(pretMapper::toResponse)
                .toList();
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

        Pret pretMisAJour = pretRepository.save(pret);

        // Si le prêt est ACCEPTE, générer automatiquement la grille d'amortissement
        if (request.getStatut() == StatutPret.ACCEPTE) {
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
}