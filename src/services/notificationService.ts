// src/services/notificationService.ts
import { db } from "../lib/firebaseconfig";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import type { ApprovalNotification } from "../types/approvalWorkflow";

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

  // Notificar próximo aprovador
  notifyNextApprover: async (
    requestId: string,
    stepId: string,
    approverId: string
  ): Promise<void> => {
    try {
      await notificationService.createNotification({
        requestId,
        userId: approverId,
        type: "approval_required",
        title: "Nova solicitação para aprovação",
        message: `Você tem uma nova solicitação OSA aguardando sua aprovação na etapa ${stepId}`,
        isRead: false,
        actionUrl: `/approvals/${requestId}`,
      });
    } catch (error) {
      console.error("Erro ao notificar próximo aprovador:", error);
      throw error;
    }
  },

  // Notificar sobre mudanças de status
  notifyStatusChange: async (
    requestId: string,
    status: string,
    userId: string
  ): Promise<void> => {
    try {
      const statusMessages = {
        aprovado: "Sua solicitação OSA foi aprovada!",
        rejeitado: "Sua solicitação OSA foi rejeitada.",
        devolvido: "Sua solicitação OSA foi devolvida para revisão.",
      };

      await notificationService.createNotification({
        requestId,
        userId,
        type:
          status === "aprovado"
            ? "approved"
            : status === "rejeitado"
            ? "rejected"
            : "returned",
        title: "Status da solicitação atualizado",
        message:
          statusMessages[status as keyof typeof statusMessages] ||
          `Status da solicitação alterado para ${status}`,
        isRead: false,
        actionUrl: `/requests/${requestId}`,
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
        where("isRead", "==", false)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as ApprovalNotification[];
    } catch (error) {
      console.error("Erro ao obter notificações:", error);
      throw error;
    }
  },

  // Marcar notificação como lida
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
};
