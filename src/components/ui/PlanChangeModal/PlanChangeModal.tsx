import { useState } from "react";
import { FiCheck, FiX, FiStar } from "react-icons/fi";
import { useToast } from "../../../hooks/useToast";
import "./PlanChangeModal.css";

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  color: string;
  popular?: boolean;
}

interface PlanChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: string;
}

export function PlanChangeModal({ isOpen, onClose, currentPlan }: PlanChangeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const { showSuccess, showError } = useToast();

  const plans: Plan[] = [
    {
      id: "starter",
      name: "Starter",
      price: 99.90,
      description: "Ideal para pequenas empresas iniciando no mercado",
      features: [
        "5 Contratos Ativos",
        "3 Usuários",
        "1 GB Armazenamento",
        "Suporte por Email",
        "Relatórios Básicos"
      ],
      color: "#10b981"
    },
    {
      id: "business",
      name: "Business",
      price: 299.90,
      description: "Perfeito para empresas em crescimento",
      features: [
        "25 Contratos Ativos",
        "10 Usuários",
        "10 GB Armazenamento",
        "Suporte Prioritário",
        "Relatórios Avançados",
        "API Access",
        "Integrações"
      ],
      color: "#3b82f6",
      popular: true
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: 799.90,
      description: "Solução completa para grandes empresas",
      features: [
        "Contratos Ilimitados",
        "Usuários Ilimitados",
        "Armazenamento Ilimitado",
        "Suporte Dedicado",
        "Todos os Recursos Premium",
        "API Completa",
        "Integrações Avançadas",
        "White Label",
        "SSO",
        "Audit Logs"
      ],
      color: "#8b5cf6"
    }
  ];

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleUpgrade = () => {
    if (!selectedPlan) {
      showError("Erro", "Selecione um plano para continuar.");
      return;
    }

    if (selectedPlan === currentPlan) {
      showError("Erro", "Você já está neste plano.");
      return;
    }

    const plan = plans.find(p => p.id === selectedPlan);
    showSuccess("Sucesso", `Plano alterado para ${plan?.name} com sucesso!`);
    onClose();
  };

  const getCurrentPlan = () => {
    return plans.find(p => p.id === currentPlan);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(price);
  };

  if (!isOpen) return null;

  return (
    <div className="plan-modal-overlay">
      <div className="plan-modal">
        <div className="plan-modal__header">
          <h2>Alterar Plano de Assinatura</h2>
          <button className="plan-modal__close" onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        <div className="plan-modal__content">
          <div className="current-plan-info">
            <h3>Plano Atual</h3>
            <div className="current-plan-card">
              <div className="plan-name">{getCurrentPlan()?.name}</div>
              <div className="plan-price">{formatPrice(getCurrentPlan()?.price || 0)}/mês</div>
            </div>
          </div>

          <div className="plans-grid">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`plan-card ${plan.id === currentPlan ? "current" : ""} ${selectedPlan === plan.id ? "selected" : ""}`}
                onClick={() => handlePlanSelect(plan.id)}
                style={{ borderColor: plan.color }}
              >
                {plan.popular && (
                  <div className="popular-badge">
                    <FiStar size={12} />
                    Mais Popular
                  </div>
                )}

                <div className="plan-header">
                  <h3>{plan.name}</h3>
                  <div className="plan-price">
                    {formatPrice(plan.price)}
                    <span>/mês</span>
                  </div>
                </div>

                <p className="plan-description">{plan.description}</p>

                <div className="plan-features">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="feature-item">
                      <FiCheck className="feature-check" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {plan.id === currentPlan && (
                  <div className="current-badge">Plano Atual</div>
                )}

                {selectedPlan === plan.id && plan.id !== currentPlan && (
                  <div className="selected-badge">Selecionado</div>
                )}
              </div>
            ))}
          </div>

          <div className="plan-modal__actions">
            <button className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button
              className="btn-upgrade"
              onClick={handleUpgrade}
              disabled={!selectedPlan || selectedPlan === currentPlan}
            >
              Alterar Plano
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
