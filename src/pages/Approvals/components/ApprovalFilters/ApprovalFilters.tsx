// src/pages/Approvals/components/ApprovalFilters/ApprovalFilters.tsx
import React from "react";
import { FiFilter, FiSearch, FiX } from "react-icons/fi";
import "./ApprovalFilters.css";

interface FilterState {
  status: string;
  priority: string;
  department: string;
  search: string;
}

interface ApprovalFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  loading?: boolean;
}

const ApprovalFilters: React.FC<ApprovalFiltersProps> = ({
  filters,
  onFilterChange,
  loading = false,
}) => {
  const statusOptions = [
    { value: "todos", label: "Todos os Status" },
    { value: "rascunho", label: "Rascunho" },
    { value: "pendente", label: "Pendente" },
    { value: "aprovado", label: "Aprovado" },
    { value: "rejeitado", label: "Rejeitado" },
    { value: "cancelado", label: "Cancelado" },
  ];

  const priorityOptions = [
    { value: "todos", label: "Todas as Prioridades" },
    { value: "baixa", label: "Baixa" },
    { value: "media", label: "Média" },
    { value: "alta", label: "Alta" },
    { value: "urgente", label: "Urgente" },
  ];

  const departmentOptions = [
    { value: "todos", label: "Todos os Departamentos" },
    { value: "engenharia", label: "Engenharia" },
    { value: "suprimentos", label: "Suprimentos" },
    { value: "diretoria", label: "Diretoria" },
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ search: e.target.value });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ status: e.target.value });
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ priority: e.target.value });
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ department: e.target.value });
  };

  const clearFilters = () => {
    onFilterChange({
      status: "todos",
      priority: "todos",
      department: "todos",
      search: "",
    });
  };

  const hasActiveFilters = () => {
    return (
      filters.status !== "todos" ||
      filters.priority !== "todos" ||
      filters.department !== "todos" ||
      filters.search !== ""
    );
  };

  return (
    <div className="approval-filters">
      <div className="approval-filters__header">
        <div className="approval-filters__title-section">
          <FiFilter className="approval-filters__title-icon" />
          <h3 className="approval-filters__title">Filtros</h3>
        </div>

        {hasActiveFilters() && (
          <button
            onClick={clearFilters}
            className="approval-filters__clear-btn"
            disabled={loading}
          >
            <FiX />
            Limpar Filtros
          </button>
        )}
      </div>

      <div className="approval-filters__content">
        {/* Busca */}
        <div className="approval-filters__field approval-filters__field--search">
          <label className="approval-filters__label">
            <FiSearch className="approval-filters__label-icon" />
            Buscar
          </label>
          <input
            type="text"
            className="approval-filters__search-input"
            placeholder="Buscar por protocolo, descrição ou justificativa..."
            value={filters.search}
            onChange={handleSearchChange}
            disabled={loading}
          />
        </div>

        {/* Status */}
        <div className="approval-filters__field">
          <label className="approval-filters__label">Status</label>
          <select
            className="approval-filters__select"
            value={filters.status}
            onChange={handleStatusChange}
            disabled={loading}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Prioridade */}
        <div className="approval-filters__field">
          <label className="approval-filters__label">Prioridade</label>
          <select
            className="approval-filters__select"
            value={filters.priority}
            onChange={handlePriorityChange}
            disabled={loading}
          >
            {priorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Departamento */}
        <div className="approval-filters__field">
          <label className="approval-filters__label">Departamento</label>
          <select
            className="approval-filters__select"
            value={filters.department}
            onChange={handleDepartmentChange}
            disabled={loading}
          >
            {departmentOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filtros Ativos */}
      {hasActiveFilters() && (
        <div className="approval-filters__active">
          <span className="approval-filters__active-label">
            Filtros ativos:
          </span>
          <div className="approval-filters__active-tags">
            {filters.status !== "todos" && (
              <span className="approval-filters__active-tag">
                Status:{" "}
                {
                  statusOptions.find((opt) => opt.value === filters.status)
                    ?.label
                }
              </span>
            )}
            {filters.priority !== "todos" && (
              <span className="approval-filters__active-tag">
                Prioridade:{" "}
                {
                  priorityOptions.find((opt) => opt.value === filters.priority)
                    ?.label
                }
              </span>
            )}
            {filters.department !== "todos" && (
              <span className="approval-filters__active-tag">
                Departamento:{" "}
                {
                  departmentOptions.find(
                    (opt) => opt.value === filters.department
                  )?.label
                }
              </span>
            )}
            {filters.search && (
              <span className="approval-filters__active-tag">
                Busca: "{filters.search}"
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalFilters;
