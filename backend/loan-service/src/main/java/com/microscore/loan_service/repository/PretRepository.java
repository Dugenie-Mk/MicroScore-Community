package com.microscore.loan_service.repository;

import com.microscore.loan_service.entity.Pret;
import com.microscore.loan_service.entity.StatutPret;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface PretRepository extends JpaRepository<Pret, Long> {

    Optional<Pret> findByIdPret(Long idPret);

    List<Pret> findByIdClient(Long idClient);

    List<Pret> findByStatut(StatutPret statut);

    @Query("SELECT COALESCE(MAX(p.idPret), 0) FROM Pret p")
    Long findMaxIdPret();
}