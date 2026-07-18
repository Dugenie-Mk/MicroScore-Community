package com.microscore.scoring_service.dto;

import com.microscore.scoring_service.entity.BlocCritere;
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
public class ParametreDeScoringDto {

    private Long id;

    @NotNull(message = "Le bloc critère est obligatoire")
    private BlocCritere blocCritere;

    @NotBlank(message = "Le nom du critère est obligatoire")
    private String nomCritere;

    @NotNull(message = "Le poids du critère est obligatoire")
    @Positive(message = "Le poids doit être positif")
    private Double poidsCritere;

    private Boolean actif;

    private String description;
}