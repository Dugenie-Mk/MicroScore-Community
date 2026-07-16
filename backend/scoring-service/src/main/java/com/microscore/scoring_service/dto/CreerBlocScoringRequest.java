package com.microscore.scoring_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreerBlocScoringRequest {

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    @Positive(message = "Le poids doit être positif")
    private Double poids;
}
