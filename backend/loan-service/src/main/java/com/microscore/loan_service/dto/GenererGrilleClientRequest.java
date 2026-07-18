package com.microscore.loan_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GenererGrilleClientRequest {

    private Long idPret;
    private Double montant;
    private Integer dureeRemboursementMois;
    private String dateDebut;
    private Double tauxInteret;
    private String typeTaux;
}