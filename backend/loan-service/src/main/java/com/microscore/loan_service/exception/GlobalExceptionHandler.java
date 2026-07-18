package com.microscore.loan_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(PretNotFoundException.class)
    public ResponseEntity<ErrorResponse> handlePretNotFound(PretNotFoundException ex) {
        ErrorResponse erreur = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .statut(HttpStatus.NOT_FOUND.value())
                .erreur("Prêt non trouvé")
                .message(ex.getMessage())
                .build();
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(erreur);
    }

    @ExceptionHandler(PretDejaExistantException.class)
    public ResponseEntity<ErrorResponse> handlePretDejaExistant(PretDejaExistantException ex) {
        ErrorResponse erreur = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .statut(HttpStatus.CONFLICT.value())
                .erreur("Prêt déjà existant")
                .message(ex.getMessage())
                .build();
        return ResponseEntity.status(HttpStatus.CONFLICT).body(erreur);
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

    @ExceptionHandler(StatutInvalideException.class)
    public ResponseEntity<ErrorResponse> handleStatutInvalide(StatutInvalideException ex) {
        ErrorResponse erreur = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .statut(HttpStatus.BAD_REQUEST.value())
                .erreur("Statut invalide")
                .message(ex.getMessage())
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(erreur);
    }
}