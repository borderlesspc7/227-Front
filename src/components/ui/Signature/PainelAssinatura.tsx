import React, { useMemo, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import type { Contract } from "../../../types/contracts";
import type { AdditiveRequest } from "../../../types/additiveRequest";
import { pdfService } from "../../../services/pdfService";
import { assinaturaService } from "../../../services/assinaturaService";

interface PainelAssinaturaProps {
  contrato: Contract;
  aditivo: AdditiveRequest;
  onAssinado?: (url: string) => void;
}

export const PainelAssinatura: React.FC<PainelAssinaturaProps> = ({ contrato, aditivo, onAssinado }) => {
  const sigRef = useRef<SignatureCanvas | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assinadoUrl, setAssinadoUrl] = useState<string | null>(null);

  const disabled = useMemo(() => !aditivo?.id || !contrato?.id, [aditivo?.id, contrato?.id]);

  const handleClear = () => {
    sigRef.current?.clear();
  };

  const handleAssinar = async () => {
    if (!sigRef.current || sigRef.current.isEmpty()) {
      setError("Assinatura vazia. Por favor, assine no campo.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const dataUrl = sigRef.current.getTrimmedCanvas().toDataURL("image/png");
      const blob = await pdfService.generateAdditivePDFWithSignature(contrato, aditivo, dataUrl);
      const record = await assinaturaService.completeSignature({
        contratoId: contrato.id,
        aditivoId: aditivo.id || "",
        signedPdfBlob: blob,
      });
      setAssinadoUrl(record.documentoUrl || null);
      onAssinado?.(record.documentoUrl || "");
    } catch (e: any) {
      setError(e?.message || "Falha ao concluir assinatura");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ border: "1px solid #ccc", borderRadius: 4, width: 520, height: 220 }}>
        <SignatureCanvas
          ref={sigRef}
          penColor="#000"
          backgroundColor="#fff"
          canvasProps={{
            width: 520,
            height: 220,
            style: { display: "block", borderRadius: 4 },
          }}
        />
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button onClick={handleClear} disabled={loading || disabled}>Limpar</button>
        <button onClick={handleAssinar} disabled={loading || disabled}>{loading ? "Salvando..." : "Assinar"}</button>
      </div>
      {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
      {assinadoUrl && (
        <div style={{ marginTop: 12 }}>
          <a href={assinadoUrl} target="_blank" rel="noreferrer">Ver PDF Assinado</a>
        </div>
      )}
    </div>
  );
};

export default PainelAssinatura;


