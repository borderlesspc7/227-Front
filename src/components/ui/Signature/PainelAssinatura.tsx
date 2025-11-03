import React, { useMemo, useRef, useState, useContext } from "react";
import SignatureCanvas from "react-signature-canvas";
import type { Contract } from "../../../types/contracts";
import type { AdditiveRequest } from "../../../types/additiveRequest";
import { pdfService } from "../../../services/pdfService";
import { assinaturaService, AssinaturaError } from "../../../services/assinaturaService";
import { AuthContext } from "../../../contexts/authContext";

// Tipo para a instância do SignatureCanvas com métodos opcionais
interface SignatureCanvasInstance {
  getTrimmedCanvas?: () => HTMLCanvasElement;
  getCanvas?: () => HTMLCanvasElement;
  canvas?: HTMLCanvasElement;
  isEmpty?: () => boolean;
  clear?: () => void;
}

interface PainelAssinaturaProps {
  contrato: Contract;
  aditivo: AdditiveRequest;
  onAssinado?: (url: string) => void;
}

export const PainelAssinatura: React.FC<PainelAssinaturaProps> = ({ contrato, aditivo, onAssinado }) => {
  const { user } = useContext(AuthContext) || {};
  const sigRef = useRef<SignatureCanvas | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assinadoUrl, setAssinadoUrl] = useState<string | null>(null);

  const disabled = useMemo(() => !aditivo?.id || !contrato?.id, [aditivo?.id, contrato?.id]);

  const handleClear = () => {
    sigRef.current?.clear();
  };

  // Validação de qualidade mínima da assinatura
  const validateSignatureQuality = (canvas: HTMLCanvasElement): { valid: boolean; error?: string } => {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return { valid: false, error: "Erro ao acessar contexto do canvas." };
    }

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    // Contar pixels não-transparentes (assinatura)
    let signaturePixels = 0;
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] > 0) { // Alpha > 0 (não transparente)
        signaturePixels++;
      }
    }

    // Área mínima: pelo menos 1000 pixels (aproximadamente 2% de um canvas 520x220)
    const MIN_AREA = 1000;
    const totalPixels = canvas.width * canvas.height;
    const signaturePercentage = (signaturePixels / totalPixels) * 100;

    if (signaturePixels < MIN_AREA) {
      return {
        valid: false,
        error: `Assinatura muito pequena. Por favor, desenhe uma assinatura maior (mínimo ${MIN_AREA} pixels).`,
      };
    }

    // Verificar densidade mínima (não pode ser apenas alguns pontos isolados)
    if (signaturePercentage < 0.5) {
      return {
        valid: false,
        error: "Assinatura muito esparsa. Por favor, desenhe uma assinatura mais completa.",
      };
    }

    return { valid: true };
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
      const sigInstance = sigRef.current as SignatureCanvasInstance | null;

      if (!sigInstance) {
        throw new Error("Instância da assinatura não disponível.");
      }

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

      // Validar qualidade mínima da assinatura
      const qualityCheck = validateSignatureQuality(canvas);
      if (!qualityCheck.valid) {
        setError(qualityCheck.error || "Assinatura não atende aos critérios mínimos de qualidade.");
        return;
      }

      // Converter canvas para dataURL
      const dataUrl = canvas.toDataURL("image/png");

      // Verificar se o dataURL não está vazio (apenas cor de fundo)
      if (!dataUrl || dataUrl.length < 100) {
        throw new Error("Assinatura inválida. Por favor, desenhe sua assinatura novamente.");
      }

      let blob;
      try {
        blob = await pdfService.generateAdditivePDFWithSignature(contrato, aditivo, dataUrl);
      } catch {
        throw new Error("Erro ao gerar PDF com assinatura. Tente novamente.");
      }

      const record = await assinaturaService.completeSignature({
        contratoId: contrato.id,
        aditivoId: aditivo.id || "",
        signedPdfBlob: blob,
        userId: user?.uid,
      });
      setAssinadoUrl(record.documentoUrl || null);
      onAssinado?.(record.documentoUrl || "");
    } catch (e: unknown) {
      console.error("Erro ao processar assinatura:", e);

      // Tratar erros específicos da assinatura
      if (e instanceof AssinaturaError) {
        setError(e.userMessage);
      } else if (e instanceof Error) {
        // Verificar se é um erro de rede/CORS
        const errorMessage = e.message.toLowerCase();
        if (errorMessage.includes("cors") || errorMessage.includes("network") || errorMessage.includes("fetch")) {
          setError("Erro de conexão. Verifique sua internet e as configurações do Firebase Storage.");
        } else if (errorMessage.includes("auth") || errorMessage.includes("autenticado")) {
          setError("Erro de autenticação. Por favor, faça login novamente.");
        } else {
          setError(e.message);
        }
      } else {
        setError("Falha ao concluir assinatura. Verifique se a assinatura foi desenhada corretamente e tente novamente.");
      }
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


