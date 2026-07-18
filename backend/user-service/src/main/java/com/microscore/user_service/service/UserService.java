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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    private final EmailService emailService;

    public UserDTO createUser(UserCreateDTO dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new EmailAlreadyExistsException("Un compte existe déjà avec cet email : " + dto.getEmail());
        }
        String rawPassword = dto.getMotDePasse();
        User user = userMapper.toEntity(dto);
        user.setMotDePasse(passwordEncoder.encode(rawPassword));
        user.setMustChangePassword(true);
        User savedUser = userRepository.save(user);
        UserDTO result = userMapper.toDTO(savedUser);
        emailService.envoyerMotDePasseTemporaire(savedUser.getEmail(), result.getFullName(), rawPassword);
        return result;
    }

    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Utilisateur non trouvé avec l'id : " + id));
        return userMapper.toDTO(user);
    }

    public Page<UserDTO> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(userMapper::toDTO);
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(userMapper::toDTO)
                .toList();
    }

    public Page<UserDTO> getUsersByRole(User.Role role, Pageable pageable) {
        return userRepository.findByRole(role, pageable)
                .map(userMapper::toDTO);
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
        existingUser.setCni(dto.getCni());
        existingUser.setMatricule(dto.getMatricule());
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

    public UserDTO updateUserStatus(Long id, User.StatutCompte statut, String motif) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Utilisateur non trouvé avec l'id : " + id));
        user.setStatut(statut);
        if (statut == User.StatutCompte.BLOQUE) {
            user.setMotifBlocage(motif);
        } else {
            user.setMotifBlocage(null);
        }
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
        if (dto.getCni() != null) existingUser.setCni(dto.getCni());
        if (dto.getMatricule() != null) existingUser.setMatricule(dto.getMatricule());
        if (dto.getMustChangePassword() != null) existingUser.setMustChangePassword(dto.getMustChangePassword());
        if (dto.getMotifBlocage() != null) existingUser.setMotifBlocage(dto.getMotifBlocage());
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

    public UserDTO changePassword(Long id, String currentPassword, String newPassword) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Utilisateur non trouvé avec l'id : " + id));
        if (!passwordEncoder.matches(currentPassword, user.getMotDePasse())) {
            throw new UserNotFoundException("Mot de passe actuel incorrect");
        }
        user.setMotDePasse(passwordEncoder.encode(newPassword));
        user.setMustChangePassword(false);
        user.setDerniereConnexion(LocalDateTime.now());
        if (user.getStatut() == User.StatutCompte.EN_ATTENTE) {
            user.setStatut(User.StatutCompte.ACTIF);
        }
        User updatedUser = userRepository.save(user);
        return userMapper.toDTO(updatedUser);
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
        if (user.isMustChangePassword()) {
            return userMapper.toDTO(user);
        }
        user.setDerniereConnexion(LocalDateTime.now());
        userRepository.save(user);
        return userMapper.toDTO(user);
    }
}