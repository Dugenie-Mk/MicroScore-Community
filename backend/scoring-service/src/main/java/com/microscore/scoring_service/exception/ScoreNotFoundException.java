package com.microscore.scoring_service.exception;

public class ScoreNotFoundException extends RuntimeException {

    public ScoreNotFoundException(String message) {
        super(message);
    }
}