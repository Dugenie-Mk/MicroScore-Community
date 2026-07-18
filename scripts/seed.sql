-- =========================================================
-- MICROSCORE COMMUNITY - RESET & SEED SCRIPT
-- Execute in order: user -> loan -> repayment -> scoring -> admin
-- =========================================================

-- ==================== 1. USER SERVICE ====================
USE microscore_user;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE comptes_bancaires;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO users (id, nom, prenom, email, mot_de_passe, telephone, role, statut, date_creation, must_change_password, cni, profession, secteur_activite, situation_matrimoniale, date_naissance)
VALUES
(1, 'Benoît', 'Simo', 'simo.b@microscore.cm', '$2b$10$ourLxw3XwvB4/IHa.lmwJe0PDm4xARBqzKd.cI/oXX/KYvJljxYYq', '+237677000001', 'ADMIN', 'ACTIF', NOW(), false, NULL, NULL, NULL, NULL, NULL),
(2, 'Arielle', 'Djoko', 'arielle.d@microscore.cm', '$2b$10$ourLxw3XwvB4/IHa.lmwJe0PDm4xARBqzKd.cI/oXX/KYvJljxYYq', '+237677000002', 'ADMIN', 'ACTIF', NOW(), false, NULL, NULL, NULL, NULL, NULL),
(3, 'Djibril', 'Nana', 'nana.d@microscore.cm', '$2b$10$erRDkmx74JBjOR85gVdWueaLDthI92iPooMHkaBqaQ65c/RadyUAS', '+237677000003', 'GESTIONNAIRE', 'ACTIF', NOW(), false, NULL, NULL, NULL, NULL, NULL),
(4, 'Rachel', 'Eyanga', 'rachel.e@microscore.cm', '$2b$10$erRDkmx74JBjOR85gVdWueaLDthI92iPooMHkaBqaQ65c/RadyUAS', '+237677000004', 'GESTIONNAIRE', 'ACTIF', NOW(), false, NULL, NULL, NULL, NULL, NULL),
(5, 'Prunelle', 'Kambou', 'prunelle@gmail.com', '$2b$10$2BPjLxfWfQRuMjlkDuytpumSdyNbcRT3oMQfpPl75jp9lPjCMSv8.', '+237677000005', 'CLIENT', 'ACTIF', NOW(), false, 'CM-2026-0001', 'Enseignante', 'Éducation', 'MARIÉ', '1990-05-15'),
(6, 'Jules', 'Anafack', 'jules@gmail.com', '$2b$10$2BPjLxfWfQRuMjlkDuytpumSdyNbcRT3oMQfpPl75jp9lPjCMSv8.', '+237677000006', 'CLIENT', 'ACTIF', NOW(), false, 'CM-2026-0002', 'Commerçant', 'Commerce', 'MARIÉ', '1985-08-22'),
(7, 'Paul', 'Tchinda', 'paul.t@email.com', '$2b$10$2BPjLxfWfQRuMjlkDuytpumSdyNbcRT3oMQfpPl75jp9lPjCMSv8.', '+237677000007', 'CLIENT', 'ACTIF', NOW(), false, 'CM-2026-0003', 'Agriculteur', 'Agriculture', 'CELIBATAIRE', '1995-01-10'),
(8, 'Marie', 'Ndong', 'marie.n@email.com', '$2b$10$mHvHov9jUuUJffPCOcLUX.71cUdCvjKDylzwmcptPbige1jKjI9FW', '+237677000008', 'CLIENT', 'EN_ATTENTE', NOW(), true, 'CM-2026-0004', 'Coiffeuse', 'Coiffure', 'CELIBATAIRE', '1998-11-03'),
(9, 'Pierre', 'Essomba', 'pierre.e@email.com', '$2b$10$GTUkN4vOg5Nqz4N2.VxiV.cffjRGyTMadobsJugQeqB2.xmRwnOVu', '+237677000009', 'CLIENT', 'ACTIF', NOW(), true, 'CM-2026-0005', 'Chauffeur', 'Transport', 'MARIÉ', '1992-07-18'),
(10, 'Sophie', 'Bella', 'sophie.b@email.com', '$2b$10$Z9JrU8BUvI1QHMxK7iL/3eNbAItXG0Ue4DOv5wmVMbwnOzaC47jo2', '+237677000010', 'CLIENT', 'BLOQUE', NOW(), false, 'CM-2026-0006', NULL, NULL, NULL, NULL);

