package com.microscore.loan_service.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnregistrerScoreRequest {

    @NotNull(message = "L'identifiant du prêt est obligatoire")
    private Long idPret;

    @NotNull(message = "L'identifiant du client est obligatoire")
    private Long idClient;

    @NotNull(message = "Le score total est obligatoire")
    private Double scoreTotal;

    @NotNull(message = "Le montant est obligatoire")
    private Double montant;

    @NotNull(message = "La durée de remboursement est obligatoire")
    private Integer dureeRemboursementMois;
}