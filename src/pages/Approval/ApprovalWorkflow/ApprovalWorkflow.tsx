import React from "react";
import { CheckCircle, Clock, XCircle, ArrowLeft } from "lucide-react";
import type {
  WorkflowStatus,
  ApprovalStep,
} from "../../../types/approvalWorkflow";
import "./ApprovalWorkflow.css";

interface ApprovalWorkflowProps {
  workflowStatus: WorkflowStatus;
  steps: ApprovalStep[];
  onAction?: (stepId: string, action: "approve" | "reject" | "return") => void;
  canTakeAction?: boolean;
  currentUserDepartment?: string;
}

const ApprovalWorkflow: React.FC<ApprovalWorkflowProps> = ({
  workflowStatus,
  steps,
  onAction,
  canTakeAction = false,
  currentUserDepartment,
}) => {
  const getStepStatus = (step: ApprovalStep) => {
    if (workflowStatus.completedSteps.includes(step.id)) {
      return "completed";
    } else if (workflowStatus.currentStep === step.id) {
      return "current";
    } else if (workflowStatus.isRejected) {
      return "rejected";
    }
    return "pending";
  };

  const getStepIcon = (_step: ApprovalStep, status: string) => {
    switch (status) {
      case "completed":
        return (
          <CheckCircle className="approval-workflow__step-icon--completed" />
        );
      case "current":
        return <Clock className="approval-workflow__step-icon--current" />;
      case "rejected":
        return <XCircle className="approval-workflow__step-icon--rejected" />;
      default:
        return <Clock className="approval-workflow__step-icon--pending" />;
    }
  };

  const canTakeActionOnStep = (step: ApprovalStep) => {
    if (!canTakeAction) return false;
    if (workflowStatus.currentStep !== step.id) return false;
    if (workflowStatus.isCompleted || workflowStatus.isRejected) return false;
    return currentUserDepartment === step.department;
  };

  return (
    <div className="approval-workflow">
      <div className="approval-workflow__header">
        <h3 className="approval-workflow__title">Fluxo de Aprovação</h3>
        <div className="approval-workflow__status">
          {workflowStatus.isCompleted && (
            <span className="approval-workflow__status-badge approval-workflow__status-badge--completed">
              Aprovado
            </span>
          )}
          {workflowStatus.isRejected && (
            <span className="approval-workflow__status-badge approval-workflow__status-badge--rejected">
              Rejeitado
            </span>
          )}
          {workflowStatus.isReturned && (
            <span className="approval-workflow__status-badge approval-workflow__status-badge--returned">
              Devolvido
            </span>
          )}
          {!workflowStatus.isCompleted && !workflowStatus.isRejected && (
            <span className="approval-workflow__status-badge approval-workflow__status-badge--pending">
              Pendente
            </span>
          )}
        </div>
      </div>

      <div className="approval-workflow__steps">
        {steps.map((step, index) => {
          const status = getStepStatus(step);
          const canAction = canTakeActionOnStep(step);

          return (
            <div key={step.id} className="approval-workflow__step">
              <div className="approval-workflow__step-content">
                <div className="approval-workflow__step-header">
                  {getStepIcon(step, status)}
                  <div className="approval-workflow__step-info">
                    <h4 className="approval-workflow__step-name">
                      {step.name}
                    </h4>
                    <p className="approval-workflow__step-description">
                      {step.description}
                    </p>
                  </div>
                </div>
                <div className="approval-workflow__step-meta">
                  <span className="approval-workflow__step-department">
                    {step.department.toUpperCase()}
                  </span>
                  <span className="approval-workflow__step-time">
                    {step.estimatedDays} dia(s)
                  </span>
                </div>
              </div>

              {canAction && onAction && (
                <div className="approval-workflow__step-actions">
                  <button
                    className="approval-workflow__action-btn approval-workflow__action-btn--approve"
                    onClick={() => onAction(step.id, "approve")}
                  >
                    <CheckCircle />
                    Aprovar
                  </button>
                  <button
                    className="approval-workflow__action-btn approval-workflow__action-btn--reject"
                    onClick={() => onAction(step.id, "reject")}
                  >
                    <XCircle />
                    Rejeitar
                  </button>
                  {index > 0 && (
                    <button
                      className="approval-workflow__action-btn approval-workflow__action-btn--return"
                      onClick={() => onAction(step.id, "return")}
                    >
                      <ArrowLeft />
                      Devolver
                    </button>
                  )}
                </div>
              )}

              {index < steps.length - 1 && (
                <div
                  className="approval-workflow__connector"
                  style={{
                    backgroundColor:
                      status === "completed" ? "#10b981" : "#e5e7eb",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
      {workflowStatus.actions.length > 0 && (
        <div className="approval-workflow__history">
          <h4 className="approval-workflow__history-title">
            Histórico de Ações
          </h4>
          <div className="approval-workflow__history-list">
            {workflowStatus.actions.map((action) => (
              <div key={action.id} className="approval-workflow__history-item">
                <div className="approval-workflow__action-header">
                  <span className="approval-workflow__action-type">
                    {action.action === "approve" && "✅ Aprovado"}
                    {action.action === "reject" && "❌ Rejeitado"}
                    {action.action === "return" && " ↩️ Devolvido"}
                  </span>
                  <span className="approval-workflow__action-time">
                    {new Date(action.timestamp).toLocaleString("pt-BR")}
                  </span>
                </div>
                <div className="approval-workflow__action-details">
                  <p className="approval-workflow__action-user">
                    Por: {action.approverName}
                  </p>
                  {action.comments && (
                    <p className="approval-workflow__action-comments">
                      {action.comments}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalWorkflow;
