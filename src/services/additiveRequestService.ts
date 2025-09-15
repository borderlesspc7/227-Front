import type {
  AdditiveRequest,
  AdditiveRequestFormData,
  UpdateAdditiveRequestData,
} from "../types/additiveRequest";
import { db } from "../lib/firebaseconfig";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  doc,
  query,
  orderBy,
  where,
  serverTimestamp,
} from "firebase/firestore";

// Função para converter dados do Firebase para o formato esperado
const convertFirestoreData = (data: any): AdditiveRequest => {
  return {
    ...data,
    createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || data.updatedAt || new Date(),
    approvedAt: data.approvedAt?.toDate?.() || data.approvedAt,
    rejectedAt: data.rejectedAt?.toDate?.() || data.rejectedAt,
    evidencias:
      data.evidencias?.map((evidence: any) => ({
        ...evidence,
        uploadedAt:
          evidence.uploadedAt?.toDate?.() || evidence.uploadedAt || new Date(),
      })) || [],
  };
};

export const additiveRequestService = {
  generateProtocol: async (): Promise<string> => {
    const year = new Date().getFullYear();
    const requestsRef = collection(db, "additiveRequests");
    const q = query(
      requestsRef,
      where("protocolo", ">=", `OSA-${year}-000000`),
      where("protocolo", "<", `OSA-${year + 1}-000000`)
    );

    const snapshot = await getDocs(q);
    const count = snapshot.size + 1;
    return `OSA-${year}-${String(count).padStart(6, "0")}`;
  },

  createAdditiveRequest: async (
    requestData: AdditiveRequestFormData,
    userId?: string
  ): Promise<AdditiveRequest> => {
    try {
      const protocolo = await additiveRequestService.generateProtocol();
      const requestsRef = collection(db, "additiveRequests");

      const valorTotal = requestData.itens.reduce(
        (total, item) => total + item.quantidade * item.precoUnitario,
        0
      );

      const itens = requestData.itens.map((item) => ({
        ...item,
        id: Math.random().toString(36).substring(2, 9),
        valorTotal: item.quantidade * item.precoUnitario,
      }));

      const newRequest = {
        protocolo,
        contratoId: requestData.contratoId,
        descricao: requestData.descricao,
        justificativa: requestData.justificativa,
        prioridade: requestData.prioridade,
        status: "rascunho" as const,
        itens,
        valorTotal,
        evidencias: [],
        createdBy: userId || "anonymous-user",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(requestsRef, newRequest);
      const createdRequest: AdditiveRequest = {
        id: docRef.id,
        protocolo: newRequest.protocolo,
        contratoId: newRequest.contratoId,
        descricao: newRequest.descricao,
        justificativa: newRequest.justificativa,
        prioridade: newRequest.prioridade,
        status: newRequest.status,
        itens: newRequest.itens,
        valorTotal: newRequest.valorTotal,
        evidencias: newRequest.evidencias,
        createdBy: newRequest.createdBy,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return createdRequest;
    } catch (error) {
      console.error("Erro ao criar solicitação de aditivo:", error);
      throw error;
    }
  },

  getAdditiveRequests: async (): Promise<AdditiveRequest[]> => {
    try {
      const requestsRef = collection(db, "additiveRequests");
      const q = query(requestsRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) =>
        convertFirestoreData({
          id: doc.id,
          ...doc.data(),
        })
      );
    } catch (error) {
      console.error("Error getting additive requests:", error);
      throw error;
    }
  },

  // Buscar por ID
  getAdditiveRequestById: async (
    id: string
  ): Promise<AdditiveRequest | null> => {
    try {
      const requestRef = doc(db, "additiveRequests", id);
      const snapshot = await getDoc(requestRef);

      if (snapshot.exists()) {
        return convertFirestoreData({
          id: snapshot.id,
          ...snapshot.data(),
        });
      }
      return null;
    } catch (error) {
      console.error("Error getting additive request:", error);
      throw error;
    }
  },

  updateAdditiveRequest: async (
    id: string,
    updateData: UpdateAdditiveRequestData
  ): Promise<void> => {
    try {
      const requestRef = doc(db, "additiveRequests", id);
      await updateDoc(requestRef, {
        ...updateData,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating additive request:", error);
      throw error;
    }
  },

  // Submeter para aprovação
  submitForApproval: async (id: string): Promise<void> => {
    try {
      const requestRef = doc(db, "additiveRequests", id);
      await updateDoc(requestRef, {
        status: "pendente",
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error submitting for approval:", error);
      throw error;
    }
  },

  // Aprovar solicitação
  approveRequest: async (id: string, approvedBy: string): Promise<void> => {
    try {
      const requestRef = doc(db, "additiveRequests", id);
      await updateDoc(requestRef, {
        status: "aprovado",
        approvedBy,
        approvedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error approving request:", error);
      throw error;
    }
  },

  rejectRequest: async (
    id: string,
    rejectedBy: string,
    rejectionReason: string
  ): Promise<void> => {
    try {
      const requestRef = doc(db, "additiveRequests", id);
      await updateDoc(requestRef, {
        status: "rejeitado",
        rejectedBy,
        rejectedAt: serverTimestamp(),
        rejectionReason,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error rejecting request:", error);
      throw error;
    }
  },

  // Deletar solicitação
  deleteAdditiveRequest: async (id: string): Promise<void> => {
    try {
      const requestRef = doc(db, "additiveRequests", id);
      await deleteDoc(requestRef);
    } catch (error) {
      console.error("Error deleting additive request:", error);
      throw error;
    }
  },
};
