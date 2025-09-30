import React, { useState } from "react";
import { Button } from "../../../components/ui/Button/Button";
import { FiPlus, FiEdit, FiTrash2, FiEye } from "react-icons/fi";
import "./UserList.css";

interface User {
    id: string;
    displayName: string;
    email: string;
    role: string;
    cpf: string;
    phone: string;
    createdAt: Date;
}

interface UserListProps {
    users: User[];
    onUserEdit?: (user: User) => void;
    onUserDelete?: (userId: string) => void;
    onNewUser?: () => void;
}

const UserList: React.FC<UserListProps> = ({
    users,
    onUserEdit,
    onUserDelete,
    onNewUser,
}) => {
    const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

    const handleDelete = async (userId: string) => {
        if (onUserDelete) {
            setDeletingUserId(userId);
            try {
                await onUserDelete(userId);
            } catch (error) {
                console.error("Erro ao deletar usuário:", error);
            } finally {
                setDeletingUserId(null);
            }
        }
    };

    const formatDate = (date: Date | string): string => {
        const d = typeof date === 'string' ? new Date(date) : date;
        return d.toLocaleDateString('pt-BR');
    };

    const getRoleLabel = (role: string): string => {
        const roleLabels: Record<string, string> = {
            admin: "Administrador",
            solicitante: "Solicitante",
            engenheiro: "Engenheiro",
            suprimento: "Suprimentos",
            diretor: "Diretor",
        };
        return roleLabels[role] || role;
    };

    if (users.length === 0) {
        return (
            <div className="user-list">
                <div className="user-list__header">
                    <div className="user-list__header-content">
                        <h3 className="user-list__title">Usuários Cadastrados</h3>
                        <p className="user-list__subtitle">
                            Lista de todos os usuários do sistema
                        </p>
                    </div>
                    {onNewUser && (
                        <Button
                            variant="primary"
                            onClick={onNewUser}
                            className="user-list__add-button"
                        >
                            <FiPlus className="user-list__add-icon" />
                            Novo Usuário
                        </Button>
                    )}
                </div>

                <div className="user-list__empty">
                    <div className="user-list__empty-icon">
                        <FiEye />
                    </div>
                    <h3>Nenhum usuário cadastrado</h3>
                    <p>Comece cadastrando o primeiro usuário do sistema.</p>
                    {onNewUser && (
                        <Button
                            variant="primary"
                            onClick={onNewUser}
                            className="user-list__empty-button"
                        >
                            <FiPlus />
                            Cadastrar Primeiro Usuário
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="user-list">
            <div className="user-list__header">
                <div className="user-list__header-content">
                    <h3 className="user-list__title">Usuários Cadastrados</h3>
                    <p className="user-list__subtitle">
                        {users.length} usuário{users.length !== 1 ? 's' : ''} registrado{users.length !== 1 ? 's' : ''}
                    </p>
                </div>
                {onNewUser && (
                    <Button
                        variant="primary"
                        onClick={onNewUser}
                        className="user-list__add-button"
                    >
                        <FiPlus className="user-list__add-icon" />
                        Novo Usuário
                    </Button>
                )}
            </div>

            {/* Desktop Table View */}
            <div className="user-list__table-container">
                <table className="user-list__table">
                    <thead className="user-list__thead">
                        <tr>
                            <th>Nome</th>
                            <th>Email</th>
                            <th>Função</th>
                            <th>CPF</th>
                            <th>Telefone</th>
                            <th>Cadastrado em</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody className="user-list__tbody">
                        {users.map((user) => (
                            <tr key={user.id} className="user-list__row">
                                <td className="user-list__cell user-list__cell--name">
                                    <div className="user-list__user-info">
                                        <div className="user-list__user-avatar">
                                            {user.displayName.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="user-list__user-name">{user.displayName}</span>
                                    </div>
                                </td>
                                <td className="user-list__cell user-list__cell--email">
                                    {user.email}
                                </td>
                                <td className="user-list__cell user-list__cell--role">
                                    <span className={`user-list__role-badge user-list__role-badge--${user.role}`}>
                                        {getRoleLabel(user.role)}
                                    </span>
                                </td>
                                <td className="user-list__cell user-list__cell--cpf">
                                    {user.cpf}
                                </td>
                                <td className="user-list__cell user-list__cell--phone">
                                    {user.phone || '-'}
                                </td>
                                <td className="user-list__cell user-list__cell--date">
                                    {formatDate(user.createdAt)}
                                </td>
                                <td className="user-list__cell user-list__cell--actions">
                                    <div className="user-list__actions">
                                        <div className="user-list__crud-actions">
                                            {onUserEdit && (
                                                <button
                                                    type="button"
                                                    onClick={() => onUserEdit(user)}
                                                    className="user-list__action-btn user-list__action-btn--edit"
                                                    title="Editar usuário"
                                                >
                                                    <FiEdit />
                                                </button>
                                            )}
                                            {onUserDelete && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(user.id)}
                                                    className="user-list__action-btn user-list__action-btn--delete"
                                                    title="Excluir usuário"
                                                    disabled={deletingUserId === user.id}
                                                >
                                                    {deletingUserId === user.id ? (
                                                        <div className="user-list__spinner" />
                                                    ) : (
                                                        <FiTrash2 />
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserList;
