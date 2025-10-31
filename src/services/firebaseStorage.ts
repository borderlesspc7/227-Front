import { app } from "../lib/firebaseconfig";
import { getStorage, ref, uploadBytes, uploadString, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";

const storage = getStorage(app);
const auth = getAuth(app);

export interface UploadResult {
  path: string;
  url: string;
}

export const firebaseStorageService = {
  async uploadPdfBlob(path: string, blob: Blob): Promise<UploadResult> {
    try {
      // Verificar se o usuário está autenticado
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("Você precisa estar autenticado para fazer upload de arquivos. Por favor, faça login novamente.");
      }

      // Garantir que o path não comece com /
      const cleanPath = path.startsWith('/') ? path.slice(1) : path;
      const storageRef = ref(storage, cleanPath);
      
      console.log("Tentando fazer upload para:", cleanPath);
      console.log("Usuário autenticado:", currentUser.uid);
      
      const snapshot = await uploadBytes(storageRef, blob, {
        contentType: "application/pdf",
      });
      const url = await getDownloadURL(snapshot.ref);
      return { path: cleanPath, url };
    } catch (error: any) {
      console.error("Erro no upload do PDF:", error);
      console.error("Código do erro:", error.code);
      console.error("Mensagem do erro:", error.message);
      
      if (error.code === 'storage/unauthorized') {
        throw new Error("Você não tem permissão para fazer upload. Verifique se está autenticado e se as regras do Firebase Storage permitem o upload.");
      } else if (error.code === 'storage/canceled') {
        throw new Error("Upload cancelado.");
      } else if (error.message?.includes("autenticado")) {
        throw error; // Já é uma mensagem clara
      } else if (error.message?.includes("CORS") || error.message?.includes("preflight")) {
        throw new Error("Erro de CORS: Verifique as regras do Firebase Storage. Elas devem permitir upload para usuários autenticados. Acesse o Firebase Console → Storage → Rules e configure as regras adequadas.");
      } else {
        throw new Error(`Erro ao fazer upload: ${error.message || "Erro desconhecido. Verifique as regras do Firebase Storage e sua autenticação."}`);
      }
    }
  },

  async uploadDataUrl(path: string, dataUrl: string, contentType?: string): Promise<UploadResult> {
    const storageRef = ref(storage, path);
    const snapshot = await uploadString(storageRef, dataUrl, "data_url", {
      contentType,
    });
    const url = await getDownloadURL(snapshot.ref);
    return { path, url };
  },

  async getDownloadUrl(path: string): Promise<string> {
    try {
      // Garantir que o path não comece com /
      const cleanPath = path.startsWith('/') ? path.slice(1) : path;
      const storageRef = ref(storage, cleanPath);
      return await getDownloadURL(storageRef);
    } catch (error: any) {
      console.error("Erro ao recuperar URL de download:", error);
      if (error.code === 'storage/object-not-found') {
        throw new Error("Arquivo não encontrado no Storage.");
      } else {
        throw new Error(`Erro ao recuperar URL: ${error.message || "Erro desconhecido"}`);
      }
    }
  },
};

export default firebaseStorageService;


