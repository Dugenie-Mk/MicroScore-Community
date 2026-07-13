package com.microscore.scoring_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ScoreNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleScoreNotFound(ScoreNotFoundException ex) {
        ErrorResponse erreur = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .statut(HttpStatus.NOT_FOUND.value())
                .erreur("Score non trouvé")
                .message(ex.getMessage())
                .build();
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(erreur);
    }

    @ExceptionHandler(ParametreNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleParametreNotFound(ParametreNotFoundException ex) {
        ErrorResponse erreur = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .statut(HttpStatus.NOT_FOUND.value())
                .erreur("Paramètre de scoring non trouvé")
                .message(ex.getMessage())
                .build();
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(erreur);
    }

    @ExceptionHandler(ScoringConfigurationException.class)
    public ResponseEntity<ErrorResponse> handleScoringConfiguration(ScoringConfigurationException ex) {
        ErrorResponse erreur = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .statut(HttpStatus.CONFLICT.value())
                .erreur("Configuration du scoring invalide")
                .message(ex.getMessage())
                .build();
        return ResponseEntity.status(HttpStatus.CONFLICT).body(erreur);
    }

    @ExceptionHandler(DemandeScoringInvalideException.class)
    public ResponseEntity<ErrorResponse> handleDemandeInvalide(DemandeScoringInvalideException ex) {
        ErrorResponse erreur = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .statut(HttpStatus.BAD_REQUEST.value())
                .erreur("Demande de scoring invalide")
                .message(ex.getMessage())
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(erreur);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException ex) {
        List<String> details = ex.getBindingResult().getFieldErrors().stream()
                .map(err -> err.getField() + " : " + err.getDefaultMessage())
                .toList();

        ErrorResponse erreur = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .statut(HttpStatus.BAD_REQUEST.value())
                .erreur("Erreur de validation")
                .message("Un ou plusieurs champs sont invalides")
                .details(details)
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(erreur);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        ErrorResponse erreur = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .statut(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .erreur("Erreur interne")
                .message(ex.getMessage())
                .build();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(erreur);
    }
    @ExceptionHandler(LoanServiceUnavailableException.class)
    public ResponseEntity<ErrorResponse> handleLoanServiceUnavailable(LoanServiceUnavailableException ex) {
        ErrorResponse erreur = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .statut(HttpStatus.SERVICE_UNAVAILABLE.value())
                .erreur("Service de prêt indisponible")
                .message(ex.getMessage())
                .build();
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(erreur);
    }
}