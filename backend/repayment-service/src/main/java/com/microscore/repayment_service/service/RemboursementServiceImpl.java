package com.microscore.repayment_service.service;

import com.microscore.repayment_service.dto.EcheanceDto;
import com.microscore.repayment_service.dto.GenererGrilleRequest;
import com.microscore.repayment_service.dto.GrilleAmortissementResponse;
import com.microscore.repayment_service.dto.PayerMultipleRequest;
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
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class RemboursementServiceImpl implements RemboursementService {

    private final EcheanceRepository echeanceRepository;
    private final EcheanceMapper echeanceMapper;

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

        // Taux fourni par le gestionnaire, ou 2% par défaut
        double tauxInteret = request.getTauxInteret() != null ? request.getTauxInteret() : 2.0;
        String typeTaux = request.getTypeTaux() != null ? request.getTypeTaux() : "ANNUEL";

        double tauxMensuel;
        if ("MENSUEL".equalsIgnoreCase(typeTaux)) {
            tauxMensuel = tauxInteret / 100.0;
        } else {
            tauxMensuel = (tauxInteret / 100.0) / 12;
        }

        double t = tauxMensuel;

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

        return construireResponse(request.getIdPret(), C, n, arrondir(totalInterets), tauxMensuel, echeancesSauvegardees);
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

        Echeance first = echeances.get(0);

        // Reconstitution du montant initial = capitalRembourse × nombre d'échéances
        Double capRemb = first.getCapitalRembourse();
        if (capRemb == null) capRemb = 0.0;
        int n = echeances.size();
        double montant = arrondir(capRemb * n);

        double totalInterets = echeances.stream()
                .mapToDouble(e -> Optional.ofNullable(e.getInterets()).orElse(0.0))
                .sum();

        // Recalcul du taux mensuel à partir de la 1ère échéance
        double interetsPremiere = Optional.ofNullable(first.getInterets()).orElse(0.0);
        double tauxMensuelEstime = montant > 0 ? interetsPremiere / montant : 0;

        log.info("Grille chargée pour le prêt id={} : {} échéances, montant={}", idPret, n, montant);

        return construireResponse(idPret, montant, n, arrondir(totalInterets), tauxMensuelEstime, echeances);
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


    // ===================== PAYER PLUSIEURS ÉCHÉANCES (CLIENT) =====================
    @Override
    @Transactional
    public List<EcheanceDto> payerEcheances(PayerMultipleRequest request) {
        List<Echeance> toutes = echeanceRepository
                .findByIdPretOrderByNumeroEcheanceAsc(request.getIdPret());

        if (toutes.isEmpty()) {
            throw new EcheanceNotFoundException(
                    "Aucune échéance trouvée pour le prêt id=" + request.getIdPret());
        }

        List<Echeance> nonPayees = toutes.stream()
                .filter(e -> e.getStatut() != StatutEcheance.PAYE)
                .toList();

        if (nonPayees.isEmpty()) {
            throw new EcheanceDejaPayeeException(
                    "Toutes les échéances du prêt id=" + request.getIdPret() + " sont déjà payées.");
        }

        int nbAPayer = Math.min(request.getNombreMois(), nonPayees.size());
        List<Echeance> aPayer = nonPayees.subList(0, nbAPayer);

        for (Echeance e : aPayer) {
            e.setStatut(StatutEcheance.PAYE);
            e.setDatePaiement(LocalDateTime.now());
        }

        List<Echeance> sauvegardees = echeanceRepository.saveAll(aPayer);
        log.info("{} échéance(s) payée(s) pour le prêt id={}", nbAPayer, request.getIdPret());

        return sauvegardees.stream()
                .map(echeanceMapper::toDto)
                .toList();
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
                                                           int n, double totalInterets,
                                                           double tauxMensuel, List<Echeance> echeances) {
        return GrilleAmortissementResponse.builder()
                .idPret(idPret)
                .montantEmprunte(montant)
                .dureeRemboursementMois(n)
                .tauxAnnuel(arrondir(tauxMensuel * 12 * 100))
                .tauxMensuel(arrondir(tauxMensuel * 100))
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