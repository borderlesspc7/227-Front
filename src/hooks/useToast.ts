import { useCallback, useContext } from "react";
import { ToastContext } from "../contexts/toastContext";

export interface ToastData {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
  action?: { label: string; onClick: () => void };
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export interface ToastContextType {
  toasts: ToastData[];
  showToast: (toast: Omit<ToastData, "id">) => void;
  showSuccess: (title: string, message?: string, duration?: number, options?: {
    action?: { label: string; onClick: () => void };
    persistent?: boolean;
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  }) => void;
  showError: (title: string, message?: string, duration?: number, options?: {
    action?: { label: string; onClick: () => void };
    persistent?: boolean;
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  }) => void;
  showWarning: (title: string, message?: string, duration?: number, options?: {
    action?: { label: string; onClick: () => void };
    persistent?: boolean;
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  }) => void;
  showInfo: (title: string, message?: string, duration?: number, options?: {
    action?: { label: string; onClick: () => void };
    persistent?: boolean;
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  }) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    // Fallback para quando o contexto não está disponível
    console.warn("useToast: ToastProvider não encontrado, usando fallback");
    return {
      toasts: [],
      showToast: (toast) => {
        console.log(`Toast: ${toast?.type?.toUpperCase() || 'UNKNOWN'} - ${toast?.title || 'Sem título'}${toast?.message ? `: ${toast.message}` : ""}`);
      },
      showSuccess: (title, message) => console.log(`✅ ${title}${message ? `: ${message}` : ""}`),
      showError: (title, message) => console.error(`❌ ${title}${message ? `: ${message}` : ""}`),
      showWarning: (title, message) => console.warn(`⚠️ ${title}${message ? `: ${message}` : ""}`),
      showInfo: (title, message) => console.info(`ℹ️ ${title}${message ? `: ${message}` : ""}`),
      removeToast: () => { },
      clearAllToasts: () => { },
    };
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
