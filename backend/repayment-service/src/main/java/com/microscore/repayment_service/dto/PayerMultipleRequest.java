package com.microscore.repayment_service.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayerMultipleRequest {

    @NotNull
    private Long idPret;

    @NotNull
    @Min(1)
    private Integer nombreMois;
}
