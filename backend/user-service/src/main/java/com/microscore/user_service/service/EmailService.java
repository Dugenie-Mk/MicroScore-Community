package com.microscore.user_service.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void envoyerMotDePasseTemporaire(String destinataire, String nomUtilisateur, String motDePasseTemporaire) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(destinataire);
            message.setSubject("MicroScore - Vos identifiants de connexion");
            message.setText(buildMessage(nomUtilisateur, motDePasseTemporaire));
            mailSender.send(message);
            log.info("Email envoyé à {}", destinataire);
        } catch (Exception e) {
            log.error("Échec envoi email à {} : {}", destinataire, e.getMessage());
        }
    }

    private String buildMessage(String nom, String tempsPwd) {
        return """
                Bonjour %s,

                Votre compte MicroScore a été créé avec succès.

                Voici vos identifiants de connexion :
                Mot de passe temporaire : %s

                Lors de votre première connexion, vous devrez obligatoirement changer ce mot de passe.

                L'équipe MicroScore
                """.formatted(nom, tempsPwd);
    }
}
