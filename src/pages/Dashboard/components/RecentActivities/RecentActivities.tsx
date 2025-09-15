import React from "react";
import {
  FiClock,
  FiUser,
  FiFileText,
  FiDollarSign,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiEdit,
} from "react-icons/fi";
import { type AdditiveRequest } from "../../../../types/additiveRequest";
import { type Contract } from "../../../../types/contracts";
import "./RecentActivities.css";

interface RecentActivitiesProps {
  requests: AdditiveRequest[];
  contracts: Contract[];
}

const RecentActivities: React.FC<RecentActivitiesProps> = ({
  requests,
  contracts,
}) => {
  // Função para obter o ícone do status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "aprovado":
        return (
          <FiCheckCircle className="recent-activities__status-icon recent-activities__status-icon--approved" />
        );
      case "rejeitado":
        return (
          <FiXCircle className="recent-activities__status-icon recent-activities__status-icon--rejected" />
        );
      case "pendente":
        return (
          <FiClock className="recent-activities__status-icon recent-activities__status-icon--pending" />
        );
      case "rascunho":
        return (
          <FiEdit className="recent-activities__status-icon recent-activities__status-icon--draft" />
        );
      default:
        return (
          <FiAlertCircle className="recent-activities__status-icon recent-activities__status-icon--default" />
        );
    }
  };

  // Função para obter o texto do status
  const getStatusText = (status: string) => {
    const statusTexts = {
      rascunho: "Rascunho",
      pendente: "Pendente",
      aprovado: "Aprovado",
      rejeitado: "Rejeitado",
    };
    return statusTexts[status as keyof typeof statusTexts] || status;
  };

  // Função para obter a cor da prioridade
  const getPriorityColor = (priority: string) => {
    const colors = {
      urgente: "#DC2626",
      alta: "#EA580C",
      media: "#D97706",
      baixa: "#059669",
    };
    return colors[priority as keyof typeof colors] || "#6B7280";
  };

  // Função para formatar moeda
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      notation: "compact",
    }).format(value);
  };

  // Função para formatar data relativa
  const formatRelativeDate = (date: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return diffInMinutes < 1 ? "Agora mesmo" : `${diffInMinutes}min atrás`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h atrás`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d atrás`;
    } else {
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      });
    }
  };

  // Função para obter nome do contrato
  const getContractName = (contractId: string) => {
    const contract = contracts.find((c) => c.id === contractId);
    return contract
      ? `${contract.numeroContrato} - ${contract.cliente}`
      : contractId;
  };

  if (requests.length === 0) {
    return (
      <div className="recent-activities">
        <div className="recent-activities__header">
          <h3 className="recent-activities__title">
            <FiClock />
            Atividades Recentes
          </h3>
        </div>
        <div className="recent-activities__empty">
          <div className="recent-activities__empty-icon">🕒</div>
          <p className="recent-activities__empty-text">
            Nenhuma atividade recente
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="recent-activities">
      <div className="recent-activities__header">
        <h3 className="recent-activities__title">
          <FiClock />
          Atividades Recentes
        </h3>
        <p className="recent-activities__subtitle">
          Últimas {requests.length} solicitações criadas/atualizadas
        </p>
      </div>

      <div className="recent-activities__list">
        {requests.map((request, index) => (
          <div key={request.id || index} className="recent-activities__item">
            <div className="recent-activities__item-header">
              <div className="recent-activities__status">
                {getStatusIcon(request.status)}
                <span
                  className={`recent-activities__status-text recent-activities__status-text--${request.status}`}
                >
                  {getStatusText(request.status)}
                </span>
              </div>
              <div className="recent-activities__timestamp">
                {formatRelativeDate(request.createdAt)}
              </div>
            </div>

            <div className="recent-activities__item-content">
              <div className="recent-activities__main-info">
                <h4 className="recent-activities__item-title">
                  <FiFileText />
                  {request.descricao}
                </h4>
                <p className="recent-activities__protocol">
                  Protocolo: <span>{request.protocolo}</span>
                </p>
                <p className="recent-activities__contract">
                  Contrato: <span>{getContractName(request.contratoId)}</span>
                </p>
              </div>

              <div className="recent-activities__meta-info">
                <div className="recent-activities__priority">
                  <div
                    className="recent-activities__priority-indicator"
                    style={{
                      backgroundColor: getPriorityColor(request.prioridade),
                    }}
                  />
                  <span className="recent-activities__priority-text">
                    {request.prioridade.toUpperCase()}
                  </span>
                </div>

                <div className="recent-activities__value">
                  <FiDollarSign />
                  <span>{formatCurrency(request.valorTotal)}</span>
                </div>

                <div className="recent-activities__items-count">
                  <span>{request.itens?.length || 0} item(s)</span>
                </div>
              </div>
            </div>

            <div className="recent-activities__item-footer">
              <div className="recent-activities__creator">
                <FiUser />
                <span>Criado por: {request.createdBy}</span>
              </div>

              {request.itens && request.itens.length > 0 && (
                <div className="recent-activities__top-item">
                  <span>📦 {request.itens[0].descricao}</span>
                  {request.itens.length > 1 && (
                    <span className="recent-activities__more-items">
                      +{request.itens.length - 1} mais
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {requests.length >= 10 && (
        <div className="recent-activities__footer">
          <p className="recent-activities__footer-text">
            Mostrando as 10 atividades mais recentes
          </p>
        </div>
      )}
    </div>
  );
};

export default RecentActivities;
