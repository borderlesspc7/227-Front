import React, { useState } from "react";
import type { Contract } from "../../../types/contracts";
import type { AdditiveRequest } from "../../../types/additiveRequest";
import { pdfService } from "../../../services/pdfService";
import { assinaturaService } from "../../../services/assinaturaService";

interface GerarDocumentoProps {
  contrato: Contract;
  aditivo: AdditiveRequest;
  clienteId: string;
  onGerado?: (recordId: string) => void;
}

export const GerarDocumento: React.FC<GerarDocumentoProps> = ({ contrato, aditivo, clienteId, onGerado }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documentoUrl, setDocumentoUrl] = useState<string | null>(null);

  const handleGerar = async () => {
    setLoading(true);
    setError(null);
    try {
      const blob = await pdfService.generateAdditivePDF(contrato, aditivo);
      const record = await assinaturaService.initSignatureFlow({
        contratoId: contrato.id,
        aditivoId: aditivo.id || "",
        clienteId,
        originalPdfBlob: blob,
      });
      setDocumentoUrl(record.documentoOriginalUrl);
      onGerado?.(record.id);
    } catch (e: any) {
      console.error("Erro ao gerar documento:", e);
      let errorMessage = e?.message || "Falha ao gerar documento";
      
      // Mensagens mais específicas para problemas comuns
      if (errorMessage.includes("CORS") || errorMessage.includes("preflight")) {
        errorMessage = "Erro de CORS: Verifique as regras do Firebase Storage no Firebase Console. As regras devem permitir upload para usuários autenticados.";
      } else if (errorMessage.includes("autenticado")) {
        errorMessage = "Você precisa estar autenticado para gerar documentos. Por favor, faça login novamente.";
      } else if (errorMessage.includes("permissão")) {
        errorMessage = "Permissão negada. Verifique se as regras do Firebase Storage permitem upload.";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleGerar} disabled={loading}>
        {loading ? "Gerando..." : "Gerar PDF do Aditivo"}
      </button>
      {error && (
        <div style={{ 
          color: "#dc2626", 
          marginTop: 12, 
          padding: 12, 
          background: "#fef2f2", 
          border: "1px solid #fecaca", 
          borderRadius: 6,
          fontSize: "14px"
        }}>
          <strong>Erro:</strong> {error}
          {error.includes("CORS") && (
            <div style={{ marginTop: 8, fontSize: "12px", color: "#991b1b" }}>
              💡 <strong>Como resolver:</strong> Acesse o Firebase Console → Storage → Rules e configure as regras para permitir upload para usuários autenticados. Veja o arquivo FIREBASE_STORAGE_RULES.md para instruções detalhadas.
            </div>
          )}
        </div>
      )}
      {documentoUrl && (
        <div style={{ marginTop: 12 }}>
          <a href={documentoUrl} target="_blank" rel="noreferrer">Visualizar Documento</a>
        </div>
      )}
    </div>
  );
};

export default GerarDocumento;


