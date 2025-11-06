"use client";

import type React from "react";
import "./Sidebar.css";
import { NavLink, useLocation } from "react-router-dom";
import {
  FiUser,
  FiFileText,
  FiDollarSign,
  FiPlusCircle,
  FiBarChart,
  FiCheck,
  FiPackage,
  FiFile,
  FiSettings,
  FiEdit3,
} from "react-icons/fi";
import { usePermissions } from "../../../hooks/usePermissions";

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className = "" }) => {
  const { hasPermission } = usePermissions();
  const location = useLocation();

  // Determinar o prefixo baseado na rota atual
  const isAdminRoute = location.pathname.startsWith('/admin');
  const basePath = isAdminRoute ? '/admin' : '/dashboard';

  const allMenuItems = [
    {
      id: "dashboard",
      label: "Dashboard Gerencial",
      icon: FiBarChart,
      path: `${basePath}`,
      requiredPermission: "view_dashboard" as const,
    },
    {
      id: "approvals",
      label: "Aprovações",
      icon: FiCheck,
      path: `${basePath}/approvals`,
      requiredPermission: "view_approvals" as const,
    },
    {
      id: "register-user",
      label: "Usuários",
      icon: FiUser,
      path: `${basePath}/register-user`,
      requiredPermission: "view_users" as const,
    },
    {
      id: "register-contracts",
      label: "Cadastro de Contratos Principais",
      icon: FiFileText,
      path: `${basePath}/contracts`,
      requiredPermission: "view_contracts" as const,
    },
    {
      id: "register-prices",
      label: "Cadastro de Preços Unitários",
      icon: FiDollarSign,
      path: `${basePath}/prices`,
      requiredPermission: "view_prices" as const,
    },
    {
      id: "additive-requests",
      path: `${basePath}/additive-requests`,
      label: "Solicitações de Aditivos",
      icon: FiPlusCircle,
      requiredPermission: "view_additive_requests" as const,
    },
    {
      id: "items",
      path: `${basePath}/items`,
      label: "Cadastro de Itens",
      icon: FiPackage,
      requiredPermission: "view_items" as const,
    },
    {
      id: "formalization",
      path: `${basePath}/formalization`,
      label: "Formalização",
      icon: FiFile,
      requiredPermission: "view_formalization" as const,
    },
    {
      id: "signatures",
      path: `${basePath}/signatures`,
      label: "Documentos Assinados",
      icon: FiEdit3,
      requiredPermission: "view_approvals" as const,
    },
    {
      id: "profile",
      path: `${basePath}/profile`,
      label: "Perfil",
      icon: FiSettings,
      requiredPermission: "view_profile" as const,
    },
  ];

  // Filtrar itens do menu baseado nas permissões do usuário
  const menuItems = allMenuItems.filter((item) => {
    // Verificar se o usuário tem a permissão necessária para ver este item
    try {
      return hasPermission(item.requiredPermission);
    } catch {
      return false;
    }
  });
  return (
    <aside className={`sidebar ${className}`}>
      <div className="sidebar__header">
        <div className="sidebar__logo">
          <div className="sidebar__logo-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="url(#gradient)" />
              <path
                d="M8 12h16v2H8v-2zm0 4h16v2H8v-2zm0 4h12v2H8v-2z"
                fill="white"
              />
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="32" y2="32">
                  <stop stopColor="#3b82f6" />
                  <stop offset="1" stopColor="#1d4ed8" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="sidebar__logo-text">AddControl</span>
        </div>
      </div>

      <nav className="sidebar__nav">
        <ul className="sidebar__menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            // Dashboard deve ser ativo apenas na rota exata, não em sub-rotas
            const isExactMatch = item.id === "dashboard";

            return (
              <li key={item.id} className="sidebar__menu-item">
                <NavLink
                  to={item.path}
                  end={isExactMatch}
                  className={({ isActive }) =>
                    `sidebar__menu-link ${isActive ? "sidebar__menu-link--active" : ""
                    }`
                  }
                >
                  <Icon className="sidebar__menu-icon" />
                  <span className="sidebar__menu-text">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};
