import React from "react";
import { createPortal } from "react-dom";
import "./Modal.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "small" | "medium" | "large" | "extra-large";
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "medium",
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const portalTarget =
    (typeof document !== "undefined" && document.querySelector(".admin-layout")) ||
    (typeof document !== "undefined" && document.getElementById("root")) ||
    undefined;

  const modalContent = (
    <div className="modal__backdrop" onClick={handleBackdropClick}>
      <div className={`modal__container modal__container--${size}`}>
        <button
          className="modal__close-btn"
          onClick={onClose}
          type="button"
          aria-label="Fechar modal"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        {title && (
          <div className="modal__header">
            <h2 className="modal__title">{title}</h2>
          </div>
        )}
        <div className="modal__content">{children}</div>
      </div>
    </div>
  );

  // Renderiza dentro da área .admin-layout; fallback para #root quando não disponível
  return portalTarget ? createPortal(modalContent, portalTarget) : modalContent;
};

export default Modal;
