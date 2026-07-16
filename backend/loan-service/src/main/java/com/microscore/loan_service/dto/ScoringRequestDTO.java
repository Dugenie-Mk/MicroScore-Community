package com.microscore.loan_service.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScoringRequestDTO {

    private Long clientId;

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

    // Montant et durée
    private Double montant;
    private Integer dureeRemboursementMois;

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