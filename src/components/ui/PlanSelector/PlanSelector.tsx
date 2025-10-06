import React from "react";
import type { SubscriptionPlanConfig } from "../../types/subscription";
import "./PlanSelector.css";

interface PlanSelectorProps {
    plans: SubscriptionPlanConfig[];
    selectedPlan?: string;
    onPlanSelect: (plan: SubscriptionPlanConfig) => void;
    currentPlan?: string;
}

export function PlanSelector({
    plans,
    selectedPlan,
    onPlanSelect,
    currentPlan
}: PlanSelectorProps) {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(price);
    };

    const getPlanIcon = (planId: string) => {
        switch (planId) {
            case "starter": return "🚀";
            case "business": return "💼";
            case "enterprise": return "🏢";
            default: return "📦";
        }
    };

    const isCurrentPlan = (planId: string) => {
        return currentPlan === planId;
    };

    const isSelected = (planId: string) => {
        return selectedPlan === planId;
    };

    return (
        <div className="plan-selector">
            <div className="plan-selector-header">
                <h2>Escolha seu Plano</h2>
                <p>Selecione o plano que melhor atende às necessidades da sua empresa</p>
            </div>

            <div className="plans-grid">
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        className={`plan-card ${isSelected(plan.id) ? 'selected' : ''} ${isCurrentPlan(plan.id) ? 'current' : ''}`}
                        onClick={() => onPlanSelect(plan)}
                    >
                        {isCurrentPlan(plan.id) && (
                            <div className="current-badge">Plano Atual</div>
                        )}

                        <div className="plan-header">
                            <div className="plan-icon">{getPlanIcon(plan.id)}</div>
                            <h3 className="plan-name">{plan.name}</h3>
                            <div className="plan-price">
                                <span className="price-value">{formatPrice(plan.price)}</span>
                                <span className="price-period">/mês</span>
                            </div>
                        </div>

                        <div className="plan-description">
                            <p>{plan.description}</p>
                        </div>

                        <div className="plan-limits">
                            <div className="limit-item">
                                <span className="limit-label">Contratos Ativos:</span>
                                <span className="limit-value">
                                    {plan.limits.maxActiveContracts === -1 ? 'Ilimitado' : plan.limits.maxActiveContracts}
                                </span>
                            </div>
                            <div className="limit-item">
                                <span className="limit-label">Usuários:</span>
                                <span className="limit-value">
                                    {plan.limits.maxUsers === -1 ? 'Ilimitado' : plan.limits.maxUsers}
                                </span>
                            </div>
                            <div className="limit-item">
                                <span className="limit-label">Armazenamento:</span>
                                <span className="limit-value">{plan.limits.storageGB} GB</span>
                            </div>
                            <div className="limit-item">
                                <span className="limit-label">Suporte:</span>
                                <span className="limit-value">
                                    {plan.limits.supportLevel === 'basic' && 'Básico'}
                                    {plan.limits.supportLevel === 'priority' && 'Prioritário'}
                                    {plan.limits.supportLevel === 'dedicated' && 'Dedicado'}
                                </span>
                            </div>
                        </div>

                        <div className="plan-features">
                            <h4>Recursos Incluídos:</h4>
                            <ul>
                                {plan.features.map((feature, index) => (
                                    <li key={index}>
                                        <span className="feature-check">✓</span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="plan-actions">
                            {isCurrentPlan(plan.id) ? (
                                <button className="current-plan-btn" disabled>
                                    Plano Atual
                                </button>
                            ) : (
                                <button
                                    className={`select-plan-btn ${isSelected(plan.id) ? 'selected' : ''}`}
                                >
                                    {isSelected(plan.id) ? 'Selecionado' : 'Selecionar Plano'}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
