package com.microscore.repayment_service.dto;

import com.microscore.repayment_service.entity.StatutEcheance;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EcheanceDto {

    private Long id;
    private Long idPret;
    private Integer numeroEcheance;
    private Double capitalRembourse;
    private Double interets;
    private Double mensualite;
    private Double capitalRestantDu;
    private StatutEcheance statut;
    private LocalDate dateEcheancePrevue;
    private LocalDateTime datePaiement;
}