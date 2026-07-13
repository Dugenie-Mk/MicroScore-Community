package com.microscore.scoring_service.exception;

public class LoanServiceUnavailableException extends RuntimeException {

    public LoanServiceUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
}