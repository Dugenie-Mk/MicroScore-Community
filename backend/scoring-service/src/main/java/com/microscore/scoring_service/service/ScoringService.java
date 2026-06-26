package com.microscore.scoring_service.service;

import com.microscore.scoring_service.dto.DemandeScoringRequest;
import com.microscore.scoring_service.dto.ScoreResponse;

public interface ScoringService {

    ScoreResponse calculerScore(Long pretId, DemandeScoringRequest request);

    ScoreResponse getScoreByPretId(Long pretId);

    ScoreResponse getScoreById(Long scoreId);
}