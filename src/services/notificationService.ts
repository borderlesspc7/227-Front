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
          message: `Nova solicitação ${
            request.protocolo
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
          message = `Sua solicitação ${requestProtocol} foi rejeitada. ${
            comments ? `Motivo: ${comments}` : ""
          }`;
          priority = "urgent";
          break;
        case "returned":
          type = "returned";
          title = "Solicitação devolvida";
          message = `Sua solicitação ${requestProtocol} foi devolvida para correções. ${
            comments ? `Comentários: ${comments}` : ""
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
};
