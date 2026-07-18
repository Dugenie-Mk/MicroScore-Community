package com.microscore.loan_service.controller;

import com.microscore.loan_service.service.ParametreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/parametres")
@RequiredArgsConstructor
public class ParametreController {

    private final ParametreService parametreService;

    @GetMapping("/{cle}")
    public ResponseEntity<Map<String, String>> getParametre(@PathVariable String cle) {
        String valeur = parametreService.getValeur(cle);
        if (valeur == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(Map.of("cle", cle, "valeur", valeur));
    }

    @PutMapping("/{cle}")
    public ResponseEntity<Map<String, String>> updateParametre(
            @PathVariable String cle,
            @RequestBody Map<String, String> body) {
        String valeur = body.get("valeur");
        if (valeur == null) {
            return ResponseEntity.badRequest().build();
        }
        parametreService.setValeur(cle, valeur);
        return ResponseEntity.ok(Map.of("cle", cle, "valeur", valeur));
    }
}
