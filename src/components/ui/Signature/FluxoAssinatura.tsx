import React, { useState, useEffect, useContext } from "react";
import type { Contract } from "../../../types/contracts";
import type { AdditiveRequest } from "../../../types/additiveRequest";
import { contractService } from "../../../services/contractService";
import { assinaturaService, type AssinaturaRecord } from "../../../services/assinaturaService";
import GerarDocumento from "./GerarDocumento";
import { PainelAssinatura } from "./PainelAssinatura";
import StatusAssinatura from "./StatusAssinatura";
import { useToast } from "../../../hooks/useToast";
import { AuthContext } from "../../../contexts/authContext";
import "./FluxoAssinatura.css";

interface FluxoAssinaturaProps {
  aditivo: AdditiveRequest;
}

const FluxoAssinatura: React.FC<FluxoAssinaturaProps> = ({ aditivo }) => {
  const { user } = useContext(AuthContext) || {};
  const { showSuccess, showError } = useToast();
  
  const [contrato, setContrato] = useState<Contract | null>(null);
  const [assinaturaRecord, setAssinaturaRecord] = useState<AssinaturaRecord | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [aditivo.contratoId, aditivo.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Carregar contrato
      if (aditivo.contratoId) {
        const contract = await contractService.getContractById(aditivo.contratoId);
        setContrato(contract);
      }

      // Carregar registro de assinatura se existir
      if (aditivo.contratoId && aditivo.id) {
        let signature = await assinaturaService.getSignature({
          contratoId: aditivo.contratoId,
          aditivoId: aditivo.id,
        });
        
        // Se encontrou assinatura, tenta atualizar as URLs para garantir que estão válidas
        if (signature) {
          try {
            signature = await assinaturaService.refreshSignatureUrls(signature);
          } catch (urlError) {
            console.warn("Aviso: não foi possível atualizar URLs da assinatura:", urlError);
            // Continua com a assinatura original mesmo se falhar ao atualizar URLs
          }
        }
        
        setAssinaturaRecord(signature);
      }
    } catch (e: any) {
      setError(e?.message || "Erro ao carregar dados");
      showError("Erro ao carregar informações de assinatura");
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentoGerado = async (recordId: string) => {
    showSuccess("Documento gerado com sucesso! Agora você pode assinar.");
    await loadData(); // Recarregar para mostrar o painel de assinatura
  };

  const handleAssinaturaConcluida = (url: string) => {
    showSuccess("Documento assinado com sucesso!");
    loadData(); // Recarregar para mostrar status atualizado
  };

  if (loading) {
    return (
      <div className="fluxo-assinatura__loading">
        <p>Carregando informações de assinatura...</p>
      </div>
    );
  }

  if (error || !contrato) {
    return (
      <div className="fluxo-assinatura__error">
        <p>{error || "Contrato não encontrado"}</p>
      </div>
    );
  }

  // Se o aditivo não está aprovado, não mostrar área de assinatura
  if (aditivo.status !== "aprovado") {
    return (
      <div className="fluxo-assinatura__info">
        <p>Este aditivo precisa estar aprovado para poder ser assinado.</p>
      </div>
    );
  }

  return (
    <div className="fluxo-assinatura">
      <h3 className="fluxo-assinatura__title">Assinatura Digital</h3>

      {/* Se ainda não foi gerado documento */}
      {!assinaturaRecord && (
        <div className="fluxo-assinatura__section">
          <p className="fluxo-assinatura__description">
            Gere o documento PDF do aditivo para iniciar o processo de assinatura digital.
          </p>
          {user?.uid && (
            <GerarDocumento
              contrato={contrato}
              aditivo={aditivo}
              clienteId={user.uid}
              onGerado={handleDocumentoGerado}
            />
          )}
        </div>
      )}

      {/* Se documento foi gerado mas não assinado */}
      {assinaturaRecord && assinaturaRecord.status === "Pendente" && (
        <div className="fluxo-assinatura__section">
          <div className="fluxo-assinatura__documento-info">
            <p className="fluxo-assinatura__description">
              Documento gerado. Assine digitalmente abaixo:
            </p>
            {assinaturaRecord.documentoOriginalUrl && (
              <button
                onClick={async () => {
                  try {
                    // Tenta abrir a URL diretamente
                    window.open(assinaturaRecord.documentoOriginalUrl, "_blank", "noopener,noreferrer");
                  } catch (error) {
                    // Se falhar, tenta recuperar a URL válida
                    try {
                      const path = `documentos/${aditivo.contratoId}/aditivos/${aditivo.id}/original.pdf`;
                      const newUrl = await assinaturaService.getValidDownloadUrl(path);
                      window.open(newUrl, "_blank", "noopener,noreferrer");
                    } catch (err) {
                      showError("Erro ao abrir documento. Verifique sua conexão e tente novamente.");
                      console.error("Erro ao recuperar URL:", err);
                    }
                  }
                }}
                className="fluxo-assinatura__link"
                type="button"
              >
                📄 Visualizar Documento Original
              </button>
            )}
          </div>
          <div className="fluxo-assinatura__signature-panel">
            <PainelAssinatura
              contrato={contrato}
              aditivo={aditivo}
              onAssinado={handleAssinaturaConcluida}
            />
          </div>
        </div>
      )}

      {/* Se já foi assinado */}
      {assinaturaRecord && assinaturaRecord.status === "Assinado" && (
        <div className="fluxo-assinatura__section">
          <div className="fluxo-assinatura__success">
            <p className="fluxo-assinatura__success-message">
              ✅ Documento assinado com sucesso!
            </p>
            {assinaturaRecord.documentoUrl && (
              <button
                onClick={async () => {
                  try {
                    // Tenta abrir a URL diretamente
                    window.open(assinaturaRecord.documentoUrl, "_blank", "noopener,noreferrer");
                  } catch (error) {
                    // Se falhar, tenta recuperar a URL válida
                    try {
                      const path = `documentos/${aditivo.contratoId}/aditivos/${aditivo.id}/assinado.pdf`;
                      const newUrl = await assinaturaService.getValidDownloadUrl(path);
                      window.open(newUrl, "_blank", "noopener,noreferrer");
                    } catch (err) {
                      showError("Erro ao abrir documento. Verifique sua conexão e tente novamente.");
                      console.error("Erro ao recuperar URL:", err);
                    }
                  }
                }}
                className="fluxo-assinatura__link fluxo-assinatura__link--success"
                type="button"
              >
                📄 Visualizar PDF Assinado
              </button>
            )}
          </div>
          <StatusAssinatura
            contratoId={aditivo.contratoId}
            aditivoId={aditivo.id || ""}
          />
        </div>
      )}

      {/* Se foi recusado */}
      {assinaturaRecord && assinaturaRecord.status === "Recusado" && (
        <div className="fluxo-assinatura__section">
          <div className="fluxo-assinatura__rejected">
            <p className="fluxo-assinatura__rejected-message">
              ❌ Assinatura recusada
            </p>
            <StatusAssinatura
              contratoId={aditivo.contratoId}
              aditivoId={aditivo.id || ""}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FluxoAssinatura;

