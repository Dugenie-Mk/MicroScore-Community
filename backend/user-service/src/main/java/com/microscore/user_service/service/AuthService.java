package com.microscore.user_service.service;

import com.microscore.user_service.config.JwtService;
import com.microscore.user_service.dto.LoginRequestDTO;
import com.microscore.user_service.dto.LoginResponseDTO;
import com.microscore.user_service.entity.User;
import com.microscore.user_service.exception.UserNotFoundException;
import com.microscore.user_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public LoginResponseDTO login(LoginRequestDTO dto) {
        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new UserNotFoundException("Email ou mot de passe incorrect"));

        if (!passwordEncoder.matches(dto.getMotDePasse(), user.getMotDePasse())) {
            throw new UserNotFoundException("Email ou mot de passe incorrect");
        }

        if (user.getStatut() != User.StatutCompte.ACTIF) {
            throw new UserNotFoundException("Votre compte n'est pas encore activé");
        }

        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());

        return LoginResponseDTO.builder()
                .token(token)
                .role(user.getRole().name())
                .email(user.getEmail())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .build();
    }
}