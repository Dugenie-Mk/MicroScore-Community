package com.microscore.scoring_service.service;

import com.microscore.scoring_service.dto.ParametreDeScoringDto;

import java.util.List;
import java.util.Map;

public interface ParametreDeScoringService {

    List<ParametreDeScoringDto> getAllParametres();

    ParametreDeScoringDto creerParametre(ParametreDeScoringDto dto);

    ParametreDeScoringDto modifierParametre(Long id, ParametreDeScoringDto dto);

    void supprimerParametre(Long id);

    Map<String, Double> chargerPoidsActifs();
}