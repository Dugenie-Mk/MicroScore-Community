package com.microscore.repayment_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EcheanceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleEcheanceNotFound(EcheanceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .statut(HttpStatus.NOT_FOUND.value())
                .erreur("Échéance non trouvée")
                .message(ex.getMessage())
                .build());
    }

    @ExceptionHandler(GrilleDejaExistanteException.class)
    public ResponseEntity<ErrorResponse> handleGrilleDejaExistante(GrilleDejaExistanteException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .statut(HttpStatus.CONFLICT.value())
                .erreur("Grille déjà existante")
                .message(ex.getMessage())
                .build());
    }

    @ExceptionHandler(EcheanceDejaPayeeException.class)
    public ResponseEntity<ErrorResponse> handleEcheanceDejaPayee(EcheanceDejaPayeeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .statut(HttpStatus.BAD_REQUEST.value())
                .erreur("Échéance déjà payée")
                .message(ex.getMessage())
                .build());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        List<String> details = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getField() + " : " + e.getDefaultMessage())
                .toList();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .statut(HttpStatus.BAD_REQUEST.value())
                .erreur("Erreur de validation")
                .message("Un ou plusieurs champs sont invalides")
                .details(details)
                .build());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .statut(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .erreur("Erreur interne")
                .message(ex.getMessage())
                .build());
    }
}