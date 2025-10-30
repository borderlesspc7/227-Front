import React, { useEffect, useState } from "react";
import { assinaturaService, type AssinaturaRecord } from "../../../services/assinaturaService";

interface StatusAssinaturaProps {
  contratoId: string;
  aditivoId: string;
}

export const StatusAssinatura: React.FC<StatusAssinaturaProps> = ({ contratoId, aditivoId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [record, setRecord] = useState<AssinaturaRecord | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await assinaturaService.getSignature({ contratoId, aditivoId });
      setRecord(data ?? null);
    } catch (e: any) {
      setError(e?.message || "Falha ao obter status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [contratoId, aditivoId]);

  const handleRecusar = async () => {
    setLoading(true);
    setError(null);
    try {
      await assinaturaService.rejectSignature({ contratoId, aditivoId });
      await load();
    } catch (e: any) {
      setError(e?.message || "Falha ao recusar assinatura");
      setLoading(false);
    }
  };

  const handleReabrir = async () => {
    setLoading(true);
    setError(null);
    try {
      await assinaturaService.reopenAsPending({ contratoId, aditivoId });
      await load();
    } catch (e: any) {
      setError(e?.message || "Falha ao reabrir assinatura");
      setLoading(false);
    }
  };

  if (loading) return <div>Carregando status...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!record) return <div>Nenhum registro de assinatura encontrado.</div>;

  return (
    <div>
      <div>
        <strong>Status:</strong> {record.status}
      </div>
      <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
        <button onClick={handleRecusar} disabled={loading}>Recusar</button>
        <button onClick={handleReabrir} disabled={loading}>Reabrir como Pendente</button>
        {record.documentoOriginalUrl && (
          <a href={record.documentoOriginalUrl} target="_blank" rel="noreferrer">PDF Original</a>
        )}
        {record.documentoUrl && (
          <a href={record.documentoUrl} target="_blank" rel="noreferrer">PDF Assinado</a>
        )}
      </div>
    </div>
  );
};

export default StatusAssinatura;


