package com.microscore.scoring_service.controller;

import com.microscore.scoring_service.dto.ParametreDeScoringDto;
import com.microscore.scoring_service.service.ParametreDeScoringService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/parametres-scoring")
@RequiredArgsConstructor
public class ParametreDeScoringController {

    private final ParametreDeScoringService parametreDeScoringService;

    @GetMapping
    public ResponseEntity<List<ParametreDeScoringDto>> getAll() {
        return ResponseEntity.ok(parametreDeScoringService.getAllParametres());
    }

    @PostMapping
    public ResponseEntity<ParametreDeScoringDto> creer(@Valid @RequestBody ParametreDeScoringDto dto) {
        ParametreDeScoringDto cree = parametreDeScoringService.creerParametre(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(cree);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ParametreDeScoringDto> modifier(
            @PathVariable Long id, @Valid @RequestBody ParametreDeScoringDto dto) {
        return ResponseEntity.ok(parametreDeScoringService.modifierParametre(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        parametreDeScoringService.supprimerParametre(id);
        return ResponseEntity.noContent().build();
    }
}