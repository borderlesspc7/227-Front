import type { UserRole } from "../types/auth";
import type { Permission } from "../utils/rolePermissions";
import { hasPermission } from "./rolePermissions";

/**
 * Exceção lançada quando uma operação é negada por falta de permissão
 */
export class PermissionDeniedError extends Error {
  constructor(permission: Permission, role?: UserRole) {
    const roleMsg = role ? ` (role: ${role})` : "";
    super(`Permissão negada: ${permission}${roleMsg}`);
    this.name = "PermissionDeniedError";
  }
}

/**
 * Verifica se o usuário tem a permissão necessária para executar uma ação.
 * Lança PermissionDeniedError se não tiver permissão.
 * 
 * @param role - Role do usuário
 * @param permission - Permissão necessária
 * @throws PermissionDeniedError se não tiver permissão
 */
export function requirePermission(role: UserRole | undefined, permission: Permission): void {
  if (!role || !hasPermission(role, permission)) {
    throw new PermissionDeniedError(permission, role);
  }
}

/**
 * Verifica se o usuário tem pelo menos uma das permissões necessárias.
 * Lança PermissionDeniedError se não tiver nenhuma das permissões.
 * 
 * @param role - Role do usuário
 * @param permissions - Array de permissões (pelo menos uma é necessária)
 * @throws PermissionDeniedError se não tiver nenhuma das permissões
 */
export function requireAnyPermission(role: UserRole | undefined, permissions: Permission[]): void {
  if (!role || !permissions.some(permission => hasPermission(role, permission))) {
    throw new PermissionDeniedError(permissions[0] || "unknown", role);
  }
}

