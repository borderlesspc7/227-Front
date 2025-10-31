import React from "react";
import type { AssinaturaRecord } from "../../../services/assinaturaService";
import SignatureCard from "./SignatureCard";
import "./SignaturesList.css";

interface SignaturesListProps {
  loading: boolean;
  signatures: AssinaturaRecord[];
  error: string | null;
  onRefresh: () => void;
}

const SignaturesList: React.FC<SignaturesListProps> = ({
  loading,
  signatures,
  error,
  onRefresh,
}) => {
  const getStatusColor = (status: AssinaturaRecord["status"]) => {
    switch (status) {
      case "Pendente":
        return "#f59e0b";
      case "Assinado":
        return "#10b981";
      case "Recusado":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getStatusLabel = (status: AssinaturaRecord["status"]) => {
    switch (status) {
      case "Pendente":
        return "Pendente";
      case "Assinado":
        return "Assinado";
      case "Recusado":
        return "Recusado";
      default:
        return status;
    }
  };

  if (loading && signatures.length === 0) {
    return (
      <div className="signatures-list__loading">
        <div className="signatures-list__loading-spinner"></div>
        <p>Carregando assinaturas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="signatures-list__error">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
        <p>{error}</p>
        <button onClick={onRefresh} className="signatures-list__retry-btn">
          Tentar novamente
        </button>
      </div>
    );
  }

  if (signatures.length === 0) {
    return (
      <div className="signatures-list__empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14,2 14,8 20,8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10,9 9,9 8,9"></polyline>
        </svg>
        <h3>Nenhuma assinatura encontrada</h3>
        <p>Ainda não há documentos assinados para exibir.</p>
      </div>
    );
  }

  return (
    <div className="signatures-list">
      <div className="signatures-list__header">
        <h2 className="signatures-list__title">Documentos</h2>
        <div className="signatures-list__stats">
          <span className="signatures-list__stat">
            Total: {signatures.length}
          </span>
        </div>
      </div>

      <div className="signatures-list__grid">
        {signatures.map((signature) => (
          <SignatureCard
            key={signature.id}
            signature={signature}
            statusColor={getStatusColor(signature.status)}
            statusLabel={getStatusLabel(signature.status)}
          />
        ))}
      </div>
    </div>
  );
};

export default SignaturesList;

