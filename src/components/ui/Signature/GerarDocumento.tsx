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
      setError(e?.message || "Falha ao gerar documento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleGerar} disabled={loading}>
        {loading ? "Gerando..." : "Gerar PDF do Aditivo"}
      </button>
      {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
      {documentoUrl && (
        <div style={{ marginTop: 12 }}>
          <a href={documentoUrl} target="_blank" rel="noreferrer">Visualizar Documento</a>
        </div>
      )}
    </div>
  );
};

export default GerarDocumento;


