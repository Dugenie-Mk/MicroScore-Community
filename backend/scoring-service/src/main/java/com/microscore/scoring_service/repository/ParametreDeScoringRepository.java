package com.microscore.scoring_service.repository;

import com.microscore.scoring_service.entity.BlocCritere;
import com.microscore.scoring_service.entity.ParametreDeScoring;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ParametreDeScoringRepository extends JpaRepository<ParametreDeScoring, Long> {

    List<ParametreDeScoring> findByActifTrue();

    List<ParametreDeScoring> findByBlocCritereAndActifTrue(BlocCritere blocCritere);

    Optional<ParametreDeScoring> findByNomCritereAndActifTrue(String nomCritere);
}