package com.microscore.loan_service.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class LoanRequest {

    @NotNull
    private Long clientId;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal montant;

    @NotNull
    @Min(1)
    private Integer duree;

    @NotNull
    @DecimalMin("0.0")
    private BigDecimal tauxInteret;

    public LoanRequest() {}

    public Long getClientId() { return clientId; }
    public void setClientId(Long clientId) { this.clientId = clientId; }

    public BigDecimal getMontant() { return montant; }
    public void setMontant(BigDecimal montant) { this.montant = montant; }

    public Integer getDuree() { return duree; }
    public void setDuree(Integer duree) { this.duree = duree; }

    public BigDecimal getTauxInteret() { return tauxInteret; }
    public void setTauxInteret(BigDecimal tauxInteret) { this.tauxInteret = tauxInteret; }
}