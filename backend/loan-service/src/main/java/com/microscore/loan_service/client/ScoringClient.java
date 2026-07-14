package com.microscore.loan_service.client;

import com.microscore.loan_service.dto.ScoreResponseDTO;
import com.microscore.loan_service.dto.ScoringRequestDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "scoring-service")
public interface ScoringClient {

    @PostMapping("/api/scoring/calculate")
    ScoreResponseDTO calculateScore(@RequestBody ScoringRequestDTO request);
}