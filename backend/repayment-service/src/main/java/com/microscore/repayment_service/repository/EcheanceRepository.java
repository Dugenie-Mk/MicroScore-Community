package com.microscore.repayment_service.repository;

import com.microscore.repayment_service.entity.Echeance;
import com.microscore.repayment_service.entity.StatutEcheance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EcheanceRepository extends JpaRepository<Echeance, Long> {

    List<Echeance> findByIdPretOrderByNumeroEcheanceAsc(Long idPret);

    boolean existsByIdPret(Long idPret);

    List<Echeance> findByIdPretAndStatut(Long idPret, StatutEcheance statut);

    Optional<Echeance> findFirstByIdPretAndStatutOrderByNumeroEcheanceAsc(
            Long idPret, StatutEcheance statut);
}