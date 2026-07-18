package com.microscore.loan_service.service;

import com.microscore.loan_service.dto.CreerPretRequest;
import com.microscore.loan_service.dto.DeciderStatutRequest;
import com.microscore.loan_service.dto.EnregistrerScoreRequest;
import com.microscore.loan_service.dto.PretResponse;
import com.microscore.loan_service.entity.StatutPret;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface PretService {

    PretResponse creerPret(CreerPretRequest request);

    PretResponse enregistrerScore(EnregistrerScoreRequest request);

    List<PretResponse> getAllPrets();

    Page<PretResponse> getAllPrets(Pageable pageable);

    PretResponse getPretById(Long idPret);

    List<PretResponse> getPretsByClientId(Long idClient);

    Page<PretResponse> getPretsByClientId(Long idClient, Pageable pageable);

    List<PretResponse> getPretsByStatut(StatutPret statut);

    Page<PretResponse> getPretsFiltered(StatutPret statut, String motif, LocalDateTime dateDebut, LocalDateTime dateFin, Pageable pageable);

    PretResponse deciderStatut(Long idPret, DeciderStatutRequest request);

    PretResponse annulerPret(Long idPret, Long idClient);

    void supprimerPret(Long idPret, Long idClient);
}