package com.microscore.loan_service.repository;

import com.microscore.loan_service.entity.Loan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LoanRepository extends JpaRepository<Loan, Long> {

    List<Loan> findByClientId(Long clientId);
}