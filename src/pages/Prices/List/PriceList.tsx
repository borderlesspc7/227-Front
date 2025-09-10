"use client";

import React, { useState } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import type { UnitPrice } from "../../../types/unitPrice";
import "./PriceList.css";
import { unitPriceService } from "../../../services/unitPrice";
import { useToast } from "../../../hooks/useToast";

interface PriceListProps {
  prices: UnitPrice[];
  onEdit: (price: UnitPrice) => void;
  onDelete: (id: string) => void;
}

const PriceList: React.FC<PriceListProps> = ({ prices, onEdit, onDelete }) => {
  const { showSuccess, showError } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleDelete = async (id: string, codigo: string) => {
    if (
      window.confirm(`Deseja realmente excluir o preço unitário "${codigo}"?`)
    ) {
      setDeletingId(id);
      try {
        await unitPriceService.deleteUnitPrice(id);
        onDelete(id);
        showSuccess(
          "Preço excluído!",
          `O preço unitário "${codigo}" foi excluído com sucesso.`
        );
      } catch (error) {
        console.error("Erro ao excluir:", error);
        showError(
          "Erro ao excluir",
          "Não foi possível excluir o preço unitário. Tente novamente."
        );
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleEdit = (price: UnitPrice) => {
    onEdit(price);
  };

  if (prices.length === 0) {
    return (
      <div className="price-list__empty">
        <p className="price-list__empty-text">
          Nenhum preço unitário cadastrado ainda
        </p>
      </div>
    );
  }

  return (
    <div className="price-list">
      <div className="price-list__header">
        <h2 className="price-list__title">Preços Unitários cadastrados</h2>
        <span className="price-list__count">{prices.length} item(s)</span>
      </div>

      <div className="price-list__table-container">
        <table className="price-list__table">
          <thead className="price-list__thead">
            <tr>
              <th>Código</th>
              <th>Tipo</th>
              <th>Espessura</th>
              <th>Estrutura</th>
              <th>Chapa Face 1</th>
              <th>Chapa Face 2</th>
              <th>Isolamento</th>
              <th>Qtd</th>
              <th>Unidade</th>
              <th>Unit. Mat</th>
              <th>Unit. MDO</th>
              <th>Total Mat</th>
              <th>Total MDO</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody className="price-list__tbody">
            {prices.map((price) => (
              <tr
                key={price.id}
                className={`price-list__row ${
                  hoveredRow === price.id ? "price-list__row--hovered" : ""
                }`}
                onMouseEnter={() => setHoveredRow(price.id ?? null)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <td className="price-list__cell price-list__cell--code">
                  <div className="price-list__code-container">
                    <span className="price-list__code-badge">
                      {price.codigo}
                    </span>
                  </div>
                </td>
                <td className="price-list__cell">
                  <span className="price-list__type">{price.tipo}</span>
                </td>
                <td className="price-list__cell">{price.espessura || "-"}</td>
                <td className="price-list__cell">{price.estrutura || "-"}</td>
                <td className="price-list__cell">{price.chapaFace1 || "-"}</td>
                <td className="price-list__cell">{price.chapaFace2 || "-"}</td>
                <td className="price-list__cell">{price.isolamento || "-"}</td>
                <td className="price-list__cell price-list__cell--number">
                  <span className="price-list__quantity">
                    {price.quantidade}
                  </span>
                </td>
                <td className="price-list__cell">
                  <span className="price-list__unit">{price.unidade}</span>
                </td>
                <td className="price-list__cell price-list__cell--currency">
                  <span className="price-list__amount">
                    {formatCurrency(price.unitMaterial)}
                  </span>
                </td>
                <td className="price-list__cell price-list__cell--currency">
                  <span className="price-list__amount">
                    {formatCurrency(price.unitMaoObra)}
                  </span>
                </td>
                <td className="price-list__cell price-list__cell--currency price-list__cell--total">
                  <span className="price-list__total">
                    {formatCurrency(price.totalMaterial ?? 0)}
                  </span>
                </td>
                <td className="price-list__cell price-list__cell--currency price-list__cell--total">
                  <span className="price-list__total">
                    {formatCurrency(price.totalMaoObra ?? 0)}
                  </span>
                </td>
                <td className="price-list__cell price-list__cell--actions">
                  <div className="price-list__actions">
                    <button
                      onClick={() => handleEdit(price)}
                      className="price-list__action-btn price-list__action-btn--edit"
                      title="Editar preço unitário"
                      disabled={deletingId === price.id}
                    >
                      <FiEdit2 size={16} />
                      <span className="price-list__action-text">Editar</span>
                    </button>
                    <button
                      onClick={() => handleDelete(price.id ?? "", price.codigo)}
                      className="price-list__action-btn price-list__action-btn--delete"
                      title="Excluir preço unitário"
                      disabled={deletingId === price.id}
                    >
                      {deletingId === price.id ? (
                        <div className="price-list__loading-spinner"></div>
                      ) : (
                        <FiTrash2 size={16} />
                      )}
                      <span className="price-list__action-text">
                        {deletingId === price.id ? "Excluindo..." : "Excluir"}
                      </span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PriceList;
