package com.microscore.user_service.dto;

import com.microscore.user_service.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {

    private Long id;
    private String nom;
    private String prenom;
    private String fullName;
    private String email;
    private String telephone;
    private User.Role role;
    private User.StatutCompte statut;
    private LocalDate dateNaissance;
    private String lieuNaissance;
    private String situationMatrimoniale;
    private String niveauEducation;
    private Integer personnesACharge;
    private String cni;
    private String matricule;
    private boolean mustChangePassword;
    private String motifBlocage;
    private String profession;
    private String secteurActivite;
    private String sexe;
    private Double revenu;
    private LocalDateTime dateCreation;
    private LocalDateTime derniereConnexion;
}