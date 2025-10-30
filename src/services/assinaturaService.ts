import { db } from "../lib/firebaseconfig";
import { collection, doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
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
    const basePath = `/documentos/${contratoId}/aditivos/${aditivoId}`;

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
    const basePath = `/documentos/${contratoId}/aditivos/${aditivoId}`;
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
};

export default assinaturaService;


