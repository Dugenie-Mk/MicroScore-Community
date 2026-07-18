package com.microscore.scoring_service.init;

import com.microscore.scoring_service.entity.BlocCritere;
import com.microscore.scoring_service.entity.ParametreDeScoring;
import com.microscore.scoring_service.repository.ParametreDeScoringRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final ParametreDeScoringRepository repository;

    @Override
    public void run(String... args) {
        repository.deleteAll();
        repository.flush();

        log.info("Initialisation des paramètres de scoring par défaut...");

        repository.saveAll(List.of(
                // PROFIL_SOCIODEMOGRAPHIQUE (total 20)
                bloc(BlocCritere.PROFIL_SOCIODEMOGRAPHIQUE, "Âge", 6.0, "Âge du client"),
                bloc(BlocCritere.PROFIL_SOCIODEMOGRAPHIQUE, "Situation matrimoniale", 4.0, "Célibataire, marié, etc."),
                bloc(BlocCritere.PROFIL_SOCIODEMOGRAPHIQUE, "Niveau d'éducation", 3.0, null),
                bloc(BlocCritere.PROFIL_SOCIODEMOGRAPHIQUE, "Stabilité résidentielle", 3.0, "Ancienneté à la résidence actuelle"),
                bloc(BlocCritere.PROFIL_SOCIODEMOGRAPHIQUE, "Nombre de personnes à charge", 4.0, null),

                // CAPACITE_REMBOURSEMENT (total 30)
                bloc(BlocCritere.CAPACITE_REMBOURSEMENT, "Revenus mensuels nets", 10.0, null),
                bloc(BlocCritere.CAPACITE_REMBOURSEMENT, "Charges fixes", 7.0, null),
                bloc(BlocCritere.CAPACITE_REMBOURSEMENT, "Taux d'endettement", 7.0, null),
                bloc(BlocCritere.CAPACITE_REMBOURSEMENT, "Flux de trésorerie de l'activité", 6.0, null),

                // MONTANT_DUREE (total 10)
                bloc(BlocCritere.MONTANT_DUREE, "Montant du prêt", 5.0, null),
                bloc(BlocCritere.MONTANT_DUREE, "Durée de remboursement", 5.0, null),

                // HISTORIQUE_CREDIT (total 15)
                bloc(BlocCritere.HISTORIQUE_CREDIT, "Comportement sur prêts précédents", 6.0, null),
                bloc(BlocCritere.HISTORIQUE_CREDIT, "Nombre de prêts en cours", 4.0, null),
                bloc(BlocCritere.HISTORIQUE_CREDIT, "Ancienneté client microfinance", 5.0, null),

                // ACTIVITE_ECONOMIQUE (total 12)
                bloc(BlocCritere.ACTIVITE_ECONOMIQUE, "Type d'activité", 3.0, null),
                bloc(BlocCritere.ACTIVITE_ECONOMIQUE, "Ancienneté de l'entreprise", 3.0, null),
                bloc(BlocCritere.ACTIVITE_ECONOMIQUE, "Chiffre d'affaires / bénéfices estimés", 3.0, null),
                bloc(BlocCritere.ACTIVITE_ECONOMIQUE, "Secteur d'activité", 3.0, null),

                // GARANTIES (total 8)
                bloc(BlocCritere.GARANTIES, "Garantie personnelle", 3.0, null),
                bloc(BlocCritere.GARANTIES, "Garantie matérielle", 2.5, null),
                bloc(BlocCritere.GARANTIES, "Épargne constituée", 2.5, null),

                // FACTEURS_COMPORTEMENTAUX (total 5)
                bloc(BlocCritere.FACTEURS_COMPORTEMENTAUX, "Motivation et projet clair", 2.0, null),
                bloc(BlocCritere.FACTEURS_COMPORTEMENTAUX, "Réputation dans la communauté", 1.5, null),
                bloc(BlocCritere.FACTEURS_COMPORTEMENTAUX, "Régularité de l'épargne", 1.5, null)
        ));

        log.info("24 paramètres de scoring initialisés (total 100%)");
    }

    private ParametreDeScoring bloc(BlocCritere bloc, String nom, double poids, String description) {
        return ParametreDeScoring.builder()
                .blocCritere(bloc)
                .nomCritere(nom)
                .poidsCritere(poids)
                .actif(true)
                .description(description)
                .build();
    }
}
