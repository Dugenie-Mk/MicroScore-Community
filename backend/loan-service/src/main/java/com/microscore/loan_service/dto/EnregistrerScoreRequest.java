package com.microscore.loan_service.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnregistrerScoreRequest {

    @NotNull(message = "L'identifiant du prêt est obligatoire")
    private Long idPret;

    @NotNull(message = "L'identifiant du client est obligatoire")
    private Long idClient;

    @NotNull(message = "Le montant est obligatoire")
    private Double montant;

    @NotNull(message = "La durée de remboursement est obligatoire")
    private Integer dureeRemboursementMois;

    private Double scoreTotal;

    // Profil sociodémographique
    private Integer age;
    private String situationMatrimoniale;
    private String niveauEducation;
    private Integer ancienneteResidenceMois;
    private Integer nombrePersonnesACharge;

    // Capacité de remboursement
    private Double revenuMensuelNet;
    private Double chargesFixes;
    private Double fluxTresorerieActivite;

    // Historique de crédit
    private Integer nombreRetardsAnterieurs;
    private Integer nombrePretsEnCours;
    private Integer ancienneteClientMois;

    // Activité économique
    private String typeActivite;
    private Integer ancienneteEntrepriseMois;
    private Double chiffreAffairesMensuel;
    private String secteurActivite;

    // Garanties
    private Boolean garantiePersonnelle;
    private Boolean garantieMaterielle;
    private Double epargneConstituee;

    // Facteurs comportementaux
    private Integer noteMotivationEntretien;
    private String reputationCommunaute;
    private String regulariteEpargne;
}