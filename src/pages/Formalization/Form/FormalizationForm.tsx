import React, { useState, useEffect, useContext } from "react";
import { formalizationService } from "../../../services/formalizationService";
import { useToast } from "../../../hooks/useToast";
import { AuthContext } from "../../../contexts/authContext";
import type {
    OSAFormalizationFormData,
    CutoffCriteria,
    AdditiveRequest
} from "../../../types/formalization";
import type { OSAGroup } from "../../../types/formalization";
import "./FormalizationForm.css";

interface FormalizationFormProps {
    group?: OSAGroup | null;
    onSubmit: (formData: OSAFormalizationFormData) => void;
    onCancel: () => void;
}

const FormalizationForm: React.FC<FormalizationFormProps> = ({
    group,
    onSubmit,
    onCancel,
}) => {
    const { showSuccess, showError } = useToast();
    const { user } = useContext(AuthContext) || {};

    const [formData, setFormData] = useState<OSAFormalizationFormData>({
        name: "",
        description: "",
        cutoffCriteria: {
            type: "manual",
            description: ""
        },
        selectedOSAs: [],
    });

    const [availableOSAs, setAvailableOSAs] = useState<AdditiveRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const osas = await formalizationService.getEligibleOSAs();
                setAvailableOSAs(osas);

                if (group) {
                    setFormData({
                        name: group.name,
                        description: group.description || "",
                        cutoffCriteria: group.cutoffCriteria,
                        selectedOSAs: group.osas.map(osa => osa.id || ""),
                    });
                }
            } catch (error) {
                setError("Erro ao carregar OSAs disponíveis");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [group]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCriteriaChange = (field: keyof CutoffCriteria, value: any) => {
        setFormData(prev => ({
            ...prev,
            cutoffCriteria: {
                ...prev.cutoffCriteria,
                [field]: value,
            },
        }));
    };

    const handleOSASelection = (osaId: string, selected: boolean) => {
        setFormData(prev => ({
            ...prev,
            selectedOSAs: selected
                ? [...prev.selectedOSAs, osaId]
                : prev.selectedOSAs.filter(id => id !== osaId),
        }));
    };

    const handleSelectAll = () => {
        const allIds = availableOSAs.map(osa => osa.id || "");
        setFormData(prev => ({
            ...prev,
            selectedOSAs: prev.selectedOSAs.length === allIds.length ? [] : allIds,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            showError({
                title: "Erro de Validação",
                message: "Nome do agrupamento é obrigatório",
                type: "error"
            });
            return;
        }

        if (formData.selectedOSAs.length === 0) {
            showError({
                title: "Erro de Validação",
                message: "Selecione pelo menos uma OSA para o agrupamento",
                type: "error"
            });
            return;
        }

        try {
            setLoading(true);
            await onSubmit(formData);
        } catch (error) {
            showError({
                title: "Erro",
                message: "Erro ao processar formulário. Tente novamente.",
                type: "error"
            });
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getTotalValue = () => {
        return formData.selectedOSAs.reduce((total, osaId) => {
            const osa = availableOSAs.find(o => o.id === osaId);
            return total + (osa?.valorTotal || 0);
        }, 0);
    };

    const getSelectedOSAs = () => {
        return availableOSAs.filter(osa => formData.selectedOSAs.includes(osa.id || ""));
    };

    return (
        <div className="formalization-form">
            <div className="formalization-form__header">
                <h2 className="formalization-form__title">
                    {group ? "Editar Agrupamento" : "Novo Agrupamento de OSAs"}
                </h2>
                <p className="formalization-form__subtitle">
                    {group ? "Modifique os dados do agrupamento" : "Configure o agrupamento de OSAs para formalização"}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="formalization-form__form">
                {/* Informações Básicas */}
                <div className="formalization-form__section">
                    <h3 className="formalization-form__section-title">Informações Básicas</h3>

                    <div className="formalization-form__field">
                        <label className="formalization-form__label">
                            Nome do Agrupamento *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="formalization-form__input"
                            placeholder="Ex: Aditivo Contratual Q1 2024"
                            required
                        />
                    </div>

                    <div className="formalization-form__field">
                        <label className="formalization-form__label">
                            Descrição
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className="formalization-form__textarea"
                            placeholder="Descrição opcional do agrupamento..."
                            rows={3}
                        />
                    </div>
                </div>

                {/* Critérios de Corte */}
                <div className="formalization-form__section">
                    <h3 className="formalization-form__section-title">Critérios de Corte</h3>

                    <div className="formalization-form__field">
                        <label className="formalization-form__label">
                            Tipo de Critério
                        </label>
                        <select
                            value={formData.cutoffCriteria.type}
                            onChange={(e) => handleCriteriaChange("type", e.target.value)}
                            className="formalization-form__select"
                        >
                            <option value="manual">Manual</option>
                            <option value="value">Por Valor</option>
                            <option value="period">Por Período</option>
                            <option value="contract">Por Contrato</option>
                        </select>
                    </div>

                    {formData.cutoffCriteria.type === "value" && (
                        <div className="formalization-form__field">
                            <label className="formalization-form__label">
                                Valor Mínimo (R$)
                            </label>
                            <input
                                type="number"
                                value={formData.cutoffCriteria.value || ""}
                                onChange={(e) => handleCriteriaChange("value", parseFloat(e.target.value) || 0)}
                                className="formalization-form__input"
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                            />
                        </div>
                    )}

                    {formData.cutoffCriteria.type === "period" && (
                        <div className="formalization-form__field-group">
                            <div className="formalization-form__field">
                                <label className="formalization-form__label">
                                    Data Inicial
                                </label>
                                <input
                                    type="date"
                                    value={formData.cutoffCriteria.startDate ?
                                        formData.cutoffCriteria.startDate.toISOString().split('T')[0] : ""}
                                    onChange={(e) => handleCriteriaChange("startDate", new Date(e.target.value))}
                                    className="formalization-form__input"
                                />
                            </div>
                            <div className="formalization-form__field">
                                <label className="formalization-form__label">
                                    Data Final
                                </label>
                                <input
                                    type="date"
                                    value={formData.cutoffCriteria.endDate ?
                                        formData.cutoffCriteria.endDate.toISOString().split('T')[0] : ""}
                                    onChange={(e) => handleCriteriaChange("endDate", new Date(e.target.value))}
                                    className="formalization-form__input"
                                />
                            </div>
                        </div>
                    )}

                    {formData.cutoffCriteria.type === "manual" && (
                        <div className="formalization-form__field">
                            <label className="formalization-form__label">
                                Descrição do Critério Manual
                            </label>
                            <textarea
                                value={formData.cutoffCriteria.description || ""}
                                onChange={(e) => handleCriteriaChange("description", e.target.value)}
                                className="formalization-form__textarea"
                                placeholder="Descreva os critérios utilizados para este agrupamento..."
                                rows={2}
                            />
                        </div>
                    )}
                </div>

                {/* Seleção de OSAs */}
                <div className="formalization-form__section">
                    <div className="formalization-form__section-header">
                        <h3 className="formalization-form__section-title">
                            Seleção de OSAs ({formData.selectedOSAs.length} selecionadas)
                        </h3>
                        <button
                            type="button"
                            onClick={handleSelectAll}
                            className="formalization-form__select-all-btn"
                        >
                            {formData.selectedOSAs.length === availableOSAs.length ? "Desmarcar Todas" : "Selecionar Todas"}
                        </button>
                    </div>

                    {loading ? (
                        <div className="formalization-form__loading">
                            <p>Carregando OSAs disponíveis...</p>
                        </div>
                    ) : (
                        <div className="formalization-form__osas-list">
                            {availableOSAs.map((osa) => (
                                <div key={osa.id} className="formalization-form__osa-item">
                                    <label className="formalization-form__osa-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={formData.selectedOSAs.includes(osa.id || "")}
                                            onChange={(e) => handleOSASelection(osa.id || "", e.target.checked)}
                                        />
                                        <div className="formalization-form__osa-info">
                                            <div className="formalization-form__osa-header">
                                                <span className="formalization-form__osa-protocol">{osa.protocolo}</span>
                                                <span className="formalization-form__osa-value">
                                                    R$ {osa.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                            <p className="formalization-form__osa-description">{osa.descricao}</p>
                                            <div className="formalization-form__osa-meta">
                                                <span className="formalization-form__osa-date">
                                                    {osa.createdAt.toLocaleDateString('pt-BR')}
                                                </span>
                                                <span className="formalization-form__osa-priority">
                                                    Prioridade: {osa.prioridade}
                                                </span>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Resumo */}
                {formData.selectedOSAs.length > 0 && (
                    <div className="formalization-form__summary">
                        <h3 className="formalization-form__section-title">Resumo do Agrupamento</h3>
                        <div className="formalization-form__summary-content">
                            <div className="formalization-form__summary-item">
                                <span className="formalization-form__summary-label">OSAs Selecionadas:</span>
                                <span className="formalization-form__summary-value">{formData.selectedOSAs.length}</span>
                            </div>
                            <div className="formalization-form__summary-item">
                                <span className="formalization-form__summary-label">Valor Total:</span>
                                <span className="formalization-form__summary-value">
                                    R$ {getTotalValue().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Botões */}
                <div className="formalization-form__actions">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="formalization-form__cancel-btn"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading || formData.selectedOSAs.length === 0}
                        className="formalization-form__submit-btn"
                    >
                        {loading ? "Processando..." : group ? "Atualizar" : "Criar Agrupamento"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FormalizationForm;
