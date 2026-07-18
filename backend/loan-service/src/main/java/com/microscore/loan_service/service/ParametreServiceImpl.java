package com.microscore.loan_service.service;

import com.microscore.loan_service.entity.Parametre;
import com.microscore.loan_service.repository.ParametreRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ParametreServiceImpl implements ParametreService {

    private final ParametreRepository parametreRepository;

    @PostConstruct
    public void initDefaults() {
        initParam("TAUX_INTERET_GLOBAL", "2.0");
        initParam("TYPE_TAUX_GLOBAL", "ANNUEL");
    }

    private void initParam(String cle, String valeurParDefaut) {
        if (!parametreRepository.existsById(cle)) {
            parametreRepository.save(Parametre.builder()
                    .cle(cle)
                    .valeur(valeurParDefaut)
                    .build());
            log.info("Paramètre '{}' initialisé avec la valeur par défaut '{}'", cle, valeurParDefaut);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public String getValeur(String cle) {
        return parametreRepository.findById(cle)
                .map(Parametre::getValeur)
                .orElse(null);
    }

    @Override
    @Transactional
    public void setValeur(String cle, String valeur) {
        Parametre param = parametreRepository.findById(cle)
                .orElse(Parametre.builder().cle(cle).build());
        param.setValeur(valeur);
        parametreRepository.save(param);
        log.info("Paramètre '{}' mis à jour avec la valeur '{}'", cle, valeur);
    }
}
