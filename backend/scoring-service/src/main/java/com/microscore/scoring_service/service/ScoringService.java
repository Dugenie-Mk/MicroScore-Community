package com.microscore.scoring_service.service;

import com.microscore.scoring_service.dto.DemandeScoringRequest;
import com.microscore.scoring_service.dto.ScoreDetailResponse;
import com.microscore.scoring_service.dto.ScoreResponse;

import java.util.List;

public interface ScoringService {

    ScoreDetailResponse calculerScore(Long pretId, DemandeScoringRequest request);

    ScoreResponse getScoreByPretId(Long pretId);

    ScoreResponse getScoreById(Long scoreId);

    ScoreDetailResponse getScoreDetailById(Long scoreId);

    List<ScoreResponse> getAllScores();

    List<ScoreResponse> getScoresByClientId(Long clientId);

    ScoreDetailResponse getLatestScoreByClientId(Long clientId);
}
