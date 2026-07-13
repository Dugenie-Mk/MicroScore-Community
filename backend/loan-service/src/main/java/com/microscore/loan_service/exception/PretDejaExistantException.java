package com.microscore.loan_service.exception;

public class PretDejaExistantException extends RuntimeException {

    public PretDejaExistantException(String message) {
        super(message);
    }
}