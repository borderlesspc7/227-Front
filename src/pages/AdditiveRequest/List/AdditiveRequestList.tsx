import React, { useState, useMemo } from "react";
import {
  FiSearch,
  FiFilter,
  FiEdit,
  FiTrash2,
  FiEye,
  FiPackage,
  FiCalendar,
  FiDollarSign,
  FiFileText,
} from "react-icons/fi";
import { type AdditiveRequest } from "../../../types/additiveRequest";
import { useToast } from "../../../hooks/useToast";
import "./AdditiveRequestList.css";

interface AdditiveRequestListProps {
  requests: AdditiveRequest[];
  loading: boolean;
  error: string | null;
  onEdit: (request: AdditiveRequest) => void;
  onDelete: (id: string) => void;
  onView: (request: AdditiveRequest) => void;
  onAddNew: () => void;
}

const AdditiveRequestList: React.FC<AdditiveRequestListProps> = ({
  requests,
  loading,
  error,
  onEdit,
  onDelete,
  onView,
  onAddNew,
}) => {
  const { showSuccess, showError } = useToast();

  // Estados para filtros
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [priorityFilter, setPriorityFilter] = useState<string>("todos");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Opções de filtro
  const statusOptions = [
    { value: "todos", label: "Todos os Status" },
    { value: "rascunho", label: "Rascunho" },
    { value: "pendente", label: "Pendente" },
    { value: "aprovado", label: "Aprovado" },
    { value: "rejeitado", label: "Rejeitado" },
  ];

  const priorityOptions = [
    { value: "todos", label: "Todas as Prioridades" },
    { value: "baixa", label: "Baixa" },
    { value: "media", label: "Média" },
    { value: "alta", label: "Alta" },
    { value: "urgente", label: "Urgente" },
  ];

  // Filtrar solicitações
  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const matchesStatus =
        statusFilter === "todos" || request.status === statusFilter;
      const matchesPriority =
        priorityFilter === "todos" || request.prioridade === priorityFilter;
      const matchesSearch =
        searchTerm === "" ||
        request.protocolo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.justificativa.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesStatus && matchesPriority && matchesSearch;
    });
  }, [requests, statusFilter, priorityFilter, searchTerm]);

  // Função para formatar moeda
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Função para formatar data
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Função para obter ícone da prioridade
  const getPriorityIcon = (priority: string): string => {
    const icons = {
      baixa: "🟢",
      media: "🟡",
      alta: "🟠",
      urgente: "🔴",
    };
    return icons[priority as keyof typeof icons] || "⚪";
  };

  // Função para obter texto do status
  const getStatusText = (status: string): string => {
    const statusTexts = {
      rascunho: "Rascunho",
      pendente: "Pendente",
      aprovado: "Aprovado",
      rejeitado: "Rejeitado",
    };
    return statusTexts[status as keyof typeof statusTexts] || status;
  };

  // Função para deletar solicitação
  const handleDelete = async (id: string, protocolo: string) => {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir a solicitação " +
        protocolo +
        "? Esta ação não pode ser desfeita."
    );

    if (confirmed) {
      try {
        onDelete(id);
        showSuccess("Sucesso", "Solicitação excluída com sucesso!");
      } catch (error) {
        showError("Erro", "Erro ao excluir solicitação. Tente novamente.");
        console.error(error);
      }
    }
  };

  // Renderizar loading
  if (loading) {
    return (
      <div className="additive-request-list">
        <div className="additive-request-list__loading">
          <div className="additive-request-list__loading-text">
            <div className="additive-request-list__spinner"></div>
            Carregando solicitações...
          </div>
        </div>
      </div>
    );
  }

  // Renderizar erro
  if (error) {
    return (
      <div className="additive-request-list">
        <div className="additive-request-list__error">
          <div className="additive-request-list__error-text">
            <FiFileText className="additive-request-list__error-icon" />
            {error}
          </div>
        </div>
      </div>
    );
  }

  // Renderizar lista vazia
  if (filteredRequests.length === 0) {
    return (
      <div className="additive-request-list">
        <div className="additive-request-list__empty">
          <div className="additive-request-list__empty-icon">📋</div>
          <h3 className="additive-request-list__empty-title">
            {searchTerm ||
            statusFilter !== "todos" ||
            priorityFilter !== "todos"
              ? "Nenhuma solicitação encontrada"
              : "Nenhuma solicitação cadastrada"}
          </h3>
          <p className="additive-request-list__empty-text">
            {searchTerm ||
            statusFilter !== "todos" ||
            priorityFilter !== "todos"
              ? "Tente ajustar os filtros ou termo de busca."
              : "Comece criando sua primeira solicitação de aditivo."}
          </p>
          {!searchTerm &&
            statusFilter === "todos" &&
            priorityFilter === "todos" && (
              <button
                className="additive-request-list__empty-button"
                onClick={onAddNew}
              >
                <FiPackage />
                Criar Primeira Solicitação
              </button>
            )}
        </div>
      </div>
    );
  }

  return (
    <div className="additive-request-list">
      {/* Cabeçalho */}
      <div className="additive-request-list__header">
        <h2 className="additive-request-list__title">
          <FiPackage className="additive-request-list__title-icon" />
          Solicitações de Aditivos
        </h2>
        <div className="additive-request-list__count">
          {filteredRequests.length} solicitação
          {filteredRequests.length !== 1 ? "ões" : ""}
        </div>
      </div>

      {/* Filtros */}
      <div className="additive-request-list__filters">
        <div className="additive-request-list__filter">
          <label className="additive-request-list__filter-label">
            <FiFilter />
            Status:
          </label>
          <select
            className="additive-request-list__filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="additive-request-list__filter">
          <label className="additive-request-list__filter-label">
            <FiFilter />
            Prioridade:
          </label>
          <select
            className="additive-request-list__filter-select"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            {priorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="additive-request-list__search">
          <input
            type="text"
            className="additive-request-list__search-input"
            placeholder="Buscar por protocolo, descrição ou justificativa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FiSearch className="additive-request-list__search-icon" />
        </div>
      </div>

      {/* Grid de solicitações */}
      <div className="additive-request-list__grid">
        {filteredRequests.map((request) => (
          <div key={request.id} className="additive-request-list__card">
            {/* Cabeçalho do cartão */}
            <div className="additive-request-list__card-header">
              <h3 className="additive-request-list__card-title">
                {request.descricao}
              </h3>
              <span
                className={`additive-request-list__card-status additive-request-list__card-status--${request.status}`}
              >
                {getStatusText(request.status)}
              </span>
            </div>

            {/* Informações do cartão */}
            <div className="additive-request-list__card-info">
              <div className="additive-request-list__card-row">
                <span className="additive-request-list__card-label">
                  Protocolo:
                </span>
                <span className="additive-request-list__card-value additive-request-list__card-value--protocol">
                  {request.protocolo}
                </span>
              </div>

              <div className="additive-request-list__card-row">
                <span className="additive-request-list__card-label">
                  Prioridade:
                </span>
                <span
                  className={`additive-request-list__card-value additive-request-list__card-value--priority additive-request-list__card-value--priority--${request.prioridade}`}
                >
                  {getPriorityIcon(request.prioridade)}{" "}
                  {request.prioridade.toUpperCase()}
                </span>
              </div>

              <div className="additive-request-list__card-row">
                <span className="additive-request-list__card-label">
                  Criado em:
                </span>
                <span className="additive-request-list__card-value">
                  <FiCalendar /> {formatDate(request.createdAt)}
                </span>
              </div>

              <div className="additive-request-list__card-row">
                <span className="additive-request-list__card-label">
                  Valor Total:
                </span>
                <span className="additive-request-list__card-value additive-request-list__card-value--total">
                  <FiDollarSign /> {formatCurrency(request.valorTotal)}
                </span>
              </div>
            </div>

            {/* Itens do cartão */}
            {request.itens && request.itens.length > 0 && (
              <div className="additive-request-list__card-items">
                <div className="additive-request-list__card-items-title">
                  <FiPackage />
                  Itens
                  <span className="additive-request-list__card-items-count">
                    {request.itens.length}
                  </span>
                </div>
                {request.itens.slice(0, 3).map((item, index) => (
                  <div key={index} className="additive-request-list__card-item">
                    <span className="additive-request-list__card-item-desc">
                      {item.descricao}
                    </span>
                    <span className="additive-request-list__card-item-qty">
                      {item.quantidade} {item.unidade}
                    </span>
                    <span className="additive-request-list__card-item-price">
                      {formatCurrency(item.valorTotal)}
                    </span>
                  </div>
                ))}
                {request.itens.length > 3 && (
                  <div className="additive-request-list__card-item">
                    <span className="additive-request-list__card-item-desc">
                      +{request.itens.length - 3} item(s) adicional(is)
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Ações do cartão */}
            <div className="additive-request-list__card-actions">
              <button
                className="additive-request-list__card-button additive-request-list__card-button--view"
                onClick={() => onView(request)}
                title="Visualizar detalhes"
              >
                <FiEye />
                Ver
              </button>

              <button
                className="additive-request-list__card-button additive-request-list__card-button--edit"
                onClick={() => onEdit(request)}
                title="Editar solicitação"
              >
                <FiEdit />
                Editar
              </button>

              <button
                className="additive-request-list__card-button additive-request-list__card-button--delete"
                onClick={() => handleDelete(request.id!, request.protocolo!)}
                title="Excluir solicitação"
              >
                <FiTrash2 />
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdditiveRequestList;
