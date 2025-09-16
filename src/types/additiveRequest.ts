import type { WorkflowStatus } from "./approvalWorkflow";

export interface AdditiveRequest {
  id?: string;
  protocolo: string;
  contratoId: string;
  descricao: string;
  justificativa: string;
  status: "rascunho" | "pendente" | "aprovado" | "rejeitado" | "cancelado";
  prioridade: "baixa" | "media" | "alta" | "urgente";

  itens: AdditiveItem[];
  valorTotal: number;

  evidencias: Evidence[];

  // Informações de auditoria
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;

  workflowStatus?: WorkflowStatus;
  currentApprovalStep?: string;
  approvalConfigId?: string;
  pdfUrl?: string;
  isWorkflowActive: boolean;
  workflowStartedAt?: Date;
  workflowCompletedAt?: Date;
}

export interface AdditiveItem {
  id: string;
  descricao: string;
  quantidade: number;
  unidade: string;
  precoUnitario: number;
  valorTotal: number;
  observacoes?: string;
}

export interface Evidence {
  id: string;
  nome: string;
  tipo: string;
  tamanho: number;
  url: string;
  uploadedAt: Date;
}

export interface AdditiveRequestFormData {
  contratoId: string;
  descricao: string;
  justificativa: string;
  prioridade: "baixa" | "media" | "alta" | "urgente";
  itens: Omit<AdditiveItem, "id" | "valorTotal">[];
  evidencias: File[];
}

export interface UpdateAdditiveRequestData {
  descricao?: string;
  justificativa?: string;
  prioridade?: "baixa" | "media" | "alta" | "urgente";
  itens?: Omit<AdditiveItem, "id" | "valorTotal">[];
  status?: "rascunho" | "pendente" | "aprovado" | "rejeitado" | "cancelado";
  rejectionReason?: string;
}
