"use client";

import React, { useState } from "react";
import type { Item } from "../../../types/item";
import { itemService } from "../../../services/itemService";
import { useToast } from "../../../hooks/useToast";
import { usePermissions } from "../../../hooks/usePermissions";
import { useAuth } from "../../../hooks/useAuth";
import { PermissionDeniedError } from "../../../utils/servicePermissions";
import { useConfirmModal } from "../../../hooks/useConfirmModal";
import { ConfirmModal } from "../../../components/ui/ConfirmModal/ConfirmModal";
import "./ItemList.css";

interface ItemListProps {
    items: Item[];
    onEdit: (item: Item) => void;
    onDelete: (itemId: string) => void;
    onRefresh: () => void;
}

export const ItemList: React.FC<ItemListProps> = ({
    items,
    onEdit,
    onDelete,
}) => {
    const { showToast } = useToast();
    const { user } = useAuth();
    const { hasPermission } = usePermissions();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const { modalState, showConfirm, hideConfirm, handleConfirm } = useConfirmModal();

    const handleDelete = async (itemId: string) => {
        const item = items.find(i => i.id === itemId);
        const itemName = item?.descricao || "este item";

        showConfirm(
            `Tem certeza que deseja excluir "${itemName}"? Esta ação não pode ser desfeita.`,
            async () => {
                try {
                    setDeletingId(itemId);
                    await itemService.deleteItem(itemId, user?.role);
                    onDelete(itemId);
                    showToast({ type: "success", title: "Item excluído com sucesso!" });
                } catch (error) {
                    if (error instanceof PermissionDeniedError) {
                        showToast({ 
                            type: "error", 
                            title: "Permissão negada", 
                            message: "Você não tem permissão para deletar itens." 
                        });
                    } else {
                        showToast({ type: "error", title: "Erro ao excluir item" });
                    }
                } finally {
                    setDeletingId(null);
                }
            },
            {
                title: "Excluir Item",
                confirmText: "Excluir",
                cancelText: "Cancelar",
                type: "danger"
            }
        );
    };

    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value);
    };

    const formatDate = (date: Date): string => {
        return new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    };

    if (items.length === 0) {
        return (
            <div className="item-list__empty">
                <div className="item-list__empty-icon">📦</div>
                <h3 className="item-list__empty-title">Nenhum item encontrado</h3>
                <p className="item-list__empty-description">
                    Crie seu primeiro item para começar a usar o sistema.
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="item-list">
                <div className="item-list__grid">
                    {items.map((item) => (
                        <div key={item.id} className="item-list__card">
                            {/* Imagem do item - estilo carta Pokémon */}
                            <div className="item-list__card-image">
                                {item.imagemUrl ? (
                                    <img
                                        src={item.imagemUrl}
                                        alt={item.descricao}
                                        className="item-list__card-img"
                                    />
                                ) : (
                                    <div className="item-list__card-placeholder">
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                            <circle cx="8.5" cy="8.5" r="1.5" />
                                            <polyline points="21,15 16,10 5,21" />
                                        </svg>
                                    </div>
                                )}
                                <div className="item-list__card-image-overlay">
                                    <div className="item-list__card-category-badge">
                                        {item.categoria}
                                    </div>
                                </div>
                            </div>

                            <div className="item-list__card-header">
                                <div className="item-list__card-title">
                                    <h3 className="item-list__card-name">{item.descricao}</h3>
                                </div>
                                <div className="item-list__card-status">
                                    <span className={`item-list__card-badge ${item.ativo ? "item-list__card-badge--active" : "item-list__card-badge--inactive"}`}>
                                        {item.ativo ? "Ativo" : "Inativo"}
                                    </span>
                                </div>
                            </div>

                            <div className="item-list__card-content">
                                <div className="item-list__card-info">
                                    <div className="item-list__card-field">
                                        <span className="item-list__card-label">Unidade:</span>
                                        <span className="item-list__card-value">{item.unidade}</span>
                                    </div>
                                    <div className="item-list__card-field">
                                        <span className="item-list__card-label">Preço Unitário:</span>
                                        <span className="item-list__card-value item-list__card-value--price">
                                            {formatCurrency(item.precoUnitario)}
                                        </span>
                                    </div>
                                </div>

                                <div className="item-list__card-observations">
                                    <span className="item-list__card-label">Observações:</span>
                                    <p className="item-list__card-text">
                                        {item.observacoes || "-"}
                                    </p>
                                </div>

                                <div className="item-list__card-footer">
                                    <div className="item-list__card-dates">
                                        <div className="item-list__card-field">
                                            <span className="item-list__card-label">Criado em:</span>
                                            <span className="item-list__card-value">
                                                {formatDate(item.createdAt)}
                                            </span>
                                        </div>
                                        <div className="item-list__card-field">
                                            <span className="item-list__card-label">Atualizado em:</span>
                                            <span className="item-list__card-value">
                                                {item.updatedAt.getTime() !== item.createdAt.getTime()
                                                    ? formatDate(item.updatedAt)
                                                    : "-"
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="item-list__card-actions">
                                {hasPermission("edit_items") && (
                                    <button
                                        onClick={() => onEdit(item)}
                                        className="item-list__card-btn item-list__card-btn--edit"
                                        disabled={!item.ativo}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                        </svg>
                                        Editar
                                    </button>
                                )}
                                {hasPermission("delete_items") && (
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="item-list__card-btn item-list__card-btn--delete"
                                        disabled={deletingId === item.id}
                                    >
                                    {deletingId === item.id ? (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                                            <path d="M3 21v-5h5" />
                                            <path d="M21 3v5h-5" />
                                            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                                        </svg>
                                    ) : (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M3 6h18" />
                                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                        </svg>
                                    )}
                                    Excluir
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal de Confirmação */}
            <ConfirmModal
                isOpen={modalState.isOpen}
                onClose={hideConfirm}
                onConfirm={handleConfirm}
                title={modalState.title}
                message={modalState.message}
                confirmText={modalState.confirmText}
                cancelText={modalState.cancelText}
                type={modalState.type}
                isLoading={deletingId !== null}
            />
        </>
    );
};
