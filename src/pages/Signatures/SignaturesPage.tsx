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
  const [generatingDocuments, setGeneratingDocuments] = useState(false);

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

  const handleGenerateMissingDocuments = async () => {
    try {
      setGeneratingDocuments(true);
      setError(null);
      
      const result = await assinaturaService.generateMissingDocuments(user?.companyId);
      
      if (result.generated > 0) {
        showSuccess(
          "Documentos gerados!",
          `${result.generated} documento(s) de assinatura foram gerados com sucesso.${result.errors > 0 ? ` ${result.errors} erro(s) ocorreram.` : ""}`
        );
        // Recarregar lista após gerar documentos
        await loadSignatures();
      } else {
        showSuccess(
          "Nenhum documento necessário",
          "Todas as solicitações aprovadas já possuem documentos de assinatura."
        );
      }
    } catch (error) {
      const errorMessage = "Erro ao gerar documentos faltantes";
      setError(errorMessage);
      showError(errorMessage + ". Verifique o console para mais detalhes.");
      console.error(error);
    } finally {
      setGeneratingDocuments(false);
    }
  };

  return (
    <div className="signatures-page">
      <div className="signatures-page__header">
        <h1 className="signatures-page__title">Documentos Assinados</h1>
        <div className="signatures-page__actions">
          {(user?.role === "admin" || user?.role === "diretor") && (
            <button
              className="signatures-page__generate-btn"
              onClick={handleGenerateMissingDocuments}
              disabled={generatingDocuments || loading}
              type="button"
              title="Gerar documentos de assinatura para solicitações aprovadas que ainda não têm documento"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10,9 9,9 8,9"></polyline>
              </svg>
              {generatingDocuments ? "Gerando..." : "Gerar Documentos Faltantes"}
            </button>
          )}
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

