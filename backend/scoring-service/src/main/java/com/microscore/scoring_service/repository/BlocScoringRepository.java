package com.microscore.scoring_service.repository;

import com.microscore.scoring_service.entity.BlocScoring;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BlocScoringRepository extends JpaRepository<BlocScoring, Long> {
}
