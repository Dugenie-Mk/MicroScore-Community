package com.microscore.loan_service.service;

import com.microscore.loan_service.dto.DeciderStatutRequest;
import com.microscore.loan_service.dto.EnregistrerScoreRequest;
import com.microscore.loan_service.dto.PretResponse;
import com.microscore.loan_service.entity.StatutPret;

import java.util.List;

public interface PretService {

    PretResponse enregistrerScore(EnregistrerScoreRequest request);

    PretResponse getPretById(Long idPret);

    List<PretResponse> getPretsByClientId(Long idClient);

    List<PretResponse> getPretsByStatut(StatutPret statut);

    PretResponse deciderStatut(Long idPret, DeciderStatutRequest request);
}