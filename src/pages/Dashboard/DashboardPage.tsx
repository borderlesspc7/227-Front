import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  FiBarChart,
  FiTrendingUp,
  FiDollarSign,
  FiFileText,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiXCircle,
} from "react-icons/fi";
import { type AdditiveRequest } from "../../types/additiveRequest";
import { type Contract } from "../../types/contracts";
import { additiveRequestService } from "../../services/additiveRequestService";
import { contractService } from "../../services/contractService";
import { trendsService } from "../../services/trendsService";
import { useToast } from "../../hooks/useToast";
import { useAuth } from "../../hooks/useAuth";
import { usePermissions } from "../../hooks/usePermissions";
import KPICard from "./components/KPICard/KPICard";
import FilterSection from "./components/FilterSection/FilterSection";
import ChartSection from "./components/ChartSection/ChartSection";
import RecentActivities from "./components/RecentActivities/RecentActivities";
import AlertDashboard from "../../components/ui/AlertDashboard/AlertDashboard";
import { CompanySetupPrompt } from "../../components/ui/CompanySetupPrompt/CompanySetupPrompt";
import ClientDashboard from "./ClientDashboard/ClientDashboard";
import "./DashboardPage.css";

interface DashboardFilters {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  status: string;
  priority: string;
  contractId: string;
  createdBy: string;
}

