import React, { useState } from "react";
import { SubscriptionStatusComponent } from "../../components/ui/SubscriptionStatus/SubscriptionStatus";
import { PlanSelector } from "../../components/ui/PlanSelector/PlanSelector";
import { useCompany } from "../../contexts/companyContext";
import { subscriptionService } from "../../services/subscriptionService";
import { useToast } from "../../hooks/useToast";
import "./SubscriptionPage.css";

export function SubscriptionPage() {
    const { company, subscriptionStatus, refreshSubscription } = useCompany();
    const { showToast } = useToast();
    const [showPlanSelector, setShowPlanSelector] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

    const handleUpgrade = () => {
        setShowPlanSelector(true);
    };

    const handleDowngrade = () => {
        setShowPlanSelector(true);
    };

    const handlePlanSelect = async (plan: any) => {
        if (!company) return;

        try {
            // Aqui você implementaria a lógica de mudança de plano
            // Por exemplo, integração com gateway de pagamento
            showToast("Funcionalidade de mudança de plano será implementada em breve", "info");

            // Simulação de atualização
            await refreshSubscription();
            setShowPlanSelector(false);
        } catch (error) {
            showToast("Erro ao alterar plano", "error");
        }
    };

    if (!company || !subscriptionStatus) {
        return (
            <div className="subscription-page">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Carregando informações da assinatura...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="subscription-page">
            <div className="subscription-header">
                <h1>Gerenciar Assinatura</h1>
                <p>Visualize e gerencie sua assinatura e uso atual</p>
            </div>

            <div className="subscription-content">
                <div className="subscription-info">
                    <SubscriptionStatusComponent
                        status={subscriptionStatus}
                        onUpgrade={handleUpgrade}
                        onDowngrade={handleDowngrade}
                    />
                </div>

                {showPlanSelector && (
                    <div className="plan-selector-modal">
                        <div className="modal-overlay" onClick={() => setShowPlanSelector(false)} />
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2>Alterar Plano</h2>
                                <button
                                    className="close-btn"
                                    onClick={() => setShowPlanSelector(false)}
                                >
                                    ×
                                </button>
                            </div>
                            <div className="modal-body">
                                <PlanSelector
                                    plans={subscriptionService.getAvailablePlans()}
                                    selectedPlan={selectedPlan || undefined}
                                    onPlanSelect={handlePlanSelect}
                                    currentPlan={subscriptionStatus.plan}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
