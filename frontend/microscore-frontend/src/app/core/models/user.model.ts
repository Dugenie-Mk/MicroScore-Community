export interface User {
  id: number;
  fullName: string;
  email: string;
  // Champs additionnels requis pour la gestion et le filtrage backend
  telephone?: string;
  statut?: 'ACTIF' | 'BLOQUE' | 'EN_ATTENTE';
  role?: 'CLIENT' | 'GESTIONNAIRE' | 'ADMIN';
}

export interface UserRequest {
  fullName: string;
  email: string;
  password: string;
  // Permet d'envoyer le rôle choisi lors de la création d'un utilisateur
  role?: 'CLIENT' | 'GESTIONNAIRE' | 'ADMIN';
  telephone?: string;
}

// ==========================================
// EXTENSIONS PAR RÔLE POUR LES TABLEAUX
// ==========================================

// Extension spécifique pour le Client Emprunteur (avec sa CNI)
export interface ClientUser extends User {
  cni: string;
}

// Extension spécifique pour l'Administrateur (avec l'historique de session)
export interface AdminUser extends User {
  derniereConnexion?: string;
}

// Extension spécifique pour le Gestionnaire (avec son Matricule professionnel)
export interface GestionnaireUser extends User {
  matricule: string;
}