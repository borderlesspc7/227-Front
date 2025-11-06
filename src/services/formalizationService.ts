import type {
    OSAGroup,
    OSAFormalizationFormData,
    UpdateOSAGroupData,
    CutoffCriteria,
} from "../types/formalization";
import type { AdditiveRequest } from "../types/additiveRequest";
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
    serverTimestamp,
} from "firebase/firestore";
import type { UserRole } from "../types/auth";
import { requirePermission } from "../utils/servicePermissions";

// Função para converter dados do Firebase para o formato esperado
const convertFirestoreData = (
    data: Record<string, unknown>
): OSAGroup => {
    const convertTimestamp = (timestamp: unknown): Date => {
        if (timestamp && typeof timestamp === "object" && "toDate" in timestamp) {
            return (timestamp as { toDate: () => Date }).toDate();
        }
        if (timestamp instanceof Date) {
            return timestamp;
        }
        return new Date();
    };

    return {
        id: data.id as string,
        name: data.name as string,
        description: data.description as string | undefined,
        osas: data.osas as AdditiveRequest[],
        totalValue: data.totalValue as number,
        cutoffCriteria: data.cutoffCriteria as CutoffCriteria,
        createdAt: convertTimestamp(data.createdAt),
        createdBy: data.createdBy as string,
        status: data.status as "draft" | "ready" | "formalized" | "cancelled",
        formalizationData: data.formalizationData as OSAGroup["formalizationData"],
    };
};

