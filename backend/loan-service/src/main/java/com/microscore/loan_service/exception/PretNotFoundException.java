package com.microscore.loan_service.exception;

public class PretNotFoundException extends RuntimeException {

    public PretNotFoundException(String message) {
        super(message);
    }
}