package com.microscore.repayment_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "echeance")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Echeance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "idPret", nullable = false)
    private Long idPret;

    @Column(name = "numeroEcheance", nullable = false)
    private Integer numeroEcheance;

    @Column(name = "capitalRembourse", nullable = false)
    private Double capitalRembourse;

    @Column(name = "interets", nullable = false)
    private Double interets;

    @Column(name = "mensualite", nullable = false)
    private Double mensualite;

    @Column(name = "capitalRestantDu", nullable = false)
    private Double capitalRestantDu;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false)
    @Builder.Default
    private StatutEcheance statut = StatutEcheance.EN_ATTENTE;

    @Column(name = "datePaiement")
    private LocalDateTime datePaiement;

    @Column(name = "dateEcheancePrevue", nullable = false)
    private LocalDate dateEcheancePrevue;
}