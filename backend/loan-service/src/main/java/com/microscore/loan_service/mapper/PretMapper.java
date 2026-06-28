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
                .scoreTotal(pret.getScoreTotal())
                .dateEnregistrement(pret.getDateEnregistrement())
                .build();
    }
}