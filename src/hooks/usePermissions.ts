import { useAuth } from "./useAuth";
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canAccessRoute,
  type Permission,
} from "../utils/rolePermissions";

export function usePermissions() {
  const { user } = useAuth();
  const role = user?.role;

  return {
    hasPermission: (permission: Permission) => hasPermission(role, permission),
    hasAnyPermission: (permissions: Permission[]) =>
      hasAnyPermission(role, permissions),
    hasAllPermissions: (permissions: Permission[]) =>
      hasAllPermissions(role, permissions),
    canAccessRoute: (routePath: string) => canAccessRoute(role, routePath),
    role,
    isAdmin: role === "admin",
    isDiretor: role === "diretor",
    isEngenheiro: role === "engenheiro",
    isSolicitante: role === "solicitante",
    isSuprimento: role === "suprimento",
    isCliente: role === "cliente",
  };
}

