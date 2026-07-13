package com.microscore.repayment_service.service;

import com.microscore.repayment_service.dto.GenererGrilleRequest;
import com.microscore.repayment_service.dto.GrilleAmortissementResponse;
import com.microscore.repayment_service.dto.EcheanceDto;

import java.util.List;

public interface RemboursementService {

    GrilleAmortissementResponse genererGrille(GenererGrilleRequest request);

    GrilleAmortissementResponse getGrilleByIdPret(Long idPret);

    EcheanceDto payerEcheance(Long echeanceId);

    EcheanceDto marquerEnRetard(Long echeanceId);

    List<EcheanceDto> getEcheancesByStatut(Long idPret, String statut);
}