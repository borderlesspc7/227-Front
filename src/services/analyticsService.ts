import type { AdditiveRequest } from "../types/additiveRequest";
import type { Contract } from "../types/contracts";
import { additiveRequestService } from "./additiveRequestService";
import { contractService } from "./contractService";

export interface AnalyticsData {
  totalRequests: number;
  approvedRequests: number;
  pendingRequests: number;
  rejectedRequests: number;
  draftRequests: number;
  totalValue: number;
  approvedValue: number;
  pendingValue: number;
  rejectedValue: number;
  approvalRate: number;
  averageValue: number;
  topContracts: Array<{
    contractId: string;
    contractName: string;
    requestCount: number;
    totalValue: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    year: number;
    totalRequests: number;
    approvedRequests: number;
    totalValue: number;
    approvedValue: number;
  }>;
  priorityDistribution: Array<{
    priority: string;
    count: number;
    percentage: number;
  }>;
  statusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  creatorStats: Array<{
    createdBy: string;
    requestCount: number;
    approvalRate: number;
    totalValue: number;
  }>;
}

export interface AnalyticsFilters {
  startDate?: Date;
  endDate?: Date;
  status?: string[];
  priority?: string[];
  contractIds?: string[];
  createdBy?: string[];
}

class AnalyticsService {
  /**
   * Obter dados analíticos gerais
   */
  async getAnalyticsData(filters?: AnalyticsFilters): Promise<AnalyticsData> {
    try {
      const [requests, contracts] = await Promise.all([
        additiveRequestService.getAdditiveRequests(),
        contractService.getContracts(),
      ]);

      // Aplicar filtros
      const filteredRequests = this.applyFilters(requests, filters);

      return this.processAnalyticsData(filteredRequests, contracts);
    } catch (error) {
      console.error("Erro ao obter dados analíticos:", error);
      throw error;
    }
  }

  /**
   * Obter dados para comparação de períodos
   */
  async getComparativeData(
    currentFilters: AnalyticsFilters,
    previousFilters: AnalyticsFilters
  ): Promise<{
    current: AnalyticsData;
    previous: AnalyticsData;
    trends: Record<string, number>;
  }> {
    try {
      const [currentData, previousData] = await Promise.all([
        this.getAnalyticsData(currentFilters),
        this.getAnalyticsData(previousFilters),
      ]);

      const trends = this.calculateTrends(currentData, previousData);

      return {
        current: currentData,
        previous: previousData,
        trends,
      };
    } catch (error) {
      console.error("Erro ao obter dados comparativos:", error);
      throw error;
    }
  }

  /**
   * Exportar dados para relatório
   */
  async exportReport(
    format: "csv" | "json" | "excel",
    filters?: AnalyticsFilters
  ): Promise<string> {
    try {
      const data = await this.getAnalyticsData(filters);

      switch (format) {
        case "csv":
          return this.exportToCsv(data);
        case "json":
          return JSON.stringify(data, null, 2);
        case "excel":
          return this.exportToExcel(data);
        default:
          throw new Error("Formato não suportado");
      }
    } catch (error) {
      console.error("Erro ao exportar relatório:", error);
      throw error;
    }
  }

  /**
   * Aplicar filtros aos dados
   */
  private applyFilters(
    requests: AdditiveRequest[],
    filters?: AnalyticsFilters
  ): AdditiveRequest[] {
    if (!filters) return requests;

    return requests.filter((request) => {
      // Filtro por data
      if (filters.startDate && request.createdAt < filters.startDate) {
        return false;
      }
      if (filters.endDate && request.createdAt > filters.endDate) {
        return false;
      }

      // Filtro por status
      if (
        filters.status &&
        filters.status.length > 0 &&
        !filters.status.includes(request.status)
      ) {
        return false;
      }

      // Filtro por prioridade
      if (
        filters.priority &&
        filters.priority.length > 0 &&
        !filters.priority.includes(request.prioridade)
      ) {
        return false;
      }

      // Filtro por contrato
      if (
        filters.contractIds &&
        filters.contractIds.length > 0 &&
        !filters.contractIds.includes(request.contratoId)
      ) {
        return false;
      }

      // Filtro por criador
      if (
        filters.createdBy &&
        filters.createdBy.length > 0 &&
        !filters.createdBy.includes(request.createdBy)
      ) {
        return false;
      }

      return true;
    });
  }

