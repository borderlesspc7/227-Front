// src/types/approvalWorkflow.ts

export interface ApprovalStep {
  id: string;
  name: string;
  department: "engenharia" | "suprimentos" | "diretoria";
  order: number;
  isRequired: boolean;
  approvers: string[]; // IDs dos usuários que podem aprovar nesta etapa
  description: string;
  estimatedDays: number; // Tempo estimado para aprovação
}

export interface ApprovalAction {
  id: string;
  requestId: string;
  stepId: string;
  action: "approve" | "reject" | "return";
  approverId: string;
  approverName: string;
  comments: string;
  timestamp: Date;
  attachments?: string[]; // URLs de anexos opcionais
  nextStepId?: string; // Para ações de aprovação
}

export interface WorkflowStatus {
  requestId: string;
  currentStep: string;
  completedSteps: string[];
  isCompleted: boolean;
  isRejected: boolean;
  isReturned: boolean;
  actions: ApprovalAction[];
  startedAt: Date;
  totalSteps: number;
}

export interface ApprovalConfig {
  id: string;
  name: string;
  description: string;
  steps: ApprovalStep[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApprovalNotification {
  id: string;
  requestId: string;
  requestProtocol: string; // Protocolo da solicitação para exibição
  userId: string;
  type:
    | "new_request"
    | "approval_required"
    | "approved"
    | "rejected"
    | "returned"
    | "request_submitted";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string; // Link para a página de aprovação
  priority: "low" | "medium" | "high" | "urgent";
  department?: string; // Departamento responsável
  senderName?: string; // Nome de quem gerou a notificação
}

export interface ApprovalStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  averageApprovalTime: number; // em dias
  approvalRate: number; // porcentagem
  departmentStats: {
    engenharia: {
      pending: number;
      approved: number;
      rejected: number;
      averageTime: number;
    };
    suprimentos: {
      pending: number;
      approved: number;
      rejected: number;
      averageTime: number;
    };
    diretoria: {
      pending: number;
      approved: number;
      rejected: number;
      averageTime: number;
    };
  };
}

// Tipos para formulários
export interface ApprovalActionFormData {
  action: "approve" | "reject" | "return";
  comments: string;
  attachments?: File[];
}

export interface WorkflowConfigFormData {
  name: string;
  description: string;
  steps: Omit<ApprovalStep, "id">[];
}

// Enums para facilitar o uso
export enum ApprovalStatus {
  DRAFT = "rascunho",
  PENDING = "pendente",
  APPROVED = "aprovado",
  REJECTED = "rejeitado",
  RETURNED = "devolvido",
  CANCELLED = "cancelado",
}

export enum ApprovalActionType {
  APPROVE = "approve",
  REJECT = "reject",
  RETURN = "return",
}

export enum Department {
  ENGENHARIA = "engenharia",
  SUPRIMENTOS = "suprimentos",
  DIRETORIA = "diretoria",
}

export interface ApprovalStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  byDepartment: {
    engenharia: number;
    suprimentos: number;
    diretoria: number;
  };
}
