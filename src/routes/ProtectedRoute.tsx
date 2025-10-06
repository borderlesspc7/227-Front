import { useAuth } from "../hooks/useAuth";
import { Navigate, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { paths } from "./paths";
import type { UserRole } from "../types/auth";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: UserRole[];
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate(paths.login, { replace: true });
    } else if (!loading && user && roles && roles.length > 0) {
      const userRole = user.role;
      if (!userRole || !roles.includes(userRole)) {
        navigate(paths.login, { replace: true });
      }
    }
  }, [user, loading, roles, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null; // Não renderiza nada enquanto navega
  }

  if (roles && roles.length > 0) {
    const userRole = user.role;
    if (!userRole || !roles.includes(userRole)) {
      return null; // Não renderiza nada enquanto navega
    }
  }

  return <>{children}</>;
}
