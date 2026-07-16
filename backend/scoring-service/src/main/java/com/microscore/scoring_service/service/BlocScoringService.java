package com.microscore.scoring_service.service;

import com.microscore.scoring_service.dto.BlocScoringDto;
import com.microscore.scoring_service.dto.CreerBlocScoringRequest;
import com.microscore.scoring_service.dto.CreerDetailRequest;
import com.microscore.scoring_service.dto.DetailCritereDto;
import com.microscore.scoring_service.entity.BlocScoring;
import com.microscore.scoring_service.entity.DetailCritere;
import com.microscore.scoring_service.exception.ResourceNotFoundException;
import com.microscore.scoring_service.repository.BlocScoringRepository;
import com.microscore.scoring_service.repository.DetailCritereRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BlocScoringService {

    private final BlocScoringRepository blocRepository;
    private final DetailCritereRepository detailRepository;

    public List<BlocScoringDto> getAllBlocs() {
        return blocRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    public BlocScoringDto getBlocById(Long id) {
        BlocScoring bloc = blocRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bloc non trouvé avec l'id : " + id));
        return toDto(bloc);
    }

    @Transactional
    public BlocScoringDto creerBloc(CreerBlocScoringRequest request) {
        BlocScoring bloc = new BlocScoring();
        bloc.setNom(request.getNom());
        bloc.setPoids(request.getPoids());
        BlocScoring saved = blocRepository.save(bloc);
        return toDto(saved);
    }

    @Transactional
    public BlocScoringDto modifierBloc(Long id, CreerBlocScoringRequest request) {
        BlocScoring bloc = blocRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bloc non trouvé avec l'id : " + id));
        bloc.setNom(request.getNom());
        bloc.setPoids(request.getPoids());
        return toDto(blocRepository.save(bloc));
    }

    @Transactional
    public void supprimerBloc(Long id) {
        if (!blocRepository.existsById(id)) {
            throw new ResourceNotFoundException("Bloc non trouvé avec l'id : " + id);
        }
        blocRepository.deleteById(id);
    }

    @Transactional
    public DetailCritereDto ajouterDetail(Long blocId, CreerDetailRequest request) {
        BlocScoring bloc = blocRepository.findById(blocId)
                .orElseThrow(() -> new ResourceNotFoundException("Bloc non trouvé avec l'id : " + blocId));
        DetailCritere detail = new DetailCritere();
        detail.setNom(request.getNom());
        detail.setBloc(bloc);
        DetailCritere saved = detailRepository.save(detail);
        return toDetailDto(saved);
    }

    @Transactional
    public DetailCritereDto modifierDetail(Long blocId, Long detailId, CreerDetailRequest request) {
        DetailCritere detail = detailRepository.findById(detailId)
                .orElseThrow(() -> new ResourceNotFoundException("Détail non trouvé avec l'id : " + detailId));
        if (!detail.getBloc().getId().equals(blocId)) {
            throw new ResourceNotFoundException("Le détail n'appartient pas à ce bloc");
        }
        detail.setNom(request.getNom());
        return toDetailDto(detailRepository.save(detail));
    }

    @Transactional
    public void supprimerDetail(Long blocId, Long detailId) {
        DetailCritere detail = detailRepository.findById(detailId)
                .orElseThrow(() -> new ResourceNotFoundException("Détail non trouvé avec l'id : " + detailId));
        if (!detail.getBloc().getId().equals(blocId)) {
            throw new ResourceNotFoundException("Le détail n'appartient pas à ce bloc");
        }
        detailRepository.delete(detail);
    }

    private BlocScoringDto toDto(BlocScoring bloc) {
        List<DetailCritereDto> details = bloc.getDetails().stream()
                .map(this::toDetailDto)
                .toList();
        return BlocScoringDto.builder()
                .id(bloc.getId())
                .nom(bloc.getNom())
                .poids(bloc.getPoids())
                .details(details)
                .build();
    }

    private DetailCritereDto toDetailDto(DetailCritere detail) {
        return DetailCritereDto.builder()
                .id(detail.getId())
                .nom(detail.getNom())
                .build();
    }
}
