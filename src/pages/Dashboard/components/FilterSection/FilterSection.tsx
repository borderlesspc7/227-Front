import React from "react";
import {
  FiFilter,
  FiCalendar,
  FiUser,
  FiCheckCircle,
  FiAlertTriangle,
  FiCircle,
} from "react-icons/fi";
import "./FilterSection.css";

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

import { type Contract } from "../../../../types/contracts";
import { type AdditiveRequest } from "../../../../types/additiveRequest";

interface FilterSectionProps {
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
  contracts: Contract[];
  requests: AdditiveRequest[];
}

const FilterSection: React.FC<FilterSectionProps> = ({
  filters,
  onFiltersChange,
  contracts,
  requests,
}) => {
  const updateFilter = (key: keyof DashboardFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const updateDateRange = (key: "startDate" | "endDate", value: string) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [key]: value,
      },
    });
  };

  // Obter lista única de criadores
  const creators = React.useMemo(() => {
    const uniqueCreators = [...new Set(requests.map((r) => r.createdBy))];
    return uniqueCreators.filter(
      (creator) => creator && creator !== "anonymous-user"
    );
  }, [requests]);

  // Resetar filtros
  const resetFilters = () => {
    onFiltersChange({
      dateRange: {
        startDate: new Date(new Date().getFullYear(), 0, 1)
          .toISOString()
          .split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
      },
      status: "todos",
      priority: "todos",
      contractId: "todos",
      createdBy: "todos",
    });
  };

  // Filtros rápidos
  const quickFilters = [
    {
      label: "Últimos 7 dias",
      onClick: () => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);

        onFiltersChange({
          ...filters,
          dateRange: {
            startDate: startDate.toISOString().split("T")[0],
            endDate: endDate.toISOString().split("T")[0],
          },
        });
      },
    },
    {
      label: "Último mês",
      onClick: () => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);

        onFiltersChange({
          ...filters,
          dateRange: {
            startDate: startDate.toISOString().split("T")[0],
            endDate: endDate.toISOString().split("T")[0],
          },
        });
      },
    },
    {
      label: "Últimos 3 meses",
      onClick: () => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 3);

        onFiltersChange({
          ...filters,
          dateRange: {
            startDate: startDate.toISOString().split("T")[0],
            endDate: endDate.toISOString().split("T")[0],
          },
        });
      },
    },
    {
      label: "Este ano",
      onClick: () => {
        const endDate = new Date();
        const startDate = new Date(endDate.getFullYear(), 0, 1);

        onFiltersChange({
          ...filters,
          dateRange: {
            startDate: startDate.toISOString().split("T")[0],
            endDate: endDate.toISOString().split("T")[0],
          },
        });
      },
    },
  ];

  return (
    <div className="filter-section">
      <div className="filter-section__header">
        <h3 className="filter-section__title">
          <FiFilter />
          Filtros Avançados
        </h3>
        <button className="filter-section__reset-btn" onClick={resetFilters}>
          Limpar Filtros
        </button>
      </div>

      <div className="filter-section__content">
        {/* Filtros rápidos */}
        <div className="filter-section__quick-filters">
          <span className="filter-section__quick-label">Período:</span>
          {quickFilters.map((filter, index) => (
            <button
              key={index}
              className="filter-section__quick-btn"
              onClick={filter.onClick}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Filtros principais */}
        <div className="filter-section__main-filters">
          {/* Data Range */}
          <div className="filter-section__filter-group">
            <label className="filter-section__label">
              <FiCalendar />
              Período Personalizado
            </label>
            <div className="filter-section__date-range">
              <input
                type="date"
                className="filter-section__input filter-section__input--date"
                value={filters.dateRange.startDate}
                onChange={(e) => updateDateRange("startDate", e.target.value)}
              />
              <span className="filter-section__date-separator">até</span>
              <input
                type="date"
                className="filter-section__input filter-section__input--date"
                value={filters.dateRange.endDate}
                onChange={(e) => updateDateRange("endDate", e.target.value)}
              />
            </div>
          </div>

          {/* Status */}
          <div className="filter-section__filter-group">
            <label className="filter-section__label">
              <FiCheckCircle />
              Status
            </label>
            <select
              className="filter-section__select"
              value={filters.status}
              onChange={(e) => updateFilter("status", e.target.value)}
            >
              <option value="todos">Todos os Status</option>
              <option value="rascunho">🟠 Rascunho</option>
              <option value="pendente">🟡 Pendente</option>
              <option value="aprovado">🟢 Aprovado</option>
              <option value="rejeitado">🔴 Rejeitado</option>
            </select>
          </div>

          {/* Prioridade */}
          <div className="filter-section__filter-group">
            <label className="filter-section__label">
              <FiAlertTriangle />
              Prioridade
            </label>
            <select
              className="filter-section__select"
              value={filters.priority}
              onChange={(e) => updateFilter("priority", e.target.value)}
            >
              <option value="todos">Todas as Prioridades</option>
              <option value="urgente">🔴 Urgente</option>
              <option value="alta">🟠 Alta</option>
              <option value="media">🟡 Média</option>
              <option value="baixa">🟢 Baixa</option>
            </select>
          </div>

          {/* Contrato */}
          <div className="filter-section__filter-group">
            <label className="filter-section__label">
              <FiCircle />
              Contrato/Obra
            </label>
            <select
              className="filter-section__select"
              value={filters.contractId}
              onChange={(e) => updateFilter("contractId", e.target.value)}
            >
              <option value="todos">Todos os Contratos</option>
              {contracts.map((contract) => (
                <option key={contract.id} value={contract.id}>
                  {contract.numeroContrato} - {contract.cliente}
                </option>
              ))}
            </select>
          </div>

          {/* Responsável */}
          <div className="filter-section__filter-group">
            <label className="filter-section__label">
              <FiUser />
              Responsável
            </label>
            <select
              className="filter-section__select"
              value={filters.createdBy}
              onChange={(e) => updateFilter("createdBy", e.target.value)}
            >
              <option value="todos">Todos os Responsáveis</option>
              {creators.map((creator) => (
                <option key={creator} value={creator}>
                  {creator}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterSection;
