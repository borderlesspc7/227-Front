"use client";

import type React from "react";
import { FiLogOut, FiUser } from "react-icons/fi";
import "./Header.css";
import { useAuth } from "../../../hooks/useAuth";
import type { User } from "../../../types/auth";
import NotificationBell from "../../ui/NotificationBell/NotificationBell";

interface HeaderProps {
  user: User;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ user, className = "" }) => {
  const auth = useAuth();

  const handleLogout = async () => {
    try {
      await auth.logout();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      admin: "Administrador",
      requester: "Solicitante de OSAs",
      engineer: "Engenheiro Aprovador",
      supplies: "Suprimentos",
      director: "Diretor/Financeiro",
    };
    return roleMap[role] || role;
  };

  return (
    <header className={`header ${className}`}>
      <div className="header__content">
        <div className="header__user-info">
          <div className="header__user-avatar">
            <FiUser className="header__user-avatar-icon" />
          </div>
          <div className="header__user-details">
            <h2 className="header__user-name">{user.displayName}</h2>
            <div className="header__user-meta">
              <span className="header__user-email">{user.email}</span>
              <span className="header__user-role-separator">•</span>
              <span className="header__user-role">
                {getRoleDisplayName(user.role || "")}
              </span>
            </div>
          </div>
        </div>

        <div className="header__actions">
          <NotificationBell />
          <button
            className="header__logout-btn"
            onClick={handleLogout}
            type="button"
            title="Sair do sistema"
          >
            <FiLogOut className="header__logout-icon" />
            <span className="header__logout-text">Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
};
