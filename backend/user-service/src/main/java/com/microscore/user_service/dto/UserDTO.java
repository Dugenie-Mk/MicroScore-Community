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
    private String fullName;
    private String email;
    private String telephone;
    private User.Role role;
    private User.StatutCompte statut;
    private LocalDate dateNaissance;
    private String situationMatrimoniale;
    private String niveauEducation;
    private Integer personnesACharge;
    private String profession;
    private String secteurActivite;
    private LocalDateTime dateCreation;
    private LocalDateTime derniereConnexion;
}