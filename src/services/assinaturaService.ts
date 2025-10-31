import { db } from "../lib/firebaseconfig";
import { collection, doc, getDoc, setDoc, updateDoc, serverTimestamp, getDocs, query, where } from "firebase/firestore";
import { firebaseStorageService } from "./firebaseStorage";

export type AssinaturaStatus = "Pendente" | "Assinado" | "Recusado";

export interface AssinaturaRecord {
  id: string; // contratoId_aditivoId
  aditivoId: string;
  contratoId: string;
  clienteId: string;
  status: AssinaturaStatus;
  dataEnvio: any; // Firestore Timestamp
  dataAssinatura?: any; // Firestore Timestamp
  documentoOriginalUrl: string;
  documentoUrl?: string; // assinado
}

const COLLECTION = "assinaturas";

function signatureDocId(contratoId: string, aditivoId: string) {
  return `${contratoId}_${aditivoId}`;
}

export const assinaturaService = {
  async initSignatureFlow(params: {
    contratoId: string;
    aditivoId: string;
    clienteId: string;
    originalPdfBlob: Blob;
  }): Promise<AssinaturaRecord> {
    const { contratoId, aditivoId, clienteId, originalPdfBlob } = params;
    // Remover barra inicial - Firebase Storage não precisa dela
    const basePath = `documentos/${contratoId}/aditivos/${aditivoId}`;

    const originalUpload = await firebaseStorageService.uploadPdfBlob(`${basePath}/original.pdf`, originalPdfBlob);

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
    await setDoc(ref, record, { merge: true });
    return record;
  },

  async completeSignature(params: {
    contratoId: string;
    aditivoId: string;
    signedPdfBlob: Blob;
  }): Promise<AssinaturaRecord> {
    const { contratoId, aditivoId, signedPdfBlob } = params;
    // Remover barra inicial - Firebase Storage não precisa dela
    const basePath = `documentos/${contratoId}/aditivos/${aditivoId}`;
    const upload = await firebaseStorageService.uploadPdfBlob(`${basePath}/assinado.pdf`, signedPdfBlob);

    const id = signatureDocId(contratoId, aditivoId);
    const ref = doc(collection(db, COLLECTION), id);
    await updateDoc(ref, {
      status: "Assinado",
      dataAssinatura: serverTimestamp(),
      documentoUrl: upload.url,
    });

    const updated = await getDoc(ref);
    return updated.data() as AssinaturaRecord;
  },

  async rejectSignature(params: { contratoId: string; aditivoId: string }): Promise<void> {
    const { contratoId, aditivoId } = params;
    const id = signatureDocId(contratoId, aditivoId);
    const ref = doc(collection(db, COLLECTION), id);
    await updateDoc(ref, {
      status: "Recusado",
    });
  },

  async reopenAsPending(params: { contratoId: string; aditivoId: string }): Promise<void> {
    const { contratoId, aditivoId } = params;
    const id = signatureDocId(contratoId, aditivoId);
    const ref = doc(collection(db, COLLECTION), id);
    await updateDoc(ref, {
      status: "Pendente",
      dataAssinatura: null,
    });
  },

  async getSignature(params: { contratoId: string; aditivoId: string }): Promise<AssinaturaRecord | undefined> {
    const { contratoId, aditivoId } = params;
    const id = signatureDocId(contratoId, aditivoId);
    const ref = doc(collection(db, COLLECTION), id);
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as AssinaturaRecord) : undefined;
  },

  async getAllSignatures(params?: { clienteId?: string; status?: AssinaturaStatus }): Promise<AssinaturaRecord[]> {
    const signaturesRef = collection(db, COLLECTION);
    let q = query(signaturesRef);

    if (params?.clienteId) {
      q = query(q, where("clienteId", "==", params.clienteId));
    }

    if (params?.status) {
      q = query(q, where("status", "==", params.status));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as AssinaturaRecord);
  },

  async getValidDownloadUrl(path: string): Promise<string> {
    try {
      // Remove barra inicial se existir
      const cleanPath = path.startsWith('/') ? path.slice(1) : path;
      // Tenta recuperar a URL válida do Firebase Storage
      return await firebaseStorageService.getDownloadUrl(cleanPath);
    } catch (error) {
      console.error("Erro ao recuperar URL de download:", error);
      throw new Error("Erro ao recuperar URL do documento");
    }
  },

  async refreshSignatureUrls(record: AssinaturaRecord): Promise<AssinaturaRecord> {
    try {
      // Remover barra inicial - Firebase Storage não precisa dela
      const basePath = `documentos/${record.contratoId}/aditivos/${record.aditivoId}`;
      
      // Atualizar URL do documento original
      const originalUrl = await firebaseStorageService.getDownloadUrl(`${basePath}/original.pdf`);
      
      const updatedRecord: Partial<AssinaturaRecord> = {
        documentoOriginalUrl: originalUrl,
      };

      // Atualizar URL do documento assinado se existir
      if (record.status === "Assinado") {
        const signedUrl = await firebaseStorageService.getDownloadUrl(`${basePath}/assinado.pdf`);
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


