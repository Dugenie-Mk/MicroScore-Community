package com.microscore.user_service.mapper;

import com.microscore.user_service.dto.UserCreateDTO;
import com.microscore.user_service.dto.UserDTO;
import com.microscore.user_service.entity.User;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class UserMapper {

    public UserDTO toDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .email(user.getEmail())
                .telephone(user.getTelephone())
                .role(user.getRole())
                .statut(user.getStatut())
                .dateNaissance(user.getDateNaissance())
                .situationMatrimoniale(user.getSituationMatrimoniale())
                .niveauEducation(user.getNiveauEducation())
                .personnesACharge(user.getPersonnesACharge())
                .build();
    }

    public User toEntity(UserCreateDTO dto) {
        return User.builder()
                .nom(dto.getNom())
                .prenom(dto.getPrenom())
                .email(dto.getEmail())
                .motDePasse(dto.getMotDePasse())
                .telephone(dto.getTelephone())
                .role(dto.getRole() != null ? dto.getRole() : User.Role.CLIENT)
                .statut(User.StatutCompte.EN_ATTENTE)
                .dateNaissance(dto.getDateNaissance())
                .situationMatrimoniale(dto.getSituationMatrimoniale())
                .niveauEducation(dto.getNiveauEducation())
                .personnesACharge(dto.getPersonnesACharge())
                .dateCreation(LocalDateTime.now())
                .build();
    }
}