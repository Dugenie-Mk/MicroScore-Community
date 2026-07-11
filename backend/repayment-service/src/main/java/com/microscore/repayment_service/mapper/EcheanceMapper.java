package com.microscore.repayment_service.mapper;

import com.microscore.repayment_service.dto.EcheanceDto;
import com.microscore.repayment_service.entity.Echeance;
import org.springframework.stereotype.Component;

@Component
public class EcheanceMapper {

    public EcheanceDto toDto(Echeance echeance) {
        return EcheanceDto.builder()
                .id(echeance.getId())
                .idPret(echeance.getIdPret())
                .numeroEcheance(echeance.getNumeroEcheance())
                .capitalRembourse(echeance.getCapitalRembourse())
                .interets(echeance.getInterets())
                .mensualite(echeance.getMensualite())
                .capitalRestantDu(echeance.getCapitalRestantDu())
                .statut(echeance.getStatut())
                .dateEcheancePrevue(echeance.getDateEcheancePrevue())
                .datePaiement(echeance.getDatePaiement())
                .build();
    }
}