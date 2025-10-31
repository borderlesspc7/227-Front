import React, { useState, useEffect, useContext } from "react";
import { assinaturaService, type AssinaturaRecord } from "../../services/assinaturaService";
import { useToast } from "../../hooks/useToast";
import { AuthContext } from "../../contexts/authContext";
import SignaturesList from "./List/SignaturesList";
import "./SignaturesPage.css";

const SignaturesPage: React.FC = () => {
  const { showError, showSuccess } = useToast();
  const { user } = useContext(AuthContext) || {};

  const [signatures, setSignatures] = useState<AssinaturaRecord[]>([]);
  const [filteredSignatures, setFilteredSignatures] = useState<AssinaturaRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("todos");

  useEffect(() => {
    loadSignatures();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [signatures, statusFilter]);

  const loadSignatures = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: { clienteId?: string; status?: "Pendente" | "Assinado" | "Recusado" } = {};
      
      // Cliente só vê suas próprias assinaturas
      if (user?.uid) {
        params.clienteId = user.uid;
      }

      const allSignatures = await assinaturaService.getAllSignatures(params);
      setSignatures(allSignatures);
    } catch (error) {
      const errorMessage = "Erro ao carregar assinaturas";
      setError(errorMessage);
      showError(errorMessage + ". Verifique sua conexão e tente novamente.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...signatures];

    if (statusFilter !== "todos") {
      filtered = filtered.filter(
        (sig) => sig.status === statusFilter
      );
    }

    setFilteredSignatures(filtered);
  };

  const handleStatusFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus);
  };

  const handleRefresh = () => {
    loadSignatures();
  };

  return (
    <div className="signatures-page">
      <div className="signatures-page__header">
        <h1 className="signatures-page__title">Documentos Assinados</h1>
        <button
          className="signatures-page__refresh-btn"
          onClick={handleRefresh}
          disabled={loading}
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
          Atualizar
        </button>
      </div>

      {loading && signatures.length === 0 && (
        <div className="signatures-page__loading">
          <p>Carregando assinaturas...</p>
        </div>
      )}

      {error && (
        <div className="signatures-page__error">
          <p>Erro: {error}</p>
        </div>
      )}

      <div className="signatures-page__filters">
        <div className="signatures-page__filter-group">
          <label htmlFor="status-filter" className="signatures-page__filter-label">
            Status:
          </label>
          <select
            id="status-filter"
            className="signatures-page__filter-select"
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="Pendente">Pendente</option>
            <option value="Assinado">Assinado</option>
            <option value="Recusado">Recusado</option>
          </select>
        </div>
        <div className="signatures-page__stats">
          <span className="signatures-page__stat">
            Total: {signatures.length}
          </span>
          <span className="signatures-page__stat">
            Assinados: {signatures.filter(s => s.status === "Assinado").length}
          </span>
          <span className="signatures-page__stat">
            Pendentes: {signatures.filter(s => s.status === "Pendente").length}
          </span>
        </div>
      </div>

      <div className="signatures-page__list-section">
        <SignaturesList
          loading={loading}
          signatures={filteredSignatures}
          error={error}
          onRefresh={handleRefresh}
        />
      </div>
    </div>
  );
};

export default SignaturesPage;

