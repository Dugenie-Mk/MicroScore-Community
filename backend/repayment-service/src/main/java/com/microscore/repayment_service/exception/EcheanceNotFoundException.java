package com.microscore.repayment_service.exception;

public class EcheanceNotFoundException extends RuntimeException {

    public EcheanceNotFoundException(String message) {
        super(message);
    }
}