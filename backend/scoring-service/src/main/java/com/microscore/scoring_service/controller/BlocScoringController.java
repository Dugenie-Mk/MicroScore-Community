package com.microscore.scoring_service.controller;

import com.microscore.scoring_service.dto.BlocScoringDto;
import com.microscore.scoring_service.dto.CreerBlocScoringRequest;
import com.microscore.scoring_service.dto.CreerDetailRequest;
import com.microscore.scoring_service.dto.DetailCritereDto;
import com.microscore.scoring_service.service.BlocScoringService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/blocs-scoring")
@RequiredArgsConstructor
public class BlocScoringController {

    private final BlocScoringService blocScoringService;

    @GetMapping
    public ResponseEntity<List<BlocScoringDto>> getAll() {
        return ResponseEntity.ok(blocScoringService.getAllBlocs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BlocScoringDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(blocScoringService.getBlocById(id));
    }

    @PostMapping
    public ResponseEntity<BlocScoringDto> creer(@Valid @RequestBody CreerBlocScoringRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(blocScoringService.creerBloc(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BlocScoringDto> modifier(@PathVariable Long id, @Valid @RequestBody CreerBlocScoringRequest request) {
        return ResponseEntity.ok(blocScoringService.modifierBloc(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        blocScoringService.supprimerBloc(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{blocId}/details")
    public ResponseEntity<DetailCritereDto> ajouterDetail(@PathVariable Long blocId, @Valid @RequestBody CreerDetailRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(blocScoringService.ajouterDetail(blocId, request));
    }

    @PutMapping("/{blocId}/details/{detailId}")
    public ResponseEntity<DetailCritereDto> modifierDetail(@PathVariable Long blocId, @PathVariable Long detailId, @Valid @RequestBody CreerDetailRequest request) {
        return ResponseEntity.ok(blocScoringService.modifierDetail(blocId, detailId, request));
    }

    @DeleteMapping("/{blocId}/details/{detailId}")
    public ResponseEntity<Void> supprimerDetail(@PathVariable Long blocId, @PathVariable Long detailId) {
        blocScoringService.supprimerDetail(blocId, detailId);
        return ResponseEntity.noContent().build();
    }
}
