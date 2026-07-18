package com.microscore.loan_service.controller;

import com.microscore.loan_service.dto.CreerPretRequest;
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
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@RestController
@RequestMapping("/api/prets")
@RequiredArgsConstructor
public class PretController {

    private final PretService pretService;

    @PostMapping
    public ResponseEntity<PretResponse> creerPret(
            @Valid @RequestBody CreerPretRequest request) {
        PretResponse response = pretService.creerPret(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/enregistrer-score")
    public ResponseEntity<PretResponse> enregistrerScore(
            @Valid @RequestBody EnregistrerScoreRequest request) {
        PretResponse response = pretService.enregistrerScore(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<PretResponse>> getAllPrets() {
        return ResponseEntity.ok(pretService.getAllPrets());
    }

    @GetMapping("/paginated")
    public ResponseEntity<Page<PretResponse>> getAllPretsPaginated(Pageable pageable) {
        return ResponseEntity.ok(pretService.getAllPrets(pageable));
    }

    @GetMapping("/recherche")
    public ResponseEntity<Page<PretResponse>> rechercherPrets(
            @RequestParam(required = false) String statut,
            @RequestParam(required = false) String motif,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin,
            Pageable pageable) {
        StatutPret s = null;
        if (statut != null && !statut.isBlank() && !"TOUS".equalsIgnoreCase(statut)) {
            s = StatutPret.valueOf(statut);
        }
        String m = (motif != null && !motif.isBlank()) ? motif : null;
        LocalDateTime debut = (dateDebut != null) ? dateDebut.atStartOfDay() : null;
        LocalDateTime fin = (dateFin != null) ? dateFin.atTime(23, 59, 59) : null;
        return ResponseEntity.ok(pretService.getPretsFiltered(s, m, debut, fin, pageable));
    }

    @GetMapping("/{idPret}")
    public ResponseEntity<PretResponse> getPretById(@PathVariable Long idPret) {
        return ResponseEntity.ok(pretService.getPretById(idPret));
    }

    @GetMapping("/client/{idClient}")
    public ResponseEntity<List<PretResponse>> getPretsByClientId(
            @PathVariable Long idClient) {
        return ResponseEntity.ok(pretService.getPretsByClientId(idClient));
    }

    @GetMapping("/client/{idClient}/paginated")
    public ResponseEntity<Page<PretResponse>> getPretsByClientIdPaginated(
            @PathVariable Long idClient,
            Pageable pageable) {
        return ResponseEntity.ok(pretService.getPretsByClientId(idClient, pageable));
    }

    @GetMapping("/statut/{statut}")
    public ResponseEntity<List<PretResponse>> getPretsByStatut(@PathVariable StatutPret statut) {
        return ResponseEntity.ok(pretService.getPretsByStatut(statut));
    }

    @PatchMapping("/{idPret}/annuler")
    public ResponseEntity<PretResponse> annulerPret(
            @PathVariable Long idPret,
            @RequestParam Long clientId) {
        return ResponseEntity.ok(pretService.annulerPret(idPret, clientId));
    }

    @DeleteMapping("/{idPret}")
    public ResponseEntity<Void> supprimerPret(
            @PathVariable Long idPret,
            @RequestParam Long clientId) {
        pretService.supprimerPret(idPret, clientId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{idPret}/decision")
    public ResponseEntity<PretResponse> deciderStatut(
            @PathVariable Long idPret,
            @Valid @RequestBody DeciderStatutRequest request) {
        return ResponseEntity.ok(pretService.deciderStatut(idPret, request));
    }
}