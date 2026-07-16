package com.microscore.user_service.mapper;

import com.microscore.user_service.dto.UserCreateDTO;
import com.microscore.user_service.dto.UserDTO;
import com.microscore.user_service.entity.User;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class UserMapper {

    public UserDTO toDTO(User user) {
        String fullName = (user.getPrenom() != null ? user.getPrenom() + " " : "") +
                (user.getNom() != null ? user.getNom() : "");
        return UserDTO.builder()
                .id(user.getId())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .fullName(fullName.trim())
                .email(user.getEmail())
                .telephone(user.getTelephone())
                .role(user.getRole())
                .statut(user.getStatut())
                .dateNaissance(user.getDateNaissance())
                .situationMatrimoniale(user.getSituationMatrimoniale())
                .niveauEducation(user.getNiveauEducation())
                .personnesACharge(user.getPersonnesACharge())
                .profession(user.getProfession())
                .secteurActivite(user.getSecteurActivite())
                .dateCreation(user.getDateCreation())
                .derniereConnexion(user.getDerniereConnexion())
                .build();
    }

    public User toEntity(UserCreateDTO dto) {
        String[] parts = dto.getFullName().trim().split(" ", 2);
        String prenom = parts[0];
        String nom = parts.length > 1 ? parts[1] : "";

        return User.builder()
                .nom(nom)
                .prenom(prenom)
                .email(dto.getEmail())
                .motDePasse(dto.getMotDePasse())
                .telephone(dto.getTelephone())
                .role(dto.getRole() != null ? dto.getRole() : User.Role.CLIENT)
                .statut(User.StatutCompte.EN_ATTENTE)
                .dateNaissance(dto.getDateNaissance())
                .situationMatrimoniale(dto.getSituationMatrimoniale())
                .niveauEducation(dto.getNiveauEducation())
                .personnesACharge(dto.getPersonnesACharge())
                .profession(dto.getProfession())
                .secteurActivite(dto.getSecteurActivite())
                .dateCreation(LocalDateTime.now())
                .build();
    }
}