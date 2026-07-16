package com.microscore.user_service.config;

import com.microscore.user_service.entity.User;
import com.microscore.user_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seed("Simo", "Benoît", "simo.b@microscore.cm", "admin123", User.Role.ADMIN);
        seed("Djoko", "Arielle", "arielle.d@microscore.cm", "admin123", User.Role.ADMIN);
        seed("Nana", "Djibril", "nana.d@microscore.cm", "gest123", User.Role.GESTIONNAIRE);
        seed("Eyanga", "Rachel", "rachel.e@microscore.cm", "gest123", User.Role.GESTIONNAIRE);
        seed("Kambou", "Prunelle", "prunelle@gmail.com", "client123", User.Role.CLIENT);
        seed("Anafack", "Jules", "jules@gmail.com", "client123", User.Role.CLIENT);
        seed("Tchinda", "Paul", "paul.t@email.com", "client123", User.Role.CLIENT);
    }

    private void seed(String prenom, String nom, String email, String motDePasse, User.Role role) {
        var existingUser = userRepository.findByEmail(email);
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            if (!user.getMotDePasse().startsWith("$2")) {
                user.setMotDePasse(passwordEncoder.encode(motDePasse));
                userRepository.save(user);
            }
            return;
        }
        User user = User.builder()
                .prenom(prenom)
                .nom(nom)
                .email(email)
                .motDePasse(passwordEncoder.encode(motDePasse))
                .telephone("0000000000")
                .role(role)
                .statut(User.StatutCompte.ACTIF)
                .dateCreation(LocalDateTime.now())
                .build();
        userRepository.save(user);
    }
}
