package com.microscore.loan_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScoreResponseDTO {

    private Long clientId;
    private Double profilSociodemographiqueScore;
    private Double capaciteRemboursementScore;
    private Double historiqueCreditScore;
    private Double activitesEconomiquesScore;
    private Double garantiesCollaterauxScore;
    private Double facteursComportementauxScore;
    private Double scoreFinal;
}