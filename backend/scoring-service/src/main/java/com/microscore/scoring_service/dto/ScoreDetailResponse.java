package com.microscore.scoring_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScoreDetailResponse {

    private Long scoreId;
    private Long pretId;
    private Long clientId;
    private Double scoreTotal;
    private LocalDateTime dateCalcul;
    private List<BlocScore> blocs;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BlocScore {
        private String bloc;
        private String label;
        private Double totalBloc;
        private Double scoreBloc;
        private List<CritereScore> criteres;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CritereScore {
        private String nom;
        private Double poids;
        private Double points;
    }
}
