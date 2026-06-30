package com.microscore.loan_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "pret")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pret {

    @Id
    private Long idPret;

    @Column(name = "idClient", nullable = false)
    private Long idClient;

    @Column(name = "scoreTotal", nullable = false)
    private Double scoreTotal;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false)
    @Builder.Default
    private StatutPret statut = StatutPret.EN_ATTENTE;

    @Column(name = "dateEnregistrement")
    private LocalDateTime dateEnregistrement;

    @Column(name = "dateDecision")
    private LocalDateTime dateDecision;

    @PrePersist
    protected void onCreate() {
        this.dateEnregistrement = LocalDateTime.now();
        if (this.statut == null) {
            this.statut = StatutPret.EN_ATTENTE;
        }
    }
}