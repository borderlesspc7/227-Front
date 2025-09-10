import { useCallback, useContext } from "react";
import { ToastContext } from "../contexts/toastContext";

export interface ToastData {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
}

export interface ToastContextType {
  toasts: ToastData[];
  showToast: (toast: Omit<ToastData, "id">) => void;
  showSuccess: (title: string, message?: string, duration?: number) => void;
  showError: (title: string, message?: string, duration?: number) => void;
  showWarning: (title: string, message?: string, duration?: number) => void;
  showInfo: (title: string, message?: string, duration?: number) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

// Hook para uso fora do contexto (fallback)
export const useToastFallback = () => {
  const showSuccess = useCallback((title: string, message?: string) => {
    console.log(`✅ ${title}${message ? `: ${message}` : ""}`);
  }, []);

  const showError = useCallback((title: string, message?: string) => {
    console.error(`❌ ${title}${message ? `: ${message}` : ""}`);
  }, []);

  const showWarning = useCallback((title: string, message?: string) => {
    console.warn(`⚠️ ${title}${message ? `: ${message}` : ""}`);
  }, []);

  const showInfo = useCallback((title: string, message?: string) => {
    console.info(`ℹ️ ${title}${message ? `: ${message}` : ""}`);
  }, []);

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};
