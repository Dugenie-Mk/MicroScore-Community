package com.microscore.loan_service.dto;

import com.microscore.loan_service.entity.StatutPret;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeciderStatutRequest {

    @NotNull(message = "Le statut est obligatoire")
    private StatutPret statut;
}