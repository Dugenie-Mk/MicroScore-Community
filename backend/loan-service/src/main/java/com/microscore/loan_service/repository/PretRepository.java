package com.microscore.loan_service.repository;

import com.microscore.loan_service.entity.Pret;
import com.microscore.loan_service.entity.StatutPret;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PretRepository extends JpaRepository<Pret, Long> {

    Optional<Pret> findByIdPret(Long idPret);

    List<Pret> findByIdClient(Long idClient);

    Page<Pret> findByIdClient(Long idClient, Pageable pageable);

    List<Pret> findByStatut(StatutPret statut);

    Page<Pret> findByStatut(StatutPret statut, Pageable pageable);

    @Query("SELECT p FROM Pret p WHERE " +
           "(:statut IS NULL OR p.statut = :statut) AND " +
           "(:motif IS NULL OR LOWER(p.motif) LIKE LOWER(CONCAT('%', :motif, '%'))) AND " +
           "(:dateDebut IS NULL OR p.dateDecision >= :dateDebut) AND " +
           "(:dateFin IS NULL OR p.dateDecision <= :dateFin)")
    Page<Pret> findFiltered(@Param("statut") StatutPret statut,
                            @Param("motif") String motif,
                            @Param("dateDebut") LocalDateTime dateDebut,
                            @Param("dateFin") LocalDateTime dateFin,
                            Pageable pageable);

}