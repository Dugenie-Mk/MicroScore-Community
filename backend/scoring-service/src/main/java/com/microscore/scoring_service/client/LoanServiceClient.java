package com.microscore.scoring_service.client;

import com.microscore.scoring_service.dto.EnregistrerScoreClientRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "loan-service")
public interface LoanServiceClient {

    @PostMapping("/api/prets/enregistrer-score")
    ResponseEntity<Void> enregistrerScore(@RequestBody EnregistrerScoreClientRequest request);
}