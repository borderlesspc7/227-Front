import React, { useState } from "react";
import { assinaturaService } from "../../../services/assinaturaService";

interface PdfLinkProps {
  url: string | undefined | null;
  path?: string; // Path do arquivo no Storage (para recuperar URL válida)
  contratoId?: string;
  aditivoId?: string;
  label: string;
  className?: string;
}

const PdfLink: React.FC<PdfLinkProps> = ({
  url,
  path,
  contratoId,
  aditivoId,
  label,
  className = "",
}) => {
  const [validUrl, setValidUrl] = useState<string | null>(url || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Se a URL não está disponível, tenta recuperar
    if (!validUrl && path) {
      e.preventDefault();
      setLoading(true);
      setError(null);

      try {
        const newUrl = await assinaturaService.getValidDownloadUrl(path);
        setValidUrl(newUrl);
        // Abre a URL em nova aba
        window.open(newUrl, "_blank", "noopener,noreferrer");
      } catch (err: any) {
        setError("Erro ao recuperar documento. Tente novamente.");
        console.error("Erro ao recuperar URL:", err);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Se a URL existe mas pode estar expirada, tenta validar
    if (validUrl && validUrl.includes("firebasestorage.googleapis.com")) {
      // Deixa o link abrir normalmente
      // O navegador tentará acessar e se falhar, podemos tratar
    }
  };

  if (!validUrl && !path) {
    return null;
  }

  if (error) {
    return (
      <span className={`pdf-link-error ${className}`} style={{ color: "#dc2626", fontSize: "14px" }}>
        {error}
      </span>
    );
  }

  if (loading) {
    return (
      <span className={`pdf-link-loading ${className}`} style={{ color: "#6b7280", fontSize: "14px" }}>
        Carregando...
      </span>
    );
  }

  return (
    <a
      href={validUrl || "#"}
      onClick={handleClick}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "8px 16px",
        background: "#3b82f6",
        color: "white",
        textDecoration: "none",
        borderRadius: "6px",
        fontSize: "14px",
        fontWeight: "500",
        transition: "background 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#2563eb";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#3b82f6";
      }}
    >
      {label}
    </a>
  );
};

export default PdfLink;

