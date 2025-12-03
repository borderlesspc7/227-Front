import React, { useState, useEffect } from "react";
import { Button } from "../../../components/ui/Button/Button";
import { FiPlus, FiEdit, FiTrash2, FiEye } from "react-icons/fi";
import "./UserList.css";
import { usePermissions } from "../../../hooks/usePermissions";
import { optionsService } from "../../../services/optionsService";

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
    onUserDelete?: (user: User) => void;
    onNewUser?: () => void;
}

const UserList: React.FC<UserListProps> = ({
    users,
    onUserEdit,
    onUserDelete,
    onNewUser,
}) => {
    const { hasPermission } = usePermissions();
    const [roleLabels, setRoleLabels] = useState<Record<string, string>>({});

    useEffect(() => {
        const loadRoleLabels = async () => {
            try {
                const options = await optionsService.getUserRoleOptions();
                const labels: Record<string, string> = {};
                options.forEach(opt => {
                    labels[opt.value] = opt.label;
                });
                setRoleLabels(labels);
            } catch (error) {
                console.error("Erro ao carregar labels de roles:", error);
                // Fallback para labels hardcoded
                setRoleLabels({
                    admin: "Administrador",
                    assistente_obra: "Assistente Obra",
                    engenheiro_obra: "Engenheiro Obra",
                    gestor_obra: "Gestor Obra",
                    suprimento_obra: "Suprimento Obra",
                    supervisor_masterwall: "Supervisor Masterwall",
                    assistente_masterwall: "Assistente Masterwall",
                    diretoria_masterwall: "Diretoria Masterwall",
                    orcamentista_masterwall: "Orçamentista Masterwall",
                    gestor_contratos_masterwall: "Gestor Contratos Masterwall",
                });
            }
        };
        loadRoleLabels();
    }, []);

    const handleDelete = (user: User) => {
        if (onUserDelete) {
            onUserDelete(user);
        }
    };

    const formatDate = (date: Date | string): string => {
        const d = typeof date === 'string' ? new Date(date) : date;
        return d.toLocaleDateString('pt-BR');
    };

    const getRoleLabel = (role: string): string => {
        return roleLabels[role] || role.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
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
                    {onNewUser && hasPermission("create_users") && (
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
                {onNewUser && hasPermission("create_users") && (
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
                                <td className="user-list__cell user-list__cell--date">
                                    {formatDate(user.createdAt)}
                                </td>
                                <td className="user-list__cell user-list__cell--actions">
                                    <div className="user-list__actions">
                                        <div className="user-list__crud-actions">
                                            {onUserEdit && hasPermission("edit_users") && (
                                                <button
                                                    type="button"
                                                    onClick={() => onUserEdit(user)}
                                                    className="user-list__action-btn user-list__action-btn--edit"
                                                    title="Editar usuário"
                                                >
                                                    <FiEdit />
                                                </button>
                                            )}
                                            {onUserDelete && hasPermission("delete_users") && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(user)}
                                                    className="user-list__action-btn user-list__action-btn--delete"
                                                    title="Excluir usuário"
                                                >
                                                    <FiTrash2 />
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
