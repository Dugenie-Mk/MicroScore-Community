package com.microscore.loan_service.dto;

import com.microscore.loan_service.entity.StatutPret;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PretResponse {

    private Long idPret;
    private Long idClient;
    private String motif;
    private Double scoreTotal;
    private Double montant;
    private Integer dureeRemboursementMois;
    private StatutPret statut;
    private LocalDateTime dateEnregistrement;
    private LocalDateTime dateDecision;
}