  /**
   * Processar dados analíticos
   */
  private processAnalyticsData(
    requests: AdditiveRequest[],
    contracts: Contract[]
  ): AnalyticsData {
    const totalRequests = requests.length;
    const approvedRequests = requests.filter(
      (r) => r.status === "aprovado"
    ).length;
    const pendingRequests = requests.filter(
      (r) => r.status === "pendente"
    ).length;
    const rejectedRequests = requests.filter(
      (r) => r.status === "rejeitado"
    ).length;
    const draftRequests = requests.filter(
      (r) => r.status === "rascunho"
    ).length;

    const totalValue = requests.reduce((sum, r) => sum + r.valorTotal, 0);
    const approvedValue = requests
      .filter((r) => r.status === "aprovado")
      .reduce((sum, r) => sum + r.valorTotal, 0);
    const pendingValue = requests
      .filter((r) => r.status === "pendente")
      .reduce((sum, r) => sum + r.valorTotal, 0);
    const rejectedValue = requests
      .filter((r) => r.status === "rejeitado")
      .reduce((sum, r) => sum + r.valorTotal, 0);

    const approvalRate =
      totalRequests > 0 ? (approvedRequests / totalRequests) * 100 : 0;
    const averageValue = totalRequests > 0 ? totalValue / totalRequests : 0;

    // Top contratos
    const contractStats = new Map<string, { count: number; value: number }>();
    requests.forEach((request) => {
      const current = contractStats.get(request.contratoId) || {
        count: 0,
        value: 0,
      };
      contractStats.set(request.contratoId, {
        count: current.count + 1,
        value: current.value + request.valorTotal,
      });
    });

    const topContracts = Array.from(contractStats.entries())
      .map(([contractId, stats]) => {
        const contract = contracts.find((c) => c.id === contractId);
        return {
          contractId,
          contractName: contract
            ? `${contract.numeroContrato} - ${contract.cliente}`
            : contractId,
          requestCount: stats.count,
          totalValue: stats.value,
        };
      })
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 10);

    // Tendências mensais (últimos 12 meses)
    const monthlyTrends = this.calculateMonthlyTrends(requests);

    // Distribuição por prioridade
    const priorityDistribution = this.calculatePriorityDistribution(requests);

    // Distribuição por status
    const statusDistribution = this.calculateStatusDistribution(requests);

    // Estatísticas por criador
    const creatorStats = this.calculateCreatorStats(requests);

