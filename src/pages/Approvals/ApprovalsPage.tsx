// src/pages/Approvals/ApprovalsPage.tsx
import React, { useState, useEffect, useContext } from "react";
import {
  FiRefreshCw,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiTrendingUp,
  FiFileText,
} from "react-icons/fi";
import { AuthContext } from "../../contexts/authContext";
import { workflowService } from "../../services/workflowService";
import { additiveRequestService } from "../../services/additiveRequestService";
import { useToast } from "../../hooks/useToast";
import { usePermissions } from "../../hooks/usePermissions";
import { HasRole } from "../../components/ui/HasRole";
import type { AdditiveRequest } from "../../types/additiveRequest";
import type {
  ApprovalStats,
  ApprovalActionFormData,
} from "../../types/approvalWorkflow";
import { Department } from "../../types/approvalWorkflow";
import ApprovalCard from "./components/ApprovalCard/ApprovalCard";
import ApprovalFilters from "./components/ApprovalFilters/ApprovalFilters";
import "./ApprovalsPage.css";

const ApprovalsPage: React.FC = () => {
  const { user } = useContext(AuthContext) || {};
  const { showSuccess, showError } = useToast();
  const { isCliente } = usePermissions();

  // Estados principais
  const [requests, setRequests] = useState<AdditiveRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<AdditiveRequest[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ApprovalStats | null>(null);

  // Estados de filtros
  const [filters, setFilters] = useState({
    status: "todos",
    priority: "todos",
    department: "todos",
    search: "",
  });

  // Estado do usuário atual
  const [currentUserDepartment] = useState<Department>(Department.ENGENHARIA);

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Aplicar filtros quando mudarem
  useEffect(() => {
    applyFilters();
  }, [requests, filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Garantir que o workflow está configurado
      try {
        await workflowService.setupDefaultWorkflow();
      } catch {
        // Continuar mesmo se a configuração falhar
      }

      let listForPage: AdditiveRequest[] = [];

      // Cliente vê todas as solicitações, outros veem apenas do departamento
      if (isCliente) {
        // Cliente vê todas as solicitações relacionadas à sua empresa
        if (user?.companyId) {
          const allRequests = await additiveRequestService.getAdditiveRequests(
            user.companyId
          );
          // Filtrar apenas solicitações que não estão em rascunho
          const nonDraft = allRequests.filter(
            (req) => req.status !== "rascunho"
          );
          listForPage = nonDraft;
        }
      } else {
        // Para não-clientes (admin/engenheiro/etc.), a lista da página deve permitir filtrar por qualquer status.
        // Portanto, carregamos TODAS as solicitações da empresa do usuário.
        if (user?.companyId) {
          const companyRequests =
            await additiveRequestService.getAdditiveRequests(user.companyId);
          listForPage = companyRequests; // inclui aprovadas/rejeitadas/pendentes
          // Se por algum motivo vier vazio (índices/regras), tenta carregar todas
          if (!listForPage || listForPage.length === 0) {
            try {
              const allRequests =
                await additiveRequestService.getAllAdditiveRequests();
              if (allRequests.length > 0) listForPage = allRequests;
            } catch {}
          }
        } else {
          // Admin sem companyId: carregar todas as solicitações
          const allRequests =
            await additiveRequestService.getAllAdditiveRequests();
          listForPage = allRequests;
        }
      }

      // Fallback: se ainda estiver vazio (regras/erro silencioso), tenta ao menos pendentes por departamento
      if (!listForPage || listForPage.length === 0) {
        try {
          const deptPendings =
            await workflowService.getPendingRequestsByDepartmentOptimized(
              currentUserDepartment
            );
          if (deptPendings && deptPendings.length > 0) {
            listForPage = deptPendings;
          }
        } catch {}
      }

      // Carregar estatísticas (apenas para não-clientes)
      if (!isCliente) {
        const workflowStats = await workflowService.getWorkflowStats();
        setStats(workflowStats as ApprovalStats);
      }

      setRequests(listForPage);
    } catch (err) {
      const errorMessage = "Erro ao carregar dados de aprovação";
      setError(errorMessage);
      showError("Erro ao carregar", errorMessage);
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...requests];

    // Filtro por status
    if (filters.status !== "todos") {
      filtered = filtered.filter(
        (request) => request.status === filters.status
      );
    }

    // Filtro por prioridade
    if (filters.priority !== "todos") {
      filtered = filtered.filter(
        (request) => request.prioridade === filters.priority
      );
    }

    // Filtro por departamento
    if (filters.department !== "todos") {
      filtered = filtered.filter((request) => {
        // Lógica para filtrar por departamento baseado na etapa atual
        return request.currentApprovalStep?.includes(filters.department);
      });
    }

    // Filtro por busca
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        (request) =>
          request.protocolo.toLowerCase().includes(searchTerm) ||
          request.descricao.toLowerCase().includes(searchTerm) ||
          request.justificativa.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredRequests(filtered);
  };

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleRefresh = () => {
    loadData();
  };

  const handleApprovalAction = async (
    requestId: string,
    action: "approve" | "reject" | "return",
    formData: ApprovalActionFormData
  ) => {
    try {
      setLoading(true);

      const request = requests.find((r) => r.id === requestId);
      if (!request || !request.currentApprovalStep) return;

      const approverId = user?.uid || "anonymous";
      const approverName = user?.displayName || "Usuário Anônimo";

      switch (action) {
        case "approve":
          await workflowService.approveStep(
            requestId,
            request.currentApprovalStep,
            approverId,
            approverName,
            formData
          );
          break;
        case "reject":
          await workflowService.rejectRequest(
            requestId,
            request.currentApprovalStep,
            approverId,
            approverName,
            formData
          );
          break;
        case "return":
          await workflowService.returnToPreviousStep(
            requestId,
            request.currentApprovalStep,
            approverId,
            approverName,
            formData
          );
          break;
      }

      showSuccess(
        "Ação realizada!",
        "A solicitação foi processada com sucesso."
      );
      await loadData(); // Recarregar dados
    } catch (err) {
      showError(
        "Erro ao processar",
        "Erro ao executar a ação. Tente novamente."
      );
      console.error("Erro ao processar ação:", err);
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentStats = () => {
    if (!stats) return null;

    return {
      pending:
        (stats as ApprovalStats).byDepartment[currentUserDepartment] || 0,
      total: (stats as ApprovalStats).total,
      approved: (stats as ApprovalStats).approved,
      rejected: (stats as ApprovalStats).rejected,
    };
  };

  const departmentStats = getDepartmentStats();

  if (loading && requests.length === 0) {
    return (
      <div className="approvals-page">
        <div className="approvals-page__loading">
          <FiRefreshCw className="approvals-page__loading-icon" />
          <p>Carregando aprovações...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="approvals-page">
        <div className="approvals-page__error">
          <FiAlertCircle className="approvals-page__error-icon" />
          <p>{error}</p>
          <button onClick={handleRefresh} className="approvals-page__retry-btn">
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="approvals-page">
      {/* Header */}
      <div className="approvals-page__header">
        <div className="approvals-page__title-section">
          <h1 className="approvals-page__title">
            <FiFileText className="approvals-page__title-icon" />
            Central de Aprovações
          </h1>
          <p className="approvals-page__subtitle">
            {isCliente
              ? "Visualize e acompanhe as solicitações de OSAs"
              : "Gerencie as solicitações de OSAs do seu departamento"}
          </p>
        </div>

        <div className="approvals-page__actions">
          <button
            onClick={handleRefresh}
            className="approvals-page__refresh-btn"
            disabled={loading}
          >
            <FiRefreshCw
              className={
                loading ? "approvals-page__refresh-icon--spinning" : ""
              }
            />
            Atualizar
          </button>
        </div>
      </div>

      {/* Estatísticas - Cliente não vê estatísticas detalhadas */}
      <HasRole
        roles={[
          "admin",
          "diretoria_masterwall",
          "engenheiro_obra",
          "assistente_obra",
          "suprimento_obra",
        ]}
      >
        {departmentStats && (
          <div className="approvals-page__stats">
            <div className="approvals-page__stat-card">
              <div className="approvals-page__stat-icon approvals-page__stat-icon--pending">
                <FiClock />
              </div>
              <div className="approvals-page__stat-content">
                <h3 className="approvals-page__stat-value">
                  {departmentStats.pending}
                </h3>
                <p className="approvals-page__stat-label">Pendentes</p>
              </div>
            </div>

            <div className="approvals-page__stat-card">
              <div className="approvals-page__stat-icon approvals-page__stat-icon--approved">
                <FiCheckCircle />
              </div>
              <div className="approvals-page__stat-content">
                <h3 className="approvals-page__stat-value">
                  {departmentStats.approved}
                </h3>
                <p className="approvals-page__stat-label">Aprovadas</p>
              </div>
            </div>

            <div className="approvals-page__stat-card">
              <div className="approvals-page__stat-icon approvals-page__stat-icon--rejected">
                <FiXCircle />
              </div>
              <div className="approvals-page__stat-content">
                <h3 className="approvals-page__stat-value">
                  {departmentStats.rejected}
                </h3>
                <p className="approvals-page__stat-label">Rejeitadas</p>
              </div>
            </div>

            <div className="approvals-page__stat-card">
              <div className="approvals-page__stat-icon approvals-page__stat-icon--total">
                <FiTrendingUp />
              </div>
              <div className="approvals-page__stat-content">
                <h3 className="approvals-page__stat-value">
                  {departmentStats.total}
                </h3>
                <p className="approvals-page__stat-label">Total</p>
              </div>
            </div>
          </div>
        )}
      </HasRole>

      {/* Filtros */}
      <ApprovalFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        loading={loading}
      />

      {/* Lista de solicitações */}
      <div className="approvals-page__content">
        {filteredRequests.length === 0 ? (
          <div className="approvals-page__empty">
            <FiFileText className="approvals-page__empty-icon" />
            <h3 className="approvals-page__empty-title">
              {filters.search ||
              filters.status !== "todos" ||
              filters.priority !== "todos"
                ? "Nenhuma solicitação encontrada"
                : "Nenhuma solicitação pendente"}
            </h3>
            <p className="approvals-page__empty-text">
              {filters.search ||
              filters.status !== "todos" ||
              filters.priority !== "todos"
                ? "Tente ajustar os filtros para encontrar solicitações."
                : "Não há solicitações aguardando aprovação no momento."}
            </p>
          </div>
        ) : (
          <div className="approvals-page__grid">
            {filteredRequests.map((request) => (
              <ApprovalCard
                key={request.id}
                request={request}
                onAction={handleApprovalAction}
                currentUserDepartment={currentUserDepartment}
                loading={loading}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovalsPage;
