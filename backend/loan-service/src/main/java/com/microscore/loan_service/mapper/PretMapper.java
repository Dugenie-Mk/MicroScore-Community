package com.microscore.loan_service.mapper;

import com.microscore.loan_service.dto.PretResponse;
import com.microscore.loan_service.entity.Pret;
import org.springframework.stereotype.Component;

@Component
public class PretMapper {

    public PretResponse toResponse(Pret pret) {
        return PretResponse.builder()
                .idPret(pret.getIdPret())
                .idClient(pret.getIdClient())
                .motif(pret.getMotif())
                .scoreTotal(pret.getScoreTotal())
                .montant(pret.getMontant())
                .dureeRemboursementMois(pret.getDureeRemboursementMois())
                .statut(pret.getStatut())
                .dateEnregistrement(pret.getDateEnregistrement())
                .dateDecision(pret.getDateDecision())
                .build();
    }
}