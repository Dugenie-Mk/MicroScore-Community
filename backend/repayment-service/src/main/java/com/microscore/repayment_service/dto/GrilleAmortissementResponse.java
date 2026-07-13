package com.microscore.repayment_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrilleAmortissementResponse {

    private Long idPret;
    private Double montantEmprunte;
    private Integer dureeRemboursementMois;
    private Double tauxAnnuel;
    private Double tauxMensuel;
    private Double capitalRembourseParEcheance;
    private Double totalInterets;
    private Double coutTotalCredit;
    private List<EcheanceDto> echeances;
}