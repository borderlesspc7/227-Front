/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import AdditiveRequestForm from "../AdditiveRequest/Form/AdditiveRequestForm";
import AdditiveRequestList from "../AdditiveRequest/List/AdditiveRequestList";
import type { AdditiveRequest } from "../../types/additiveRequest";
import { additiveRequestService } from "../../services/additiveRequestService";
import { useToast } from "../../hooks/useToast";
import "./AdditiveRequestPage.css";
import { PlusIcon } from "lucide-react";

const AdditiveRequestPage: React.FC = () => {
  const { showError } = useToast();

  const [requests, setRequests] = useState<AdditiveRequest[]>([]);
  const [editingRequest, setEditingRequest] = useState<AdditiveRequest | null>(
    null
  );
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRequests = async () => {
      try {
        setLoading(true);
        const requestFromDB =
          await additiveRequestService.getAdditiveRequests();
        setRequests(requestFromDB);
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
  }, [showError]);

  const handleAddRequest = (_request: Omit<AdditiveRequest, "id">) => {
    const refreshRequests = async () => {
      try {
        const requestsFromDB =
          await additiveRequestService.getAdditiveRequests();
        setRequests(requestsFromDB);
      } catch (err) {
        console.error("Erro ao recarregar solicitações:", err);
      }
    };

    refreshRequests();
    setShowForm(false);
  };

  const handleEditRequest = (request: AdditiveRequest) => {
    setEditingRequest(request);
    setShowForm(true);
  };

  const handleUpdateRequest = (
    _updatedRequest: Omit<AdditiveRequest, "id">
  ) => {
    const refreshRequests = async () => {
      try {
        const requestsFromDB =
          await additiveRequestService.getAdditiveRequests();
        setRequests(requestsFromDB);
      } catch (err) {
        console.error("Erro ao recarregar solicitações:", err);
      }
    };

    refreshRequests();
    setEditingRequest(null);
    setShowForm(false);
  };

  const handleDeleteRequest = (_id: string) => {
    const refreshRequests = async () => {
      try {
        const requestsFromDB =
          await additiveRequestService.getAdditiveRequests();
        setRequests(requestsFromDB);
      } catch (err) {
        console.error("Erro ao recarregar solicitações:", err);
      }
    };

    refreshRequests();
  };

  const handleCancelForm = () => {
    setEditingRequest(null);
    setShowForm(false);
  };

  return (
    <div className="additive-request-page">
      <div className="additive-request-page__header">
        <h1 className="additive-request-page__title">
          Solicitações de Aditivos / OSAs
        </h1>
        <button
          className="additive-request-page__add-btn"
          onClick={() => setShowForm(true)}
          type="button"
        >
          <PlusIcon className="additive-request-page__add-icon" />
          Nova Solicitação
        </button>
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

      {showForm && (
        <div className="additive-request-page__form-section">
          <AdditiveRequestForm
            request={editingRequest}
            onSubmit={editingRequest ? handleUpdateRequest : handleAddRequest}
            onCancel={handleCancelForm}
          />
        </div>
      )}

      <div className="additive-request-page__list-section">
        <AdditiveRequestList
          loading={loading}
          requests={requests}
          error={error}
          onEdit={handleEditRequest}
          onDelete={handleDeleteRequest}
          onView={(request) => {
            // Implementar visualização se necessário
            console.log("Visualizar solicitação:", request);
          }}
          onAddNew={() => setShowForm(true)}
        />
      </div>
    </div>
  );
};

export default AdditiveRequestPage;