INSERT INTO comptes_bancaires (id, user_id, numero_compte, operateur, solde, date_ouverture)
VALUES
(1, 5, 'MTN-2026-0001', 'MTN_MOMO', 150000, NOW()),
(2, 6, 'ORANGE-2026-0001', 'ORANGE_MONEY', 250000, NOW()),
(3, 7, 'MTN-2026-0002', 'MTN_MOMO', 80000, NOW());


-- ==================== 2. LOAN SERVICE ====================
USE microscore_loan;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE pret;
SET FOREIGN_KEY_CHECKS = 1;

-- Prunelle (clientId=5): 3 loans
INSERT INTO pret (id_pret, id_client, motif, montant, duree_remboursement_mois, score_total, statut, date_enregistrement, date_decision)
VALUES
(1, 5, 'Financement frais de scolarité enfants', 200000, 6, 75, 'APPROUVE', '2026-01-15 10:00:00', '2026-01-18 14:00:00'),
(2, 5, 'Achat matériel didactique', 100000, 3, 82, 'APPROUVE', '2026-03-01 09:00:00', '2026-03-03 11:00:00'),
(3, 5, 'Extension salle de classe', 500000, 12, 0, 'EN_ATTENTE', '2026-07-10 08:00:00', NULL);

-- Jules (clientId=6): 2 loans
INSERT INTO pret (id_pret, id_client, motif, montant, duree_remboursement_mois, score_total, statut, date_enregistrement, date_decision)
VALUES
(4, 6, 'Approvisionnement boutique', 300000, 8, 62, 'APPROUVE', '2026-02-10 10:30:00', '2026-02-13 16:00:00'),
(5, 6, 'Achat véhicule utilitaire', 1500000, 24, 0, 'REJETE', '2026-05-20 07:45:00', '2026-05-22 09:00:00');

-- Paul (clientId=7): 1 loan
INSERT INTO pret (id_pret, id_client, motif, montant, duree_remboursement_mois, score_total, statut, date_enregistrement, date_decision)
VALUES
(6, 7, 'Achat semences et engrais', 150000, 5, 70, 'APPROUVE', '2026-04-05 11:00:00', '2026-04-08 10:00:00');

-- Marie (clientId=8): 1 pending loan
INSERT INTO pret (id_pret, id_client, motif, montant, duree_remboursement_mois, score_total, statut, date_enregistrement, date_decision)
VALUES
(7, 8, 'Création salon de coiffure', 250000, 10, 0, 'EN_ATTENTE', '2026-07-12 14:00:00', NULL);


-- ==================== 3. REPAYMENT SERVICE ====================
USE microscore_repayment;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE echeance;
SET FOREIGN_KEY_CHECKS = 1;

-- Loan 1 (Prunelle, 200000, 6 mois): 4 payées, 2 en attente
INSERT INTO echeance (id, id_pret, numero_echeance, capital_rembourse, interets, mensualite, capital_restant_du, statut, date_echeance_prevue, date_paiement)
VALUES
(1, 1, 1, 33166.67, 3.33, 33170.00, 166833.33, 'PAYE', '2026-02-01', '2026-02-01 08:00:00'),
(2, 1, 2, 33166.67, 3.33, 33170.00, 133666.66, 'PAYE', '2026-03-01', '2026-03-01 08:00:00'),
(3, 1, 3, 33166.67, 3.33, 33170.00, 100499.99, 'PAYE', '2026-04-01', '2026-04-01 08:00:00'),
(4, 1, 4, 33166.67, 3.33, 33170.00, 67333.32, 'PAYE', '2026-05-01', '2026-05-01 08:00:00'),
(5, 1, 5, 33166.67, 3.33, 33170.00, 34166.65, 'EN_ATTENTE', '2026-06-01', NULL),
(6, 1, 6, 34166.65, 3.42, 34170.07, 0, 'EN_ATTENTE', '2026-07-01', NULL);

-- Loan 2 (Prunelle, 100000, 3 mois): 1 payée, 2 en attente
INSERT INTO echeance (id, id_pret, numero_echeance, capital_rembourse, interets, mensualite, capital_restant_du, statut, date_echeance_prevue, date_paiement)
VALUES
(7, 2, 1, 33222.22, 1.67, 33223.89, 66777.78, 'PAYE', '2026-04-01', '2026-04-01 08:00:00'),
(8, 2, 2, 33222.22, 1.67, 33223.89, 33555.56, 'EN_ATTENTE', '2026-05-01', NULL),
(9, 2, 3, 33555.56, 1.68, 33557.24, 0, 'EN_ATTENTE', '2026-06-01', NULL);

