package com.microscore.scoring_service.repository;

import com.microscore.scoring_service.entity.DetailCritere;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DetailCritereRepository extends JpaRepository<DetailCritere, Long> {

    List<DetailCritere> findByBlocId(Long blocId);
}
