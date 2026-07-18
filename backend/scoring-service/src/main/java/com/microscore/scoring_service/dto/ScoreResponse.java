package com.microscore.scoring_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScoreResponse {

    private Long scoreId;
    private Long pretId;
    private Long clientId;
    private Double scoreTotal;
    private LocalDateTime dateCalcul;
}