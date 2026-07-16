package com.microscore.user_service.service;

import com.microscore.user_service.dto.UserCreateDTO;
import com.microscore.user_service.dto.UserDTO;
import com.microscore.user_service.dto.UserPatchDTO;
import com.microscore.user_service.entity.User;
import com.microscore.user_service.exception.EmailAlreadyExistsException;
import com.microscore.user_service.exception.UserNotFoundException;
import com.microscore.user_service.mapper.UserMapper;
import com.microscore.user_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public UserDTO createUser(UserCreateDTO dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new EmailAlreadyExistsException("Un compte existe déjà avec cet email : " + dto.getEmail());
        }
        User user = userMapper.toEntity(dto);
        user.setMotDePasse(passwordEncoder.encode(dto.getMotDePasse()));
        User savedUser = userRepository.save(user);
        return userMapper.toDTO(savedUser);
    }

    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Utilisateur non trouvé avec l'id : " + id));
        return userMapper.toDTO(user);
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(userMapper::toDTO)
                .toList();
    }

    public List<UserDTO> getUsersByRole(User.Role role) {
        return userRepository.findByRole(role)
                .stream()
                .map(userMapper::toDTO)
                .toList();
    }

    public UserDTO updateUser(Long id, UserCreateDTO dto) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Utilisateur non trouvé avec l'id : " + id));

        String[] parts = dto.getFullName().trim().split(" ", 2);
        existingUser.setPrenom(parts[0]);
        existingUser.setNom(parts.length > 1 ? parts[1] : "");
        existingUser.setTelephone(dto.getTelephone());
        existingUser.setSituationMatrimoniale(dto.getSituationMatrimoniale());
        existingUser.setNiveauEducation(dto.getNiveauEducation());
        existingUser.setPersonnesACharge(dto.getPersonnesACharge());
        existingUser.setProfession(dto.getProfession());
        existingUser.setSecteurActivite(dto.getSecteurActivite());

        User updatedUser = userRepository.save(existingUser);
        return userMapper.toDTO(updatedUser);
    }

    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Utilisateur non trouvé avec l'id : " + id));
        userRepository.delete(user);
    }

    public UserDTO validateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Utilisateur non trouvé avec l'id : " + id));
        user.setStatut(User.StatutCompte.ACTIF);
        User validatedUser = userRepository.save(user);
        return userMapper.toDTO(validatedUser);
    }

    public UserDTO updateUserStatus(Long id, User.StatutCompte statut) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Utilisateur non trouvé avec l'id : " + id));
        user.setStatut(statut);
        User updatedUser = userRepository.save(user);
        return userMapper.toDTO(updatedUser);
    }

    public UserDTO patchUser(Long id, UserPatchDTO dto) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Utilisateur non trouvé avec l'id : " + id));

        if (dto.getFullName() != null) {
            String[] parts = dto.getFullName().trim().split(" ", 2);
            existingUser.setPrenom(parts[0]);
            existingUser.setNom(parts.length > 1 ? parts[1] : "");
        }
        if (dto.getEmail() != null) {
            if (!dto.getEmail().equals(existingUser.getEmail()) && userRepository.existsByEmail(dto.getEmail())) {
                throw new EmailAlreadyExistsException("Un compte existe déjà avec cet email : " + dto.getEmail());
            }
            existingUser.setEmail(dto.getEmail());
        }
        if (dto.getTelephone() != null) existingUser.setTelephone(dto.getTelephone());
        if (dto.getRole() != null) existingUser.setRole(dto.getRole());
        if (dto.getDateNaissance() != null) existingUser.setDateNaissance(dto.getDateNaissance());
        if (dto.getSituationMatrimoniale() != null) existingUser.setSituationMatrimoniale(dto.getSituationMatrimoniale());
        if (dto.getNiveauEducation() != null) existingUser.setNiveauEducation(dto.getNiveauEducation());
        if (dto.getPersonnesACharge() != null) existingUser.setPersonnesACharge(dto.getPersonnesACharge());
        if (dto.getProfession() != null) existingUser.setProfession(dto.getProfession());
        if (dto.getSecteurActivite() != null) existingUser.setSecteurActivite(dto.getSecteurActivite());

        User updatedUser = userRepository.save(existingUser);
        return userMapper.toDTO(updatedUser);
    }

    public void updateLastLogin(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Utilisateur non trouvé avec l'id : " + id));
        user.setDerniereConnexion(LocalDateTime.now());
        userRepository.save(user);
    }

    public UserDTO authenticate(String email, String motDePasse) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Email ou mot de passe incorrect"));
        if (!passwordEncoder.matches(motDePasse, user.getMotDePasse())) {
            throw new UserNotFoundException("Email ou mot de passe incorrect");
        }
        if (user.getStatut() == User.StatutCompte.BLOQUE) {
            throw new UserNotFoundException("Ce compte est bloqué");
        }
        user.setDerniereConnexion(LocalDateTime.now());
        userRepository.save(user);
        return userMapper.toDTO(user);
    }
}