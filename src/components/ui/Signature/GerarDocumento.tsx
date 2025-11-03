import React, { useState } from "react";
import type { Contract } from "../../../types/contracts";
import type { AdditiveRequest } from "../../../types/additiveRequest";
import { pdfService } from "../../../services/pdfService";
import { assinaturaService, AssinaturaError } from "../../../services/assinaturaService";

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
    } catch (e: unknown) {
      console.error("Erro ao gerar documento:", e);

      // Tratar erros específicos da assinatura
      if (e instanceof AssinaturaError) {
        setError(e.userMessage);
      } else if (e instanceof Error) {
        // Verificar tipo de erro específico
        const errorMessage = e.message.toLowerCase();
        if (errorMessage.includes("cors") || errorMessage.includes("preflight")) {
          setError("Erro de conexão com o servidor. Verifique as configurações do Firebase Storage e tente novamente.");
        } else if (errorMessage.includes("auth") || errorMessage.includes("autenticado")) {
          setError("Você precisa estar autenticado para gerar documentos. Por favor, faça login novamente.");
        } else if (errorMessage.includes("permissão") || errorMessage.includes("permission")) {
          setError("Permissão negada. Verifique se as regras do Firebase Storage permitem upload para usuários autenticados.");
        } else if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
          setError("Erro de conexão. Verifique sua internet e tente novamente.");
        } else {
          setError(`Erro ao gerar documento: ${e.message}`);
        }
      } else {
        setError("Falha ao gerar documento. Tente novamente ou contate o suporte.");
      }
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


