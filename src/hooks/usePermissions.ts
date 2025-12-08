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

  // Cliente é alguém que não tem nenhum dos roles específicos do sistema
  const isCliente = !role || (
    role !== "admin" &&
    role !== "assistente_obra" &&
    role !== "engenheiro_obra" &&
    role !== "gestor_obra" &&
    role !== "suprimento_obra" &&
    role !== "supervisor_masterwall" &&
    role !== "assistente_masterwall" &&
    role !== "diretoria_masterwall" &&
    role !== "orcamentista_masterwall" &&
    role !== "gestor_contratos_masterwall"
  );

  return {
    hasPermission: (permission: Permission) => hasPermission(role, permission),
    hasAnyPermission: (permissions: Permission[]) =>
      hasAnyPermission(role, permissions),
    hasAllPermissions: (permissions: Permission[]) =>
      hasAllPermissions(role, permissions),
    canAccessRoute: (routePath: string) => canAccessRoute(role, routePath),
    role,
    isAdmin: role === "admin",
    isAssistenteObra: role === "assistente_obra",
    isEngenheiroObra: role === "engenheiro_obra",
    isGestorObra: role === "gestor_obra",
    isSuprimentoObra: role === "suprimento_obra",
    isSupervisorMasterwall: role === "supervisor_masterwall",
    isAssistenteMasterwall: role === "assistente_masterwall",
    isDiretoriaMasterwall: role === "diretoria_masterwall",
    isOrcamentistaMasterwall: role === "orcamentista_masterwall",
    isGestorContratosMasterwall: role === "gestor_contratos_masterwall",
    isCliente,
  };
}

