import type {
  Contract,
  ContractFormData,
  UpdateContractData,
} from "../types/contracts";
import { db } from "../lib/firebaseconfig";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  where,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { subscriptionService } from "./subscriptionService";

export const contractService = {
  async createContract(
    contractData: Omit<ContractFormData, "id" | "createdAt" | "updatedAt">
  ): Promise<Contract> {
    try {
      // Verificar limites da empresa antes de criar
      const canCreate = await subscriptionService.canExecuteAction(
        contractData.companyId,
        "maxActiveContracts"
      );

      if (!canCreate.canExecute) {
        throw new Error(
          `Limite de contratos ativos atingido. Plano atual permite ${canCreate.limit} contratos.`
        );
      }

      // NUNCA envie File/Blob diretamente ao Firestore. Excluímos pdfFile do payload.
      const { pdfFile, valor, ...rest } = contractData;
      const payload = {
        ...rest,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        valor: parseFloat(valor.replace(/\D/g, "")) / 100,
      };

      const contractRef = await addDoc(collection(db, "contracts"), payload);

      const newContract: Contract = {
        id: contractRef.id,
        companyId: contractData.companyId,
        cliente: contractData.cliente,
        obra: contractData.obra,
        numeroContrato: contractData.numeroContrato,
        vigenciaInicio: contractData.vigenciaInicio,
        vigenciaFim: contractData.vigenciaFim,
        valor: parseFloat(contractData.valor.replace(/\D/g, "")) / 100,
        pdfFile: contractData.pdfFile,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: contractData.createdBy || "",
        status: contractData.status,
      };

      // Atualizar contador de contratos ativos se status for "ativo"
      if (contractData.status === "ativo") {
        const usage = await subscriptionService.getCompanyUsage(contractData.companyId);
        await subscriptionService.updateCompanyUsage(contractData.companyId, {
          activeContracts: usage.activeContracts + 1,
        });
      }

      return newContract;
    } catch (error) {
      throw new Error("Erro ao criar contrato: " + error);
    }
  },

  async getContracts(companyId: string): Promise<Contract[]> {
    try {
      if (!companyId) {
        console.warn("CompanyId is undefined, returning empty array");
        return [];
      }

      const contractsRef = collection(db, "contracts");
      let querySnapshot;
      try {
        const q = query(
          contractsRef,
          where("companyId", "==", companyId),
          orderBy("createdAt", "desc")
        );
        querySnapshot = await getDocs(q);
      } catch (err) {
        // Fallback sem orderBy (evita necessidade de índice composto e documentos sem createdAt)
        console.warn("Falha ao ordenar por createdAt, usando fallback sem orderBy.", err);
        const qNoOrder = query(contractsRef, where("companyId", "==", companyId));
        querySnapshot = await getDocs(qNoOrder);
      }

      const contracts: Contract[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as any;
        contracts.push({
          id: doc.id,
          companyId: data.companyId,
          cliente: data.cliente,
          obra: data.obra,
          numeroContrato: data.numeroContrato,
          vigenciaInicio: data.vigenciaInicio,
          vigenciaFim: data.vigenciaFim,
          valor: Number(data.valor) || 0,
          pdfFile: null,
          createdAt: data?.createdAt?.toDate?.() || new Date(),
          updatedAt: data?.updatedAt?.toDate?.() || new Date(),
          createdBy: data.createdBy || "",
          status: data.status || "pendente",
        });
      });

      return contracts;
    } catch (error) {
      throw new Error("Erro ao buscar contratos: " + error);
    }
  },

  async getContractById(id: string): Promise<Contract | null> {
    try {
      const contractRef = await getDoc(doc(db, "contracts", id));
      if (!contractRef.exists()) return null;

      const data = contractRef.data() as any;
      return {
        id: contractRef.id,
        companyId: data.companyId,
        cliente: data.cliente,
        obra: data.obra,
        numeroContrato: data.numeroContrato,
        vigenciaInicio: data.vigenciaInicio,
        vigenciaFim: data.vigenciaFim,
        valor: Number(data.valor) || 0,
        pdfFile: null,
        createdAt: data?.createdAt?.toDate?.() || new Date(),
        updatedAt: data?.updatedAt?.toDate?.() || new Date(),
        createdBy: data.createdBy || "",
        status: data.status || "pendente",
      } as Contract;
    } catch (error) {
      throw new Error("Erro ao buscar contrato: " + error);
    }
  },

  async updateContract(
    id: string,
    updateData: UpdateContractData
  ): Promise<void> {
    try {
      // Se estiver alterando o status, verificar limites
      if (updateData.status === "ativo") {
        const contract = await this.getContractById(id);
        if (contract) {
          const canActivate = await subscriptionService.canExecuteAction(
            contract.companyId,
            "maxActiveContracts"
          );

          if (!canActivate.canExecute) {
            throw new Error(
              `Limite de contratos ativos atingido. Plano atual permite ${canActivate.limit} contratos.`
            );
          }
        }
      }

      const contractRef = doc(db, "contracts", id);
      await updateDoc(contractRef, {
        ...updateData,
        updatedAt: serverTimestamp(),
      });

      // Atualizar contadores se necessário
      const contract = await this.getContractById(id);
      if (contract && updateData.status) {
        const usage = await subscriptionService.getCompanyUsage(contract.companyId);

        if (updateData.status === "ativo") {
          await subscriptionService.updateCompanyUsage(contract.companyId, {
            activeContracts: usage.activeContracts + 1,
          });
        } else if (contract.status === "ativo" && (updateData.status === "pendente" || updateData.status === "inativo")) {
          await subscriptionService.updateCompanyUsage(contract.companyId, {
            activeContracts: Math.max(0, usage.activeContracts - 1),
          });
        }
      }
    } catch (error) {
      throw new Error("Erro ao atualizar contrato: " + error);
    }
  },

  async deleteContract(id: string): Promise<void> {
    try {
      // Verificar se o contrato está ativo para atualizar contadores
      const contract = await this.getContractById(id);

      await deleteDoc(doc(db, "contracts", id));

      // Atualizar contador se o contrato estava ativo
      if (contract && contract.status === "ativo") {
        const usage = await subscriptionService.getCompanyUsage(contract.companyId);
        await subscriptionService.updateCompanyUsage(contract.companyId, {
          activeContracts: Math.max(0, usage.activeContracts - 1),
        });
      }
    } catch (error) {
      throw new Error("Erro ao deletar contrato: " + error);
    }
  },

  observeContracts(companyId: string, callback: (contracts: Contract[]) => void): Unsubscribe {
    try {
      if (!companyId) {
        console.warn("CompanyId is undefined, returning empty callback");
        callback([]);
        return () => { }; // Retorna unsubscribe vazio
      }

      const contractsRef = collection(db, "contracts");
      const q = query(
        contractsRef,
        where("companyId", "==", companyId),
        orderBy("createdAt", "desc")
      );

      return onSnapshot(q, (querySnapshot) => {
        const contracts: Contract[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data() as any;
          contracts.push({
            id: doc.id,
            companyId: data.companyId,
            cliente: data.cliente,
            obra: data.obra,
            numeroContrato: data.numeroContrato,
            vigenciaInicio: data.vigenciaInicio,
            vigenciaFim: data.vigenciaFim,
            valor: Number(data.valor) || 0,
            pdfFile: null,
            createdAt: data?.createdAt?.toDate?.() || new Date(),
            updatedAt: data?.updatedAt?.toDate?.() || new Date(),
            createdBy: data.createdBy || "",
            status: data.status || "pendente",
          });
        });

        callback(contracts);
      });
    } catch (error) {
      throw new Error("Erro ao observar contratos: " + error);
    }
  },
};
