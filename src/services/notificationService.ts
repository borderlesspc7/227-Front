// src/services/notificationService.ts
import { db } from "../lib/firebaseconfig";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import type {
  ApprovalNotification,
  ApprovalConfig,
  ApprovalStep,
} from "../types/approvalWorkflow";
import type { AdditiveRequest } from "../types/additiveRequest";
import type { OSAGroup } from "../types/formalization";
import { subscriptionService } from "./subscriptionService";

export const notificationService = {
  // Criar notificação
  createNotification: async (
    notification: Omit<ApprovalNotification, "id" | "createdAt">
  ): Promise<void> => {
    try {
      const notificationsRef = collection(db, "notifications");
      await addDoc(notificationsRef, {
        ...notification,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Erro ao criar notificação:", error);
      throw error;
    }
  },

  // Notificar quando solicitação é enviada para aprovação
  notifyRequestSubmitted: async (
    request: AdditiveRequest,
    senderName: string
  ): Promise<void> => {
    try {
      // Buscar configuração do workflow
      const configRef = doc(db, "workflowConfigs", "default-workflow");
      const configDoc = await getDoc(configRef);

      if (!configDoc.exists()) {
        console.warn("Configuração do workflow não encontrada");
        return;
      }

      const config = configDoc.data() as ApprovalConfig;
      const firstStep = config.steps.find(
        (step: ApprovalStep) => step.order === 1
      );

      if (!firstStep) {
        console.warn("Primeira etapa do workflow não encontrada");
        return;
      }

      // Notificar aprovadores da primeira etapa
      // Se não há aprovadores definidos, buscar usuários por role
      let approvers = firstStep.approvers || [];

      if (approvers.length === 0) {
        // Para teste, enviar notificação para o próprio usuário que criou
        approvers = [request.createdBy];
      }

      const notificationPromises = approvers.map(async (approverId: string) => {
        await notificationService.createNotification({
          requestId: request.id!,
          requestProtocol: request.protocolo,
          userId: approverId,
          type: "new_request",
          title: "Nova solicitação para aprovação",
          message: `Nova solicitação ${request.protocolo
            } enviada por ${senderName}. Valor: R$ ${request.valorTotal.toLocaleString(
              "pt-BR",
              { minimumFractionDigits: 2 }
            )}`,
          isRead: false,
          actionUrl: `/admin/approvals`,
          priority:
            request.prioridade === "urgente"
              ? "urgent"
              : request.prioridade === "alta"
                ? "high"
                : request.prioridade === "media"
                  ? "medium"
                  : "low",
          department: firstStep.department,
          senderName: senderName,
        });
      });

      await Promise.all(notificationPromises);

      // Notificar o criador da solicitação
      await notificationService.createNotification({
        requestId: request.id!,
        requestProtocol: request.protocolo,
        userId: request.createdBy,
        type: "request_submitted",
        title: "Solicitação enviada para aprovação",
        message: `Sua solicitação ${request.protocolo} foi enviada para aprovação. Primeira etapa: ${firstStep.name}`,
        isRead: false,
        actionUrl: `/additive-requests`,
        priority: "medium",
        department: firstStep.department,
        senderName: "Sistema",
      });
    } catch (error) {
      console.error("Erro ao notificar envio da solicitação:", error);
      throw error;
    }
  },

  // Notificar próximo aprovador
  notifyNextApprover: async (
    requestId: string,
    requestProtocol: string,
    _stepId: string,
    approverId: string,
    senderName: string
  ): Promise<void> => {
    try {
      await notificationService.createNotification({
        requestId,
        requestProtocol,
        userId: approverId,
        type: "approval_required",
        title: "Nova aprovação necessária",
        message: `Solicitação ${requestProtocol} precisa da sua aprovação. Aprovada por: ${senderName}`,
        isRead: false,
        actionUrl: `/admin/approvals`,
        priority: "high",
        senderName: senderName,
      });
    } catch (error) {
      console.error("Erro ao notificar aprovador:", error);
      throw error;
    }
  },

  // Notificar mudança de status
  notifyStatusChange: async (
    requestId: string,
    requestProtocol: string,
    status: string,
    userId: string,
    senderName: string,
    comments?: string
  ): Promise<void> => {
    try {
      let type: ApprovalNotification["type"] = "new_request";
      let title = "";
      let message = "";
      let priority: ApprovalNotification["priority"] = "medium";

      switch (status) {
        case "approved":
          type = "approved";
          title = "Solicitação aprovada";
          message = `Sua solicitação ${requestProtocol} foi aprovada!`;
          priority = "high";
          break;
        case "rejected":
          type = "rejected";
          title = "Solicitação rejeitada";
          message = `Sua solicitação ${requestProtocol} foi rejeitada. ${comments ? `Motivo: ${comments}` : ""
            }`;
          priority = "urgent";
          break;
        case "returned":
          type = "returned";
          title = "Solicitação devolvida";
          message = `Sua solicitação ${requestProtocol} foi devolvida para correções. ${comments ? `Comentários: ${comments}` : ""
            }`;
          priority = "high";
          break;
        default:
          title = "Status da solicitação alterado";
          message = `O status da sua solicitação ${requestProtocol} foi alterado para: ${status}`;
      }

      await notificationService.createNotification({
        requestId,
        requestProtocol,
        userId,
        type,
        title,
        message,
        isRead: false,
        actionUrl: `/additive-requests`,
        priority,
        senderName,
      });
    } catch (error) {
      console.error("Erro ao notificar mudança de status:", error);
      throw error;
    }
  },

  // Obter notificações do usuário
  getUserNotifications: async (
    userId: string
  ): Promise<ApprovalNotification[]> => {
    try {
      const notificationsRef = collection(db, "notifications");
      const q = query(
        notificationsRef,
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        dismissedAt: doc.data().dismissedAt?.toDate() || undefined,
      })) as ApprovalNotification[];
    } catch (error) {
      console.error("Erro ao obter notificações:", error);
      throw error;
    }
  },

  // Obter notificações não lidas
  getUnreadNotifications: async (
    userId: string
  ): Promise<ApprovalNotification[]> => {
    try {
      const notificationsRef = collection(db, "notifications");
      const q = query(
        notificationsRef,
        where("userId", "==", userId),
        where("isRead", "==", false),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as ApprovalNotification[];
    } catch (error) {
      console.error("Erro ao obter notificações não lidas:", error);
      throw error;
    }
  },

  // Marcar como lida
  markAsRead: async (notificationId: string): Promise<void> => {
    try {
      const notificationRef = doc(db, "notifications", notificationId);
      await updateDoc(notificationRef, {
        isRead: true,
      });
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
      throw error;
    }
  },

  // Marcar todas as notificações como lidas
  markAllAsRead: async (userId: string): Promise<void> => {
    try {
      const notificationsRef = collection(db, "notifications");
      const q = query(
        notificationsRef,
        where("userId", "==", userId),
        where("isRead", "==", false)
      );

      const snapshot = await getDocs(q);
      const updatePromises = snapshot.docs.map((doc) =>
        updateDoc(doc.ref, { isRead: true })
      );

      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Erro ao marcar todas as notificações como lidas:", error);
      throw error;
    }
  },

  // Remover notificação (dismiss)
  dismissNotification: async (notificationId: string): Promise<void> => {
    try {
      const notificationRef = doc(db, "notifications", notificationId);
      await updateDoc(notificationRef, {
        isRead: true,
        isDismissed: true,
        dismissedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Erro ao remover notificação:", error);
      throw error;
    }
  },

  // ===== ALERTAS AVANÇADOS =====

  // Helper function para notificar administradores
  notifyAdmins: async (companyId: string, notification: Omit<ApprovalNotification, "id" | "createdAt" | "userId">): Promise<void> => {
    try {
      const usersRef = collection(db, "users");
      const adminQuery = query(
        usersRef,
        where("companyId", "==", companyId),
        where("role", "==", "admin")
      );
      const adminSnapshot = await getDocs(adminQuery);
      const adminUsers = adminSnapshot.docs.map(doc => doc.id);

      const notificationPromises = adminUsers.map(async (adminUserId) => {
        await notificationService.createNotification({
          ...notification,
          userId: adminUserId,
        });
      });

      await Promise.all(notificationPromises);
    } catch (error) {
      console.error("Erro ao notificar administradores:", error);
    }
  },

  // Verificar e notificar limites de contrato
  checkContractLimits: async (companyId: string): Promise<void> => {
    try {
      const subscriptionStatus = await subscriptionService.getSubscriptionStatus(companyId);

      if (!subscriptionStatus) return;

      const limits = subscriptionStatus.limits;
      const currentUsage = subscriptionStatus.usage;

      // Verificar limite de contratos ativos
      if (limits.maxActiveContracts > 0 && currentUsage.activeContracts >= limits.maxActiveContracts * 0.9) {
        const percentage = Math.round((currentUsage.activeContracts / limits.maxActiveContracts) * 100);

        await notificationService.notifyAdmins(companyId, {
          requestId: "system",
          requestProtocol: "LIMIT-ALERT",
          type: "contract_limit_warning",
          title: "⚠️ Limite de Contratos Próximo",
          message: `Você está usando ${percentage}% do limite de contratos ativos (${currentUsage.activeContracts}/${limits.maxActiveContracts}). Considere fazer upgrade do plano.`,
          isRead: false,
          actionUrl: "/subscription",
          priority: percentage >= 95 ? "urgent" : "high",
          department: "system",
          senderName: "Sistema de Monitoramento",
        });
      }

      // Verificar limite de usuários
      if (limits.maxUsers > 0 && currentUsage.totalUsers >= limits.maxUsers * 0.9) {
        const percentage = Math.round((currentUsage.totalUsers / limits.maxUsers) * 100);

        await notificationService.notifyAdmins(companyId, {
          requestId: "system",
          requestProtocol: "LIMIT-ALERT",
          type: "user_limit_warning",
          title: "⚠️ Limite de Usuários Próximo",
          message: `Você está usando ${percentage}% do limite de usuários (${currentUsage.totalUsers}/${limits.maxUsers}). Considere fazer upgrade do plano.`,
          isRead: false,
          actionUrl: "/subscription",
          priority: percentage >= 95 ? "urgent" : "high",
          department: "system",
          senderName: "Sistema de Monitoramento",
        });
      }

      // Verificar limite de armazenamento
      if (limits.storageGB > 0 && currentUsage.storageUsedGB >= limits.storageGB * 0.9) {
        const percentage = Math.round((currentUsage.storageUsedGB / limits.storageGB) * 100);

        await notificationService.notifyAdmins(companyId, {
          requestId: "system",
          requestProtocol: "LIMIT-ALERT",
          type: "storage_limit_warning",
          title: "⚠️ Limite de Armazenamento Próximo",
          message: `Você está usando ${percentage}% do limite de armazenamento (${currentUsage.storageUsedGB.toFixed(1)}GB/${limits.storageGB}GB). Considere fazer upgrade do plano.`,
          isRead: false,
          actionUrl: "/subscription",
          priority: percentage >= 95 ? "urgent" : "high",
          department: "system",
          senderName: "Sistema de Monitoramento",
        });
      }
    } catch (error) {
      console.error("Erro ao verificar limites de contrato:", error);
    }
  },

  // Notificar devoluções pendentes
  notifyPendingReturns: async (companyId: string): Promise<void> => {
    try {
      // Buscar solicitações devolvidas há mais de 24 horas
      const requestsRef = collection(db, "additiveRequests");
      const q = query(
        requestsRef,
        where("companyId", "==", companyId),
        where("status", "==", "devolvido"),
        orderBy("updatedAt", "desc")
      );

      const snapshot = await getDocs(q);
      const returnedRequests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as AdditiveRequest[];

      // Filtrar solicitações devolvidas há mais de 24 horas
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const pendingReturns = returnedRequests.filter(request =>
        request.updatedAt < twentyFourHoursAgo
      );

      if (pendingReturns.length > 0) {
        // Buscar usuários da empresa para notificar
        const usersRef = collection(db, "users");
        const usersQuery = query(usersRef, where("companyId", "==", companyId));
        const usersSnapshot = await getDocs(usersQuery);
        const companyUsers = usersSnapshot.docs.map(doc => doc.id);

        // Notificar cada usuário da empresa
        const notificationPromises = companyUsers.map(async (userId) => {
          await notificationService.createNotification({
            requestId: "system",
            requestProtocol: "RETURN-ALERT",
            userId: userId,
            type: "pending_returns",
            title: "📋 Devoluções Pendentes",
            message: `Você tem ${pendingReturns.length} solicitação(ões) devolvida(s) há mais de 24 horas que precisam de atenção.`,
            isRead: false,
            actionUrl: "/additive-requests?status=devolvido",
            priority: "high",
            department: "system",
            senderName: "Sistema de Monitoramento",
          });
        });

        await Promise.all(notificationPromises);
      }
    } catch (error) {
      console.error("Erro ao notificar devoluções pendentes:", error);
    }
  },

  // Notificar formalizações pendentes
  notifyPendingFormalizations: async (companyId: string): Promise<void> => {
    try {
      // Buscar agrupamentos prontos para formalização há mais de 48 horas
      const groupsRef = collection(db, "osaGroups");
      const q = query(
        groupsRef,
        where("status", "==", "ready"),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);
      const readyGroups = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as OSAGroup[];

      // Filtrar agrupamentos prontos há mais de 48 horas
      const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
      const pendingFormalizations = readyGroups.filter(group =>
        group.createdAt < fortyEightHoursAgo
      );

      if (pendingFormalizations.length > 0) {
        // Buscar usuários da empresa para notificar
        const usersRef = collection(db, "users");
        const usersQuery = query(usersRef, where("companyId", "==", companyId));
        const usersSnapshot = await getDocs(usersQuery);
        const companyUsers = usersSnapshot.docs.map(doc => doc.id);

        // Notificar cada usuário da empresa
        const notificationPromises = companyUsers.map(async (userId) => {
          await notificationService.createNotification({
            requestId: "system",
            requestProtocol: "FORMALIZATION-ALERT",
            userId: userId,
            type: "pending_formalizations",
            title: "📄 Formalizações Pendentes",
            message: `Você tem ${pendingFormalizations.length} agrupamento(s) pronto(s) para formalização há mais de 48 horas.`,
            isRead: false,
            actionUrl: "/formalization",
            priority: "medium",
            department: "system",
            senderName: "Sistema de Monitoramento",
          });
        });

        await Promise.all(notificationPromises);
      }
    } catch (error) {
      console.error("Erro ao notificar formalizações pendentes:", error);
    }
  },

  // Executar todas as verificações de alertas
  runAdvancedAlerts: async (companyId: string): Promise<void> => {
    try {
      await Promise.all([
        notificationService.checkContractLimits(companyId),
        notificationService.notifyPendingReturns(companyId),
        notificationService.notifyPendingFormalizations(companyId),
      ]);
    } catch (error) {
      console.error("Erro ao executar alertas avançados:", error);
    }
  },

  // Obter estatísticas de alertas para dashboard
  getAlertStats: async (companyId: string): Promise<{
    contractLimitAlerts: number;
    pendingReturns: number;
    pendingFormalizations: number;
    urgentNotifications: number;
  }> => {
    try {
      const usersRef = collection(db, "users");
      const usersQuery = query(usersRef, where("companyId", "==", companyId));
      const usersSnapshot = await getDocs(usersQuery);
      const companyUserIds = usersSnapshot.docs.map(doc => doc.id);

      if (companyUserIds.length === 0) {
        return {
          contractLimitAlerts: 0,
          pendingReturns: 0,
          pendingFormalizations: 0,
          urgentNotifications: 0,
        };
      }

      // Buscar notificações urgentes
      const notificationsRef = collection(db, "notifications");
      const urgentQuery = query(
        notificationsRef,
        where("userId", "in", companyUserIds),
        where("priority", "==", "urgent"),
        where("isRead", "==", false)
      );
      const urgentSnapshot = await getDocs(urgentQuery);
      const urgentNotifications = urgentSnapshot.docs.length;

      // Buscar solicitações devolvidas
      const requestsRef = collection(db, "additiveRequests");
      const returnedQuery = query(
        requestsRef,
        where("companyId", "==", companyId),
        where("status", "==", "devolvido")
      );
      const returnedSnapshot = await getDocs(returnedQuery);
      const pendingReturns = returnedSnapshot.docs.length;

      // Buscar formalizações pendentes
      const groupsRef = collection(db, "osaGroups");
      const formalizationQuery = query(
        groupsRef,
        where("status", "==", "ready")
      );
      const formalizationSnapshot = await getDocs(formalizationQuery);
      const pendingFormalizations = formalizationSnapshot.docs.length;

      // Verificar limites de contrato
      const subscriptionStatus = await subscriptionService.getSubscriptionStatus(companyId);
      let contractLimitAlerts = 0;

      if (subscriptionStatus) {
        const limits = subscriptionStatus.limits;
        const currentUsage = subscriptionStatus.usage;

        if (limits.maxActiveContracts > 0 && currentUsage.activeContracts >= limits.maxActiveContracts * 0.9) {
          contractLimitAlerts++;
        }
        if (limits.maxUsers > 0 && currentUsage.totalUsers >= limits.maxUsers * 0.9) {
          contractLimitAlerts++;
        }
        if (limits.storageGB > 0 && currentUsage.storageUsedGB >= limits.storageGB * 0.9) {
          contractLimitAlerts++;
        }
      }

      return {
        contractLimitAlerts,
        pendingReturns,
        pendingFormalizations,
        urgentNotifications,
      };
    } catch (error) {
      console.error("Erro ao obter estatísticas de alertas:", error);
      return {
        contractLimitAlerts: 0,
        pendingReturns: 0,
        pendingFormalizations: 0,
        urgentNotifications: 0,
      };
    }
  },
};
