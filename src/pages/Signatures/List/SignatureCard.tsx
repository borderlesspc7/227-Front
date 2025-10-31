import React from "react";
import type { AssinaturaRecord } from "../../../services/assinaturaService";
import "./SignatureCard.css";

interface SignatureCardProps {
  signature: AssinaturaRecord;
  statusColor: string;
  statusLabel: string;
}

const SignatureCard: React.FC<SignatureCardProps> = ({
  signature,
  statusColor,
  statusLabel,
}) => {
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    
    try {
      let date: Date;
      if (timestamp.toDate) {
        date = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else {
        date = new Date(timestamp);
      }
      
      if (isNaN(date.getTime())) {
        return "Data inválida";
      }
      
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  return (
    <div className="signature-card">
      <div className="signature-card__header">
        <div className="signature-card__title-section">
          <h3 className="signature-card__title">Documento de Assinatura</h3>
          <span
            className="signature-card__status"
            style={{ backgroundColor: statusColor }}
          >
            {statusLabel}
          </span>
        </div>
      </div>

      <div className="signature-card__content">
        <div className="signature-card__info">
          <div className="signature-card__info-item">
            <span className="signature-card__info-label">ID do Contrato:</span>
            <span className="signature-card__info-value">{signature.contratoId}</span>
          </div>
          <div className="signature-card__info-item">
            <span className="signature-card__info-label">ID do Aditivo:</span>
            <span className="signature-card__info-value">{signature.aditivoId}</span>
          </div>
          <div className="signature-card__info-item">
            <span className="signature-card__info-label">Data de Envio:</span>
            <span className="signature-card__info-value">{formatDate(signature.dataEnvio)}</span>
          </div>
          {signature.dataAssinatura && (
            <div className="signature-card__info-item">
              <span className="signature-card__info-label">Data de Assinatura:</span>
              <span className="signature-card__info-value">{formatDate(signature.dataAssinatura)}</span>
            </div>
          )}
        </div>

        <div className="signature-card__actions">
          {signature.documentoOriginalUrl && (
            <a
              href={signature.documentoOriginalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="signature-card__action-btn signature-card__action-btn--primary"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
              PDF Original
            </a>
          )}
          {signature.documentoUrl && (
            <a
              href={signature.documentoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="signature-card__action-btn signature-card__action-btn--success"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4"></path>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
              PDF Assinado
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignatureCard;

