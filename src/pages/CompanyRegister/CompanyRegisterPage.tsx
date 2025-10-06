import React, { useState } from "react";
import { CompanyRegisterModal } from "../../components/ui/CompanyRegisterModal/CompanyRegisterModal";
import "./CompanyRegisterPage.css";

export function CompanyRegisterPage() {
    const [isModalOpen, setIsModalOpen] = useState(true);

    const handleSuccess = () => {
        // Após cadastro bem-sucedido, redirecionar para dashboard
        window.location.href = "/admin/dashboard";
    };

    const handleClose = () => {
        // Voltar para dashboard (mesmo sem empresa configurada)
        window.location.href = "/admin/dashboard";
    };

    return (
        <div className="company-register-page">
            <div className="page-header">
                <h1>Cadastro de Empresa</h1>
                <p>Configure sua empresa para acessar todas as funcionalidades do AddControl</p>
            </div>

            <CompanyRegisterModal
                isOpen={isModalOpen}
                onClose={handleClose}
                onSuccess={handleSuccess}
            />
        </div>
    );
}
