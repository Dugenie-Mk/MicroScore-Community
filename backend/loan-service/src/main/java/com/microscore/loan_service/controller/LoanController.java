package com.microscore.loan_service.controller;

import com.microscore.loan_service.dto.LoanRequest;
import com.microscore.loan_service.dto.LoanResponse;
import com.microscore.loan_service.service.LoanService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prets")
public class LoanController {

    private final LoanService loanService;

    public LoanController(LoanService loanService) {
        this.loanService = loanService;
    }

    @PostMapping
    public ResponseEntity<LoanResponse> creerPret(@Valid @RequestBody LoanRequest request) {
        LoanResponse response = loanService.creerPret(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LoanResponse> obtenirPret(@PathVariable Long id) {
        return ResponseEntity.ok(loanService.obtenirPretParId(id));
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<LoanResponse>> obtenirPretsParClient(@PathVariable Long clientId) {
        return ResponseEntity.ok(loanService.obtenirPretsParClient(clientId));
    }
}