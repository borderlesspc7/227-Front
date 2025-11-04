import { db } from "../lib/firebaseconfig";
import { collection, doc, getDoc, setDoc, updateDoc, serverTimestamp, getDocs, query, where, type Timestamp, type FieldValue } from "firebase/firestore";
import { firebaseStorageService } from "./firebaseStorage";
import type { AdditiveItem, AdditiveRequest, Evidence } from "../types/additiveRequest";
import { getClientAuditInfo, getDocumentVersion } from "../utils/auditUtils";

// Classe de erro customizada para assinaturas
export class AssinaturaError extends Error {
  constructor(
    message: string,
    public code: string,
    public userMessage: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = "AssinaturaError";
  }
}

// Função para tratar erros e retornar mensagens claras
function handleAssinaturaError(error: unknown, context: string): AssinaturaError {
  if (error instanceof AssinaturaError) {
    return error;
  }

  const errorObj = error as { code?: string; message?: string };
  const errorCode = errorObj?.code || "UNKNOWN_ERROR";
  let userMessage = "Ocorreu um erro inesperado. Tente novamente.";

  // Mensagens específicas por tipo de erro
  switch (errorCode) {
    case "storage/unauthorized":
      userMessage = "Você não tem permissão para realizar esta operação. Verifique se está autenticado corretamente.";
      break;
    case "storage/canceled":
      userMessage = "Operação cancelada.";
      break;
    case "storage/quota-exceeded":
      userMessage = "Limite de armazenamento excedido. Contate o administrador.";
      break;
    case "permission-denied":
      userMessage = "Permissão negada. Verifique suas permissões no sistema.";
      break;
    case "unauthenticated":
      userMessage = "Você precisa estar autenticado para realizar esta operação.";
      break;
    default:
      if (errorObj?.message) {
        // Verificar se a mensagem contém palavras-chave específicas
        const message = errorObj.message.toLowerCase();
        if (message.includes("cors") || message.includes("preflight")) {
          userMessage = "Erro de conexão com o servidor. Verifique as configurações do Firebase Storage.";
        } else if (message.includes("network") || message.includes("fetch")) {
          userMessage = "Erro de conexão. Verifique sua internet e tente novamente.";
        } else if (message.includes("auth") || message.includes("autenticado")) {
          userMessage = "Erro de autenticação. Por favor, faça login novamente.";
        } else {
          userMessage = `Erro: ${errorObj.message}`;
        }
      }
  }

  console.error(`[AssinaturaService] Erro em ${context}:`, error);
  return new AssinaturaError(
    errorObj?.message || "Erro desconhecido",
    errorCode,
    userMessage,
    error
  );
}

export type AssinaturaStatus = "Pendente" | "Assinado" | "Recusado";

// Interface para informações de auditoria
export interface AssinaturaAuditInfo {
  ipAddress?: string;
  userAgent?: string;
  versaoDocumento?: string; // Versão do documento assinado
  assinadoPor?: string; // ID do usuário que assinou
}

export interface AssinaturaRecord {
  id: string; // contratoId_aditivoId
  aditivoId: string;
  contratoId: string;
  clienteId: string;
  status: AssinaturaStatus;
  dataEnvio: Timestamp | FieldValue;
  dataAssinatura?: Timestamp | FieldValue;
  documentoOriginalUrl: string;
  documentoUrl?: string; // assinado
  // Campos de auditoria
  auditInfo?: AssinaturaAuditInfo;
  versaoDocumento?: string; // Versão do documento no momento da assinatura
}

const COLLECTION = "assinaturas";

// Cache para URLs do Firebase Storage (evita múltiplas chamadas)
const urlCache = new Map<string, { url: string; expiresAt: number }>();
const CACHE_DURATION = 55 * 60 * 1000; // 55 minutos (URLs do Firebase expiram em 1 hora)

function signatureDocId(contratoId: string, aditivoId: string) {
  return `${contratoId}_${aditivoId}`;
}

// Função para obter URL com cache
async function getCachedDownloadUrl(path: string): Promise<string> {
  const now = Date.now();
  const cached = urlCache.get(path);

  // Se tem cache válido, retorna
  if (cached && cached.expiresAt > now) {
    return cached.url;
  }

  // Busca nova URL
  try {
    const url = await firebaseStorageService.getDownloadUrl(path);

    // Armazena no cache
    urlCache.set(path, {
      url,
      expiresAt: now + CACHE_DURATION,
    });

    return url;
  } catch (error) {
    // Se falhar mas tiver cache antigo, tenta usar (mesmo que possa estar expirado)
    if (cached) {
      console.warn("Erro ao buscar nova URL, tentando usar cache:", error);
      return cached.url;
    }
    throw error;
  }
}

