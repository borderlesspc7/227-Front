import React from "react";
import type { OSAGroup } from "../../../types/formalization";
import "./FormalizationView.css";

interface FormalizationViewProps {
    group: OSAGroup;
    onClose: () => void;
}

const FormalizationView: React.FC<FormalizationViewProps> = ({
    group,
    onClose,
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
                return "Pronto para Formalização";
            case "formalized":
                return "Formalizado";
            case "cancelled":
                return "Cancelado";
            default:
                return status;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "urgente":
                return "#dc2626";
            case "alta":
                return "#f59e0b";
            case "media":
                return "#3b82f6";
            case "baixa":
                return "#059669";
            default:
                return "#6b7280";
        }
    };

    return (
        <div className="formalization-view">
            <div className="formalization-view__header">
                <div className="formalization-view__title-section">
                    <h2 className="formalization-view__title">{group.name}</h2>
                    <span
                        className="formalization-view__status"
                        style={{ backgroundColor: getStatusColor(group.status) }}
                    >
                        {getStatusLabel(group.status)}
                    </span>
                </div>
                <button
                    onClick={onClose}
                    className="formalization-view__close-btn"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>

            <div className="formalization-view__content">
                {/* Informações Gerais */}
                <div className="formalization-view__section">
                    <h3 className="formalization-view__section-title">Informações Gerais</h3>
                    <div className="formalization-view__info-grid">
                        <div className="formalization-view__info-item">
                            <span className="formalization-view__info-label">Nome:</span>
                            <span className="formalization-view__info-value">{group.name}</span>
                        </div>
                        {group.description && (
                            <div className="formalization-view__info-item">
                                <span className="formalization-view__info-label">Descrição:</span>
                                <span className="formalization-view__info-value">{group.description}</span>
                            </div>
                        )}
                        <div className="formalization-view__info-item">
                            <span className="formalization-view__info-label">Criado em:</span>
                            <span className="formalization-view__info-value">
                                {group.createdAt.toLocaleDateString('pt-BR')} às {group.createdAt.toLocaleTimeString('pt-BR')}
                            </span>
                        </div>
                        <div className="formalization-view__info-item">
                            <span className="formalization-view__info-label">Criado por:</span>
                            <span className="formalization-view__info-value">{group.createdBy}</span>
                        </div>
                    </div>
                </div>

                {/* Critérios de Corte */}
                <div className="formalization-view__section">
                    <h3 className="formalization-view__section-title">Critérios de Corte</h3>
                    <div className="formalization-view__criteria">
                        <div className="formalization-view__criteria-item">
                            <span className="formalization-view__criteria-label">Tipo:</span>
                            <span className="formalization-view__criteria-value">
                                {group.cutoffCriteria.type === "manual" ? "Manual" :
                                    group.cutoffCriteria.type === "value" ? "Por Valor" :
                                        group.cutoffCriteria.type === "period" ? "Por Período" :
                                            group.cutoffCriteria.type === "contract" ? "Por Contrato" : "Manual"}
                            </span>
                        </div>

                        {group.cutoffCriteria.type === "value" && group.cutoffCriteria.value && (
                            <div className="formalization-view__criteria-item">
                                <span className="formalization-view__criteria-label">Valor Mínimo:</span>
                                <span className="formalization-view__criteria-value">
                                    R$ {group.cutoffCriteria.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        )}

                        {group.cutoffCriteria.type === "period" && (
                            <>
                                {group.cutoffCriteria.startDate && (
                                    <div className="formalization-view__criteria-item">
                                        <span className="formalization-view__criteria-label">Data Inicial:</span>
                                        <span className="formalization-view__criteria-value">
                                            {group.cutoffCriteria.startDate.toLocaleDateString('pt-BR')}
                                        </span>
                                    </div>
                                )}
                                {group.cutoffCriteria.endDate && (
                                    <div className="formalization-view__criteria-item">
                                        <span className="formalization-view__criteria-label">Data Final:</span>
                                        <span className="formalization-view__criteria-value">
                                            {group.cutoffCriteria.endDate.toLocaleDateString('pt-BR')}
                                        </span>
                                    </div>
                                )}
                            </>
                        )}

                        {group.cutoffCriteria.type === "contract" && group.cutoffCriteria.contractId && (
                            <div className="formalization-view__criteria-item">
                                <span className="formalization-view__criteria-label">Contrato:</span>
                                <span className="formalization-view__criteria-value">{group.cutoffCriteria.contractId}</span>
                            </div>
                        )}

                        {group.cutoffCriteria.type === "manual" && group.cutoffCriteria.description && (
                            <div className="formalization-view__criteria-item">
                                <span className="formalization-view__criteria-label">Descrição:</span>
                                <span className="formalization-view__criteria-value">{group.cutoffCriteria.description}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Resumo Financeiro */}
                <div className="formalization-view__section">
                    <h3 className="formalization-view__section-title">Resumo Financeiro</h3>
                    <div className="formalization-view__summary">
                        <div className="formalization-view__summary-item">
                            <span className="formalization-view__summary-label">Total de OSAs:</span>
                            <span className="formalization-view__summary-value">{group.osas.length}</span>
                        </div>
                        <div className="formalization-view__summary-item">
                            <span className="formalization-view__summary-label">Valor Total:</span>
                            <span className="formalization-view__summary-value">
                                R$ {group.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="formalization-view__summary-item">
                            <span className="formalization-view__summary-label">Valor Médio por OSA:</span>
                            <span className="formalization-view__summary-value">
                                R$ {(group.totalValue / group.osas.length).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Lista de OSAs */}
                <div className="formalization-view__section">
                    <h3 className="formalization-view__section-title">
                        OSAs Incluídas ({group.osas.length})
                    </h3>
                    <div className="formalization-view__osas-list">
                        {group.osas.map((osa) => (
                            <div key={osa.id} className="formalization-view__osa-item">
                                <div className="formalization-view__osa-header">
                                    <div className="formalization-view__osa-title">
                                        <span className="formalization-view__osa-protocol">{osa.protocolo}</span>
                                        <span
                                            className="formalization-view__osa-priority"
                                            style={{ color: getPriorityColor(osa.prioridade) }}
                                        >
                                            {osa.prioridade.toUpperCase()}
                                        </span>
                                    </div>
                                    <span className="formalization-view__osa-value">
                                        R$ {osa.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <p className="formalization-view__osa-description">{osa.descricao}</p>
                                <div className="formalization-view__osa-meta">
                                    <span className="formalization-view__osa-date">
                                        Criado em: {osa.createdAt.toLocaleDateString('pt-BR')}
                                    </span>
                                    <span className="formalization-view__osa-status">
                                        Status: {osa.status}
                                    </span>
                                    <span className="formalization-view__osa-items">
                                        {osa.itens.length} item(s)
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dados de Formalização */}
                {group.formalizationData && (
                    <div className="formalization-view__section">
                        <h3 className="formalization-view__section-title">Dados de Formalização</h3>
                        <div className="formalization-view__formalization">
                            <div className="formalization-view__formalization-item">
                                <span className="formalization-view__formalization-label">Número do Documento:</span>
                                <span className="formalization-view__formalization-value">
                                    {group.formalizationData.documentNumber}
                                </span>
                            </div>
                            <div className="formalization-view__formalization-item">
                                <span className="formalization-view__formalization-label">Gerado em:</span>
                                <span className="formalization-view__formalization-value">
                                    {group.formalizationData.generatedAt.toLocaleDateString('pt-BR')} às {group.formalizationData.generatedAt.toLocaleTimeString('pt-BR')}
                                </span>
                            </div>
                            <div className="formalization-view__formalization-item">
                                <span className="formalization-view__formalization-label">Gerado por:</span>
                                <span className="formalization-view__formalization-value">
                                    {group.formalizationData.generatedBy}
                                </span>
                            </div>
                            {group.formalizationData.signedAt && (
                                <div className="formalization-view__formalization-item">
                                    <span className="formalization-view__formalization-label">Assinado em:</span>
                                    <span className="formalization-view__formalization-value">
                                        {group.formalizationData.signedAt.toLocaleDateString('pt-BR')} às {group.formalizationData.signedAt.toLocaleTimeString('pt-BR')}
                                    </span>
                                </div>
                            )}
                            {group.formalizationData.signedBy && (
                                <div className="formalization-view__formalization-item">
                                    <span className="formalization-view__formalization-label">Assinado por:</span>
                                    <span className="formalization-view__formalization-value">
                                        {group.formalizationData.signedBy}
                                    </span>
                                </div>
                            )}
                            {group.formalizationData.signatureProvider && (
                                <div className="formalization-view__formalization-item">
                                    <span className="formalization-view__formalization-label">Provedor de Assinatura:</span>
                                    <span className="formalization-view__formalization-value">
                                        {group.formalizationData.signatureProvider.toUpperCase()}
                                    </span>
                                </div>
                            )}
                            {group.formalizationData.pdfUrl && (
                                <div className="formalization-view__formalization-item">
                                    <span className="formalization-view__formalization-label">PDF:</span>
                                    <a
                                        href={group.formalizationData.pdfUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="formalization-view__pdf-link"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                            <polyline points="14,2 14,8 20,8" />
                                            <line x1="16" y1="13" x2="8" y2="13" />
                                            <line x1="16" y1="17" x2="8" y2="17" />
                                            <polyline points="10,9 9,9 8,9" />
                                        </svg>
                                        Visualizar PDF
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FormalizationView;
