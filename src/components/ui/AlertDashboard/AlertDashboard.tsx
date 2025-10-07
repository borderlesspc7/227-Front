import React, { useState, useEffect, useContext } from "react";
import { FiAlertTriangle, FiClock, FiFileText, FiTrendingUp, FiRefreshCw } from "react-icons/fi";
import { AuthContext } from "../../../contexts/authContext";
import { notificationService } from "../../../services/notificationService";
import "./AlertDashboard.css";

interface AlertStats {
    contractLimitAlerts: number;
    pendingReturns: number;
    pendingFormalizations: number;
    urgentNotifications: number;
}

interface AlertDashboardProps {
    className?: string;
}

const AlertDashboard: React.FC<AlertDashboardProps> = ({ className = "" }) => {
    const { user } = useContext(AuthContext) || {};
    const [alertStats, setAlertStats] = useState<AlertStats>({
        contractLimitAlerts: 0,
        pendingReturns: 0,
        pendingFormalizations: 0,
        urgentNotifications: 0,
    });
    const [loading, setLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    const loadAlertStats = async () => {
        if (!user?.companyId) return;

        try {
            setLoading(true);
            const stats = await notificationService.getAlertStats(user.companyId);
            setAlertStats(stats);
            setLastUpdated(new Date());
        } catch (error) {
            console.error("Erro ao carregar estatísticas de alertas:", error);
        } finally {
            setLoading(false);
        }
    };

    const runAdvancedAlerts = async () => {
        if (!user?.companyId) return;

        try {
            setLoading(true);
            await notificationService.runAdvancedAlerts(user.companyId);
            await loadAlertStats(); // Recarregar estatísticas após executar alertas
        } catch (error) {
            console.error("Erro ao executar alertas avançados:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.companyId) {
            loadAlertStats();

            // Atualizar estatísticas a cada 5 minutos
            const interval = setInterval(loadAlertStats, 5 * 60 * 1000);
            return () => clearInterval(interval);
        }
    }, [user?.companyId]);

    const getTotalAlerts = () => {
        return alertStats.contractLimitAlerts +
            alertStats.pendingReturns +
            alertStats.pendingFormalizations +
            alertStats.urgentNotifications;
    };

    const getAlertLevel = () => {
        const total = getTotalAlerts();
        if (total === 0) return "success";
        if (total <= 2) return "warning";
        return "danger";
    };

    const formatLastUpdated = () => {
        const now = new Date();
        const diff = now.getTime() - lastUpdated.getTime();
        const minutes = Math.floor(diff / 60000);

        if (minutes < 1) return "Agora mesmo";
        if (minutes === 1) return "1 minuto atrás";
        return `${minutes} minutos atrás`;
    };

    if (!user?.companyId) {
        return null;
    }

    return (
        <div className={`alert-dashboard ${className}`}>
            <div className="alert-dashboard__header">
                <div className="alert-dashboard__title">
                    <FiTrendingUp className="alert-dashboard__title-icon" />
                    <h3>Alertas Avançados</h3>
                </div>
                <div className="alert-dashboard__actions">
                    <button
                        className="alert-dashboard__refresh-btn"
                        onClick={runAdvancedAlerts}
                        disabled={loading}
                        title="Executar verificações de alertas"
                    >
                        <FiRefreshCw className={`alert-dashboard__refresh-icon ${loading ? 'spinning' : ''}`} />
                    </button>
                    <span className="alert-dashboard__last-updated">
                        Atualizado: {formatLastUpdated()}
                    </span>
                </div>
            </div>

            <div className="alert-dashboard__stats">
                <div className={`alert-dashboard__stat alert-dashboard__stat--${getAlertLevel()}`}>
                    <div className="alert-dashboard__stat-icon">
                        <FiAlertTriangle />
                    </div>
                    <div className="alert-dashboard__stat-content">
                        <div className="alert-dashboard__stat-value">{getTotalAlerts()}</div>
                        <div className="alert-dashboard__stat-label">Total de Alertas</div>
                    </div>
                </div>

                <div className="alert-dashboard__stat-grid">
                    <div className={`alert-dashboard__stat-item ${alertStats.contractLimitAlerts > 0 ? 'alert-dashboard__stat-item--warning' : ''}`}>
                        <div className="alert-dashboard__stat-item-icon">
                            <FiAlertTriangle />
                        </div>
                        <div className="alert-dashboard__stat-item-content">
                            <div className="alert-dashboard__stat-item-value">{alertStats.contractLimitAlerts}</div>
                            <div className="alert-dashboard__stat-item-label">Limites de Contrato</div>
                        </div>
                    </div>

                    <div className={`alert-dashboard__stat-item ${alertStats.pendingReturns > 0 ? 'alert-dashboard__stat-item--warning' : ''}`}>
                        <div className="alert-dashboard__stat-item-icon">
                            <FiClock />
                        </div>
                        <div className="alert-dashboard__stat-item-content">
                            <div className="alert-dashboard__stat-item-value">{alertStats.pendingReturns}</div>
                            <div className="alert-dashboard__stat-item-label">Devoluções Pendentes</div>
                        </div>
                    </div>

                    <div className={`alert-dashboard__stat-item ${alertStats.pendingFormalizations > 0 ? 'alert-dashboard__stat-item--warning' : ''}`}>
                        <div className="alert-dashboard__stat-item-icon">
                            <FiFileText />
                        </div>
                        <div className="alert-dashboard__stat-item-content">
                            <div className="alert-dashboard__stat-item-value">{alertStats.pendingFormalizations}</div>
                            <div className="alert-dashboard__stat-item-label">Formalizações Pendentes</div>
                        </div>
                    </div>

                    <div className={`alert-dashboard__stat-item ${alertStats.urgentNotifications > 0 ? 'alert-dashboard__stat-item--danger' : ''}`}>
                        <div className="alert-dashboard__stat-item-icon">
                            <FiAlertTriangle />
                        </div>
                        <div className="alert-dashboard__stat-item-content">
                            <div className="alert-dashboard__stat-item-value">{alertStats.urgentNotifications}</div>
                            <div className="alert-dashboard__stat-item-label">Notificações Urgentes</div>
                        </div>
                    </div>
                </div>
            </div>

            {getTotalAlerts() > 0 && (
                <div className="alert-dashboard__actions-footer">
                    <button
                        className="alert-dashboard__action-btn alert-dashboard__action-btn--primary"
                        onClick={() => window.location.href = "/notifications"}
                    >
                        Ver Todas as Notificações
                    </button>
                    <button
                        className="alert-dashboard__action-btn alert-dashboard__action-btn--secondary"
                        onClick={() => window.location.href = "/subscription"}
                    >
                        Gerenciar Assinatura
                    </button>
                </div>
            )}
        </div>
    );
};

export default AlertDashboard;
