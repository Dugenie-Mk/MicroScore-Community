package com.microscore.loan_service.repository;

import com.microscore.loan_service.entity.Pret;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PretRepository extends JpaRepository<Pret, Long> {

    Optional<Pret> findByIdPret(Long idPret);

    List<Pret> findByIdClient(Long idClient);
}