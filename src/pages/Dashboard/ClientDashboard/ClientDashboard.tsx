import React, { useState, useEffect } from "react";
import {
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiFile,
  FiAlertCircle,
  FiRefreshCw,
} from "react-icons/fi";
import { useAuth } from "../../../hooks/useAuth";
import { additiveRequestService } from "../../../services/additiveRequestService";
import { formalizationService } from "../../../services/formalizationService";
import { useToast } from "../../../hooks/useToast";
import "./ClientDashboard.css";

interface ClientDashboardStats {
  totalApprovals: number;
  pendingApprovals: number;
  approvedApprovals: number;
  pendingSignatures: number;
  completedSignatures: number;
}

const ClientDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ClientDashboardStats>({
    totalApprovals: 0,
    pendingApprovals: 0,
    approvedApprovals: 0,
    pendingSignatures: 0,
    completedSignatures: 0,
  });
  const [recentApprovals, setRecentApprovals] = useState<any[]>([]);
  const [recentFormalizations, setRecentFormalizations] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, [user?.companyId]);

  const loadDashboardData = async () => {
    if (!user?.companyId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Carregar solicitações de aditivos (aprovadas e pendentes)
      const requests = await additiveRequestService.getAdditiveRequests(
        user.companyId
      );
      
      // Filtrar apenas solicitações que não estão em rascunho
      const validRequests = requests.filter(
        (req) => req.status !== "rascunho"
      );

      // Carregar formalizações
      let allFormalizations: any[] = [];
      try {
        allFormalizations = await formalizationService.getOSAGroups();
      } catch (error) {
        console.error("Erro ao carregar formalizações:", error);
      }
      
      // Filtrar apenas formalizações relacionadas ao cliente
      // As formalizações podem estar relacionadas pela companyId nos OSAs ou pelo createdBy
      const formalizations = allFormalizations.filter((f) => {
        // Verificar se algum OSA pertence à empresa ou se foi criado por alguém da mesma empresa
        return (
          f.osas?.some(
            (osa: any) =>
              osa.companyId === user.companyId ||
              (osa as any)?.contratoId?.includes(user.companyId)
          ) || f.createdBy === user.uid
        );
      });

      // Calcular estatísticas de aprovações
      const totalApprovals = validRequests.length;
      const pendingApprovals = validRequests.filter(
        (req) => req.status === "pendente"
      ).length;
      const approvedApprovals = validRequests.filter(
        (req) => req.status === "aprovado"
      ).length;

      // Calcular estatísticas de formalizações
      const pendingSignatures = formalizations.filter(
        (f) => f.status === "ready" || f.status === "pending"
      ).length;
      const completedSignatures = formalizations.filter(
        (f) => f.status === "formalized"
      ).length;

      // Pegar as 5 mais recentes aprovações
      const sortedRequests = [...validRequests]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5);

      // Pegar as 5 formalizações mais recentes
      const sortedFormalizations = [...formalizations]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5);

      setStats({
        totalApprovals,
        pendingApprovals,
        approvedApprovals,
        pendingSignatures,
        completedSignatures,
      });

      setRecentApprovals(sortedRequests);
      setRecentFormalizations(sortedFormalizations);
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
      showError("Erro", "Erro ao carregar dados do dashboard");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: Date | string): string => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "aprovado":
        return "#10b981";
      case "pendente":
        return "#f59e0b";
      case "rejeitado":
        return "#ef4444";
      case "formalized":
        return "#10b981";
      case "ready":
        return "#3b82f6";
      case "pending":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "aprovado":
        return "Aprovado";
      case "pendente":
        return "Pendente";
      case "rejeitado":
        return "Rejeitado";
      case "formalized":
        return "Assinado";
      case "ready":
        return "Aguardando Assinatura";
      case "pending":
        return "Pendente";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="client-dashboard">
        <div className="client-dashboard__loading">
          <FiRefreshCw className="client-dashboard__loading-icon" />
          <p>Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="client-dashboard">
      {/* Header */}
      <div className="client-dashboard__header">
        <div className="client-dashboard__title-section">
          <h1 className="client-dashboard__title">
            <FiFileText className="client-dashboard__title-icon" />
            Dashboard - Visão do Cliente
          </h1>
          <p className="client-dashboard__subtitle">
            Acompanhe suas aprovações e documentos pendentes de assinatura
          </p>
        </div>
        <button
          onClick={loadDashboardData}
          className="client-dashboard__refresh-btn"
          disabled={loading}
        >
          <FiRefreshCw
            className={
              loading ? "client-dashboard__refresh-icon--spinning" : ""
            }
          />
          Atualizar
        </button>
      </div>

      {/* Estatísticas Principais */}
      <div className="client-dashboard__stats">
        <div className="client-dashboard__stat-card client-dashboard__stat-card--primary">
          <div className="client-dashboard__stat-icon client-dashboard__stat-icon--blue">
            <FiFileText />
          </div>
          <div className="client-dashboard__stat-content">
            <h3 className="client-dashboard__stat-value">
              {stats.totalApprovals}
            </h3>
            <p className="client-dashboard__stat-label">
              Total de Solicitações
            </p>
          </div>
        </div>

        <div className="client-dashboard__stat-card client-dashboard__stat-card--warning">
          <div className="client-dashboard__stat-icon client-dashboard__stat-icon--orange">
            <FiClock />
          </div>
          <div className="client-dashboard__stat-content">
            <h3 className="client-dashboard__stat-value">
              {stats.pendingApprovals}
            </h3>
            <p className="client-dashboard__stat-label">
              Aguardando Aprovação
            </p>
          </div>
        </div>

        <div className="client-dashboard__stat-card client-dashboard__stat-card--success">
          <div className="client-dashboard__stat-icon client-dashboard__stat-icon--green">
            <FiCheckCircle />
          </div>
          <div className="client-dashboard__stat-content">
            <h3 className="client-dashboard__stat-value">
              {stats.approvedApprovals}
            </h3>
            <p className="client-dashboard__stat-label">Aprovadas</p>
          </div>
        </div>

        <div className="client-dashboard__stat-card client-dashboard__stat-card--info">
          <div className="client-dashboard__stat-icon client-dashboard__stat-icon--blue">
            <FiFile />
          </div>
          <div className="client-dashboard__stat-content">
            <h3 className="client-dashboard__stat-value">
              {stats.pendingSignatures}
            </h3>
            <p className="client-dashboard__stat-label">
              Aguardando Assinatura
            </p>
          </div>
        </div>

        <div className="client-dashboard__stat-card client-dashboard__stat-card--success">
          <div className="client-dashboard__stat-icon client-dashboard__stat-icon--green">
            <FiCheckCircle />
          </div>
          <div className="client-dashboard__stat-content">
            <h3 className="client-dashboard__stat-value">
              {stats.completedSignatures}
            </h3>
            <p className="client-dashboard__stat-label">Documentos Assinados</p>
          </div>
        </div>
      </div>

      {/* Aviso se não houver dados */}
      {stats.totalApprovals === 0 && stats.pendingSignatures === 0 && (
        <div className="client-dashboard__empty">
          <FiAlertCircle className="client-dashboard__empty-icon" />
          <h3 className="client-dashboard__empty-title">
            Nenhum dado disponível
          </h3>
          <p className="client-dashboard__empty-text">
            Você ainda não possui solicitações ou documentos para acompanhar.
          </p>
        </div>
      )}

      {/* Solicitações Recentes */}
      {recentApprovals.length > 0 && (
        <div className="client-dashboard__section">
          <h2 className="client-dashboard__section-title">
            Solicitações Recentes
          </h2>
          <div className="client-dashboard__list">
            {recentApprovals.map((request) => (
              <div key={request.id} className="client-dashboard__item">
                <div className="client-dashboard__item-content">
                  <div className="client-dashboard__item-header">
                    <h4 className="client-dashboard__item-title">
                      {request.descricao || "Solicitação sem descrição"}
                    </h4>
                    <span
                      className="client-dashboard__item-status"
                      style={{
                        backgroundColor: getStatusColor(request.status),
                      }}
                    >
                      {getStatusLabel(request.status)}
                    </span>
                  </div>
                  <div className="client-dashboard__item-details">
                    <span className="client-dashboard__item-protocol">
                      Protocolo: {request.protocolo || "N/A"}
                    </span>
                    <span className="client-dashboard__item-date">
                      {formatDate(request.createdAt)}
                    </span>
                    <span className="client-dashboard__item-value">
                      {formatCurrency(request.valorTotal || 0)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formalizações Recentes */}
      {recentFormalizations.length > 0 && (
        <div className="client-dashboard__section">
          <h2 className="client-dashboard__section-title">
            Documentos para Assinatura
          </h2>
          <div className="client-dashboard__list">
            {recentFormalizations.map((formalization) => (
              <div key={formalization.id} className="client-dashboard__item">
                <div className="client-dashboard__item-content">
                  <div className="client-dashboard__item-header">
                    <h4 className="client-dashboard__item-title">
                      {formalization.formalizationData?.documentNumber ||
                        `Documento ${formalization.id?.substring(0, 8)}`}
                    </h4>
                    <span
                      className="client-dashboard__item-status"
                      style={{
                        backgroundColor: getStatusColor(formalization.status),
                      }}
                    >
                      {getStatusLabel(formalization.status)}
                    </span>
                  </div>
                  <div className="client-dashboard__item-details">
                    <span className="client-dashboard__item-protocol">
                      OSAs: {formalization.osas?.length || 0}
                    </span>
                    <span className="client-dashboard__item-date">
                      {formatDate(formalization.createdAt)}
                    </span>
                    {formalization.formalizationData?.totalValue && (
                      <span className="client-dashboard__item-value">
                        {formatCurrency(formalization.formalizationData.totalValue)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ações Rápidas */}
      <div className="client-dashboard__section">
        <h2 className="client-dashboard__section-title">Ações Rápidas</h2>
        <div className="client-dashboard__actions">
          <a
            href="/dashboard/approvals"
            className="client-dashboard__action-btn"
          >
            <FiClock />
            Ver Aprovações
          </a>
          <a
            href="/dashboard/formalization"
            className="client-dashboard__action-btn"
          >
            <FiFile />
            Ver Documentos
          </a>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;