const DashboardPage: React.FC = () => {
  const { showError } = useToast();
  const { user } = useAuth();
  const { isCliente } = usePermissions();

  // Se for cliente, mostrar dashboard simplificado
  if (isCliente) {
    return <ClientDashboard />;
  }

  // Função estável para mostrar erro
  const handleError = useCallback((title: string, message: string) => {
    showError(title, message);
  }, [showError]);

  // Estados
  const [requests, setRequests] = useState<AdditiveRequest[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [trends, setTrends] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<DashboardFilters>({
    dateRange: {
      startDate: new Date(new Date().getFullYear(), 0, 1)
        .toISOString()
        .split("T")[0], // Início do ano
      endDate: new Date().toISOString().split("T")[0], // Hoje
    },
    status: "todos",
    priority: "todos",
    contractId: "todos",
    createdBy: "todos",
  });

  // Carregamento de dados
  useEffect(() => {
    const loadData = async () => {
      if (!user?.companyId) {
        console.warn("Usuário sem companyId, não é possível carregar dados");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [requestsData, contractsData, trendsData] = await Promise.all([
          additiveRequestService.getAdditiveRequests(user.companyId),
          contractService.getContracts(user.companyId),
          trendsService.calculateTrends(user.companyId),
        ]);

        setRequests(requestsData);
        setContracts(contractsData);
        setTrends(trendsData);
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
        handleError("Erro", "Erro ao carregar dados do dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (user?.companyId) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user?.companyId, handleError]);

  // Dados filtrados
  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      // Filtro por data
      const requestDate = new Date(request.createdAt);
      const startDate = new Date(filters.dateRange.startDate);
      const endDate = new Date(filters.dateRange.endDate + "T23:59:59");

      if (requestDate < startDate || requestDate > endDate) {
        return false;
      }

      // Filtro por status
      if (filters.status !== "todos" && request.status !== filters.status) {
        return false;
      }

      // Filtro por prioridade
      if (
        filters.priority !== "todos" &&
        request.prioridade !== filters.priority
      ) {
        return false;
      }

      // Filtro por contrato
      if (
        filters.contractId !== "todos" &&
        request.contratoId !== filters.contractId
      ) {
        return false;
      }

      // Filtro por responsável
      if (
        filters.createdBy !== "todos" &&
        request.createdBy !== filters.createdBy
      ) {
        return false;
      }

      return true;
    });
  }, [requests, filters]);

  // Cálculos dos KPIs
  const kpis = useMemo(() => {
    const total = filteredRequests.length;
    const aprovados = filteredRequests.filter(
      (r) => r.status === "aprovado"
    ).length;
    const pendentes = filteredRequests.filter(
      (r) => r.status === "pendente"
    ).length;
    const rejeitados = filteredRequests.filter(
      (r) => r.status === "rejeitado"
    ).length;
    const rascunhos = filteredRequests.filter(
      (r) => r.status === "rascunho"
    ).length;

    const valorTotal = filteredRequests.reduce(
      (sum, r) => sum + r.valorTotal,
      0
    );
    const valorAprovado = filteredRequests
      .filter((r) => r.status === "aprovado")
      .reduce((sum, r) => sum + r.valorTotal, 0);
    const valorPendente = filteredRequests
      .filter((r) => r.status === "pendente")
      .reduce((sum, r) => sum + r.valorTotal, 0);

    const percentualAprovacao = total > 0 ? (aprovados / total) * 100 : 0;

    return {
      total,
      aprovados,
      pendentes,
      rejeitados,
      rascunhos,
      valorTotal,
      valorAprovado,
      valorPendente,
      percentualAprovacao,
    };
  }, [filteredRequests]);

  // Dados para gráficos
  const chartData = useMemo(() => {
    // Dados por status
    const statusData = [
      { name: "Aprovados", value: kpis.aprovados, color: "#10B981" },
      { name: "Pendentes", value: kpis.pendentes, color: "#F59E0B" },
      { name: "Rejeitados", value: kpis.rejeitados, color: "#EF4444" },
      { name: "Rascunhos", value: kpis.rascunhos, color: "#6B7280" },
    ];

    // Dados por prioridade
    const priorityData = [
      {
        name: "Urgente",
        value: filteredRequests.filter((r) => r.prioridade === "urgente")
          .length,
        color: "#DC2626",
      },
      {
        name: "Alta",
        value: filteredRequests.filter((r) => r.prioridade === "alta").length,
        color: "#EA580C",
      },
      {
        name: "Média",
        value: filteredRequests.filter((r) => r.prioridade === "media").length,
        color: "#D97706",
      },
      {
        name: "Baixa",
        value: filteredRequests.filter((r) => r.prioridade === "baixa").length,
        color: "#059669",
      },
    ];

    // Dados por mês (últimos 6 meses)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleDateString("pt-BR", {
        month: "short",
        year: "2-digit",
      });

      const monthRequests = filteredRequests.filter((r) => {
        const requestDate = new Date(r.createdAt);
        return (
          requestDate.getMonth() === date.getMonth() &&
          requestDate.getFullYear() === date.getFullYear()
        );
      });

      monthlyData.push({
        month: monthName,
        total: monthRequests.length,
        aprovados: monthRequests.filter((r) => r.status === "aprovado").length,
        valor: monthRequests.reduce((sum, r) => sum + r.valorTotal, 0),
      });
    }

    return {
      statusData,
      priorityData,
      monthlyData,
    };
  }, [filteredRequests, kpis]);

  // Função para formatar moeda
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-page__loading">
          <div className="dashboard-page__loading-spinner"></div>
          <p>Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  // Se o usuário não tem companyId, exibir prompt de configuração
  if (!user?.companyId) {
    return <CompanySetupPrompt />;
  }

  return (
    <div className="dashboard-page">
      {/* Cabeçalho */}
      <div className="dashboard-page__header">
        <div className="dashboard-page__title-section">
          <h1 className="dashboard-page__title">
            <FiBarChart className="dashboard-page__title-icon" />
            Dashboard Gerencial
          </h1>
          <p className="dashboard-page__subtitle">
            Visão geral das Ordens de Serviços Adicionais (OSAs)
          </p>
        </div>
        <div className="dashboard-page__period">
          <FiCalendar />
          {new Date(filters.dateRange.startDate).toLocaleDateString(
            "pt-BR"
          )} - {new Date(filters.dateRange.endDate).toLocaleDateString("pt-BR")}
        </div>
      </div>

      {/* Alertas Avançados */}
      <AlertDashboard />

      {/* Filtros */}
      <FilterSection
        filters={filters}
        onFiltersChange={setFilters}
        contracts={contracts}
        requests={requests}
      />

      {/* KPIs */}
      <div className="dashboard-page__kpis">
        <KPICard
          title="Total de OSAs"
          value={kpis.total.toString()}
          icon={<FiFileText />}
          trend={trends?.totalRequests?.trend || "0%"}
          trendType={trends?.totalRequests?.trendType || "neutral"}
          color="blue"
        />

        <KPICard
          title="Taxa de Aprovação"
          value={`${kpis.percentualAprovacao.toFixed(1)}%`}
          icon={<FiCheckCircle />}
          trend={trends?.approvalRate?.trend || "0%"}
          trendType={trends?.approvalRate?.trendType || "neutral"}
          color="green"
        />

        <KPICard
          title="Valor Total"
          value={formatCurrency(kpis.valorTotal)}
          icon={<FiDollarSign />}
          trend={trends?.totalValue?.trend || "0%"}
          trendType={trends?.totalValue?.trendType || "neutral"}
          color="purple"
        />

        <KPICard
          title="Valor Aprovado"
          value={formatCurrency(kpis.valorAprovado)}
          icon={<FiTrendingUp />}
          trend={trends?.approvedValue?.trend || "0%"}
          trendType={trends?.approvedValue?.trendType || "neutral"}
          color="green"
        />

        <KPICard
          title="Pendentes"
          value={kpis.pendentes.toString()}
          icon={<FiClock />}
          trend={trends?.pendingRequests?.trend || "0%"}
          trendType={trends?.pendingRequests?.trendType || "neutral"}
          color="orange"
        />

        <KPICard
          title="Rejeitados"
          value={kpis.rejeitados.toString()}
          icon={<FiXCircle />}
          trend={trends?.rejectedRequests?.trend || "0%"}
          trendType={trends?.rejectedRequests?.trendType || "neutral"}
          color="red"
        />
      </div>

      {/* Gráficos */}
      <ChartSection
        statusData={chartData.statusData}
        priorityData={chartData.priorityData}
        monthlyData={chartData.monthlyData}
      />

      {/* Atividades Recentes */}
      <RecentActivities
        requests={filteredRequests.slice(0, 10)}
        contracts={contracts}
      />
    </div>
  );
};

export default DashboardPage;
