package com.microscore.loan_service.repository;

import com.microscore.loan_service.entity.Parametre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ParametreRepository extends JpaRepository<Parametre, String> {
}
