/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import AdditiveRequestForm from "../AdditiveRequest/Form/AdditiveRequestForm";
import AdditiveRequestList from "../AdditiveRequest/List/AdditiveRequestList";
import AdditiveRequestView from "../AdditiveRequest/View/AdditiveRequestView";
import Modal from "../../components/ui/Modal/Modal";
import { ConfirmModal } from "../../components/ui/ConfirmModal/ConfirmModal";
import type {
  AdditiveRequest,
  AdditiveRequestFormData,
} from "../../types/additiveRequest";
import { additiveRequestService } from "../../services/additiveRequestService";
import { workflowService } from "../../services/workflowService";
import { useToast } from "../../hooks/useToast";
import { useAuth } from "../../hooks/useAuth";
import { usePermissions } from "../../hooks/usePermissions";
import "./AdditiveRequestPage.css";
import { PlusIcon } from "lucide-react";

const AdditiveRequestPage: React.FC = () => {
  const { showError, showSuccess } = useToast();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();

  const [requests, setRequests] = useState<AdditiveRequest[]>([]);
  const [editingRequest, setEditingRequest] = useState<AdditiveRequest | null>(
    null
  );
  const [viewingRequest, setViewingRequest] = useState<AdditiveRequest | null>(
    null
  );
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    loading: boolean;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => { },
    loading: false,
  });

  useEffect(() => {
    const loadRequests = async () => {
      try {
        setLoading(true);
        if (user?.companyId) {
          const requestFromDB =
            await additiveRequestService.getAdditiveRequests(user.companyId);
          setRequests(requestFromDB);
        } else {
          setRequests([]);
        }
      } catch (error) {
        const errorMessage = "Erro ao carregar solicitações de aditivos";
        setError(errorMessage);
        showError(
          "Erro ao carregar",
          errorMessage + ". Verifique sua conexão e tente novamente."
        );
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadRequests();
  }, [user?.companyId, showError]);

  const handleFormSubmit = async (_requestData: AdditiveRequestFormData) => {
    // Esta função só atualiza a lista, não cria solicitação
    await refreshRequestsList();
    setShowForm(false);
  };

  const refreshRequestsList = async () => {
    try {
      if (user?.companyId) {
        const requestsFromDB = await additiveRequestService.getAdditiveRequests(user.companyId);
        setRequests(requestsFromDB);
      }
    } catch (err) {
      console.error("Erro ao recarregar solicitações:", err);
    }
  };

  const handleEditRequest = (request: AdditiveRequest) => {
    setEditingRequest(request);
    setShowForm(true);
  };

  const handleViewRequest = (request: AdditiveRequest) => {
    setViewingRequest(request);
  };

  const handleCloseViewModal = () => {
    setViewingRequest(null);
  };

  const showConfirmModal = (
    title: string,
    message: string,
    onConfirm: () => void
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm,
      loading: false,
    });
  };

  const closeConfirmModal = () => {
    if (!confirmModal.loading) {
      setConfirmModal({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: () => { },
        loading: false,
      });
    }
  };

  const executeWithLoading = async (action: () => Promise<void>) => {
    setConfirmModal((prev) => ({ ...prev, loading: true }));
    try {
      await action();
      closeConfirmModal();
    } catch (error) {
      console.error("Erro na operação:", error);
      setConfirmModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleUpdateRequest = (_updatedRequest: AdditiveRequestFormData) => {
    const refreshRequests = async () => {
      try {
        if (user?.companyId) {
          const requestsFromDB =
            await additiveRequestService.getAdditiveRequests(user.companyId);
          setRequests(requestsFromDB);
        }
      } catch (err) {
        console.error("Erro ao recarregar solicitações:", err);
      }
    };

    refreshRequests();
    setEditingRequest(null);
    setShowForm(false);
  };

  const handleDeleteRequest = (id: string) => {
    const request = requests.find((r) => r.id === id);
    const protocolo = request?.protocolo || "esta solicitação";

    showConfirmModal(
      "Confirmar Exclusão",
      `Tem certeza que deseja excluir a solicitação ${protocolo}? Esta ação não pode ser desfeita.`,
      () =>
        executeWithLoading(async () => {
          await additiveRequestService.deleteAdditiveRequest(id, user?.role);
          if (user?.companyId) {
            const requestsFromDB =
              await additiveRequestService.getAdditiveRequests(user.companyId);
            setRequests(requestsFromDB);
          }
        })
    );
  };

  const handleCancelForm = () => {
    setEditingRequest(null);
    setShowForm(false);
  };

  const handleSubmitForApproval = async (request: AdditiveRequest) => {
    if (!request.id) {
      showError("Erro", "ID da solicitação não encontrado");
      return;
    }

    try {
      setLoading(true);

      try {
        await workflowService.setupDefaultWorkflow();
      } catch {
        console.error("Erro ao configurar workflow:", error);
        showError(
          "Erro ao configurar workflow",
          "Erro ao configurar workflow. Tente novamente."
        );
      }

      await additiveRequestService.submitForApproval(request.id);

      if (user?.companyId) {
        const updatedRequests =
          await additiveRequestService.getAdditiveRequests(user.companyId);
        setRequests(updatedRequests);
      }

      showSuccess(
        "Enviado para aprovação!",
        `A solicitação ${request.protocolo} foi enviada para aprovação.`
      );
    } catch (error) {
      console.error("Erro ao enviar para aprovação:", error);
      showError(
        "Erro ao enviar",
        "Erro ao enviar solicitação para aprovação. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResubmit = async (request: AdditiveRequest) => {
    if (!request.id) {
      showError("Erro", "ID da solicitação não encontrado");
      return;
    }
    try {
      setLoading(true);
      try {
        await workflowService.setupDefaultWorkflow();
      } catch {
        console.error("Erro ao configurar workflow:", error);
        showError(
          "Erro ao configurar workflow",
          "Erro ao configurar workflow. Tente novamente."
        );
      }

      await additiveRequestService.updateAdditiveRequest(request.id, {
        status: "rascunho",
        currentApprovalStep: null,
        isWorkflowActive: false,
        workflowStatus: null,
      }, user?.role);

      await additiveRequestService.submitForApproval(request.id);

      if (user?.companyId) {
        const updateRequests = await additiveRequestService.getAdditiveRequests(user.companyId);
        setRequests(updateRequests);
      }

      showSuccess(
        "Solicitação reenviada!",
        `A solicitação ${request.protocolo} foi reenviada para aprovação.`
      );
    } catch (error) {
      console.error("Erro ao resetar solicitação:", error);
      showError(
        "Erro ao resetar",
        "Erro ao resetar solicitação. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="additive-request-page">
      <div className="additive-request-page__header">
        <h1 className="additive-request-page__title">
          Solicitações de Aditivos / OSAs
        </h1>
        {hasPermission("create_additive_requests") && (
          <button
            className="additive-request-page__add-btn"
            onClick={() => setShowForm(true)}
            type="button"
          >
            <PlusIcon className="additive-request-page__add-icon" />
            Nova Solicitação
          </button>
        )}
      </div>

      {loading && (
        <div className="additive-request-page__loading">
          <p>Carregando solicitações...</p>
        </div>
      )}

      {error && (
        <div className="additive-request-page__error">
          <p>Erro: {error}</p>
        </div>
      )}

      {/* Modal de nova solicitação */}
      {showForm && (
        <Modal
          isOpen={showForm}
          onClose={handleCancelForm}
          title={editingRequest ? "Editar Solicitação" : "Nova Solicitação de Aditivo"}
          size="extra-large"
        >
          <AdditiveRequestForm
            request={editingRequest}
            onSubmit={editingRequest ? handleUpdateRequest : handleFormSubmit}
            onCancel={handleCancelForm}
          />
        </Modal>
      )}

      <div className="additive-request-page__list-section">
        <AdditiveRequestList
          loading={loading}
          requests={requests}
          error={error}
          onEdit={handleEditRequest}
          onDelete={handleDeleteRequest}
          onView={handleViewRequest}
          onAddNew={() => setShowForm(true)}
          onSubmitForApproval={handleSubmitForApproval}
          onResubmit={handleResubmit}
        />
      </div>

      {/* Modal de visualização */}
      {viewingRequest && (
        <Modal
          isOpen={!!viewingRequest}
          onClose={handleCloseViewModal}
          title={`Solicitação ${viewingRequest.protocolo}`}
          size="extra-large"
        >
          <AdditiveRequestView request={viewingRequest} />
        </Modal>
      )}

      {/* Modal de confirmação */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Confirmar"
        cancelText="Cancelar"
        type="danger"
        isLoading={confirmModal.loading}
      />
    </div>
  );
};

export default AdditiveRequestPage;
