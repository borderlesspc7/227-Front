"use client";

import React, { useState, useEffect } from "react";
import UserList from "../../components/ui/UserList/UserList";
import UserModal from "../../components/ui/UserModal/UserModal";
import { ConfirmModal } from "../../components/ui/ConfirmModal/ConfirmModal";
import { userService, type User } from "../../services/userService";
import { useToast } from "../../hooks/useToast";
import { useAuth } from "../../hooks/useAuth";
import "./RegisterPage.css";

export const RegisterPage: React.FC = () => {
  const { showError, showSuccess } = useToast();
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    userId: string | null;
    userName: string;
  }>({
    isOpen: false,
    userId: null,
    userName: "",
  });
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

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

  const handleDeleteClick = (user: User) => {
    setDeleteModal({
      isOpen: true,
      userId: user.id,
      userName: user.displayName || user.email,
    });
  };

  const handleCloseDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      userId: null,
      userName: "",
    });
  };

  const handleUserDeleted = async () => {
    if (!deleteModal.userId) return;

    try {
      setDeletingUserId(deleteModal.userId);
      await userService.deleteUser(deleteModal.userId, user?.role);
      showSuccess("Sucesso", "Usuário excluído com sucesso!");
      await loadUsers(); // Recarregar lista
      handleCloseDeleteModal();
    } catch (error: any) {
      console.error("Erro ao deletar usuário:", error);
      const errorMessage = error?.message || "Erro ao excluir usuário. Tente novamente.";
      showError("Erro ao excluir", errorMessage);
    } finally {
      setDeletingUserId(null);
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
            onUserDelete={handleDeleteClick}
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

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleUserDeleted}
        title="Excluir Usuário"
        message={`Tem certeza que deseja excluir o usuário "${deleteModal.userName}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
        isLoading={deletingUserId !== null}
      />
    </div>
  );
};
