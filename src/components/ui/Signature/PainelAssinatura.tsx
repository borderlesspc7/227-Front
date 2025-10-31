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
    if (!sigRef.current) {
      setError("Erro ao acessar o canvas de assinatura.");
      return;
    }

    // Verificar se a assinatura está vazia
    try {
      const isEmpty = sigRef.current.isEmpty?.() ?? false;
      if (isEmpty) {
        setError("Assinatura vazia. Por favor, assine no campo.");
        return;
      }
    } catch (checkError) {
      console.warn("Erro ao verificar se assinatura está vazia:", checkError);
      // Continua mesmo se a verificação falhar
    }

    setLoading(true);
    setError(null);
    try {
      // Tentar obter o canvas da assinatura de diferentes formas
      let canvas: HTMLCanvasElement | null = null;
      const sigInstance = sigRef.current as any;

      // Tentativa 1: getTrimmedCanvas (método preferencial)
      if (typeof sigInstance.getTrimmedCanvas === 'function') {
        try {
          canvas = sigInstance.getTrimmedCanvas();
        } catch (e) {
          console.warn("getTrimmedCanvas falhou, tentando alternativa:", e);
        }
      }

      // Tentativa 2: getCanvas (método alternativo)
      if (!canvas && typeof sigInstance.getCanvas === 'function') {
        try {
          canvas = sigInstance.getCanvas();
        } catch (e) {
          console.warn("getCanvas falhou, tentando alternativa:", e);
        }
      }

      // Tentativa 3: Acessar canvas diretamente
      if (!canvas && sigInstance.canvas instanceof HTMLCanvasElement) {
        canvas = sigInstance.canvas;
      }

      // Tentativa 4: Procurar canvas no elemento DOM
      if (!canvas) {
        const container = document.querySelector('[data-signature-canvas]');
        if (container) {
          const foundCanvas = container.querySelector('canvas');
          if (foundCanvas) {
            canvas = foundCanvas;
          }
        }
      }

      if (!canvas) {
        throw new Error("Não foi possível acessar o canvas da assinatura. Tente recarregar a página.");
      }

      // Converter canvas para dataURL
      const dataUrl = canvas.toDataURL("image/png");
      
      // Verificar se o dataURL não está vazio (apenas cor de fundo)
      if (!dataUrl || dataUrl.length < 100) {
        throw new Error("Assinatura inválida. Por favor, desenhe sua assinatura novamente.");
      }

      const blob = await pdfService.generateAdditivePDFWithSignature(contrato, aditivo, dataUrl);
      const record = await assinaturaService.completeSignature({
        contratoId: contrato.id,
        aditivoId: aditivo.id || "",
        signedPdfBlob: blob,
      });
      setAssinadoUrl(record.documentoUrl || null);
      onAssinado?.(record.documentoUrl || "");
    } catch (e: any) {
      console.error("Erro ao processar assinatura:", e);
      setError(e?.message || "Falha ao concluir assinatura. Verifique se a assinatura foi desenhada corretamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ border: "1px solid #ccc", borderRadius: 4, width: 520, height: 220 }} data-signature-canvas>
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


