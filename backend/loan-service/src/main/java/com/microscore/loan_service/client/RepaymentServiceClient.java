package com.microscore.loan_service.client;

import com.microscore.loan_service.dto.GenererGrilleClientRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "repayment-service")
public interface RepaymentServiceClient {

    @PostMapping("/api/remboursements/generer-grille")
    ResponseEntity<Void> genererGrille(@RequestBody GenererGrilleClientRequest request);
}