package com.microscore.scoring_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BlocScoringDto {

    private Long id;
    private String nom;
    private Double poids;
    private List<DetailCritereDto> details;
}
