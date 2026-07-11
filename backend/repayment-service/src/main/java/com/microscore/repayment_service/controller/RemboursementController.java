package com.microscore.repayment_service.controller;

import com.microscore.repayment_service.dto.EcheanceDto;
import com.microscore.repayment_service.dto.GenererGrilleRequest;
import com.microscore.repayment_service.dto.GrilleAmortissementResponse;
import com.microscore.repayment_service.service.RemboursementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/remboursements")
@RequiredArgsConstructor
public class RemboursementController {

    private final RemboursementService remboursementService;

    /**
     * Appelé par loan-service via Feign dès qu'un prêt est ACCEPTE.
     * POST /api/remboursements/generer-grille
     */
    @PostMapping("/generer-grille")
    public ResponseEntity<GrilleAmortissementResponse> genererGrille(
            @Valid @RequestBody GenererGrilleRequest request) {

        GrilleAmortissementResponse response = remboursementService.genererGrille(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Récupère la grille complète d'un prêt.
     * GET /api/remboursements/pret/{idPret}
     */
    @GetMapping("/pret/{idPret}")
    public ResponseEntity<GrilleAmortissementResponse> getGrilleByIdPret(@PathVariable Long idPret) {
        return ResponseEntity.ok(remboursementService.getGrilleByIdPret(idPret));
    }

    /**
     * Marque une échéance comme payée.
     * PATCH /api/remboursements/echeances/{echeanceId}/payer
     */
    @PatchMapping("/echeances/{echeanceId}/payer")
    public ResponseEntity<EcheanceDto> payerEcheance(@PathVariable Long echeanceId) {
        return ResponseEntity.ok(remboursementService.payerEcheance(echeanceId));
    }

    /**
     * Marque une échéance comme en retard (appelable par un job planifié ou manuellement).
     * PATCH /api/remboursements/echeances/{echeanceId}/retard
     */
    @PatchMapping("/echeances/{echeanceId}/retard")
    public ResponseEntity<EcheanceDto> marquerEnRetard(@PathVariable Long echeanceId) {
        return ResponseEntity.ok(remboursementService.marquerEnRetard(echeanceId));
    }

    /**
     * Filtre les échéances d'un prêt par statut.
     * GET /api/remboursements/pret/{idPret}/statut/{statut}
     * ex: GET /api/remboursements/pret/1/statut/EN_ATTENTE
     */
    @GetMapping("/pret/{idPret}/statut/{statut}")
    public ResponseEntity<List<EcheanceDto>> getEcheancesByStatut(
            @PathVariable Long idPret,
            @PathVariable String statut) {
        return ResponseEntity.ok(remboursementService.getEcheancesByStatut(idPret, statut));
    }
}