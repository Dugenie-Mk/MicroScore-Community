package com.microscore.scoring_service.repository;

import com.microscore.scoring_service.entity.Score;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ScoreRepository extends JpaRepository<Score, Long> {

    Optional<Score> findByPretId(Long pretId);

    List<Score> findByClientIdOrderByDateCalculDesc(Long clientId);
}