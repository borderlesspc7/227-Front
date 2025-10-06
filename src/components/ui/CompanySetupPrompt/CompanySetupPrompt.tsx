import React, { useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useCompany } from "../../../contexts/companyContext";
import { CompanyRegisterModal } from "../CompanyRegisterModal/CompanyRegisterModal";
import "./CompanySetupPrompt.css";

export function CompanySetupPrompt() {
    const { user } = useAuth();
    const { company, loading } = useCompany();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleConfigureCompany = () => {
        setIsModalOpen(true);
    };

    const handleContactSupport = () => {
        // Abrir email de suporte
        window.open("mailto:suporte@addcontrol.com?subject=Configuração de Empresa", "_blank");
    };

    const handleModalSuccess = () => {
        setIsModalOpen(false);
        // Forçar recarregamento da página para atualizar os dados do usuário
        window.location.reload();
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
    };

    if (loading) {
        return (
            <div className="company-setup-prompt">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Carregando informações da empresa...</p>
                </div>
            </div>
        );
    }

    if (!user?.companyId || !company) {
        return (
            <>
                <div className="company-setup-prompt">
                    <div className="setup-card">
                        <div className="setup-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <h2>Configuração Necessária</h2>
                        <p>
                            Sua conta precisa ser associada a uma empresa para acessar todas as funcionalidades do sistema.
                        </p>
                        <div className="setup-actions">
                            <button className="primary-btn" onClick={handleConfigureCompany}>
                                Configurar Empresa
                            </button>
                            <button className="secondary-btn" onClick={handleContactSupport}>
                                Entrar em Contato
                            </button>
                        </div>
                    </div>
                </div>

                <CompanyRegisterModal
                    isOpen={isModalOpen}
                    onClose={handleModalClose}
                    onSuccess={handleModalSuccess}
                />
            </>
        );
    }

    return null;
}
