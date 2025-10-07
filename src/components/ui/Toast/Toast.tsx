"use client";

import React, { useEffect, useState, useCallback } from "react";
import { FiCheck, FiX, FiInfo, FiAlertTriangle } from "react-icons/fi";
import "./Toast.css";

export interface ToastProps {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
  action?: { label: string; onClick: () => void };
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  action,
  position = 'top-right',
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  const closeToast = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  }, [id, onClose]);

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    closeToast();
  };

  const handleActionClick = () => {
    if (action?.onClick) {
      action.onClick();
      closeToast();
    }
  };

  useEffect(() => {
    // Animação de entrada mais rápida
    const timer = setTimeout(() => setIsVisible(true), 10);

    // Auto-close e progress bar
    if (duration > 0) {
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev - (100 / (duration / 100));
          return newProgress <= 0 ? 0 : newProgress;
        });
      }, 100);

      const autoCloseTimer = setTimeout(() => {
        closeToast();
      }, duration);

      return () => {
        clearTimeout(timer);
        clearTimeout(autoCloseTimer);
        clearInterval(progressInterval);
      };
    }

    return () => {
      clearTimeout(timer);
    };
  }, [duration, closeToast]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <FiCheck size={20} />;
      case "error":
        return <FiX size={20} />;
      case "warning":
        return <FiAlertTriangle size={20} />;
      case "info":
        return <FiInfo size={20} />;
      default:
        return <FiInfo size={20} />;
    }
  };

  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return "toast--success";
      case "error":
        return "toast--error";
      case "warning":
        return "toast--warning";
      case "info":
        return "toast--info";
      default:
        return "toast--info";
    }
  };

  return (
    <div
      className={`toast ${getTypeStyles()} ${isVisible ? "toast--visible" : ""} ${isExiting ? "toast--exiting" : ""} toast--${position}`}
    >
      <div className="toast__content">
        <div className="toast__icon">{getIcon()}</div>
        <div className="toast__text">
          <h4 className="toast__title">{title}</h4>
          {message && <p className="toast__message">{message}</p>}
        </div>
        <div className="toast__actions">
          {action && (
            <button
              className="toast__action-btn"
              onClick={handleActionClick}
              type="button"
            >
              {action.label}
            </button>
          )}
          <button
            className="toast__close"
            onClick={handleClose}
            aria-label="Fechar notificação"
            type="button"
          >
            <FiX size={16} />
          </button>
        </div>
      </div>
      {duration > 0 && (
        <div className="toast__progress">
          <div
            className="toast__progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default Toast;
