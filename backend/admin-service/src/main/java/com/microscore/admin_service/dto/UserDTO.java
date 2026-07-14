package com.microscore.admin_service.dto;

import lombok.*;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserDTO {
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String role;
    private String statut;
    private LocalDate dateNaissance;
    private String situationMatrimoniale;
    private String niveauEducation;
    private Integer personnesACharge;
}