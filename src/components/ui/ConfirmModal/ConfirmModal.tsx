"use client";

import React from "react";
import { createPortal } from "react-dom";
import { FiAlertTriangle, FiX } from "react-icons/fi";
import "./ConfirmModal.css";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmar ação",
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "warning",
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    onConfirm();
  };

  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return "confirm-modal--danger";
      case "warning":
        return "confirm-modal--warning";
      case "info":
        return "confirm-modal--info";
      default:
        return "confirm-modal--warning";
    }
  };

  const getIconColor = () => {
    switch (type) {
      case "danger":
        return "#ef4444";
      case "warning":
        return "#f59e0b";
      case "info":
        return "#3b82f6";
      default:
        return "#f59e0b";
    }
  };

  return createPortal(
    <div className="confirm-modal__backdrop" onClick={handleBackdropClick}>
      <div className={`confirm-modal__container ${getTypeStyles()}`}>
        <div className="confirm-modal__header">
          <div className="confirm-modal__icon">
            <FiAlertTriangle size={24} color={getIconColor()} />
          </div>
          <button
            className="confirm-modal__close"
            onClick={onClose}
            aria-label="Fechar modal"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="confirm-modal__content">
          <h3 className="confirm-modal__title">{title}</h3>
          <p className="confirm-modal__message">{message}</p>
        </div>

        <div className="confirm-modal__actions">
          <button
            className="confirm-modal__btn confirm-modal__btn--cancel"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            className="confirm-modal__btn confirm-modal__btn--confirm"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Processando..." : confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};