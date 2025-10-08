import React from "react";
import type { OSAGroup } from "../../../types/formalization";
import "./FormalizationList.css";

interface FormalizationListProps {
    loading: boolean;
    groups: OSAGroup[];
    error: string | null;
    onEdit: (group: OSAGroup) => void;
    onDelete: (groupId: string) => void;
    onView: (group: OSAGroup) => void;
    onGenerateDocument: (groupId: string) => void;
    onMarkAsFormalized: (groupId: string) => void;
}

const FormalizationList: React.FC<FormalizationListProps> = ({
    loading,
    groups,
    error,
    onEdit,
    onDelete,
    onView,
    onGenerateDocument,
    onMarkAsFormalized,
}) => {
    const getStatusColor = (status: OSAGroup["status"]) => {
        switch (status) {
            case "draft":
                return "#6b7280";
            case "ready":
                return "#f59e0b";
            case "formalized":
                return "#059669";
            case "cancelled":
                return "#dc2626";
            default:
                return "#6b7280";
        }
    };

    const getStatusLabel = (status: OSAGroup["status"]) => {
        switch (status) {
            case "draft":
                return "Rascunho";
            case "ready":
                return "Pronto";
            case "formalized":
                return "Formalizado";
            case "cancelled":
                return "Cancelado";
            default:
                return status;
        }
    };

    if (loading) {
        return (
            <div className="formalization-list__loading">
                <div className="formalization-list__loading-spinner"></div>
                <p>Carregando agrupamentos...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="formalization-list__error">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                <p>{error}</p>
            </div>
        );
    }

    if (groups.length === 0) {
        return (
            <div className="formalization-list__empty">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                </svg>
                <h3>Nenhum agrupamento encontrado</h3>
                <p>Crie seu primeiro agrupamento de OSAs para começar o processo de formalização.</p>
            </div>
        );
    }

    return (
        <div className="formalization-list">
            <div className="formalization-list__header">
                <h2 className="formalization-list__title">Agrupamentos de OSAs</h2>
                <div className="formalization-list__stats">
                    <span className="formalization-list__stat">
                        Total: {groups.length}
                    </span>
                    <span className="formalization-list__stat">
                        Formalizados: {groups.filter(g => g.status === "formalized").length}
                    </span>
                </div>
            </div>

            <div className="formalization-list__grid">
                {groups.map((group) => (
                    <div key={group.id} className="formalization-list__card">
                        <div className="formalization-list__card-header">
                            <div className="formalization-list__card-title">
                                <h3>{group.name}</h3>
                                <span
                                    className="formalization-list__card-status"
                                    style={{ backgroundColor: getStatusColor(group.status) }}
                                >
                                    {getStatusLabel(group.status)}
                                </span>
                            </div>
                            <div className="formalization-list__card-actions">
                                <button
                                    onClick={() => onView(group)}
                                    className="formalization-list__action-btn formalization-list__action-btn--view"
                                    title="Visualizar"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => onEdit(group)}
                                    className="formalization-list__action-btn formalization-list__action-btn--edit"
                                    title="Editar"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => onDelete(group.id)}
                                    className="formalization-list__action-btn formalization-list__action-btn--delete"
                                    title="Excluir"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M3 6h18" />
                                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="formalization-list__card-content">
                            {group.description && (
                                <p className="formalization-list__card-description">
                                    {group.description}
                                </p>
                            )}

                            <div className="formalization-list__card-stats">
                                <div className="formalization-list__card-stat">
                                    <span className="formalization-list__card-stat-label">OSAs:</span>
                                    <span className="formalization-list__card-stat-value">{group.osas.length}</span>
                                </div>
                                <div className="formalization-list__card-stat">
                                    <span className="formalization-list__card-stat-label">Valor Total:</span>
                                    <span className="formalization-list__card-stat-value">
                                        R$ {group.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="formalization-list__card-stat">
                                    <span className="formalization-list__card-stat-label">Criado em:</span>
                                    <span className="formalization-list__card-stat-value">
                                        {group.createdAt.toLocaleDateString('pt-BR')}
                                    </span>
                                </div>
                            </div>

                            <div className="formalization-list__card-criteria">
                                <span className="formalization-list__card-criteria-label">Critério:</span>
                                <span className="formalization-list__card-criteria-value">
                                    {group.cutoffCriteria.type === "manual" ? "Manual" :
                                        group.cutoffCriteria.type === "value" ? `Valor ≥ R$ ${group.cutoffCriteria.value?.toLocaleString('pt-BR')}` :
                                            group.cutoffCriteria.type === "period" ? `Período: ${group.cutoffCriteria.startDate?.toLocaleDateString('pt-BR')} - ${group.cutoffCriteria.endDate?.toLocaleDateString('pt-BR')}` :
                                                group.cutoffCriteria.type === "contract" ? "Por Contrato" : "Manual"}
                                </span>
                            </div>

                            {group.formalizationData && (
                                <div className="formalization-list__card-formalization">
                                    <div className="formalization-list__card-formalization-item">
                                        <span className="formalization-list__card-formalization-label">Documento:</span>
                                        <span className="formalization-list__card-formalization-value">
                                            {group.formalizationData.documentNumber}
                                        </span>
                                    </div>
                                    {group.formalizationData.signedAt && (
                                        <div className="formalization-list__card-formalization-item">
                                            <span className="formalization-list__card-formalization-label">Assinado em:</span>
                                            <span className="formalization-list__card-formalization-value">
                                                {group.formalizationData.signedAt.toLocaleDateString('pt-BR')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="formalization-list__card-footer">
                            {group.status === "draft" && (
                                <button
                                    onClick={() => onGenerateDocument(group.id)}
                                    className="formalization-list__footer-btn formalization-list__footer-btn--primary"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14,2 14,8 20,8" />
                                        <line x1="16" y1="13" x2="8" y2="13" />
                                        <line x1="16" y1="17" x2="8" y2="17" />
                                        <polyline points="10,9 9,9 8,9" />
                                    </svg>
                                    Gerar Documento
                                </button>
                            )}

                            {group.status === "ready" && (
                                <button
                                    onClick={() => onMarkAsFormalized(group.id)}
                                    className="formalization-list__footer-btn formalization-list__footer-btn--success"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 12l2 2 4-4" />
                                        <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3" />
                                        <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3" />
                                        <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3" />
                                        <path d="M12 21c0-1 1-3 3-3s3 2 3 3-1 3-3 3-3-2-3-3" />
                                    </svg>
                                    Marcar como Formalizado
                                </button>
                            )}

                            {group.status === "formalized" && (
                                <div className="formalization-list__footer-status">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 12l2 2 4-4" />
                                        <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3" />
                                        <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3" />
                                        <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3" />
                                        <path d="M12 21c0-1 1-3 3-3s3 2 3 3-1 3-3 3-3-2-3-3" />
                                    </svg>
                                    Formalizado
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FormalizationList;
