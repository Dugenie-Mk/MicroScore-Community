package com.microscore.scoring_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnregistrerScoreClientRequest {

    private Long idPret;
    private Long idClient;
    private Double scoreTotal;
    private Double montant;
    private Integer dureeRemboursementMois;
}