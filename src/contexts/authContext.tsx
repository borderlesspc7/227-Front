import { createContext, useState, useEffect, useMemo } from "react";
import { authService } from "../services/authService";
import type {
  User,
  LoginCredentials,
  RegisterCredentials,
} from "../types/auth";
import type { ReactNode } from "react";
import { CompanyProvider } from "./companyContext";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  registerForAdmin: (credentials: RegisterCredentials) => Promise<User>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = authService.observeAuthState((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      setError(null);
      const user = await authService.login(credentials);
      setUser(user);
      setLoading(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
      setLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      setLoading(true);
      setError(null);
      const user = await authService.register(credentials);
      setUser(user);
      setLoading(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
      setLoading(false);
    }
  };

  const registerForAdmin = async (
    credentials: RegisterCredentials
  ): Promise<User> => {
    try {
      setLoading(true);
      setError(null);
      const createdUser = await authService.register(credentials);
      // Importante: não atualizar o usuário autenticado atual
      setLoading(false);
      return createdUser;
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logOut();
      setUser(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    registerForAdmin,
    logout,
    clearError,
  };

  // Memoizar o usuário para evitar re-renderizações desnecessárias do CompanyProvider
  const memoizedUser = useMemo(() => user, [user?.uid, user?.companyId, user?.email]);

  return (
    <AuthContext.Provider value={value}>
      <CompanyProvider user={memoizedUser}>
        {children}
      </CompanyProvider>
    </AuthContext.Provider>
  );
}

export { AuthContext };
