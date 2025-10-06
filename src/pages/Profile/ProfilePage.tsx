import React, { useState, useEffect } from "react";
import { FiUser, FiCreditCard, FiSettings, FiShield, FiCalendar, FiDollarSign } from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";
import { useCompany } from "../../contexts/companyContext";
import { subscriptionService } from "../../services/subscriptionService";
import type { Company, SubscriptionStatus } from "../../types/subscription";
import "./ProfilePage.css";

export function ProfilePage() {
    const { user } = useAuth();
    const { company, loading: companyLoading } = useCompany();
    const [activeTab, setActiveTab] = useState("overview");
    const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);

    useEffect(() => {
        if (company) {
            setSubscriptionStatus(company.subscription.status);
        }
    }, [company]);

    const getPlanDetails = (plan: string) => {
        const plans = {
            starter: {
                name: "Starter",
                price: "R$ 99,90",
                features: ["5 Contratos Ativos", "3 Usuários", "1 GB Armazenamento"],
                color: "#10b981"
            },
            business: {
                name: "Business",
                price: "R$ 299,90",
                features: ["25 Contratos Ativos", "10 Usuários", "10 GB Armazenamento", "Relatórios Avançados"],
                color: "#3b82f6"
            },
            enterprise: {
                name: "Enterprise",
                price: "R$ 799,90",
                features: ["Contratos Ilimitados", "Usuários Ilimitados", "Armazenamento Ilimitado", "Todos os Recursos Premium", "Suporte Prioritário"],
                color: "#8b5cf6"
            }
        };
        return plans[plan as keyof typeof plans] || plans.starter;
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }).format(date);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active": return "#10b981";
            case "trial": return "#f59e0b";
            case "inactive": return "#ef4444";
            case "canceled": return "#6b7280";
            default: return "#6b7280";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "active": return "Ativo";
            case "trial": return "Período de Teste";
            case "inactive": return "Inativo";
            case "canceled": return "Cancelado";
            default: return "Desconhecido";
        }
    };

    if (companyLoading) {
        return (
            <div className="profile-page">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Carregando perfil...</p>
                </div>
            </div>
        );
    }

    if (!company) {
        return (
            <div className="profile-page">
                <div className="error-state">
                    <h2>Empresa não encontrada</h2>
                    <p>Não foi possível carregar as informações da empresa.</p>
                </div>
            </div>
        );
    }

    const planDetails = getPlanDetails(company.subscription.plan);

    return (
        <div className="profile-page">
            <div className="profile-header">
                <div className="profile-avatar">
                    <FiUser />
                </div>
                <div className="profile-info">
                    <h1>{company.companyName}</h1>
                    <p>{company.email}</p>
                    <div className="profile-status">
                        <span
                            className="status-badge"
                            style={{ backgroundColor: getStatusColor(subscriptionStatus || "inactive") }}
                        >
                            {getStatusText(subscriptionStatus || "inactive")}
                        </span>
                    </div>
                </div>
            </div>

            <div className="profile-content">
                <div className="profile-tabs">
                    <button
                        className={`tab ${activeTab === "overview" ? "active" : ""}`}
                        onClick={() => setActiveTab("overview")}
                    >
                        <FiUser />
                        Visão Geral
                    </button>
                    <button
                        className={`tab ${activeTab === "subscription" ? "active" : ""}`}
                        onClick={() => setActiveTab("subscription")}
                    >
                        <FiCreditCard />
                        Assinatura
                    </button>
                    <button
                        className={`tab ${activeTab === "billing" ? "active" : ""}`}
                        onClick={() => setActiveTab("billing")}
                    >
                        <FiDollarSign />
                        Cobrança
                    </button>
                    <button
                        className={`tab ${activeTab === "security" ? "active" : ""}`}
                        onClick={() => setActiveTab("security")}
                    >
                        <FiShield />
                        Segurança
                    </button>
                </div>

                <div className="profile-tab-content">
                    {activeTab === "overview" && (
                        <div className="tab-panel">
                            <div className="info-grid">
                                <div className="info-card">
                                    <h3>Informações da Empresa</h3>
                                    <div className="info-item">
                                        <label>Nome da Empresa</label>
                                        <span>{company.companyName}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>CNPJ</label>
                                        <span>{company.cnpj}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Email</label>
                                        <span>{company.email}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Telefone</label>
                                        <span>{company.phone}</span>
                                    </div>
                                </div>

                                <div className="info-card">
                                    <h3>Endereço</h3>
                                    <div className="info-item">
                                        <label>Rua</label>
                                        <span>{company.address.street}, {company.address.number}</span>
                                    </div>
                                    {company.address.complement && (
                                        <div className="info-item">
                                            <label>Complemento</label>
                                            <span>{company.address.complement}</span>
                                        </div>
                                    )}
                                    <div className="info-item">
                                        <label>Bairro</label>
                                        <span>{company.address.neighborhood}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Cidade</label>
                                        <span>{company.address.city} - {company.address.state}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>CEP</label>
                                        <span>{company.address.zipCode}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "subscription" && (
                        <div className="tab-panel">
                            <div className="subscription-overview">
                                <div className="plan-card" style={{ borderColor: planDetails.color }}>
                                    <div className="plan-header">
                                        <h3>{planDetails.name}</h3>
                                        <div className="plan-price">{planDetails.price}<span>/mês</span></div>
                                    </div>
                                    <div className="plan-features">
                                        {planDetails.features.map((feature, index) => (
                                            <div key={index} className="feature-item">
                                                <span className="feature-check">✓</span>
                                                <span>{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="subscription-details">
                                    <h3>Detalhes da Assinatura</h3>
                                    <div className="detail-item">
                                        <label>Status</label>
                                        <span
                                            className="status-text"
                                            style={{ color: getStatusColor(subscriptionStatus || "inactive") }}
                                        >
                                            {getStatusText(subscriptionStatus || "inactive")}
                                        </span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Data de Início</label>
                                        <span>{formatDate(company.subscription.startDate)}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Próxima Cobrança</label>
                                        <span>{formatDate(company.subscription.endDate)}</span>
                                    </div>
                                    {company.subscription.trialEndDate && (
                                        <div className="detail-item">
                                            <label>Fim do Período de Teste</label>
                                            <span>{formatDate(company.subscription.trialEndDate)}</span>
                                        </div>
                                    )}
                                    <div className="detail-item">
                                        <label>Renovação Automática</label>
                                        <span>{company.subscription.autoRenew ? "Ativada" : "Desativada"}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="subscription-actions">
                                <button className="btn-primary">
                                    <FiCreditCard />
                                    Alterar Plano
                                </button>
                                <button className="btn-secondary">
                                    <FiSettings />
                                    Gerenciar Assinatura
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === "billing" && (
                        <div className="tab-panel">
                            <div className="billing-section">
                                <h3>Métodos de Pagamento</h3>
                                <div className="payment-methods">
                                    <div className="payment-card">
                                        <div className="card-info">
                                            <FiCreditCard />
                                            <span>Cartão de Crédito</span>
                                        </div>
                                        <button className="btn-secondary">Gerenciar</button>
                                    </div>
                                </div>

                                <h3>Histórico de Faturas</h3>
                                <div className="invoice-list">
                                    <div className="invoice-item">
                                        <div className="invoice-info">
                                            <span className="invoice-date">{formatDate(new Date())}</span>
                                            <span className="invoice-amount">{planDetails.price}</span>
                                        </div>
                                        <div className="invoice-status">
                                            <span className="status-paid">Pago</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "security" && (
                        <div className="tab-panel">
                            <div className="security-section">
                                <h3>Configurações de Segurança</h3>
                                <div className="security-item">
                                    <div className="security-info">
                                        <h4>Autenticação de Dois Fatores</h4>
                                        <p>Adicione uma camada extra de segurança à sua conta</p>
                                    </div>
                                    <button className="btn-secondary">Configurar</button>
                                </div>

                                <div className="security-item">
                                    <div className="security-info">
                                        <h4>Alterar Senha</h4>
                                        <p>Atualize sua senha regularmente para manter a segurança</p>
                                    </div>
                                    <button className="btn-secondary">Alterar</button>
                                </div>

                                <div className="security-item">
                                    <div className="security-info">
                                        <h4>Sessões Ativas</h4>
                                        <p>Gerencie os dispositivos conectados à sua conta</p>
                                    </div>
                                    <button className="btn-secondary">Ver Sessões</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
