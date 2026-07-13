package com.microscore.scoring_service.mapper;

import com.microscore.scoring_service.dto.ScoreResponse;
import com.microscore.scoring_service.entity.Score;
import org.springframework.stereotype.Component;

@Component
public class ScoreMapper {

    public ScoreResponse toResponse(Score score) {
        return ScoreResponse.builder()
                .scoreId(score.getId())
                .pretId(score.getPretId())
                .clientId(score.getClientId())
                .scoreTotal(score.getScoreTotal())
                .dateCalcul(score.getDateCalcul())
                .build();
    }
}