    return {
      totalRequests,
      approvedRequests,
      pendingRequests,
      rejectedRequests,
      draftRequests,
      totalValue,
      approvedValue,
      pendingValue,
      rejectedValue,
      approvalRate,
      averageValue,
      topContracts,
      monthlyTrends,
      priorityDistribution,
      statusDistribution,
      creatorStats,
    };
  }

  /**
   * Calcular tendências mensais
   */
  private calculateMonthlyTrends(requests: AdditiveRequest[]) {
    const monthlyData = new Map<
      string,
      {
        totalRequests: number;
        approvedRequests: number;
        totalValue: number;
        approvedValue: number;
      }
    >();

    // Inicializar últimos 12 meses
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      monthlyData.set(key, {
        totalRequests: 0,
        approvedRequests: 0,
        totalValue: 0,
        approvedValue: 0,
      });
    }

    // Processar dados
    requests.forEach((request) => {
      const date = new Date(request.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}`;

      if (monthlyData.has(key)) {
        const current = monthlyData.get(key)!;
        current.totalRequests += 1;
        current.totalValue += request.valorTotal;

        if (request.status === "aprovado") {
          current.approvedRequests += 1;
          current.approvedValue += request.valorTotal;
        }
      }
    });

    return Array.from(monthlyData.entries()).map(([key, data]) => {
      const [year, month] = key.split("-");
      const monthName = new Date(
        parseInt(year),
        parseInt(month) - 1
      ).toLocaleDateString("pt-BR", {
        month: "short",
      });

      return {
        month: monthName,
        year: parseInt(year),
        ...data,
      };
    });
  }

  /**
   * Calcular distribuição por prioridade
   */
  private calculatePriorityDistribution(requests: AdditiveRequest[]) {
    const distribution = new Map<string, number>();

    requests.forEach((request) => {
      const value = String(request.prioridade);
      distribution.set(value, (distribution.get(value) || 0) + 1);
    });

    const total = requests.length;

    return Array.from(distribution.entries()).map(([key, count]) => ({
      priority: key,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    }));
  }

  /**
   * Calcular distribuição por status
   */
  private calculateStatusDistribution(requests: AdditiveRequest[]) {
    const distribution = new Map<string, number>();

    requests.forEach((request) => {
      const value = String(request.status);
      distribution.set(value, (distribution.get(value) || 0) + 1);
    });

    const total = requests.length;

    return Array.from(distribution.entries()).map(([key, count]) => ({
      status: key,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    }));
  }

  /**
   * Calcular estatísticas por criador
   */
  private calculateCreatorStats(requests: AdditiveRequest[]) {
    const creatorData = new Map<
      string,
      {
        total: number;
        approved: number;
        value: number;
      }
    >();

    requests.forEach((request) => {
      const current = creatorData.get(request.createdBy) || {
        total: 0,
        approved: 0,
        value: 0,
      };
      current.total += 1;
      current.value += request.valorTotal;

      if (request.status === "aprovado") {
        current.approved += 1;
      }

      creatorData.set(request.createdBy, current);
    });

    return Array.from(creatorData.entries())
      .map(([createdBy, stats]) => ({
        createdBy,
        requestCount: stats.total,
        approvalRate:
          stats.total > 0 ? (stats.approved / stats.total) * 100 : 0,
        totalValue: stats.value,
      }))
      .sort((a, b) => b.requestCount - a.requestCount);
  }

  /**
   * Calcular tendências comparativas
   */
  private calculateTrends(
    current: AnalyticsData,
    previous: AnalyticsData
  ): Record<string, number> {
    const calculatePercentageChange = (
      current: number,
      previous: number
    ): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      totalRequests: calculatePercentageChange(
        current.totalRequests,
        previous.totalRequests
      ),
      approvedRequests: calculatePercentageChange(
        current.approvedRequests,
        previous.approvedRequests
      ),
      totalValue: calculatePercentageChange(
        current.totalValue,
        previous.totalValue
      ),
      approvalRate: calculatePercentageChange(
        current.approvalRate,
        previous.approvalRate
      ),
    };
  }

  /**
   * Exportar para CSV
   */
  private exportToCsv(data: AnalyticsData): string {
    const lines = [
      "Métrica,Valor",
      `Total de Solicitações,${data.totalRequests}`,
      `Solicitações Aprovadas,${data.approvedRequests}`,
      `Taxa de Aprovação,${data.approvalRate.toFixed(2)}%`,
      `Valor Total,R$ ${data.totalValue.toLocaleString("pt-BR")}`,
      `Valor Aprovado,R$ ${data.approvedValue.toLocaleString("pt-BR")}`,
      "",
      "Top Contratos:",
      "Contrato,Quantidade,Valor Total",
      ...data.topContracts.map(
        (contract) =>
          `"${contract.contractName}",${
            contract.requestCount
          },R$ ${contract.totalValue.toLocaleString("pt-BR")}`
      ),
    ];

    return lines.join("\n");
  }

  /**
   * Exportar para Excel (simulado como CSV com separador ;)
   */
  private exportToExcel(data: AnalyticsData): string {
    return this.exportToCsv(data).replace(/,/g, ";");
  }
}

export const analyticsService = new AnalyticsService();
