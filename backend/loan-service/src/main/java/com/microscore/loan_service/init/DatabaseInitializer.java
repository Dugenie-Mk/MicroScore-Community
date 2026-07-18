package com.microscore.loan_service.init;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class DatabaseInitializer {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseInitializer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void init() {
        try {
            jdbcTemplate.execute("ALTER TABLE pret MODIFY COLUMN idPret BIGINT AUTO_INCREMENT");
            log.info("Colonne idPret de la table pret configurée en AUTO_INCREMENT");
        } catch (Exception e) {
            log.warn("Impossible de modifier la colonne idPret en AUTO_INCREMENT : {}", e.getMessage());
            log.warn("Tentative de correction alternative...");
            try {
                jdbcTemplate.execute("ALTER TABLE pret CHANGE COLUMN idPret idPret BIGINT NOT NULL AUTO_INCREMENT");
                log.info("Colonne idPret modifiée via CHANGE COLUMN");
            } catch (Exception e2) {
                log.error("Échec de la migration AUTO_INCREMENT : {}", e2.getMessage());
                log.error("Veuillez exécuter manuellement : ALTER TABLE pret MODIFY COLUMN idPret BIGINT AUTO_INCREMENT");
            }
        }
    }
}
