package com.microscore.loan_service.service;

import com.microscore.loan_service.dto.EnregistrerScoreRequest;
import com.microscore.loan_service.dto.PretResponse;
import com.microscore.loan_service.entity.Pret;
import com.microscore.loan_service.exception.PretDejaExistantException;
import com.microscore.loan_service.exception.PretNotFoundException;
import com.microscore.loan_service.mapper.PretMapper;
import com.microscore.loan_service.repository.PretRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PretServiceImpl implements PretService {

    private final PretRepository pretRepository;
    private final PretMapper pretMapper;

    @Override
    @Transactional
    public PretResponse enregistrerScore(EnregistrerScoreRequest request) {

        if (pretRepository.existsById(request.getIdPret())) {
            throw new PretDejaExistantException(
                    "Un score a déjà été enregistré pour le prêt id=" + request.getIdPret());
        }

        Pret pret = Pret.builder()
                .idPret(request.getIdPret())
                .idClient(request.getIdClient())
                .scoreTotal(request.getScoreTotal())
                .build();

        Pret pretSauvegarde = pretRepository.save(pret);

        return pretMapper.toResponse(pretSauvegarde);
    }

    @Override
    public PretResponse getPretById(Long idPret) {
        Pret pret = pretRepository.findByIdPret(idPret)
                .orElseThrow(() -> new PretNotFoundException(
                        "Aucun prêt trouvé avec idPret=" + idPret));
        return pretMapper.toResponse(pret);
    }

    @Override
    public List<PretResponse> getPretsByClientId(Long idClient) {
        return pretRepository.findByIdClient(idClient).stream()
                .map(pretMapper::toResponse)
                .toList();
    }
}