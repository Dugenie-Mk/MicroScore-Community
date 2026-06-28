package com.microscore.loan_service.service;

import com.microscore.loan_service.dto.EnregistrerScoreRequest;
import com.microscore.loan_service.dto.PretResponse;

import java.util.List;

public interface PretService {

    PretResponse enregistrerScore(EnregistrerScoreRequest request);

    PretResponse getPretById(Long idPret);

    List<PretResponse> getPretsByClientId(Long idClient);
}