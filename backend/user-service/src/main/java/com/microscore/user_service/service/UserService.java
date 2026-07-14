package com.microscore.user_service.service;

import com.microscore.user_service.dto.UserCreateDTO;
import com.microscore.user_service.dto.UserDTO;
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

    public UserDTO updateUser(Long id, UserCreateDTO dto) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Utilisateur non trouvé avec l'id : " + id));

        existingUser.setNom(dto.getNom());
        existingUser.setPrenom(dto.getPrenom());
        existingUser.setTelephone(dto.getTelephone());
        existingUser.setSituationMatrimoniale(dto.getSituationMatrimoniale());
        existingUser.setNiveauEducation(dto.getNiveauEducation());
        existingUser.setPersonnesACharge(dto.getPersonnesACharge());

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

    public void updateLastLogin(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Utilisateur non trouvé avec l'id : " + id));
        user.setDerniereConnexion(LocalDateTime.now());
        userRepository.save(user);
    }
}