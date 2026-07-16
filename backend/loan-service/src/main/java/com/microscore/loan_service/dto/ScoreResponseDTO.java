package com.microscore.loan_service.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScoreResponseDTO {

    private Long scoreId;
    private Long pretId;
    private Long clientId;
    private Double scoreTotal;
    private LocalDateTime dateCalcul;
}