import React from "react";
import type { AdditiveRequest } from "../../../types/additiveRequest";
import type { Department } from "../../../types/approvalWorkflow";
import ApprovalWorkflow from "../../Approval/ApprovalWorkflow/ApprovalWorkflow";
import "./AdditiveRequestView.css";

interface AdditiveRequestViewProps {
  request: AdditiveRequest;
}

const AdditiveRequestView: React.FC<AdditiveRequestViewProps> = ({
  request,
}) => {
  const formatDate = (date: Date | string | undefined | null) => {
    if (!date) return "N/A";

    let dateObj: Date;

    if (typeof date === "string") {
      // Se for uma string, tenta converter
      dateObj = new Date(date);
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      // Se for um objeto com toDate (Firebase Timestamp)
      if (date && typeof date === "object" && "toDate" in date) {
        dateObj = (date as { toDate: () => Date }).toDate();
      } else {
        return "N/A";
      }
    }

    // Verifica se a data é válida
    if (isNaN(dateObj.getTime())) {
      return "Data inválida";
    }

    return dateObj.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "rascunho":
        return "#6b7280";
      case "pendente":
        return "#f59e0b";
      case "aprovado":
        return "#10b981";
      case "rejeitado":
        return "#ef4444";
      case "cancelado":
        return "#6b7280";
      default:
        return "#6b7280";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "rascunho":
        return "Rascunho";
      case "pendente":
        return "Pendente";
      case "aprovado":
        return "Aprovado";
      case "rejeitado":
        return "Rejeitado";
      case "cancelado":
        return "Cancelado";
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: string) => {
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

  const getPriorityLabel = (priority: string) => {
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

  return (
    <div className="additive-request-view">
      {/* Header com protocolo e status */}
      <div className="additive-request-view__header">
        <div className="additive-request-view__protocol-section">
          <div className="additive-request-view__protocol">
            <span className="additive-request-view__protocol-label">
              Protocolo:
            </span>
            <span className="additive-request-view__protocol-value">
              {request.protocolo}
            </span>
          </div>
          <div className="additive-request-view__status-section">
            <div
              className="additive-request-view__status"
              style={{ backgroundColor: getStatusColor(request.status) }}
            >
              {getStatusLabel(request.status)}
            </div>
            <div
              className="additive-request-view__priority"
              style={{ backgroundColor: getPriorityColor(request.prioridade) }}
            >
              {getPriorityLabel(request.prioridade)}
            </div>
          </div>
        </div>
      </div>

      {/* Informações principais */}
      <div className="additive-request-view__main-info">
        <div className="additive-request-view__section">
          <h3 className="additive-request-view__section-title">
            Descrição da Solicitação
          </h3>
          <div className="additive-request-view__description">
            {request.descricao}
          </div>
        </div>

        <div className="additive-request-view__section">
          <h3 className="additive-request-view__section-title">
            Justificativa
          </h3>
          <div className="additive-request-view__justification">
            {request.justificativa}
          </div>
        </div>

        <div className="additive-request-view__section">
          <h3 className="additive-request-view__section-title">
            Informações do Contrato
          </h3>
          <div className="additive-request-view__contract-info">
            <div className="additive-request-view__info-item">
              <span className="additive-request-view__info-label">
                ID do Contrato:
              </span>
              <span className="additive-request-view__info-value">
                {request.contratoId}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Itens da solicitação */}
      <div className="additive-request-view__section">
        <h3 className="additive-request-view__section-title">
          Itens da Solicitação ({request.itens.length})
        </h3>
        <div className="additive-request-view__items">
          {request.itens.map((item, index) => (
            <div key={index} className="additive-request-view__item">
              <div className="additive-request-view__item-header">
                <h4 className="additive-request-view__item-title">
                  Item {index + 1}
                </h4>
                <div className="additive-request-view__item-total">
                  R$ {item.valorTotal.toFixed(2)}
                </div>
              </div>
              <div className="additive-request-view__item-details">
                <div className="additive-request-view__item-detail">
                  <span className="additive-request-view__detail-label">
                    Descrição:
                  </span>
                  <span className="additive-request-view__detail-value">
                    {item.descricao}
                  </span>
                </div>
                <div className="additive-request-view__item-details-row">
                  <div className="additive-request-view__item-detail">
                    <span className="additive-request-view__detail-label">
                      Quantidade:
                    </span>
                    <span className="additive-request-view__detail-value">
                      {item.quantidade} {item.unidade}
                    </span>
                  </div>
                  <div className="additive-request-view__item-detail">
                    <span className="additive-request-view__detail-label">
                      Preço Unitário:
                    </span>
                    <span className="additive-request-view__detail-value">
                      R$ {item.precoUnitario.toFixed(2)}
                    </span>
                  </div>
                </div>
                {item.observacoes && (
                  <div className="additive-request-view__item-detail">
                    <span className="additive-request-view__detail-label">
                      Observações:
                    </span>
                    <span className="additive-request-view__detail-value">
                      {item.observacoes}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Total geral */}
      <div className="additive-request-view__total-section">
        <div className="additive-request-view__total">
          <span className="additive-request-view__total-label">
            Valor Total da Solicitação:
          </span>
          <span className="additive-request-view__total-value">
            R$ {request.valorTotal.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Workflow de Aprovação */}
      {request.workflowStatus && request.isWorkflowActive && (
        <div className="additive-request-view__section">
          <h3 className="additive-request-view__section-title">
            Status de Aprovação
          </h3>
          <ApprovalWorkflow
            workflowStatus={request.workflowStatus}
            steps={[
              {
                id: "engenharia-step",
                name: "Aprovação Engenharia",
                department: "engenharia" as Department,
                order: 1,
                isRequired: true,
                approvers: [],
                description: "Análise técnica e viabilidade do projeto",
                estimatedDays: 2,
              },
              {
                id: "suprimentos-step",
                name: "Aprovação Suprimentos",
                department: "suprimentos" as Department,
                order: 2,
                isRequired: true,
                approvers: [],
                description: "Análise de custos e disponibilidade de materiais",
                estimatedDays: 1,
              },
              {
                id: "diretoria-step",
                name: "Aprovação Diretoria",
                department: "diretoria" as Department,
                order: 3,
                isRequired: true,
                approvers: [],
                description: "Aprovação final e liberação de recursos",
                estimatedDays: 1,
              },
            ]}
            canTakeAction={false}
          />
        </div>
      )}

      {/* Informações de auditoria */}
      <div className="additive-request-view__section">
        <h3 className="additive-request-view__section-title">
          Informações de Auditoria
        </h3>
        <div className="additive-request-view__audit-info">
          <div className="additive-request-view__audit-item">
            <span className="additive-request-view__audit-label">
              Criado por:
            </span>
            <span className="additive-request-view__audit-value">
              {request.createdBy}
            </span>
          </div>
          <div className="additive-request-view__audit-item">
            <span className="additive-request-view__audit-label">
              Data de criação:
            </span>
            <span className="additive-request-view__audit-value">
              {formatDate(request.createdAt)}
            </span>
          </div>
          <div className="additive-request-view__audit-item">
            <span className="additive-request-view__audit-label">
              Última atualização:
            </span>
            <span className="additive-request-view__audit-value">
              {formatDate(request.updatedAt)}
            </span>
          </div>
          {request.approvedBy && (
            <div className="additive-request-view__audit-item">
              <span className="additive-request-view__audit-label">
                Aprovado por:
              </span>
              <span className="additive-request-view__audit-value">
                {request.approvedBy}
              </span>
            </div>
          )}
          {request.approvedAt && (
            <div className="additive-request-view__audit-item">
              <span className="additive-request-view__audit-label">
                Data de aprovação:
              </span>
              <span className="additive-request-view__audit-value">
                {formatDate(request.approvedAt)}
              </span>
            </div>
          )}
          {request.rejectedBy && (
            <div className="additive-request-view__audit-item">
              <span className="additive-request-view__audit-label">
                Rejeitado por:
              </span>
              <span className="additive-request-view__audit-value">
                {request.rejectedBy}
              </span>
            </div>
          )}
          {request.rejectedAt && (
            <div className="additive-request-view__audit-item">
              <span className="additive-request-view__audit-label">
                Data de rejeição:
              </span>
              <span className="additive-request-view__audit-value">
                {formatDate(request.rejectedAt)}
              </span>
            </div>
          )}
          {request.rejectionReason && (
            <div className="additive-request-view__audit-item">
              <span className="additive-request-view__audit-label">
                Motivo da rejeição:
              </span>
              <span className="additive-request-view__audit-value">
                {request.rejectionReason}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Evidências */}
      {request.evidencias && request.evidencias.length > 0 && (
        <div className="additive-request-view__section">
          <h3 className="additive-request-view__section-title">
            Evidências ({request.evidencias.length})
          </h3>
          <div className="additive-request-view__evidences">
            {request.evidencias.map((evidence, index) => (
              <div key={index} className="additive-request-view__evidence">
                <div className="additive-request-view__evidence-info">
                  <span className="additive-request-view__evidence-name">
                    {evidence.nome}
                  </span>
                  <span className="additive-request-view__evidence-size">
                    {(evidence.tamanho / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
                <a
                  href={evidence.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="additive-request-view__evidence-link"
                >
                  Visualizar
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdditiveRequestView;
