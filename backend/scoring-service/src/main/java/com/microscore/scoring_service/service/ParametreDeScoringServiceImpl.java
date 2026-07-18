package com.microscore.scoring_service.service;

import com.microscore.scoring_service.dto.ParametreDeScoringDto;
import com.microscore.scoring_service.entity.ParametreDeScoring;
import com.microscore.scoring_service.exception.ParametreNotFoundException;
import com.microscore.scoring_service.mapper.ParametreDeScoringMapper;
import com.microscore.scoring_service.repository.ParametreDeScoringRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ParametreDeScoringServiceImpl implements ParametreDeScoringService {

    private final ParametreDeScoringRepository parametreDeScoringRepository;
    private final ParametreDeScoringMapper parametreDeScoringMapper;

    @Override
    public List<ParametreDeScoringDto> getAllParametres() {
        return parametreDeScoringRepository.findAll().stream()
                .map(parametreDeScoringMapper::toDto)
                .toList();
    }

    @Override
    @Transactional
    public ParametreDeScoringDto creerParametre(ParametreDeScoringDto dto) {
        ParametreDeScoring entity = parametreDeScoringMapper.toEntity(dto);
        entity.setId(null);
        ParametreDeScoring sauvegarde = parametreDeScoringRepository.save(entity);
        return parametreDeScoringMapper.toDto(sauvegarde);
    }

    @Override
    @Transactional
    public ParametreDeScoringDto modifierParametre(Long id, ParametreDeScoringDto dto) {
        ParametreDeScoring existant = parametreDeScoringRepository.findById(id)
                .orElseThrow(() -> new ParametreNotFoundException(
                        "Aucun paramètre de scoring trouvé avec id=" + id));

        existant.setBlocCritere(dto.getBlocCritere());
        existant.setNomCritere(dto.getNomCritere());
        existant.setPoidsCritere(dto.getPoidsCritere());
        existant.setActif(dto.getActif() == null ? existant.getActif() : dto.getActif());
        existant.setDescription(dto.getDescription());

        ParametreDeScoring sauvegarde = parametreDeScoringRepository.save(existant);
        return parametreDeScoringMapper.toDto(sauvegarde);
    }

    @Override
    @Transactional
    public void supprimerParametre(Long id) {
        if (!parametreDeScoringRepository.existsById(id)) {
            throw new ParametreNotFoundException("Aucun paramètre de scoring trouvé avec id=" + id);
        }
        parametreDeScoringRepository.deleteById(id);
    }

    @Override
    public Map<String, Double> chargerPoidsActifs() {
        return parametreDeScoringRepository.findByActifTrue().stream()
                .collect(Collectors.toMap(
                        ParametreDeScoring::getNomCritere,
                        ParametreDeScoring::getPoidsCritere
                ));
    }
}