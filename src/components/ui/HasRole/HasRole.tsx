import type { ReactNode } from "react";
import { usePermissions } from "../../../hooks/usePermissions";
import type { UserRole } from "../../../types/auth";

interface HasRoleProps {
  children: ReactNode;
  roles: UserRole[];
  fallback?: ReactNode;
}

/**
 * Componente que renderiza children apenas se o usuário tiver uma das roles especificadas
 */
export function HasRole({ children, roles, fallback = null }: HasRoleProps) {
  const { role } = usePermissions();

  if (!role || !roles.includes(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface HasPermissionProps {
  children: ReactNode;
  permission: string;
  fallback?: ReactNode;
}

/**
 * Componente que renderiza children apenas se o usuário tiver a permissão especificada
 */
export function HasPermission({
  children,
  permission,
  fallback = null,
}: HasPermissionProps) {
  const { hasPermission } = usePermissions();

  if (!hasPermission(permission as any)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