-- Loan 4 (Jules, 300000, 8 mois): 3 payées, 1 en retard, 4 en attente
INSERT INTO echeance (id, id_pret, numero_echeance, capital_rembourse, interets, mensualite, capital_restant_du, statut, date_echeance_prevue, date_paiement)
VALUES
(10, 4, 1, 37375.00, 5.00, 37380.00, 262625.00, 'PAYE', '2026-03-10', '2026-03-10 08:00:00'),
(11, 4, 2, 37375.00, 5.00, 37380.00, 225250.00, 'PAYE', '2026-04-10', '2026-04-10 08:00:00'),
(12, 4, 3, 37375.00, 5.00, 37380.00, 187875.00, 'PAYE', '2026-05-10', '2026-05-10 08:00:00'),
(13, 4, 4, 37375.00, 5.00, 37380.00, 150500.00, 'EN_RETARD', '2026-06-10', NULL),
(14, 4, 5, 37375.00, 5.00, 37380.00, 113125.00, 'EN_ATTENTE', '2026-07-10', NULL),
(15, 4, 6, 37375.00, 5.00, 37380.00, 75750.00, 'EN_ATTENTE', '2026-08-10', NULL),
(16, 4, 7, 37375.00, 5.00, 37380.00, 38375.00, 'EN_ATTENTE', '2026-09-10', NULL),
(17, 4, 8, 38375.00, 3.84, 38378.84, 0, 'EN_ATTENTE', '2026-10-10', NULL);

-- Loan 6 (Paul, 150000, 5 mois): 2 payées, 3 en attente
INSERT INTO echeance (id, id_pret, numero_echeance, capital_rembourse, interets, mensualite, capital_restant_du, statut, date_echeance_prevue, date_paiement)
VALUES
(18, 6, 1, 29900.00, 2.50, 29902.50, 120100.00, 'PAYE', '2026-05-05', '2026-05-05 08:00:00'),
(19, 6, 2, 29900.00, 2.50, 29902.50, 90200.00, 'PAYE', '2026-06-05', '2026-06-05 08:00:00'),
(20, 6, 3, 29900.00, 2.50, 29902.50, 60300.00, 'EN_ATTENTE', '2026-07-05', NULL),
(21, 6, 4, 29900.00, 2.50, 29902.50, 30400.00, 'EN_ATTENTE', '2026-08-05', NULL),
(22, 6, 5, 30400.00, 1.52, 30401.52, 0, 'EN_ATTENTE', '2026-09-05', NULL);


-- ==================== 4. SCORING SERVICE ====================
USE microscore_scoring;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE detail_critere;
TRUNCATE TABLE bloc_scoring;
TRUNCATE TABLE parametre_de_scoring;
TRUNCATE TABLE score;
SET FOREIGN_KEY_CHECKS = 1;

-- Blocs de scoring
INSERT INTO bloc_scoring (id, nom, poids)
VALUES
(1, 'Profil sociodémographique', 15),
(2, 'Capacité de remboursement', 25),
(3, 'Montant et durée', 10),
(4, 'Historique de crédit', 20),
(5, 'Activité économique', 10),
(6, 'Garanties', 10),
(7, 'Facteurs comportementaux', 10);

-- Détails des blocs
INSERT INTO detail_critere (id, nom, bloc_id)
VALUES
(1, 'Âge', 1),
(2, 'Situation matrimoniale', 1),
(3, 'Nombre de personnes à charge', 1),
(4, 'Niveau d''éducation', 1),
(5, 'Revenu mensuel net', 2),
(6, 'Charges fixes mensuelles', 2),
(7, 'Taux d''endettement', 2),
(8, 'Montant du prêt', 3),
(9, 'Durée de remboursement', 3),
(10, 'Nombre de retards antérieurs', 4),
(11, 'Nombre de prêts en cours', 4),
(12, 'Ancienneté client', 4),
(13, 'Type d''activité', 5),
(14, 'Ancienneté de l''entreprise', 5),
(15, 'Chiffre d''affaires mensuel', 5),
(16, 'Garantie personnelle', 6),
(17, 'Garantie matérielle', 6),
(18, 'Épargne constituée', 6),
(19, 'Note d''entretien', 7),
(20, 'Réputation dans la communauté', 7),
(21, 'Régularité de l''épargne', 7);

