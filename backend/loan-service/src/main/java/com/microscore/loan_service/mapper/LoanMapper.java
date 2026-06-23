package com.microscore.loan_service.mapper;

import com.microscore.loan_service.dto.LoanRequest;
import com.microscore.loan_service.dto.LoanResponse;
import com.microscore.loan_service.entity.Loan;
import org.springframework.stereotype.Component;

@Component
public class LoanMapper {

    public Loan toEntity(LoanRequest request) {
        return Loan.builder()
                .clientId(request.getClientId())
                .montant(request.getMontant())
                .duree(request.getDuree())
                .tauxInteret(request.getTauxInteret())
                .build();
    }

    public LoanResponse toResponse(Loan loan) {
        LoanResponse response = new LoanResponse();
        response.setId(loan.getId());
        response.setClientId(loan.getClientId());
        response.setMontant(loan.getMontant());
        response.setDuree(loan.getDuree());
        response.setTauxInteret(loan.getTauxInteret());
        response.setStatut(loan.getStatut());
        response.setDateCreation(loan.getDateCreation());
        return response;
    }
}