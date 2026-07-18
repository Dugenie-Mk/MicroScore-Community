export interface User {
  id: number;
  fullName: string;
  email: string;
  telephone?: string;
  statut?: 'ACTIF' | 'BLOQUE' | 'EN_ATTENTE';
  role?: 'CLIENT' | 'GESTIONNAIRE' | 'ADMIN';
  dateNaissance?: string;
  situationMatrimoniale?: string;
  niveauEducation?: string;
  personnesACharge?: number;
  profession?: string;
  secteurActivite?: string;
  dateCreation?: string;
  derniereConnexion?: string;
  cni?: string;
  matricule?: string;
  mustChangePassword?: boolean;
  motifBlocage?: string;
  dateEmbauche?: string;
  service?: string;
  permissions?: string[];
  lieuNaissance?: string;
  sexe?: string;
  nombreEnfants?: number;
  revenu?: number;
  boitePostale?: string;
}

export interface UserRequest {
  fullName: string;
  email: string;
  motDePasse: string;
  role?: 'CLIENT' | 'GESTIONNAIRE' | 'ADMIN';
  telephone?: string;
  cni?: string;
  matricule?: string;
  mustChangePassword?: boolean;
  dateNaissance?: string;
  lieuNaissance?: string;
  situationMatrimoniale?: string;
  niveauEducation?: string;
  personnesACharge?: number;
  sexe?: string;
  revenu?: number;
  profession?: string;
  secteurActivite?: string;
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