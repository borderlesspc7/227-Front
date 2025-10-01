"use client";

import React, { createContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import Toast from "../components/ui/Toast/Toast";
import type { ToastData, ToastContextType } from "../hooks/useToast";
import "../components/ui/Toast/ToastContainer.css";

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
  maxToasts?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  maxToasts = 5,
}) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<ToastData, "id">) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newToast: ToastData = {
        ...toast,
        id,
      };

      setToasts((prev) => {
        const updatedToasts = [newToast, ...prev];
        // Limita o número máximo de toasts
        return updatedToasts.slice(0, maxToasts);
      });
    },
    [maxToasts]
  );

  const showSuccess = useCallback(
    (title: string, message?: string, duration = 4000) => {
      showToast({ type: "success", title, message, duration });
    },
    [showToast]
  );

  const showError = useCallback(
    (title: string, message?: string, duration = 6000) => {
      showToast({ type: "error", title, message, duration });
    },
    [showToast]
  );

  const showWarning = useCallback(
    (title: string, message?: string, duration = 5000) => {
      showToast({ type: "warning", title, message, duration });
    },
    [showToast]
  );

  const showInfo = useCallback(
    (title: string, message?: string, duration = 4000) => {
      showToast({ type: "info", title, message, duration });
    },
    [showToast]
  );

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const contextValue: ToastContextType = {
    toasts,
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast,
    clearAllToasts,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      {/* Toast Container */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            duration={toast.duration}
            onClose={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export { ToastContext };
