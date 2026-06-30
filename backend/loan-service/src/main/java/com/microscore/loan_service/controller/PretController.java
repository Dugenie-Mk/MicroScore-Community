package com.microscore.loan_service.controller;

import com.microscore.loan_service.dto.DeciderStatutRequest;
import com.microscore.loan_service.dto.EnregistrerScoreRequest;
import com.microscore.loan_service.dto.PretResponse;
import com.microscore.loan_service.entity.StatutPret;
import com.microscore.loan_service.service.PretService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prets")
@RequiredArgsConstructor
public class PretController {

    private final PretService pretService;

    @PostMapping("/enregistrer-score")
    public ResponseEntity<PretResponse> enregistrerScore(
            @Valid @RequestBody EnregistrerScoreRequest request) {

        PretResponse response = pretService.enregistrerScore(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{idPret}")
    public ResponseEntity<PretResponse> getPretById(@PathVariable Long idPret) {
        return ResponseEntity.ok(pretService.getPretById(idPret));
    }

    @GetMapping("/client/{idClient}")
    public ResponseEntity<List<PretResponse>> getPretsByClientId(@PathVariable Long idClient) {
        return ResponseEntity.ok(pretService.getPretsByClientId(idClient));
    }

    /**
     * Liste les prêts par statut, utile pour un dashboard gestionnaire
     * (ex: GET /api/prets/statut/EN_ATTENTE pour voir les dossiers à traiter).
     */
    @GetMapping("/statut/{statut}")
    public ResponseEntity<List<PretResponse>> getPretsByStatut(@PathVariable StatutPret statut) {
        return ResponseEntity.ok(pretService.getPretsByStatut(statut));
    }

    /**
     * Endpoint pour qu'un gestionnaire décide manuellement du statut final.
     * PATCH /api/prets/{idPret}/decision
     */
    @PatchMapping("/{idPret}/decision")
    public ResponseEntity<PretResponse> deciderStatut(
            @PathVariable Long idPret,
            @Valid @RequestBody DeciderStatutRequest request) {

        return ResponseEntity.ok(pretService.deciderStatut(idPret, request));
    }
}