import React, { useState, useEffect, useContext } from "react";
import { formalizationService } from "../../services/formalizationService";
import { useToast } from "../../hooks/useToast";
import { AuthContext } from "../../contexts/authContext";
import type { OSAGroup, OSAFormalizationFormData } from "../../types/formalization";
import Modal from "../../components/ui/Modal/Modal";
import FormalizationForm from "./Form/FormalizationForm";
import FormalizationList from "./List/FormalizationList";
import FormalizationView from "./View/FormalizationView";
import "./FormalizationPage.css";

const FormalizationPage: React.FC = () => {
    const { showError, showSuccess } = useToast();
    const { user } = useContext(AuthContext) || {};

    const [groups, setGroups] = useState<OSAGroup[]>([]);
    const [editingGroup, setEditingGroup] = useState<OSAGroup | null>(null);
    const [viewingGroup, setViewingGroup] = useState<OSAGroup | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadGroups = async () => {
            try {
                setLoading(true);
                const groupsFromDB = await formalizationService.getOSAGroups();
                setGroups(groupsFromDB);
            } catch (error) {
                const errorMessage = "Erro ao carregar agrupamentos de OSAs";
                setError(errorMessage);
                showError({
                    title: "Erro ao carregar",
                    message: errorMessage + ". Verifique sua conexão e tente novamente.",
                    type: "error"
                });
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        loadGroups();
    }, [showError]);

    const handleFormSubmit = async (formData: OSAFormalizationFormData) => {
        try {
            setLoading(true);
            const newGroup = await formalizationService.createOSAGroup(formData, user?.uid);
            setGroups(prev => [newGroup, ...prev]);
            setShowForm(false);
            showSuccess({
                title: "Sucesso",
                message: "Agrupamento de OSAs criado com sucesso!",
                type: "success"
            });
        } catch (error) {
            showError({
                title: "Erro",
                message: "Erro ao criar agrupamento de OSAs. Tente novamente.",
                type: "error"
            });
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditGroup = (group: OSAGroup) => {
        setEditingGroup(group);
        setShowForm(true);
    };

    const handleViewGroup = (group: OSAGroup) => {
        setViewingGroup(group);
    };

    const handleDeleteGroup = async (groupId: string) => {
        try {
            setLoading(true);
            await formalizationService.deleteOSAGroup(groupId);
            setGroups(prev => prev.filter(group => group.id !== groupId));
            showSuccess({
                title: "Sucesso",
                message: "Agrupamento removido com sucesso!",
                type: "success"
            });
        } catch (error) {
            showError({
                title: "Erro",
                message: "Erro ao remover agrupamento. Tente novamente.",
                type: "error"
            });
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateDocument = async (groupId: string) => {
        try {
            setLoading(true);
            const documentNumber = await formalizationService.generateFormalizationDocument(groupId);

            // Atualizar a lista local
            setGroups(prev => prev.map(group =>
                group.id === groupId
                    ? { ...group, status: "ready" as const }
                    : group
            ));

            showSuccess({
                title: "Documento Gerado",
                message: `Documento de formalização ${documentNumber} gerado com sucesso!`,
                type: "success"
            });
        } catch (error) {
            showError({
                title: "Erro",
                message: "Erro ao gerar documento de formalização. Tente novamente.",
                type: "error"
            });
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsFormalized = async (groupId: string) => {
        try {
            setLoading(true);
            await formalizationService.markAsFormalized(groupId, {
                signedBy: user?.uid || "system",
                signatureProvider: "clicksign", // TODO: implementar seleção
                signatureId: `sign_${Date.now()}`
            });

            // Atualizar a lista local
            setGroups(prev => prev.map(group =>
                group.id === groupId
                    ? { ...group, status: "formalized" as const }
                    : group
            ));

            showSuccess({
                title: "Sucesso",
                message: "Agrupamento marcado como formalizado!",
                type: "success"
            });
        } catch (error) {
            showError({
                title: "Erro",
                message: "Erro ao marcar como formalizado. Tente novamente.",
                type: "error"
            });
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingGroup(null);
    };

    const refreshGroupsList = async () => {
        try {
            const groupsFromDB = await formalizationService.getOSAGroups();
            setGroups(groupsFromDB);
        } catch (err) {
            console.error("Erro ao recarregar agrupamentos:", err);
        }
    };

    return (
        <div className="formalization-page">
            <div className="formalization-page__header">
                <h1 className="formalization-page__title">
                    Módulo de Formalização
                </h1>
                <button
                    className="formalization-page__add-btn"
                    onClick={() => setShowForm(true)}
                    type="button"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Novo Agrupamento
                </button>
            </div>

            {loading && (
                <div className="formalization-page__loading">
                    <p>Carregando agrupamentos...</p>
                </div>
            )}

            {error && (
                <div className="formalization-page__error">
                    <p>Erro: {error}</p>
                </div>
            )}

            {/* Modal de novo agrupamento */}
            {showForm && (
                <Modal
                    isOpen={showForm}
                    onClose={handleCancelForm}
                    size="extra-large"
                >
                    <FormalizationForm
                        group={editingGroup}
                        onSubmit={editingGroup ? () => { } : handleFormSubmit}
                        onCancel={handleCancelForm}
                    />
                </Modal>
            )}

            <div className="formalization-page__list-section">
                <FormalizationList
                    loading={loading}
                    groups={groups}
                    error={error}
                    onEdit={handleEditGroup}
                    onDelete={handleDeleteGroup}
                    onView={handleViewGroup}
                    onGenerateDocument={handleGenerateDocument}
                    onMarkAsFormalized={handleMarkAsFormalized}
                />
            </div>

            {/* Modal de visualização */}
            {viewingGroup && (
                <Modal
                    isOpen={!!viewingGroup}
                    onClose={() => setViewingGroup(null)}
                    size="extra-large"
                >
                    <FormalizationView
                        group={viewingGroup}
                        onClose={() => setViewingGroup(null)}
                    />
                </Modal>
            )}
        </div>
    );
};

export default FormalizationPage;
