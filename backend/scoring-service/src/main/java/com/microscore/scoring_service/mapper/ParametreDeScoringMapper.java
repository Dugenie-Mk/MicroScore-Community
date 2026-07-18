package com.microscore.scoring_service.mapper;

import com.microscore.scoring_service.dto.ParametreDeScoringDto;
import com.microscore.scoring_service.entity.ParametreDeScoring;
import org.springframework.stereotype.Component;

@Component
public class ParametreDeScoringMapper {

    public ParametreDeScoringDto toDto(ParametreDeScoring entity) {
        return ParametreDeScoringDto.builder()
                .id(entity.getId())
                .blocCritere(entity.getBlocCritere())
                .nomCritere(entity.getNomCritere())
                .poidsCritere(entity.getPoidsCritere())
                .actif(entity.getActif())
                .description(entity.getDescription())
                .build();
    }

    public ParametreDeScoring toEntity(ParametreDeScoringDto dto) {
        return ParametreDeScoring.builder()
                .id(dto.getId())
                .blocCritere(dto.getBlocCritere())
                .nomCritere(dto.getNomCritere())
                .poidsCritere(dto.getPoidsCritere())
                .actif(dto.getActif() == null ? true : dto.getActif())
                .description(dto.getDescription())
                .build();
    }
}