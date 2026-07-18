package com.microscore.loan_service.dto;

import jakarta.validation.constraints.NotBlank;
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
public class CreerPretRequest {

    @NotNull(message = "L'identifiant du client est obligatoire")
    private Long idClient;

    @NotBlank(message = "Le motif est obligatoire")
    private String motif;

    @NotNull(message = "Le montant est obligatoire")
    @Positive(message = "Le montant doit être positif")
    private Double montant;

    @NotNull(message = "La durée est obligatoire")
    @Positive(message = "La durée doit être positive")
    private Integer dureeRemboursementMois;
}
