package com.microscore.repayment_service.service;

import com.microscore.repayment_service.dto.EcheanceDto;
import com.microscore.repayment_service.dto.GenererGrilleRequest;
import com.microscore.repayment_service.dto.GrilleAmortissementResponse;
import com.microscore.repayment_service.entity.Echeance;
import com.microscore.repayment_service.entity.StatutEcheance;
import com.microscore.repayment_service.exception.EcheanceDejaPayeeException;
import com.microscore.repayment_service.exception.EcheanceNotFoundException;
import com.microscore.repayment_service.exception.GrilleDejaExistanteException;
import com.microscore.repayment_service.mapper.EcheanceMapper;
import com.microscore.repayment_service.repository.EcheanceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class RemboursementServiceImpl implements RemboursementService {

    private final EcheanceRepository echeanceRepository;
    private final EcheanceMapper echeanceMapper;

    // Taux annuel fixe : 2% par an
    private static final double TAUX_ANNUEL = 0.02;
    private static final double TAUX_MENSUEL = TAUX_ANNUEL / 12;


    // ===================== GÉNÉRATION DE LA GRILLE =====================
    @Override
    @Transactional
    public GrilleAmortissementResponse genererGrille(GenererGrilleRequest request) {

        if (echeanceRepository.existsByIdPret(request.getIdPret())) {
            throw new GrilleDejaExistanteException(
                    "Une grille d'amortissement existe déjà pour le prêt id=" + request.getIdPret());
        }

        double C = request.getMontant();
        int n = request.getDureeRemboursementMois();
        double t = TAUX_MENSUEL;

        // Capital remboursé constant à chaque échéance
        // Formule : Capital Remboursé = C / n
        double capitalRembourse = arrondir(C / n);

        LocalDate dateDebut = LocalDate.parse(request.getDateDebut());
        List<Echeance> echeances = new ArrayList<>();

        double capitalRestantDuCourant = C;
        double totalInterets = 0.0;

        for (int i = 1; i <= n; i++) {

            // Formule : Intérêts(i) = Capital Restant Dû(i-1) × t
            double interets = arrondir(capitalRestantDuCourant * t);

            // Formule : Mensualité(i) = Capital Remboursé + Intérêts(i)
            double mensualite = arrondir(capitalRembourse + interets);

            // Formule : Capital Restant Dû(i) = Capital Restant Dû(i-1) - Capital Remboursé
            double capitalRestantDuApres = arrondir(capitalRestantDuCourant - capitalRembourse);

            // Correction sur la dernière échéance pour éviter les décalages d'arrondi
            if (i == n) {
                capitalRestantDuApres = 0.0;
            }

            totalInterets += interets;

            Echeance echeance = Echeance.builder()
                    .idPret(request.getIdPret())
                    .numeroEcheance(i)
                    .capitalRembourse(capitalRembourse)
                    .interets(interets)
                    .mensualite(mensualite)
                    .capitalRestantDu(capitalRestantDuApres)
                    .statut(StatutEcheance.EN_ATTENTE)
                    .dateEcheancePrevue(dateDebut.plusMonths(i - 1))
                    .build();

            echeances.add(echeance);

            // Mise à jour du capital restant dû pour la prochaine itération
            capitalRestantDuCourant = capitalRestantDuApres;
        }

        List<Echeance> echeancesSauvegardees = echeanceRepository.saveAll(echeances);

        log.info("Grille d'amortissement générée pour le prêt id={} : {} échéances", request.getIdPret(), n);

        return construireResponse(request.getIdPret(), C, n, arrondir(totalInterets), echeancesSauvegardees);
    }


    // ===================== RÉCUPÉRER LA GRILLE =====================
    @Override
    public GrilleAmortissementResponse getGrilleByIdPret(Long idPret) {
        List<Echeance> echeances = echeanceRepository
                .findByIdPretOrderByNumeroEcheanceAsc(idPret);

        if (echeances.isEmpty()) {
            throw new EcheanceNotFoundException(
                    "Aucune grille d'amortissement trouvée pour le prêt id=" + idPret);
        }

        // Reconstitution du montant initial = capitalRembourse × nombre d'échéances
        double capitalRembourseUnitaire = echeances.get(0).getCapitalRembourse();
        int n = echeances.size();
        double montant = arrondir(capitalRembourseUnitaire * n);

        double totalInterets = echeances.stream()
                .mapToDouble(Echeance::getInterets)
                .sum();

        return construireResponse(idPret, montant, n, arrondir(totalInterets), echeances);
    }


    // ===================== PAYER UNE ÉCHÉANCE =====================
    @Override
    @Transactional
    public EcheanceDto payerEcheance(Long echeanceId) {
        Echeance echeance = echeanceRepository.findById(echeanceId)
                .orElseThrow(() -> new EcheanceNotFoundException(
                        "Aucune échéance trouvée avec id=" + echeanceId));

        if (echeance.getStatut() == StatutEcheance.PAYE) {
            throw new EcheanceDejaPayeeException(
                    "L'échéance n°" + echeance.getNumeroEcheance() + " est déjà payée.");
        }

        echeance.setStatut(StatutEcheance.PAYE);
        echeance.setDatePaiement(LocalDateTime.now());

        Echeance echeanceMiseAJour = echeanceRepository.save(echeance);
        log.info("Échéance n°{} du prêt id={} marquée comme PAYÉE", echeance.getNumeroEcheance(), echeance.getIdPret());

        return echeanceMapper.toDto(echeanceMiseAJour);
    }


    // ===================== MARQUER UNE ÉCHÉANCE EN RETARD =====================
    @Override
    @Transactional
    public EcheanceDto marquerEnRetard(Long echeanceId) {
        Echeance echeance = echeanceRepository.findById(echeanceId)
                .orElseThrow(() -> new EcheanceNotFoundException(
                        "Aucune échéance trouvée avec id=" + echeanceId));

        if (echeance.getStatut() == StatutEcheance.PAYE) {
            throw new EcheanceDejaPayeeException(
                    "Impossible de marquer en retard l'échéance n°" +
                            echeance.getNumeroEcheance() + " : elle est déjà payée.");
        }

        echeance.setStatut(StatutEcheance.EN_RETARD);
        Echeance echeanceMiseAJour = echeanceRepository.save(echeance);
        log.info("Échéance n°{} du prêt id={} marquée EN_RETARD", echeance.getNumeroEcheance(), echeance.getIdPret());

        return echeanceMapper.toDto(echeanceMiseAJour);
    }


    // ===================== FILTRER PAR STATUT =====================
    @Override
    public List<EcheanceDto> getEcheancesByStatut(Long idPret, String statut) {
        StatutEcheance statutEnum = StatutEcheance.valueOf(statut.toUpperCase());
        return echeanceRepository.findByIdPretAndStatut(idPret, statutEnum).stream()
                .map(echeanceMapper::toDto)
                .toList();
    }


    // ===================== MÉTHODES UTILITAIRES =====================
    private GrilleAmortissementResponse construireResponse(Long idPret, double montant,
                                                           int n, double totalInterets, List<Echeance> echeances) {
        return GrilleAmortissementResponse.builder()
                .idPret(idPret)
                .montantEmprunte(montant)
                .dureeRemboursementMois(n)
                .tauxAnnuel(TAUX_ANNUEL * 100)
                .tauxMensuel(arrondir(TAUX_MENSUEL * 100))
                .capitalRembourseParEcheance(echeances.get(0).getCapitalRembourse())
                .totalInterets(totalInterets)
                .coutTotalCredit(arrondir(montant + totalInterets))
                .echeances(echeances.stream().map(echeanceMapper::toDto).toList())
                .build();
    }

    private double arrondir(double valeur) {
        return Math.round(valeur * 100.0) / 100.0;
    }
}