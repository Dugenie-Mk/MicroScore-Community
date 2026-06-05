// MODELE : decrit la forme d'un utilisateur cote frontend.
export interface User {
  id: number;
  fullName: string;
  email: string;
}

// Donnees envoyees a l'API pour creer un utilisateur.
export interface UserRequest {
  fullName: string;
  email: string;
  password: string;
}
