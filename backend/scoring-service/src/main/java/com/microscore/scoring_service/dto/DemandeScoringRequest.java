package com.microscore.scoring_service.dto;

import com.microscore.scoring_service.entity.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DemandeScoringRequest {

    @NotNull(message = "L'identifiant du client est obligatoire")
    private Long clientId;

    // ---------- Profil sociodémographique ----------
    @NotNull(message = "L'âge est obligatoire")
    @Min(value = 18, message = "Le client doit être majeur")
    private Integer age;

    @NotNull(message = "La situation matrimoniale est obligatoire")
    private SituationMatrimoniale situationMatrimoniale;

    @NotNull(message = "Le niveau d'éducation est obligatoire")
    private NiveauEducation niveauEducation;

    @PositiveOrZero(message = "L'ancienneté de résidence doit être positive")
    private Integer ancienneteResidenceMois;

    @PositiveOrZero(message = "Le nombre de personnes à charge doit être positif")
    private Integer nombrePersonnesACharge;

    // ---------- Capacité de remboursement ----------
    @NotNull(message = "Le revenu mensuel net est obligatoire")
    @Positive(message = "Le revenu mensuel doit être positif")
    private Double revenuMensuelNet;

    @PositiveOrZero(message = "Les charges fixes doivent être positives")
    private Double chargesFixes;

    @PositiveOrZero(message = "Le flux de trésorerie doit être positif")
    private Double fluxTresorerieActivite;

    // ---------- Montant et durée du prêt ----------
    @NotNull(message = "Le montant du prêt est obligatoire")
    @Positive(message = "Le montant doit être positif")
    private Double montant;

    @NotNull(message = "La durée de remboursement est obligatoire")
    @Positive(message = "La durée doit être positive")
    private Integer dureeRemboursementMois;

    // ---------- Historique de crédit ----------
    @PositiveOrZero
    private Integer nombreRetardsAnterieurs;

    @PositiveOrZero
    private Integer nombrePretsEnCours;

    @PositiveOrZero
    private Integer ancienneteClientMois;

    // ---------- Activité économique / business ----------
    private TypeActivite typeActivite;

    @PositiveOrZero
    private Integer ancienneteEntrepriseMois;

    @PositiveOrZero
    private Double chiffreAffairesMensuel;

    private SecteurActivite secteurActivite;

    // ---------- Garanties et collatéraux ----------
    private Boolean garantiePersonnelle;

    private Boolean garantieMaterielle;

    @PositiveOrZero
    private Double epargneConstituee;

    // ---------- Facteurs comportementaux et qualitatifs ----------
    @Min(0)
    @Max(10)
    private Integer noteMotivationEntretien;

    private NiveauQualitatif reputationCommunaute;

    private NiveauQualitatif regulariteEpargne;
}