// Limpar cache periodicamente (opcional, mas recomendado)
if (typeof window !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [path, cached] of urlCache.entries()) {
      if (cached.expiresAt <= now) {
        urlCache.delete(path);
      }
    }
  }, 5 * 60 * 1000); // Limpa a cada 5 minutos
}

// Função auxiliar para gerar documento automaticamente quando aditivo é aprovado
export async function autoGenerateSignatureDocument(requestId: string): Promise<void> {
  try {
    // Importações dinâmicas para evitar dependências circulares
    const { contractService } = await import("./contractService");
    const { pdfService } = await import("./pdfService");

    // Buscar dados do aditivo
    const additiveRequestRef = doc(collection(db, "additiveRequests"), requestId);
    const requestDoc = await getDoc(additiveRequestRef);

    if (!requestDoc.exists()) {
      console.warn("Aditivo não encontrado para geração automática:", requestId);
      return;
    }

    const requestData = requestDoc.data();
    const contratoId = requestData.contratoId as string;
    const clienteId = requestData.createdBy as string;

    // Verificar se já existe registro de assinatura
    const existingSignature = await assinaturaService.getSignature({
      contratoId,
      aditivoId: requestId,
    });

    // Se já existe, não gerar novamente
    if (existingSignature) {
      console.log("Documento de assinatura já existe para este aditivo:", requestId);
      return;
    }

    // Buscar dados do contrato
    const contract = await contractService.getContractById(contratoId);

    if (!contract) {
      console.warn("Contrato não encontrado para geração automática:", contratoId);
      return;
    }

    if (!clienteId) {
      console.warn("clienteId não encontrado para geração automática:", requestId);
      return;
    }

    // Criar objeto mínimo para geração do PDF
    const requestForPdf: AdditiveRequest = {
      id: requestId,
      companyId: (requestData.companyId as string) || "",
      protocolo: (requestData.protocolo as string) || "",
      contratoId,
      descricao: (requestData.descricao as string) || "",
      justificativa: (requestData.justificativa as string) || "",
      status: (requestData.status as AdditiveRequest["status"]) || "aprovado",
      prioridade: (requestData.prioridade as "baixa" | "media" | "alta" | "urgente") || "media",
      itens: (requestData.itens as AdditiveItem[]) || [],
      valorTotal: (requestData.valorTotal as number) || 0,
      evidencias: [] as Evidence[],
      createdBy: clienteId,
      createdAt: new Date(),
      updatedAt: new Date(),
      isWorkflowActive: false,
    };

    // Gerar PDF
    const blob = await pdfService.generateAdditivePDF(contract, requestForPdf);

    // Inicializar fluxo de assinatura
    await assinaturaService.initSignatureFlow({
      contratoId,
      aditivoId: requestId,
      clienteId,
      originalPdfBlob: blob,
    });

    console.log("Documento gerado automaticamente para aditivo aprovado:", requestId);
  } catch (error) {
    console.error("Erro na geração automática de documento:", error);
    throw error;
  }
}