-- Paramètres de scoring
INSERT INTO parametre_de_scoring (id, bloc_critere, nom_critere, poids_critere, actif, description)
VALUES
(1, 'PROFIL_SOCIODEMOGRAPHIQUE', 'Age', 20, true, 'Âge du client'),
(2, 'PROFIL_SOCIODEMOGRAPHIQUE', 'SituationMatrimoniale', 25, true, 'Situation matrimoniale'),
(3, 'PROFIL_SOCIODEMOGRAPHIQUE', 'PersonnesACharge', 20, true, 'Nombre de personnes à charge'),
(4, 'PROFIL_SOCIODEMOGRAPHIQUE', 'NiveauEducation', 35, true, 'Niveau d''éducation'),
(5, 'CAPACITE_REMBOURSEMENT', 'RevenuMensuelNet', 40, true, 'Revenu mensuel net'),
(6, 'CAPACITE_REMBOURSEMENT', 'ChargesFixes', 30, true, 'Charges fixes mensuelles'),
(7, 'CAPACITE_REMBOURSEMENT', 'TauxEndettement', 30, true, 'Taux d''endettement'),
(8, 'MONTANT_DUREE', 'Montant', 50, true, 'Montant du prêt'),
(9, 'MONTANT_DUREE', 'Duree', 50, true, 'Durée de remboursement'),
(10, 'HISTORIQUE_CREDIT', 'RetardsAnterieurs', 40, true, 'Nombre de retards'),
(11, 'HISTORIQUE_CREDIT', 'PretsEnCours', 30, true, 'Nombre de prêts en cours'),
(12, 'HISTORIQUE_CREDIT', 'AncienneteClient', 30, true, 'Ancienneté en mois'),
(13, 'ACTIVITE_ECONOMIQUE', 'TypeActivite', 40, true, 'Type d''activité'),
(14, 'ACTIVITE_ECONOMIQUE', 'AncienneteEntreprise', 30, true, 'Ancienneté de l''entreprise'),
(15, 'ACTIVITE_ECONOMIQUE', 'ChiffreAffaires', 30, true, 'Chiffre d''affaires mensuel'),
(16, 'GARANTIES', 'GarantiePersonnelle', 40, true, 'Garantie d''une personne'),
(17, 'GARANTIES', 'GarantieMaterielle', 30, true, 'Garantie matérielle'),
(18, 'GARANTIES', 'EpargneConstituee', 30, true, 'Épargne constituée'),
(19, 'FACTEURS_COMPORTEMENTAUX', 'NoteEntretien', 40, true, 'Note d''entretien'),
(20, 'FACTEURS_COMPORTEMENTAUX', 'ReputationCommunaute', 30, true, 'Réputation communautaire'),
(21, 'FACTEURS_COMPORTEMENTAUX', 'RegulariteEpargne', 30, true, 'Régularité de l''épargne');

-- Scores already stored in pret table (loan-service computes via scoring-client)


-- ==================== 5. ADMIN SERVICE ====================
USE microscore_admin;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE audit_logs;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO audit_logs (id, admin_id, action, cible, date_action, details)
VALUES
(1, 1, 'VALIDATION_UTILISATEUR', 'Kambou Prunelle', '2026-01-10 09:00:00', 'Compte client validé et activé'),
(2, 1, 'VALIDATION_UTILISATEUR', 'Anafack Jules', '2026-01-12 10:00:00', 'Compte client validé et activé'),
(3, 2, 'VALIDATION_UTILISATEUR', 'Tchinda Paul', '2026-01-15 11:00:00', 'Compte client validé et activé'),
(4, 1, 'DECISION_PRET', 'Prêt #1 (Prunelle)', '2026-01-18 14:00:00', 'Prêt approuvé - 200000 FCFA'),
(5, 2, 'DECISION_PRET', 'Prêt #4 (Jules)', '2026-02-13 16:00:00', 'Prêt approuvé - 300000 FCFA');


-- =========================================================
-- DATA VERIFICATION QUERIES
-- =========================================================
SELECT 'USERS' AS TABLE_NAME, COUNT(*) AS TOTAL FROM microscore_user.users
UNION ALL SELECT 'COMPTES_BANCAIRES', COUNT(*) FROM microscore_user.comptes_bancaires
UNION ALL SELECT 'PRETS', COUNT(*) FROM microscore_loan.pret
UNION ALL SELECT 'ECHEANCES', COUNT(*) FROM microscore_repayment.echeance
UNION ALL SELECT 'BLOC_SCORING', COUNT(*) FROM microscore_scoring.bloc_scoring
UNION ALL SELECT 'DETAIL_CRITERE', COUNT(*) FROM microscore_scoring.detail_critere
UNION ALL SELECT 'PARAMETRE_SCORING', COUNT(*) FROM microscore_scoring.parametre_de_scoring
UNION ALL SELECT 'AUDIT_LOGS', COUNT(*) FROM microscore_admin.audit_logs;
