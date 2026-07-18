package com.microscore.user_service.dto;

import com.microscore.user_service.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPatchDTO {

    private String fullName;
    private String email;
    private String telephone;
    private User.Role role;
    private LocalDate dateNaissance;
    private String situationMatrimoniale;
    private String niveauEducation;
    private Integer personnesACharge;
    private String cni;
    private String matricule;
    private Boolean mustChangePassword;
    private String motifBlocage;
    private String profession;
    private String secteurActivite;
}
