"use client";

import type React from "react";
import "./Sidebar.css";
import { NavLink } from "react-router-dom";
import {
  FiUser,
  FiFileText,
  FiDollarSign,
  FiPlusCircle,
  FiBarChart,
  FiCheck,
} from "react-icons/fi";
import { paths } from "../../../routes/paths";

interface SidebarProps {
  className?: string;
}

const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard Gerencial",
    icon: FiBarChart,
    path: "/admin/dashboard",
  },
  {
    id: "approvals",
    label: "Aprovações",
    icon: FiCheck,
    path: "/admin/approvals",
  },
  {
    id: "register-user",
    label: "Cadastrar Usuário",
    icon: FiUser,
    path: "/admin/register-user",
  },
  {
    id: "register-contracts",
    label: "Cadastro de Contratos Principais",
    icon: FiFileText,
    path: "/admin/contracts",
  },
  {
    id: "register-prices",
    label: "Cadastro de Preços Unitários",
    icon: FiDollarSign,
    path: "/admin/prices",
  },
  {
    id: "additive-requests",
    path: paths.adminAdditiveRequests,
    label: "Solicitações de Aditivos",
    icon: FiPlusCircle,
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ className = "" }) => {
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

            return (
              <li key={item.id} className="sidebar__menu-item">
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `sidebar__menu-link ${
                      isActive ? "sidebar__menu-link--active" : ""
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
