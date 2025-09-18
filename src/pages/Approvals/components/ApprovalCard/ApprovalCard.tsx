// src/pages/Approvals/components/ApprovalCard/ApprovalCard.tsx
import React, { useState } from "react";
import {
  FiCheckCircle,
  FiXCircle,
  FiArrowLeft,
  FiEye,
  FiDollarSign,
  FiCalendar,
  FiUser,
  FiAlertCircle,
} from "react-icons/fi";
import type { AdditiveRequest } from "../../../../types/additiveRequest";
import type {
  Department,
  ApprovalActionFormData,
} from "../../../../types/approvalWorkflow";
import { formatCurrency, formatDateTime } from "../../../../utils/dateUtils";
import ApprovalModal from "../../../Approval/ApprovalModal/ApprovalModal";
import "./ApprovalCard.css";

interface ApprovalCardProps {
  request: AdditiveRequest;
  onAction: (
    requestId: string,
    action: "approve" | "reject" | "return",
    formData: ApprovalActionFormData
  ) => void;
  currentUserDepartment: Department;
  loading?: boolean;
}

const ApprovalCard: React.FC<ApprovalCardProps> = ({
  request,
  onAction,
  currentUserDepartment,
  loading = false,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState<
    "approve" | "reject" | "return"
  >("approve");

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case "baixa":
        return "#10b981";
      case "media":
        return "#f59e0b";
      case "alta":
        return "#ef4444";
      case "urgente":
        return "#dc2626";
      default:
        return "#6b7280";
    }
  };

  const getPriorityLabel = (priority: string): string => {
    switch (priority) {
      case "baixa":
        return "Baixa";
      case "media":
        return "Média";
      case "alta":
        return "Alta";
      case "urgente":
        return "Urgente";
      default:
        return priority;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "rascunho":
        return "#6b7280";
      case "pendente":
        return "#f59e0b";
      case "aprovado":
        return "#10b981";
      case "rejeitado":
        return "#ef4444";
      case "devolvido":
        return "#f59e0b";
      case "cancelado":
        return "#6b7280";
      default:
        return "#6b7280";
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "rascunho":
        return "Rascunho";
      case "pendente":
        return "Pendente";
      case "aprovado":
        return "Aprovado";
      case "rejeitado":
        return "Rejeitado";
      case "devolvido":
        return "Devolvido";
      case "cancelado":
        return "Cancelado";
      default:
        return status;
    }
  };

  const canTakeAction = () => {
    if (loading) return false;
    if (request.status !== "pendente") return false;
    if (!request.currentApprovalStep) return false;
    return request.currentApprovalStep.includes(currentUserDepartment);
  };

  const handleActionClick = (action: "approve" | "reject" | "return") => {
    setModalAction(action);
    setShowModal(true);
  };

  const handleModalConfirm = (formData: ApprovalActionFormData) => {
    onAction(request.id!, modalAction, formData);
    setShowModal(false);
  };

  const handleViewDetails = () => {
    // Implementar visualização de detalhes
  };

  return (
    <>
      <div className="approval-card">
        {/* Header do Card */}
        <div className="approval-card__header">
          <div className="approval-card__title-section">
            <h3 className="approval-card__title">{request.descricao}</h3>
            <div className="approval-card__protocol">{request.protocolo}</div>
          </div>
          <div className="approval-card__status">
            <span
              className="approval-card__status-badge"
              style={{ backgroundColor: getStatusColor(request.status) }}
            >
              {getStatusLabel(request.status)}
            </span>
          </div>
        </div>

        {/* Informações Principais */}
        <div className="approval-card__content">
          <div className="approval-card__info-grid">
            <div className="approval-card__info-item">
              <FiDollarSign className="approval-card__info-icon" />
              <div className="approval-card__info-content">
                <span className="approval-card__info-label">Valor Total</span>
                <span className="approval-card__info-value">
                  {formatCurrency(request.valorTotal)}
                </span>
              </div>
            </div>

            <div className="approval-card__info-item">
              <FiCalendar className="approval-card__info-icon" />
              <div className="approval-card__info-content">
                <span className="approval-card__info-label">Criado em</span>
                <span className="approval-card__info-value">
                  {formatDateTime(request.createdAt)}
                </span>
              </div>
            </div>

            <div className="approval-card__info-item">
              <FiUser className="approval-card__info-icon" />
              <div className="approval-card__info-content">
                <span className="approval-card__info-label">Criado por</span>
                <span className="approval-card__info-value">
                  {request.createdBy}
                </span>
              </div>
            </div>

            <div className="approval-card__info-item">
              <FiAlertCircle className="approval-card__info-icon" />
              <div className="approval-card__info-content">
                <span className="approval-card__info-label">Prioridade</span>
                <span
                  className="approval-card__info-value approval-card__priority"
                  style={{ color: getPriorityColor(request.prioridade) }}
                >
                  {getPriorityLabel(request.prioridade)}
                </span>
              </div>
            </div>
          </div>

          {/* Justificativa */}
          <div className="approval-card__justification">
            <h4 className="approval-card__justification-title">
              Justificativa
            </h4>
            <p className="approval-card__justification-text">
              {request.justificativa}
            </p>
          </div>

          {/* Itens */}
          {request.itens && request.itens.length > 0 && (
            <div className="approval-card__items">
              <h4 className="approval-card__items-title">
                Itens ({request.itens.length})
              </h4>
              <div className="approval-card__items-list">
                {request.itens.slice(0, 3).map((item, index) => (
                  <div key={index} className="approval-card__item">
                    <span className="approval-card__item-desc">
                      {item.descricao}
                    </span>
                    <span className="approval-card__item-qty">
                      {item.quantidade} {item.unidade}
                    </span>
                    <span className="approval-card__item-price">
                      {formatCurrency(item.valorTotal)}
                    </span>
                  </div>
                ))}
                {request.itens.length > 3 && (
                  <div className="approval-card__item-more">
                    +{request.itens.length - 3} item(s) adicional(is)
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="approval-card__actions">
          <button
            className="approval-card__action-btn approval-card__action-btn--view"
            onClick={handleViewDetails}
            disabled={loading}
          >
            <FiEye />
            Ver Detalhes
          </button>

          {canTakeAction() && (
            <>
              <button
                className="approval-card__action-btn approval-card__action-btn--approve"
                onClick={() => handleActionClick("approve")}
                disabled={loading}
              >
                <FiCheckCircle />
                Aprovar
              </button>

              <button
                className="approval-card__action-btn approval-card__action-btn--reject"
                onClick={() => handleActionClick("reject")}
                disabled={loading}
              >
                <FiXCircle />
                Rejeitar
              </button>

              <button
                className="approval-card__action-btn approval-card__action-btn--return"
                onClick={() => handleActionClick("return")}
                disabled={loading}
              >
                <FiArrowLeft />
                Devolver
              </button>
            </>
          )}
        </div>
      </div>

      {/* Modal de Ação */}
      <ApprovalModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleModalConfirm}
        stepName={`${currentUserDepartment.toUpperCase()}`}
        actionType={modalAction}
        loading={loading}
      />
    </>
  );
};

export default ApprovalCard;