export const assinaturaService = {
  async initSignatureFlow(params: {
    contratoId: string;
    aditivoId: string;
    clienteId: string;
    originalPdfBlob: Blob;
  }): Promise<AssinaturaRecord> {
    try {
      const { contratoId, aditivoId, clienteId, originalPdfBlob } = params;

      if (!contratoId || !aditivoId || !clienteId) {
        throw new AssinaturaError(
          "Parâmetros obrigatórios ausentes",
          "INVALID_PARAMS",
          "Dados incompletos. Verifique se todos os campos estão preenchidos."
        );
      }

      // Remover barra inicial - Firebase Storage não precisa dela
      const basePath = `documentos/${contratoId}/aditivos/${aditivoId}`;

      let originalUpload;
      try {
        originalUpload = await firebaseStorageService.uploadPdfBlob(`${basePath}/original.pdf`, originalPdfBlob);
      } catch (uploadError) {
        throw handleAssinaturaError(uploadError, "initSignatureFlow - upload");
      }

      const id = signatureDocId(contratoId, aditivoId);
      const ref = doc(collection(db, COLLECTION), id);

      const record: AssinaturaRecord = {
        id,
        aditivoId,
        contratoId,
        clienteId,
        status: "Pendente",
        dataEnvio: serverTimestamp(),
        documentoOriginalUrl: originalUpload.url,
      };

      try {
        await setDoc(ref, record, { merge: true });
      } catch (saveError) {
        throw handleAssinaturaError(saveError, "initSignatureFlow - save");
      }

      // Enviar notificação por e-mail de forma não bloqueante
      try {
        const { emailService } = await import("./emailService");
        const { contractService } = await import("./contractService");
        
        // Buscar dados do contrato para o e-mail
        const contract = await contractService.getContractById(contratoId);
        
        // Buscar dados do aditivo
        const additiveRequestRef = doc(collection(db, "additiveRequests"), aditivoId);
        const requestDoc = await getDoc(additiveRequestRef);
        const requestData = requestDoc.exists() ? requestDoc.data() : null;

        if (contract && requestData) {
          const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
          const userEmail = await emailService.getUserEmail(clienteId);
          
          if (userEmail) {
            await emailService.sendEmail({
              to: userEmail,
              type: "signature_pending",
              data: {
                protocolo: requestData.protocolo || aditivoId,
                contractNumber: contract.numeroContrato || contratoId,
                valorTotal: requestData.valorTotal || 0,
                actionUrl: `${baseUrl}/dashboard/signatures`,
              },
            });
          }
        }
      } catch (emailError) {
        console.warn("Erro ao enviar e-mail de assinatura pendente (não bloqueante):", emailError);
      }

      return record;
    } catch (error) {
      if (error instanceof AssinaturaError) {
        throw error;
      }
      throw handleAssinaturaError(error, "initSignatureFlow");
    }
  },

  async completeSignature(params: {
    contratoId: string;
    aditivoId: string;
    signedPdfBlob: Blob;
    userId?: string; // ID do usuário que está assinando
  }): Promise<AssinaturaRecord> {
    try {
      const { contratoId, aditivoId, signedPdfBlob, userId } = params;

      // Obter informações de auditoria
      const auditInfo = await getClientAuditInfo();
      const versaoDoc = getDocumentVersion(aditivoId, auditInfo.timestamp);

      // Remover barra inicial - Firebase Storage não precisa dela
      const basePath = `documentos/${contratoId}/aditivos/${aditivoId}`;

      let upload;
      try {
        upload = await firebaseStorageService.uploadPdfBlob(`${basePath}/assinado.pdf`, signedPdfBlob);
      } catch (uploadError) {
        throw handleAssinaturaError(uploadError, "completeSignature - upload");
      }

      const id = signatureDocId(contratoId, aditivoId);
      const ref = doc(collection(db, COLLECTION), id);

      const updateData: Partial<AssinaturaRecord> = {
        status: "Assinado",
        dataAssinatura: serverTimestamp(),
        documentoUrl: upload.url,
        versaoDocumento: versaoDoc,
        auditInfo: {
          ipAddress: auditInfo.ipAddress || undefined,
          userAgent: auditInfo.userAgent,
          versaoDocumento: versaoDoc,
          assinadoPor: userId,
        },
      };

      try {
        await updateDoc(ref, updateData);
      } catch (updateError) {
        throw handleAssinaturaError(updateError, "completeSignature - updateDoc");
      }

      const updated = await getDoc(ref);
      if (!updated.exists()) {
        throw new AssinaturaError(
          "Registro não encontrado após atualização",
          "NOT_FOUND",
          "Erro ao salvar assinatura. O registro não foi encontrado."
        );
      }

      // Enviar notificação por e-mail de forma não bloqueante
      try {
        const { emailService } = await import("./emailService");
        const { contractService } = await import("./contractService");
        
        // Buscar dados do contrato para o e-mail
        const contract = await contractService.getContractById(contratoId);
        
        // Buscar dados do aditivo
        const additiveRequestRef = doc(collection(db, "additiveRequests"), aditivoId);
        const requestDoc = await getDoc(additiveRequestRef);
        const requestData = requestDoc.exists() ? requestDoc.data() : null;

        if (contract && requestData) {
          // Buscar o clienteId do registro de assinatura
          const recordData = updated.data() as AssinaturaRecord;
          const clienteId = recordData.clienteId;
          
          if (clienteId) {
            const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
            const userEmail = await emailService.getUserEmail(clienteId);
            
            if (userEmail) {
              await emailService.sendEmail({
                to: userEmail,
                type: "signature_completed",
                data: {
                  protocolo: requestData.protocolo || aditivoId,
                  contractNumber: contract.numeroContrato || contratoId,
                  signatureDate: new Date().toLocaleDateString("pt-BR"),
                  actionUrl: `${baseUrl}/dashboard/signatures`,
                },
              });
            }
          }
        }
      } catch (emailError) {
        console.warn("Erro ao enviar e-mail de assinatura concluída (não bloqueante):", emailError);
      }

      return updated.data() as AssinaturaRecord;
    } catch (error) {
      if (error instanceof AssinaturaError) {
        throw error;
      }
      throw handleAssinaturaError(error, "completeSignature");
    }
  },

  async rejectSignature(params: { contratoId: string; aditivoId: string }): Promise<void> {
    try {
      const { contratoId, aditivoId } = params;
      const id = signatureDocId(contratoId, aditivoId);
      const ref = doc(collection(db, COLLECTION), id);

      try {
        await updateDoc(ref, {
          status: "Recusado",
        });
      } catch (updateError) {
        throw handleAssinaturaError(updateError, "rejectSignature");
      }
    } catch (error) {
      if (error instanceof AssinaturaError) {
        throw error;
      }
      throw handleAssinaturaError(error, "rejectSignature");
    }
  },

  async reopenAsPending(params: { contratoId: string; aditivoId: string }): Promise<void> {
    try {
      const { contratoId, aditivoId } = params;
      const id = signatureDocId(contratoId, aditivoId);
      const ref = doc(collection(db, COLLECTION), id);

      try {
        await updateDoc(ref, {
          status: "Pendente",
          dataAssinatura: null,
        });
      } catch (updateError) {
        throw handleAssinaturaError(updateError, "reopenAsPending");
      }
    } catch (error) {
      if (error instanceof AssinaturaError) {
        throw error;
      }
      throw handleAssinaturaError(error, "reopenAsPending");
    }
  },

  async getSignature(params: { contratoId: string; aditivoId: string }): Promise<AssinaturaRecord | undefined> {
    try {
      const { contratoId, aditivoId } = params;
      const id = signatureDocId(contratoId, aditivoId);
      const ref = doc(collection(db, COLLECTION), id);

      try {
        const snap = await getDoc(ref);
        return snap.exists() ? (snap.data() as AssinaturaRecord) : undefined;
      } catch (readError) {
        throw handleAssinaturaError(readError, "getSignature");
      }
    } catch (error) {
      if (error instanceof AssinaturaError) {
        throw error;
      }
      throw handleAssinaturaError(error, "getSignature");
    }
  },

  async getAllSignatures(params?: { clienteId?: string; status?: AssinaturaStatus }): Promise<AssinaturaRecord[]> {
    try {
      const signaturesRef = collection(db, COLLECTION);
      let q = query(signaturesRef);

      if (params?.clienteId) {
        q = query(q, where("clienteId", "==", params.clienteId));
      }

      if (params?.status) {
        q = query(q, where("status", "==", params.status));
      }

      try {
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => doc.data() as AssinaturaRecord);
      } catch (readError) {
        throw handleAssinaturaError(readError, "getAllSignatures");
      }
    } catch (error) {
      if (error instanceof AssinaturaError) {
        throw error;
      }
      throw handleAssinaturaError(error, "getAllSignatures");
    }
  },

  async getValidDownloadUrl(path: string): Promise<string> {
    try {
      // Remove barra inicial se existir
      const cleanPath = path.startsWith('/') ? path.slice(1) : path;
      // Tenta recuperar a URL válida do Firebase Storage (com cache)
      return await getCachedDownloadUrl(cleanPath);
    } catch (error) {
      console.error("Erro ao recuperar URL de download:", error);
      throw new Error("Erro ao recuperar URL do documento");
    }
  },

  async refreshSignatureUrls(record: AssinaturaRecord): Promise<AssinaturaRecord> {
    try {
      // Remover barra inicial - Firebase Storage não precisa dela
      const basePath = `documentos/${record.contratoId}/aditivos/${record.aditivoId}`;

      // Atualizar URL do documento original (com cache)
      const originalUrl = await getCachedDownloadUrl(`${basePath}/original.pdf`);

      const updatedRecord: Partial<AssinaturaRecord> = {
        documentoOriginalUrl: originalUrl,
      };

      // Atualizar URL do documento assinado se existir (com cache)
      if (record.status === "Assinado") {
        const signedUrl = await getCachedDownloadUrl(`${basePath}/assinado.pdf`);
        updatedRecord.documentoUrl = signedUrl;
      }

      // Atualizar no Firestore
      const id = signatureDocId(record.contratoId, record.aditivoId);
      const ref = doc(collection(db, COLLECTION), id);
      await updateDoc(ref, updatedRecord);

      return {
        ...record,
        ...updatedRecord,
      } as AssinaturaRecord;
    } catch (error) {
      console.error("Erro ao atualizar URLs:", error);
      // Retorna o record original se falhar
      return record;
    }
  },
};

export default assinaturaService;


