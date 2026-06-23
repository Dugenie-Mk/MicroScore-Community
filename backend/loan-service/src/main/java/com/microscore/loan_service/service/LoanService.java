package com.microscore.loan_service.service;

import com.microscore.loan_service.dto.LoanRequest;
import com.microscore.loan_service.dto.LoanResponse;
import com.microscore.loan_service.entity.Loan;
import com.microscore.loan_service.mapper.LoanMapper;
import com.microscore.loan_service.repository.LoanRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LoanService {

    private final LoanRepository loanRepository;
    private final LoanMapper loanMapper;

    public LoanService(LoanRepository loanRepository, LoanMapper loanMapper) {
        this.loanRepository = loanRepository;
        this.loanMapper = loanMapper;
    }

    @Transactional
    public LoanResponse creerPret(LoanRequest request) {
        Loan loan = loanMapper.toEntity(request);
        Loan loanSauvegarde = loanRepository.save(loan);
        return loanMapper.toResponse(loanSauvegarde);
    }

    public LoanResponse obtenirPretParId(Long id) {
        Loan loan = loanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prêt introuvable avec id : " + id));
        return loanMapper.toResponse(loan);
    }

    public List<LoanResponse> obtenirPretsParClient(Long clientId) {
        return loanRepository.findByClientId(clientId)
                .stream()
                .map(loanMapper::toResponse)
                .collect(Collectors.toList());
    }
}