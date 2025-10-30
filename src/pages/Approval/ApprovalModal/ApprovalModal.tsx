// src/components/ApprovalModal/ApprovalModal.tsx
import React, { useState } from "react";
import { X, CheckCircle, XCircle, ArrowLeft, Upload } from "lucide-react";
import type { ApprovalActionFormData } from "../../../types/approvalWorkflow";
import "./ApprovalModal.css";
import Modal from "../../../components/ui/Modal/Modal";

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (formData: ApprovalActionFormData) => void;
  stepName: string;
  actionType: "approve" | "reject" | "return";
  loading?: boolean;
}

const ApprovalModal: React.FC<ApprovalModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  stepName,
  actionType,
  loading = false,
}) => {
  const [formData, setFormData] = useState<ApprovalActionFormData>({
    action: actionType,
    comments: "",
    attachments: [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.comments.trim()) {
      onConfirm(formData);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData((prev: ApprovalActionFormData) => ({
      ...prev,
      attachments: [...(prev.attachments || []), ...files],
    }));
  };

  const removeAttachment = (index: number) => {
    setFormData((prev: ApprovalActionFormData) => ({
      ...prev,
      attachments: (prev.attachments || []).filter(
        (_: File, i: number) => i !== index
      ),
    }));
  };

  const getActionConfig = () => {
    switch (actionType) {
      case "approve":
        return {
          title: "Aprovar Solicitação",
          icon: (
            <CheckCircle className="approval-modal__action-icon--approve" />
          ),
          buttonText: "Aprovar",
          buttonClass: "approval-modal__submit-btn--approve",
          placeholder: "Adicione comentários sobre a aprovação...",
        };
      case "reject":
        return {
          title: "Rejeitar Solicitação",
          icon: <XCircle className="approval-modal__action-icon--reject" />,
          buttonText: "Rejeitar",
          buttonClass: "approval-modal__submit-btn--reject",
          placeholder: "Explique o motivo da rejeição...",
        };
      case "return":
        return {
          title: "Devolver Solicitação",
          icon: <ArrowLeft className="approval-modal__action-icon--return" />,
          buttonText: "Devolver",
          buttonClass: "approval-modal__submit-btn--return",
          placeholder: "Explique o que precisa ser ajustado...",
        };
    }
  };

  const config = getActionConfig();

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={config.title} size="medium">
      <div className="approval-modal">
        <div className="approval-modal__header">
          <div className="approval-modal__title-section">
            {config.icon}
            <p className="approval-modal__subtitle">Etapa: {stepName}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="approval-modal__form">
          <div className="approval-modal__field">
            <label className="approval-modal__label">
              Comentários *
              <textarea
                value={formData.comments}
                onChange={(e) =>
                  setFormData((prev: ApprovalActionFormData) => ({
                    ...prev,
                    comments: e.target.value,
                  }))
                }
                className="approval-modal__textarea"
                placeholder={config.placeholder}
                rows={4}
                required
                disabled={loading}
              />
            </label>
          </div>

          <div className="approval-modal__field">
            <label className="approval-modal__label">
              Anexos (opcional)
              <div className="approval-modal__file-upload">
                <input
                  type="file"
                  id="attachments"
                  multiple
                  onChange={handleFileChange}
                  className="approval-modal__file-input"
                  disabled={loading}
                />
                <label
                  htmlFor="attachments"
                  className="approval-modal__file-label"
                >
                  <Upload />
                  Adicionar arquivos
                </label>
              </div>
            </label>

            {(formData.attachments || []).length > 0 && (
              <div className="approval-modal__attachments">
                {(formData.attachments || []).map(
                  (file: File, index: number) => (
                    <div key={index} className="approval-modal__attachment">
                      <span className="approval-modal__attachment-name">
                        {file.name}
                      </span>
                      <span className="approval-modal__attachment-size">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                      <button
                        type="button"
                        className="approval-modal__remove-attachment"
                        onClick={() => removeAttachment(index)}
                        disabled={loading}
                      >
                        <X />
                      </button>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          <div className="approval-modal__actions">
            <button
              type="button"
              className="approval-modal__cancel-btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`approval-modal__submit-btn ${config.buttonClass}`}
              disabled={loading || !formData.comments.trim()}
            >
              {loading ? "Processando..." : config.buttonText}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default ApprovalModal;
