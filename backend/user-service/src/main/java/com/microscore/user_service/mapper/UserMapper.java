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
                .lieuNaissance(user.getLieuNaissance())
                .situationMatrimoniale(user.getSituationMatrimoniale())
                .niveauEducation(user.getNiveauEducation())
                .personnesACharge(user.getPersonnesACharge())
                .cni(user.getCni())
                .matricule(user.getMatricule())
                .mustChangePassword(user.isMustChangePassword())
                .motifBlocage(user.getMotifBlocage())
                .profession(user.getProfession())
                .secteurActivite(user.getSecteurActivite())
                .sexe(user.getSexe())
                .revenu(user.getRevenu())
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
                .lieuNaissance(dto.getLieuNaissance())
                .situationMatrimoniale(dto.getSituationMatrimoniale())
                .niveauEducation(dto.getNiveauEducation())
                .personnesACharge(dto.getPersonnesACharge())
                .cni(dto.getCni())
                .matricule(dto.getMatricule())
                .mustChangePassword(dto.isMustChangePassword())
                .profession(dto.getProfession())
                .secteurActivite(dto.getSecteurActivite())
                .sexe(dto.getSexe())
                .revenu(dto.getRevenu())
                .dateCreation(LocalDateTime.now())
                .build();
    }
}