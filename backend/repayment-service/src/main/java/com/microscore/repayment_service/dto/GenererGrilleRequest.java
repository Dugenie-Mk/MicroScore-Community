package com.microscore.repayment_service.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GenererGrilleRequest {

    @NotNull(message = "L'identifiant du prêt est obligatoire")
    private Long idPret;

    @NotNull(message = "Le montant est obligatoire")
    @Positive(message = "Le montant doit être positif")
    private Double montant;

    @NotNull(message = "La durée est obligatoire")
    @Positive(message = "La durée doit être positive")
    private Integer dureeRemboursementMois;

    @NotNull(message = "La date de début est obligatoire")
    private String dateDebut; // format ISO : "2026-07-01"
}