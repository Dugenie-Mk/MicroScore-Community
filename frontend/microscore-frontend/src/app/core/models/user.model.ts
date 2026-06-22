export interface User {
  id: number;
  fullName: string;
  email: string;
}

export interface UserRequest {
  fullName: string;
  email: string;
  password: string;
}
