package com.microscore.loan_service.dto;

import com.microscore.loan_service.entity.StatutPret;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class LoanResponse {

    private Long id;
    private Long clientId;
    private BigDecimal montant;
    private Integer duree;
    private BigDecimal tauxInteret;
    private StatutPret statut;
    private LocalDateTime dateCreation;

    public LoanResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getClientId() { return clientId; }
    public void setClientId(Long clientId) { this.clientId = clientId; }

    public BigDecimal getMontant() { return montant; }
    public void setMontant(BigDecimal montant) { this.montant = montant; }

    public Integer getDuree() { return duree; }
    public void setDuree(Integer duree) { this.duree = duree; }

    public BigDecimal getTauxInteret() { return tauxInteret; }
    public void setTauxInteret(BigDecimal tauxInteret) { this.tauxInteret = tauxInteret; }

    public StatutPret getStatut() { return statut; }
    public void setStatut(StatutPret statut) { this.statut = statut; }

    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }
}