import { useState } from "react";

interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  loading: boolean;
}

interface ConfirmModalConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info" | "success";
}

export const useConfirmModal = () => {
  const [modalState, setModalState] = useState<ConfirmModalState>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    loading: false,
  });

  const showConfirm = (
    config: ConfirmModalConfig,
    onConfirm: () => void | Promise<void>
  ) => {
    setModalState({
      isOpen: true,
      title: config.title,
      message: config.message,
      onConfirm: async () => {
        setModalState((prev) => ({ ...prev, loading: true }));
        try {
          await onConfirm();
          closeModal();
        } catch (error) {
          console.error("Erro na operação:", error);
          setModalState((prev) => ({ ...prev, loading: false }));
        }
      },
      loading: false,
    });
  };

  const closeModal = () => {
    if (!modalState.loading) {
      setModalState({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: () => {},
        loading: false,
      });
    }
  };

  const setLoading = (loading: boolean) => {
    setModalState((prev) => ({ ...prev, loading }));
  };

  return {
    modalState,
    showConfirm,
    closeModal,
    setLoading,
  };
};
