"use client";

import React, { useState, useEffect } from "react";
import UserList from "../../components/ui/UserList/UserList";
import UserModal from "../../components/ui/UserModal/UserModal";
import { userService, type User } from "../../services/userService";
import { useToast } from "../../hooks/useToast";
import "./RegisterPage.css";

export const RegisterPage: React.FC = () => {
  const { showError } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const usersFromDB = await userService.getUsers();
      setUsers(usersFromDB);
    } catch (err) {
      const errorMessage = "Erro ao carregar usuários";
      setError(errorMessage);
      showError("Erro ao carregar", errorMessage + ". Verifique sua conexão e tente novamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSaved = async (newUser: User) => {
    console.log("Usuário salvo:", newUser);
    setIsModalOpen(false);
    // Recarregar lista de usuários
    await loadUsers();
  };

  const handleNewUser = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleUserDeleted = async (userId: string) => {
    try {
      await userService.deleteUser(userId);
      await loadUsers(); // Recarregar lista
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="register-user-page">
        <main className="register-user-page__main">
          <div className="register-user-page__content">
            <div className="register-user-page__loading">
              <p>Carregando usuários...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="register-user-page">
        <main className="register-user-page__main">
          <div className="register-user-page__content">
            <div className="register-user-page__error">
              <p>Erro: {error}</p>
              <button onClick={() => window.location.reload()}>
                Tentar novamente
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="register-user-page">
      <main className="register-user-page__main">
        <div className="register-user-page__content">
          <UserList
            users={users}
            onUserEdit={handleEditUser}
            onUserDelete={handleUserDeleted}
            onNewUser={handleNewUser}
          />
        </div>
      </main>

      <UserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onUserSaved={handleUserSaved}
        user={editingUser}
      />
    </div>
  );
};
