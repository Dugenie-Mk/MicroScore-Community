package com.microscore.scoring_service.controller;

import com.microscore.scoring_service.dto.DemandeScoringRequest;
import com.microscore.scoring_service.dto.ScoreResponse;
import com.microscore.scoring_service.service.ScoringService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/scores")
@RequiredArgsConstructor
public class ScoringController {

    private final ScoringService scoringService;

    @PostMapping("/calculer/{pretId}")
    public ResponseEntity<ScoreResponse> calculerScore(
            @PathVariable Long pretId,
            @Valid @RequestBody DemandeScoringRequest request) {

        ScoreResponse response = scoringService.calculerScore(pretId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/pret/{pretId}")
    public ResponseEntity<ScoreResponse> getScoreByPretId(@PathVariable Long pretId) {
        ScoreResponse response = scoringService.getScoreByPretId(pretId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{scoreId}")
    public ResponseEntity<ScoreResponse> getScoreById(@PathVariable Long scoreId) {
        ScoreResponse response = scoringService.getScoreById(scoreId);
        return ResponseEntity.ok(response);
    }
}