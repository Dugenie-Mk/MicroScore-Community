package com.microscore.loan_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PretResponse {

    private Long idPret;
    private Long idClient;
    private Double scoreTotal;
    private LocalDateTime dateEnregistrement;
}