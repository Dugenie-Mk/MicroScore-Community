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
public class ScoringRequestDTO {

    private Long clientId;
    private Integer age;
    private String situationMatrimoniale;
    private String niveauEducation;
    private Integer personnesACharge;
    private Double revenusMensuels;
    private Double chargesFixes;
    private Double tauxEndettement;
    private String typeActivite;
    private Integer ancienneteEntreprise;
    private Boolean garantieMaterielle;
    private Boolean cautionSolidaire;
    private Double epargneConstituee;
    private String reputationCommunaute;
    private Boolean epargneReguliere;
}