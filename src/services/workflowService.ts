// src/services/workflowService.ts
import { db } from "../lib/firebaseconfig";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
  setDoc,
} from "firebase/firestore";
import type {
  WorkflowStatus,
  ApprovalAction,
  ApprovalStep,
  ApprovalActionFormData,
  ApprovalConfig,
} from "../types/approvalWorkflow";
import { ApprovalStatus, Department } from "../types/approvalWorkflow";
import type { AdditiveRequest } from "../types/additiveRequest";

export const workflowService = {
  setupDefaultWorkflow: async (): Promise<void> => {
    try {
      const workflowConfig = {
        id: "default-workflow",
        name: "Workflow Padrão OSA",
        description:
          "Workflow padrão para aprovação de OSAs: Engenharia → Suprimentos → Diretoria",
        steps: [
          {
            id: "engenharia-step",
            name: "Aprovação Engenharia",
            department: "engenharia" as Department,
            order: 1,
            isRequired: true,
            approvers: [], // Será preenchido com usuários do departamento
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
        ],
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const configRef = doc(db, "workflowConfigs", workflowConfig.id);
      await setDoc(configRef, workflowConfig, { merge: true });
    } catch (error) {
      console.error("Erro ao configurar workflow padrão:", error);
      throw error;
    }
  },

  // Iniciar workflow para uma solicitação
  startWorkflow: async (
    requestId: string,
    configId: string = "default-workflow"
  ): Promise<void> => {
    try {
      const batch = writeBatch(db);

      // Buscar configuração do workflow
      const configRef = doc(db, "workflowConfigs", configId);
      const configDoc = await getDoc(configRef);

      if (!configDoc.exists()) {
        throw new Error("Configuração de workflow não encontrada");
      }

      const config = configDoc.data() as ApprovalConfig;
      const firstStep = config.steps.find(
        (step: ApprovalStep) => step.order === 1
      );

      if (!firstStep) {
        throw new Error("Primeira etapa do workflow não encontrada");
      }

      // Criar status do workflow
      const workflowStatus: WorkflowStatus = {
        requestId,
        currentStep: firstStep.id,
        completedSteps: [],
        isCompleted: false,
        isRejected: false,
        isReturned: false,
        actions: [],
        startedAt: new Date(),
        totalSteps: config.steps.length,
      };

      // Salvar status do workflow
      const workflowRef = doc(db, "workflowStatuses", requestId);
      batch.set(workflowRef, workflowStatus);

      // Atualizar solicitação
      const requestRef = doc(db, "additiveRequests", requestId);
      batch.update(requestRef, {
        status: ApprovalStatus.PENDING,
        workflowStatus,
        currentApprovalStep: firstStep.id,
        isWorkflowActive: true,
        workflowStartedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await batch.commit();
    } catch (error) {
      console.error("Erro ao iniciar workflow:", error);
      throw error;
    }
  },

  // Aprovar etapa atual
  approveStep: async (
    requestId: string,
    stepId: string,
    approverId: string,
    approverName: string,
    formData: ApprovalActionFormData
  ): Promise<void> => {
    try {
      const batch = writeBatch(db);

      // Buscar status atual do workflow
      const workflowRef = doc(db, "workflowStatuses", requestId);
      const workflowDoc = await getDoc(workflowRef);

      if (!workflowDoc.exists()) {
        throw new Error("Workflow não encontrado");
      }

      const workflowStatus = workflowDoc.data() as WorkflowStatus;

      // Verificar se a etapa atual é a correta
      if (workflowStatus.currentStep !== stepId) {
        throw new Error("Etapa incorreta para aprovação");
      }

      // Buscar configuração do workflow
      const configRef = doc(db, "workflowConfigs", "default-workflow");
      const configDoc = await getDoc(configRef);
      const config = configDoc.data() as ApprovalConfig;

      const currentStep = config.steps.find(
        (step: ApprovalStep) => step.id === stepId
      );

      if (!currentStep) {
        throw new Error("Etapa atual não encontrada");
      }

      const nextStep = config.steps.find(
        (step: ApprovalStep) => step.order === currentStep.order + 1
      );

      // Criar ação de aprovação
      const action: ApprovalAction = {
        id: `action-${Date.now()}`,
        requestId,
        stepId,
        action: "approve",
        approverId,
        approverName,
        comments: formData.comments,
        timestamp: new Date(),
        attachments: formData.attachments?.map((file) =>
          URL.createObjectURL(file)
        ),
        nextStepId: nextStep?.id,
      };

      // Atualizar status do workflow
      const updatedWorkflowStatus: WorkflowStatus = {
        ...workflowStatus,
        completedSteps: [...workflowStatus.completedSteps, stepId],
        currentStep: nextStep?.id || workflowStatus.currentStep,
        isCompleted: !nextStep, // Se não há próxima etapa, está completo
        actions: [...workflowStatus.actions, action],
        completedAt: !nextStep ? new Date() : undefined,
      };

      // Salvar atualizações
      batch.update(workflowRef, {
        ...updatedWorkflowStatus,
        startedAt: updatedWorkflowStatus.startedAt,
        completedAt: updatedWorkflowStatus.completedAt,
        actions: updatedWorkflowStatus.actions.map((action) => ({
          ...action,
          timestamp: action.timestamp,
        })),
      });

      // Atualizar solicitação
      const requestRef = doc(db, "additiveRequests", requestId);
      const updateData: Record<string, unknown> = {
        workflowStatus: {
          ...updatedWorkflowStatus,
          startedAt: updatedWorkflowStatus.startedAt,
          completedAt: updatedWorkflowStatus.completedAt,
          actions: updatedWorkflowStatus.actions.map((action) => ({
            ...action,
            timestamp: action.timestamp,
          })),
        },
        currentApprovalStep: nextStep?.id || null,
        updatedAt: serverTimestamp(),
      };

      if (updatedWorkflowStatus.isCompleted) {
        updateData.status = ApprovalStatus.APPROVED;
        updateData.approvedBy = approverName;
        updateData.approvedAt = serverTimestamp();
        updateData.workflowCompletedAt = serverTimestamp();
      }

      batch.update(requestRef, updateData);

      await batch.commit();
    } catch (error) {
      console.error("Erro ao aprovar etapa:", error);
      throw error;
    }
  },

  // Rejeitar solicitação
  rejectRequest: async (
    requestId: string,
    stepId: string,
    approverId: string,
    approverName: string,
    formData: ApprovalActionFormData
  ): Promise<void> => {
    try {
      const batch = writeBatch(db);

      // Buscar status atual do workflow
      const workflowRef = doc(db, "workflowStatuses", requestId);
      const workflowDoc = await getDoc(workflowRef);

      if (!workflowDoc.exists()) {
        throw new Error("Workflow não encontrado");
      }

      const workflowStatus = workflowDoc.data() as WorkflowStatus;

      // Criar ação de rejeição
      const action: ApprovalAction = {
        id: `action-${Date.now()}`,
        requestId,
        stepId,
        action: "reject",
        approverId,
        approverName,
        comments: formData.comments,
        timestamp: new Date(),
        attachments: formData.attachments?.map((file) =>
          URL.createObjectURL(file)
        ),
      };

      // Atualizar status do workflow
      const updatedWorkflowStatus: WorkflowStatus = {
        ...workflowStatus,
        isRejected: true,
        isCompleted: true,
        actions: [...workflowStatus.actions, action],
        completedAt: new Date(),
      };

      // Salvar atualizações
      batch.update(workflowRef, {
        ...updatedWorkflowStatus,
        startedAt: updatedWorkflowStatus.startedAt,
        completedAt: updatedWorkflowStatus.completedAt,
        actions: updatedWorkflowStatus.actions.map((action) => ({
          ...action,
          timestamp: action.timestamp,
        })),
      });

      // Atualizar solicitação
      const requestRef = doc(db, "additiveRequests", requestId);
      batch.update(requestRef, {
        status: ApprovalStatus.REJECTED,
        rejectedBy: approverName,
        rejectedAt: serverTimestamp(),
        rejectionReason: formData.comments,
        workflowStatus: {
          ...updatedWorkflowStatus,
          startedAt: updatedWorkflowStatus.startedAt,
          completedAt: updatedWorkflowStatus.completedAt,
          actions: updatedWorkflowStatus.actions.map((action) => ({
            ...action,
            timestamp: action.timestamp,
          })),
        },
        isWorkflowActive: false,
        workflowCompletedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await batch.commit();
    } catch (error) {
      console.error("Erro ao rejeitar solicitação:", error);
      throw error;
    }
  },

  // Devolver para etapa anterior
  returnToPreviousStep: async (
    requestId: string,
    stepId: string,
    approverId: string,
    approverName: string,
    formData: ApprovalActionFormData
  ): Promise<void> => {
    try {
      const batch = writeBatch(db);

      // Buscar status atual do workflow
      const workflowRef = doc(db, "workflowStatuses", requestId);
      const workflowDoc = await getDoc(workflowRef);

      if (!workflowDoc.exists()) {
        throw new Error("Workflow não encontrado");
      }

      const workflowStatus = workflowDoc.data() as WorkflowStatus;

      // Buscar configuração do workflow
      const configRef = doc(db, "workflowConfigs", "default-workflow");
      const configDoc = await getDoc(configRef);
      const config = configDoc.data() as ApprovalConfig;

      const currentStep = config.steps.find(
        (step: ApprovalStep) => step.id === stepId
      );

      if (!currentStep) {
        throw new Error("Etapa atual não encontrada");
      }

      const previousStep = config.steps.find(
        (step: ApprovalStep) => step.order === currentStep.order - 1
      );

      if (!previousStep) {
        throw new Error("Não há etapa anterior para devolver");
      }

      // Criar ação de devolução
      const action: ApprovalAction = {
        id: `action-${Date.now()}`,
        requestId,
        stepId,
        action: "return",
        approverId,
        approverName,
        comments: formData.comments,
        timestamp: new Date(),
        attachments: formData.attachments?.map((file) =>
          URL.createObjectURL(file)
        ),
        nextStepId: previousStep.id,
      };

      // Atualizar status do workflow
      const updatedWorkflowStatus: WorkflowStatus = {
        ...workflowStatus,
        currentStep: previousStep.id,
        isReturned: true,
        actions: [...workflowStatus.actions, action],
      };

      // Salvar atualizações
      batch.update(workflowRef, {
        ...updatedWorkflowStatus,
        startedAt: updatedWorkflowStatus.startedAt,
        completedAt: updatedWorkflowStatus.completedAt,
        actions: updatedWorkflowStatus.actions.map((action) => ({
          ...action,
          timestamp: action.timestamp,
        })),
      });

      // Atualizar solicitação
      const requestRef = doc(db, "additiveRequests", requestId);
      batch.update(requestRef, {
        status: ApprovalStatus.PENDING,
        workflowStatus: {
          ...updatedWorkflowStatus,
          startedAt: updatedWorkflowStatus.startedAt,
          completedAt: updatedWorkflowStatus.completedAt,
          actions: updatedWorkflowStatus.actions.map((action) => ({
            ...action,
            timestamp: action.timestamp,
          })),
        },
        currentApprovalStep: previousStep.id,
        updatedAt: serverTimestamp(),
      });

      await batch.commit();
    } catch (error) {
      console.error("Erro ao devolver para etapa anterior:", error);
      throw error;
    }
  },

  // Obter status do workflow
  getWorkflowStatus: async (
    requestId: string
  ): Promise<WorkflowStatus | null> => {
    try {
      const workflowRef = doc(db, "workflowStatuses", requestId);
      const workflowDoc = await getDoc(workflowRef);

      if (!workflowDoc.exists()) {
        return null;
      }

      return workflowDoc.data() as WorkflowStatus;
    } catch (error) {
      console.error("Erro ao obter status do workflow:", error);
      throw error;
    }
  },

  // Obter solicitações pendentes por departamento
  getPendingRequestsByDepartment: async (
    department: Department
  ): Promise<AdditiveRequest[]> => {
    try {
      const requestsRef = collection(db, "additiveRequests");
      const q = query(
        requestsRef,
        where("status", "==", ApprovalStatus.PENDING),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);
      const requests = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as AdditiveRequest[];

      // Filtrar por departamento baseado na etapa atual
      const configRef = doc(db, "workflowConfigs", "default-workflow");
      const configDoc = await getDoc(configRef);
      const config = configDoc.data() as ApprovalConfig;

      return requests.filter((request) => {
        // Verificar se tem etapa atual
        if (!request.currentApprovalStep) return false;

        // Verificar se a etapa atual pertence ao departamento
        const currentStep = config.steps.find(
          (step: ApprovalStep) => step.id === request.currentApprovalStep
        );
        return currentStep?.department === department;
      });
    } catch (error) {
      console.error("Erro ao obter solicitações pendentes:", error);
      throw error;
    }
  },

  // Versão otimizada para evitar problemas de índice do Firestore
  getPendingRequestsByDepartmentOptimized: async (
    department: Department
  ): Promise<AdditiveRequest[]> => {
    try {
      // Buscar configuração do workflow primeiro
      const configRef = doc(db, "workflowConfigs", "default-workflow");
      const configDoc = await getDoc(configRef);

      if (!configDoc.exists()) {
        await workflowService.setupDefaultWorkflow();
        // Tentar buscar novamente
        const newConfigDoc = await getDoc(configRef);
        if (!newConfigDoc.exists()) {
          throw new Error(
            "Não foi possível criar ou encontrar a configuração do workflow"
          );
        }
      }

      const config = configDoc.data() as ApprovalConfig;

      // Verificar se a configuração tem steps
      if (!config || !config.steps || !Array.isArray(config.steps)) {
        await workflowService.setupDefaultWorkflow();
        throw new Error("Configuração do workflow inválida. Tente novamente.");
      }

      // Encontrar a etapa atual do departamento
      const currentStep = config.steps.find(
        (step: ApprovalStep) => step.department === department
      );

      if (!currentStep) {
        return [];
      }

      const requestsRef = collection(db, "additiveRequests");

      // Consulta otimizada: buscar solicitações pendentes com etapa específica
      const q = query(
        requestsRef,
        where("status", "==", ApprovalStatus.PENDING),
        where("currentApprovalStep", "==", currentStep.id),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);
      const requests = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as AdditiveRequest[];

      return requests;
    } catch (error) {
      console.error("Erro ao obter solicitações pendentes:", error);
      // Fallback para função original se a otimizada falhar
      return await workflowService.getPendingRequestsByDepartment(department);
    }
  },

  // Obter estatísticas do workflow
  getWorkflowStats: async (): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    byDepartment: {
      engenharia: number;
      suprimentos: number;
      diretoria: number;
    };
  }> => {
    try {
      const requestsRef = collection(db, "additiveRequests");

      // Buscar apenas campos necessários para estatísticas
      const snapshot = await getDocs(requestsRef);

      const requests = snapshot.docs.map((doc) => ({
        id: doc.id,
        status: doc.data().status,
        currentApprovalStep: doc.data().currentApprovalStep,
      }));

      const stats = {
        total: requests.length,
        pending: requests.filter((r) => r.status === ApprovalStatus.PENDING)
          .length,
        approved: requests.filter((r) => r.status === ApprovalStatus.APPROVED)
          .length,
        rejected: requests.filter((r) => r.status === ApprovalStatus.REJECTED)
          .length,
        byDepartment: {
          engenharia: requests.filter((r) =>
            r.currentApprovalStep?.includes("engenharia")
          ).length,
          suprimentos: requests.filter((r) =>
            r.currentApprovalStep?.includes("suprimentos")
          ).length,
          diretoria: requests.filter((r) =>
            r.currentApprovalStep?.includes("diretoria")
          ).length,
        },
      };

      return stats;
    } catch (error) {
      console.error("Erro ao obter estatísticas:", error);
      throw error;
    }
  },
};
