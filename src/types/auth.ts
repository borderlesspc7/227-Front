export type UserRole =
  | "admin"
  | "solicitante"
  | "engenheiro"
  | "suprimento"
  | "diretor"
  | "cliente";

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  cnpj?: string;
  companyId?: string; // Referência para a empresa
  createdAt: Date;
  lastLoginAt: Date;
  role?: UserRole;
  isActive: boolean;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  cnpj?: string; // CNPJ para login por empresa
}

export interface UserRegisterCredentials {
  displayName: string;
  email: string;
  password: string;
  cpf: string;
  phone: string;
  role: UserRole;
}

export interface RegisterCredentials extends LoginCredentials {
  displayName: string;
  phone: string;
  cpf: string;
  role: UserRole;
  companyName: string;
  companyCnpj: string;
  companyAddress: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  subscriptionPlan: "starter" | "business" | "enterprise";
}

export interface AuthError {
  code: string;
  message: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: AuthError;
}
