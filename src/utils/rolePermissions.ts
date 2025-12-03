import type { UserRole } from "../types/auth";

export type Permission =
  | "view_dashboard"
  | "view_approvals"
  | "view_users"
  | "create_users"
  | "edit_users"
  | "delete_users"
  | "view_contracts"
  | "create_contracts"
  | "edit_contracts"
  | "delete_contracts"
  | "view_prices"
  | "create_prices"
  | "edit_prices"
  | "delete_prices"
  | "view_additive_requests"
  | "create_additive_requests"
  | "edit_additive_requests"
  | "approve_additive_requests"
  | "view_items"
  | "create_items"
  | "edit_items"
  | "delete_items"
  | "view_formalization"
  | "create_formalization"
  | "edit_formalization"
  | "comment_on_approvals"
  | "sign_documents"
  | "view_profile"
  | "edit_profile";

// Definição de permissões por role
export const rolePermissions: Record<UserRole, Permission[]> = {
  admin: [
    // Admin tem acesso total
    "view_dashboard",
    "view_approvals",
    "view_users",
    "create_users",
    "edit_users",
    "delete_users",
    "view_contracts",
    "create_contracts",
    "edit_contracts",
    "delete_contracts",
    "view_prices",
    "create_prices",
    "edit_prices",
    "delete_prices",
    "view_additive_requests",
    "create_additive_requests",
    "edit_additive_requests",
    "approve_additive_requests",
    "view_items",
    "create_items",
    "edit_items",
    "delete_items",
    "view_formalization",
    "create_formalization",
    "edit_formalization",
    "comment_on_approvals",
    "sign_documents",
    "view_profile",
    "edit_profile",
  ],
  assistente_obra: [
    // Assistente Obra: visualizar = sim, lançar = não, aprovar = não
    "view_dashboard",
    "view_contracts",
    "view_prices",
    "view_items",
    "view_formalization",
    "view_profile",
    "edit_profile",
  ],
  engenheiro_obra: [
    // Engenheiro Obra: visualizar = sim, lançar = não, aprovar = sim
    "view_dashboard",
    "view_contracts",
    "view_prices",
    "view_items",
    "view_formalization",
    "approve_additive_requests",
    "view_profile",
    "edit_profile",
  ],
  gestor_obra: [
    // Gestor Obra: visualizar = sim, lançar = não, aprovar = sim
    "view_dashboard",
    "view_contracts",
    "view_prices",
    "view_items",
    "view_formalization",
    "approve_additive_requests",
    "view_profile",
    "edit_profile",
  ],
  suprimento_obra: [
    // Suprimento Obra: visualizar = sim, lançar = não, aprovar = sim
    "view_dashboard",
    "view_approvals",
    "view_contracts",
    "view_prices",
    "view_additive_requests",
    "view_items",
    "view_formalization",
    "approve_additive_requests",
    "comment_on_approvals",
    "view_profile",
    "edit_profile",
  ],
  supervisor_masterwall: [
    // Supervisor Masterwall: visualizar = sim, lançar = sim, aprovar = não
    "view_dashboard",
    "view_contracts",
    "view_prices",
    "view_additive_requests",
    "create_additive_requests",
    "edit_additive_requests",
    "view_items",
    "view_formalization",
    "view_profile",
    "edit_profile",
  ],
  assistente_masterwall: [
    // Assistente Masterwall: visualizar = sim, lançar = não, aprovar = não
    "view_dashboard",
    "view_contracts",
    "view_prices",
    "view_additive_requests",
    "view_items",
    "view_formalization",
    "view_profile",
    "edit_profile",
  ],
  diretoria_masterwall: [
    // Permissões serão definidas
    "view_dashboard",
    "view_profile",
    "edit_profile",
  ],
  orcamentista_masterwall: [
    // Permissões serão definidas
    "view_dashboard",
    "view_profile",
    "edit_profile",
  ],
  gestor_contratos_masterwall: [
    // Permissões serão definidas
    "view_dashboard",
    "view_profile",
    "edit_profile",
  ],
};

// Mapeamento de rotas para permissões necessárias
export const routePermissions: Record<string, Permission[]> = {
  dashboard: ["view_dashboard"],
  approvals: ["view_approvals"],
  "register-user": ["view_users"],
  contracts: ["view_contracts"],
  prices: ["view_prices"],
  "additive-requests": ["view_additive_requests"],
  items: ["view_items"],
  formalization: ["view_formalization"],
  profile: ["view_profile"],
};

// Função para verificar se um role tem uma permissão específica
export function hasPermission(
  role: UserRole | undefined,
  permission: Permission
): boolean {
  if (!role) return false;
  return rolePermissions[role]?.includes(permission) ?? false;
}

// Função para verificar se um role tem qualquer uma das permissões
export function hasAnyPermission(
  role: UserRole | undefined,
  permissions: Permission[]
): boolean {
  if (!role) return false;
  return permissions.some((permission) => hasPermission(role, permission));
}

// Função para verificar se um role tem todas as permissões
export function hasAllPermissions(
  role: UserRole | undefined,
  permissions: Permission[]
): boolean {
  if (!role) return false;
  return permissions.every((permission) => hasPermission(role, permission));
}

// Função para verificar se um role pode acessar uma rota
export function canAccessRoute(
  role: UserRole | undefined,
  routePath: string
): boolean {
  if (!role) return false;

  // Remover prefixo /dashboard ou /admin e normalizar
  let cleanPath = routePath
    .replace(/^\/(dashboard|admin)/, "")
    .replace(/^\//, "");

  // Se o caminho estiver vazio ou for só "/", considerar como dashboard
  if (!cleanPath || cleanPath === "" || cleanPath === "/") {
    cleanPath = "dashboard";
  }

  const requiredPermissions = routePermissions[cleanPath];
  if (!requiredPermissions || requiredPermissions.length === 0) {
    // Se não há permissões definidas para a rota, verificar se o path coincide com algum ID conhecido
    const routeId = cleanPath.split("/")[0];
    const permissions = routePermissions[routeId];
    if (permissions && permissions.length > 0) {
      return hasAnyPermission(role, permissions);
    }
    // Se não encontrou permissões definidas, permitir acesso apenas para roles definidos (não anônimos)
    return true;
  }

  return hasAnyPermission(role, requiredPermissions);
}
