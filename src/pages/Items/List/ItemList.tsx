"use client";

import React, { useState } from "react";
import type { Item } from "../../../types/item";
import { itemService } from "../../../services/itemService";
import { useToast } from "../../../hooks/useToast";
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
    onRefresh,
}) => {
    const { showToast } = useToast();
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
                    await itemService.deleteItem(itemId);
                    onDelete(itemId);
                    showToast("Item excluído com sucesso!", "success");
                } catch (error) {
                    showToast("Erro ao excluir item", "error");
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

    const getCategoryColor = (categoria: string): string => {
        const colors: Record<string, string> = {
            Material: "#3b82f6",
            Serviço: "#10b981",
            Equipamento: "#f59e0b",
            "Mão de Obra": "#8b5cf6",
            Outros: "#6b7280",
        };
        return colors[categoria] || "#6b7280";
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
                            <div className="item-list__card-header">
                                <div className="item-list__card-title">
                                    <h3 className="item-list__card-name">{item.descricao}</h3>
                                    <div
                                        className="item-list__card-category"
                                        style={{ backgroundColor: getCategoryColor(item.categoria || "") }}
                                    >
                                        {item.categoria}
                                    </div>
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
                                <button
                                    onClick={() => onEdit(item)}
                                    className="item-list__card-btn item-list__card-btn--edit"
                                    disabled={!item.ativo}
                                >
                                    ✏️ Editar
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="item-list__card-btn item-list__card-btn--delete"
                                    disabled={deletingId === item.id}
                                >
                                    {deletingId === item.id ? "⏳" : "🗑️"} Excluir
                                </button>
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
