import type { SubscriptionStatus } from "../../../types/subscription";
import "./SubscriptionStatus.css";

interface SubscriptionStatusProps {
    status: SubscriptionStatus;
    onUpgrade?: () => void;
    onDowngrade?: () => void;
}

export function SubscriptionStatusComponent({
    status,
    onUpgrade,
    onDowngrade
}: SubscriptionStatusProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case "active": return "#10B981";
            case "trial": return "#F59E0B";
            case "suspended": return "#EF4444";
            case "inactive": return "#6B7280";
            default: return "#6B7280";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "active": return "Ativo";
            case "trial": return "Período de Teste";
            case "suspended": return "Suspenso";
            case "inactive": return "Inativo";
            default: return "Desconhecido";
        }
    };

    const getPlanName = (plan: string) => {
        switch (plan) {
            case "starter": return "Starter";
            case "business": return "Business";
            case "enterprise": return "Enterprise";
            default: return plan;
        }
    };

    const formatUsage = (current: number, limit: number) => {
        if (limit === -1) return `${current} (Ilimitado)`;
        return `${current} / ${limit}`;
    };

    const getUsagePercentage = (current: number, limit: number) => {
        if (limit === -1) return 0;
        return Math.min((current / limit) * 100, 100);
    };

    return (
        <div className="subscription-status">
            <div className="subscription-header">
                <div className="plan-info">
                    <h3>Plano {getPlanName(status.plan)}</h3>
                    <div
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(status.status) }}
                    >
                        {getStatusText(status.status)}
                    </div>
                </div>

                {status.trialDaysRemaining && status.trialDaysRemaining > 0 && (
                    <div className="trial-info">
                        <span className="trial-days">
                            {status.trialDaysRemaining} dias restantes no trial
                        </span>
                    </div>
                )}

                {status.daysUntilRenewal > 0 && (
                    <div className="renewal-info">
                        <span className="renewal-days">
                            Renovação em {status.daysUntilRenewal} dias
                        </span>
                    </div>
                )}
            </div>

            <div className="usage-section">
                <h4>Uso Atual</h4>

                <div className="usage-item">
                    <div className="usage-label">Contratos Ativos</div>
                    <div className="usage-value">
                        {formatUsage(status.usage.activeContracts, status.limits.maxActiveContracts)}
                    </div>
                    <div className="usage-bar">
                        <div
                            className="usage-fill"
                            style={{
                                width: `${getUsagePercentage(status.usage.activeContracts, status.limits.maxActiveContracts)}%`
                            }}
                        />
                    </div>
                </div>

                <div className="usage-item">
                    <div className="usage-label">Usuários</div>
                    <div className="usage-value">
                        {formatUsage(status.usage.totalUsers, status.limits.maxUsers)}
                    </div>
                    <div className="usage-bar">
                        <div
                            className="usage-fill"
                            style={{
                                width: `${getUsagePercentage(status.usage.totalUsers, status.limits.maxUsers)}%`
                            }}
                        />
                    </div>
                </div>

                <div className="usage-item">
                    <div className="usage-label">Itens</div>
                    <div className="usage-value">
                        {formatUsage(status.usage.totalItems, status.limits.maxItems)}
                    </div>
                    <div className="usage-bar">
                        <div
                            className="usage-fill"
                            style={{
                                width: `${getUsagePercentage(status.usage.totalItems, status.limits.maxItems)}%`
                            }}
                        />
                    </div>
                </div>

                <div className="usage-item">
                    <div className="usage-label">Armazenamento</div>
                    <div className="usage-value">
                        {status.usage.storageUsedGB.toFixed(2)} GB / {status.limits.storageGB} GB
                    </div>
                    <div className="usage-bar">
                        <div
                            className="usage-fill"
                            style={{
                                width: `${getUsagePercentage(status.usage.storageUsedGB, status.limits.storageGB)}%`
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="features-section">
                <h4>Recursos Incluídos</h4>
                <div className="features-grid">
                    {status.limits.features.analytics && (
                        <div className="feature-item">
                            <span className="feature-icon">📊</span>
                            <span>Analytics Avançado</span>
                        </div>
                    )}
                    {status.limits.features.customReports && (
                        <div className="feature-item">
                            <span className="feature-icon">📋</span>
                            <span>Relatórios Personalizados</span>
                        </div>
                    )}
                    {status.limits.features.apiAccess && (
                        <div className="feature-item">
                            <span className="feature-icon">🔌</span>
                            <span>Acesso à API</span>
                        </div>
                    )}
                    {status.limits.features.whiteLabel && (
                        <div className="feature-item">
                            <span className="feature-icon">🏷️</span>
                            <span>White Label</span>
                        </div>
                    )}
                    {status.limits.features.sso && (
                        <div className="feature-item">
                            <span className="feature-icon">🔐</span>
                            <span>SSO Integrado</span>
                        </div>
                    )}
                    {status.limits.features.auditLogs && (
                        <div className="feature-item">
                            <span className="feature-icon">📝</span>
                            <span>Logs de Auditoria</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="action-buttons">
                {status.canUpgrade && onUpgrade && (
                    <button className="upgrade-btn" onClick={onUpgrade}>
                        Fazer Upgrade
                    </button>
                )}
                {status.canDowngrade && onDowngrade && (
                    <button className="downgrade-btn" onClick={onDowngrade}>
                        Fazer Downgrade
                    </button>
                )}
            </div>
        </div>
    );
}