export const formalizationService = {
    // Criar novo agrupamento de OSAs
    createOSAGroup: async (
        groupData: OSAFormalizationFormData,
        userId?: string,
        companyId?: string,
        userRole?: UserRole
    ): Promise<OSAGroup> => {
        try {
            requirePermission(userRole, "create_formalization");
            
            // Buscar as OSAs selecionadas
            const { additiveRequestService } = await import("./additiveRequestService");
            const allOSAs = await additiveRequestService.getAdditiveRequests(companyId || "");

            const selectedOSAs = allOSAs.filter(osa =>
                groupData.selectedOSAs.includes(osa.id || "")
            );

            // Calcular valor total
            const totalValue = selectedOSAs.reduce(
                (total, osa) => total + osa.valorTotal,
                0
            );

            const groupsRef = collection(db, "osaGroups");
            const newGroup = {
                name: groupData.name,
                description: groupData.description,
                osas: selectedOSAs,
                totalValue,
                cutoffCriteria: groupData.cutoffCriteria,
                createdBy: userId || "anonymous-user",
                createdAt: serverTimestamp(),
                status: "draft" as const,
            };

            const docRef = await addDoc(groupsRef, newGroup);
            const createdGroup: OSAGroup = {
                id: docRef.id,
                name: newGroup.name,
                description: newGroup.description,
                osas: newGroup.osas,
                totalValue: newGroup.totalValue,
                cutoffCriteria: newGroup.cutoffCriteria,
                createdAt: new Date(),
                createdBy: newGroup.createdBy,
                status: newGroup.status,
            };

            return createdGroup;
        } catch (error) {
            console.error("Erro ao criar agrupamento de OSAs:", error);
            throw error;
        }
    },

    // Buscar todos os agrupamentos
    getOSAGroups: async (): Promise<OSAGroup[]> => {
        try {
            const groupsRef = collection(db, "osaGroups");
            const q = query(groupsRef, orderBy("createdAt", "desc"));
            const snapshot = await getDocs(q);

            return snapshot.docs.map((doc) =>
                convertFirestoreData({
                    id: doc.id,
                    ...doc.data(),
                })
            );
        } catch (error) {
            console.error("Erro ao buscar agrupamentos de OSAs:", error);
            throw error;
        }
    },

    // Buscar agrupamento por ID
    getOSAGroupById: async (id: string): Promise<OSAGroup | null> => {
        try {
            const groupRef = doc(db, "osaGroups", id);
            const snapshot = await getDoc(groupRef);

            if (snapshot.exists()) {
                return convertFirestoreData({
                    id: snapshot.id,
                    ...snapshot.data(),
                });
            }
            return null;
        } catch (error) {
            console.error("Erro ao buscar agrupamento:", error);
            throw error;
        }
    },

    // Atualizar agrupamento
    updateOSAGroup: async (
        id: string,
        updateData: UpdateOSAGroupData,
        userRole?: UserRole
    ): Promise<void> => {
        try {
            requirePermission(userRole, "edit_formalization");
            
            const groupRef = doc(db, "osaGroups", id);
            await updateDoc(groupRef, {
                ...updateData,
                updatedAt: serverTimestamp(),
            });
        } catch (error) {
            console.error("Erro ao atualizar agrupamento:", error);
            throw error;
        }
    },

    // Deletar agrupamento
    deleteOSAGroup: async (id: string, userRole?: UserRole): Promise<void> => {
        try {
            requirePermission(userRole, "edit_formalization");
            
            const groupRef = doc(db, "osaGroups", id);
            await deleteDoc(groupRef);
        } catch (error) {
            console.error("Erro ao deletar agrupamento:", error);
            throw error;
        }
    },

    // Buscar OSAs elegíveis para agrupamento
    getEligibleOSAs: async (companyId?: string, criteria?: CutoffCriteria): Promise<AdditiveRequest[]> => {
        try {
            const { additiveRequestService } = await import("./additiveRequestService");
            const allOSAs = await additiveRequestService.getAdditiveRequests(companyId || "");

            // Filtrar apenas OSAs aprovadas
            const approvedOSAs = allOSAs.filter(osa => osa.status === "aprovado");

            if (!criteria) {
                return approvedOSAs;
            }

            // Aplicar critérios de filtro
            return approvedOSAs.filter(osa => {
                switch (criteria.type) {
                    case "value":
                        return criteria.value ? osa.valorTotal >= criteria.value : true;
                    case "period":
                        if (!criteria.startDate || !criteria.endDate) return true;
                        return osa.createdAt >= criteria.startDate && osa.createdAt <= criteria.endDate;
                    case "contract":
                        return criteria.contractId ? osa.contratoId === criteria.contractId : true;
                    case "manual":
                        return true; // Critério manual não filtra automaticamente
                    default:
                        return true;
                }
            });
        } catch (error) {
            console.error("Erro ao buscar OSAs elegíveis:", error);
            throw error;
        }
    },

    // Gerar documento de formalização (simulado por enquanto)
    generateFormalizationDocument: async (groupId: string): Promise<string> => {
        try {
            const group = await formalizationService.getOSAGroupById(groupId);
            if (!group) {
                throw new Error("Agrupamento não encontrado");
            }

            // Simular geração de PDF
            const documentNumber = `ADT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`;

            // Atualizar o agrupamento com dados de formalização
            await formalizationService.updateOSAGroup(groupId, {
                status: "ready",
                formalizationData: {
                    documentNumber,
                    generatedAt: new Date(),
                    generatedBy: "system", // TODO: usar usuário atual
                    pdfUrl: `https://example.com/pdf/${documentNumber}.pdf`, // URL simulada
                }
            });

            return documentNumber;
        } catch (error) {
            console.error("Erro ao gerar documento de formalização:", error);
            throw error;
        }
    },

    // Marcar como formalizado
    markAsFormalized: async (groupId: string, signatureData?: {
        signedBy: string;
        signatureProvider: "clicksign" | "zapsign" | "docusign";
        signatureId: string;
    }): Promise<void> => {
        try {
            const group = await formalizationService.getOSAGroupById(groupId);
            if (!group || !group.formalizationData) {
                throw new Error("Agrupamento ou dados de formalização não encontrados");
            }

            await formalizationService.updateOSAGroup(groupId, {
                status: "formalized",
                formalizationData: {
                    ...group.formalizationData,
                    signedAt: new Date(),
                    signedBy: signatureData?.signedBy,
                    signatureProvider: signatureData?.signatureProvider,
                    signatureId: signatureData?.signatureId,
                }
            });
        } catch (error) {
            console.error("Erro ao marcar como formalizado:", error);
            throw error;
        }
    },
};
