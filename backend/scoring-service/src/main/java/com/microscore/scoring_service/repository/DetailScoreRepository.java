package com.microscore.scoring_service.repository;

import com.microscore.scoring_service.entity.DetailScore;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DetailScoreRepository extends JpaRepository<DetailScore, Long> {

    List<DetailScore> findByScoreId(Long scoreId);
}
