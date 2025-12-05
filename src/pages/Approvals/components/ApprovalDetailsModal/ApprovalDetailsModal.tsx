import React from "react";
import {
  FiFileText,
  FiClipboard,
  FiClock,
  FiUser,
  FiDollarSign,
  FiPackage,
  FiTrendingUp,
} from "react-icons/fi";
import Modal from "../../../../components/ui/Modal/Modal";
import type { AdditiveRequest } from "../../../../types/additiveRequest";
import { formatCurrency, formatDateTime } from "../../../../utils/dateUtils";
import "./ApprovalDetailsModal.css";

interface ApprovalDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: AdditiveRequest;
  creatorName?: string;
}

const ApprovalDetailsModal: React.FC<ApprovalDetailsModalProps> = ({
  isOpen,
  onClose,
  request,
  creatorName,
}) => {
  if (!request) return null;

  // Função para obter texto do status
  const getStatusText = (status: string): string => {
    const statusTexts = {
      rascunho: "Rascunho",
      pendente: "Pendente",
      aprovado: "Aprovado",
      rejeitado: "Rejeitado",
      devolvido: "Devolvido",
    };
    return statusTexts[status as keyof typeof statusTexts] || status;
  };

  // Função para obter texto da prioridade
  const getPriorityText = (priority: string): string => {
    const priorityTexts = {
      baixa: "Baixa",
      media: "Média",
      alta: "Alta",
      urgente: "Urgente",
    };
    return priorityTexts[priority as keyof typeof priorityTexts] || priority;
  };

  // Função para obter ícone da prioridade
  const getPriorityIcon = (priority: string): string => {
    const icons = {
      baixa: "🟢",
      media: "🟡",
      alta: "🟠",
      urgente: "🔴",
    };
    return icons[priority as keyof typeof icons] || "⚪";
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detalhes da OSA ${request.protocolo}`}
      size="large"
    >
      <div className="approval-details-modal">
        {/* Informações Principais */}
        <div className="approval-details-modal__main-info">
          <div className="approval-details-modal__field">
            <label className="approval-details-modal__field-label">
              <FiFileText />
              Descrição
            </label>
            <div
              className={`approval-details-modal__field-value ${
                !request.descricao
                  ? "approval-details-modal__field-value--empty"
                  : ""
              }`}
            >
              {request.descricao || "Não informado"}
            </div>
          </div>

          <div className="approval-details-modal__field">
            <label className="approval-details-modal__field-label">
              <FiClipboard />
              Justificativa
            </label>
            <div
              className={`approval-details-modal__field-value ${
                !request.justificativa
                  ? "approval-details-modal__field-value--empty"
                  : ""
              }`}
            >
              {request.justificativa || "Não informado"}
            </div>
          </div>

          <div className="approval-details-modal__field">
            <label className="approval-details-modal__field-label">
              <FiTrendingUp />
              Status
            </label>
            <div className="approval-details-modal__field-value">
              <span
                className={`approval-details-modal__status-badge approval-details-modal__status-badge--${request.status}`}
              >
                {getStatusText(request.status)}
              </span>
            </div>
          </div>

          <div className="approval-details-modal__field">
            <label className="approval-details-modal__field-label">
              <FiTrendingUp />
              Prioridade
            </label>
            <div className="approval-details-modal__field-value">
              <span
                className={`approval-details-modal__priority-badge approval-details-modal__priority-badge--${request.prioridade}`}
              >
                {getPriorityIcon(request.prioridade)}{" "}
                {getPriorityText(request.prioridade)}
              </span>
            </div>
          </div>

          <div className="approval-details-modal__field">
            <label className="approval-details-modal__field-label">
              <FiClock />
              Criado em
            </label>
            <div className="approval-details-modal__field-value">
              {formatDateTime(request.createdAt)}
            </div>
          </div>

          <div className="approval-details-modal__field">
            <label className="approval-details-modal__field-label">
              <FiUser />
              Criado por
            </label>
            <div className="approval-details-modal__field-value">
              {creatorName || request.createdBy || "Não informado"}
            </div>
          </div>
        </div>

        {/* Valor Total Destacado */}
        <div className="approval-details-modal__field">
          <label className="approval-details-modal__field-label">
            <FiDollarSign />
            Valor Total
          </label>
          <div className="approval-details-modal__field-value approval-details-modal__field-value--total">
            {formatCurrency(request.valorTotal)}
          </div>
        </div>

        {/* Seção de Itens */}
        {request.itens && request.itens.length > 0 && (
          <div className="approval-details-modal__items-section">
            <h3 className="approval-details-modal__items-title">
              <FiPackage />
              Itens
              <span className="approval-details-modal__items-count">
                {request.itens.length}
              </span>
            </h3>
            <div className="approval-details-modal__items-table">
              <div className="approval-details-modal__items-header">
                <div>Descrição</div>
                <div>Quantidade</div>
                <div>Unidade</div>
                <div>Valor Total</div>
              </div>
              {request.itens.map((item, idx) => (
                <div key={idx} className="approval-details-modal__items-row">
                  <div className="approval-details-modal__item-cell approval-details-modal__item-cell--desc">
                    {item.descricao}
                  </div>
                  <div className="approval-details-modal__item-cell approval-details-modal__item-cell--qty">
                    {item.quantidade}
                  </div>
                  <div className="approval-details-modal__item-cell approval-details-modal__item-cell--unit">
                    {item.unidade}
                  </div>
                  <div className="approval-details-modal__item-cell approval-details-modal__item-cell--total">
                    {formatCurrency(item.valorTotal || 0)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="approval-details-modal__actions">
          <button
            type="button"
            className="approval-details-modal__close-btn"
            onClick={onClose}
          >
            Fechar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ApprovalDetailsModal;


