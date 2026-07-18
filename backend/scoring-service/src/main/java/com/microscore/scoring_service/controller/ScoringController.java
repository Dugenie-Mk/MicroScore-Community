package com.microscore.scoring_service.controller;

import com.microscore.scoring_service.dto.DemandeScoringRequest;
import com.microscore.scoring_service.dto.ScoreDetailResponse;
import com.microscore.scoring_service.dto.ScoreResponse;
import com.microscore.scoring_service.service.ScoringService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/scores")
@RequiredArgsConstructor
public class ScoringController {

    private final ScoringService scoringService;

    @PostMapping("/calculer/{pretId}")
    public ResponseEntity<ScoreDetailResponse> calculerScore(
            @PathVariable Long pretId,
            @Valid @RequestBody DemandeScoringRequest request) {

        ScoreDetailResponse response = scoringService.calculerScore(pretId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ScoreResponse>> getAllScores() {
        return ResponseEntity.ok(scoringService.getAllScores());
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<ScoreResponse>> getScoresByClientId(@PathVariable Long clientId) {
        return ResponseEntity.ok(scoringService.getScoresByClientId(clientId));
    }

    @GetMapping("/client/{clientId}/latest")
    public ResponseEntity<ScoreDetailResponse> getLatestScoreByClientId(@PathVariable Long clientId) {
        ScoreDetailResponse response = scoringService.getLatestScoreByClientId(clientId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{scoreId}")
    public ResponseEntity<ScoreResponse> getScoreById(@PathVariable Long scoreId) {
        ScoreResponse response = scoringService.getScoreById(scoreId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{scoreId}/details")
    public ResponseEntity<ScoreDetailResponse> getScoreDetailById(@PathVariable Long scoreId) {
        ScoreDetailResponse response = scoringService.getScoreDetailById(scoreId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/pret/{pretId}")
    public ResponseEntity<ScoreResponse> getScoreByPretId(@PathVariable Long pretId) {
        ScoreResponse response = scoringService.getScoreByPretId(pretId);
        return ResponseEntity.ok(response);
    }
}
