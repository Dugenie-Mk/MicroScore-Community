package com.microscore.loan_service.controller;

import com.microscore.loan_service.dto.EnregistrerScoreRequest;
import com.microscore.loan_service.dto.PretResponse;
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

    /**
     * Endpoint appelé par scoring-service une fois le score calculé.
     * POST /api/prets/enregistrer-score
     */
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
}