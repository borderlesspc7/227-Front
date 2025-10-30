import { app } from "../lib/firebaseconfig";
import { getStorage, ref, uploadBytes, uploadString, getDownloadURL } from "firebase/storage";

const storage = getStorage(app);

export interface UploadResult {
  path: string;
  url: string;
}

export const firebaseStorageService = {
  async uploadPdfBlob(path: string, blob: Blob): Promise<UploadResult> {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, blob, {
      contentType: "application/pdf",
    });
    const url = await getDownloadURL(snapshot.ref);
    return { path, url };
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
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  },
};

export default firebaseStorageService;


