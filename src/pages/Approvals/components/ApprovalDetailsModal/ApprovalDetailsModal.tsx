import React from "react";
import Modal from "../../../../components/ui/Modal/Modal";
import type { AdditiveRequest } from "../../../../types/additiveRequest";
import { formatCurrency, formatDateTime } from "../../../../utils/dateUtils";

interface ApprovalDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: AdditiveRequest;
  creatorName?: string;
}

const ApprovalDetailsModal: React.FC<ApprovalDetailsModalProps> = ({ isOpen, onClose, request, creatorName }) => {
  if (!request) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Detalhes da OSA ${request.protocolo}`} size="large">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Descrição</div>
          <div>{request.descricao}</div>
        </div>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Justificativa</div>
          <div>{request.justificativa}</div>
        </div>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Status</div>
          <div>{request.status}</div>
        </div>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Prioridade</div>
          <div>{request.prioridade}</div>
        </div>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Criado em</div>
          <div>{formatDateTime(request.createdAt)}</div>
        </div>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Criado por</div>
          <div>{creatorName || request.createdBy}</div>
        </div>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Valor Total</div>
          <div>{formatCurrency(request.valorTotal)}</div>
        </div>
      </div>

      {request.itens?.length ? (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Itens ({request.itens.length})</div>
          <div style={{ border: "1px solid #eee", borderRadius: 8, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 8, padding: 8, background: "#fafafa", fontWeight: 600 }}>
              <div>Descrição</div>
              <div>Qtd</div>
              <div>Unidade</div>
              <div>Total</div>
            </div>
            {request.itens.map((item, idx) => (
              <div key={idx} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 8, padding: 8, borderTop: "1px solid #f0f0f0" }}>
                <div>{item.descricao}</div>
                <div>{item.quantidade}</div>
                <div>{item.unidade}</div>
                <div>{formatCurrency(item.valorTotal)}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16, gap: 8 }}>
        <button type="button" className="approvals-page__retry-btn" onClick={onClose}>Fechar</button>
      </div>
    </Modal>
  );
};

export default ApprovalDetailsModal;


