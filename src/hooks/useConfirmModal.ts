"use client";

import { useState, useCallback } from "react";

export interface ConfirmModalState {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
  onConfirm?: () => void;
}

export const useConfirmModal = () => {
  const [modalState, setModalState] = useState<ConfirmModalState>({
    isOpen: false,
    message: "",
  });

  const showConfirm = useCallback((
    message: string,
    onConfirm: () => void,
    options?: {
      title?: string;
      confirmText?: string;
      cancelText?: string;
      type?: "danger" | "warning" | "info";
    }
  ) => {
    setModalState({
      isOpen: true,
      message,
      onConfirm,
      title: options?.title,
      confirmText: options?.confirmText,
      cancelText: options?.cancelText,
      type: options?.type || "warning",
    });
  }, []);

  const hideConfirm = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  const handleConfirm = useCallback(() => {
    if (modalState.onConfirm) {
      modalState.onConfirm();
    }
    hideConfirm();
  }, [modalState.onConfirm, hideConfirm]);

  return {
    modalState,
    showConfirm,
    hideConfirm,
    handleConfirm,
  };
};