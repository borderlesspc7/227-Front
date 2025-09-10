"use client";

import React, { useState, useEffect } from "react";
import PriceForm from "./Form/PriceForm";
import PriceList from "./List/PriceList";
import type { UnitPrice } from "../../types/unitPrice";
import { unitPriceService } from "../../services/unitPrice";
import { useToast } from "../../hooks/useToast";
import "./PricePage.css";

const PricesPage: React.FC = () => {
  const { showError } = useToast();
  const [prices, setPrices] = useState<UnitPrice[]>([]);
  const [editingPrice, setEditingPrice] = useState<UnitPrice | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carrega dados do banco na inicialização
  useEffect(() => {
    const loadPrices = async () => {
      try {
        setLoading(true);
        const pricesFromDB = await unitPriceService.getUnitPrices();
        setPrices(pricesFromDB);
      } catch (err) {
        const errorMessage = "Erro ao carregar preços unitários";
        setError(errorMessage);
        showError(
          "Erro ao carregar",
          errorMessage + ". Verifique sua conexão e tente novamente."
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadPrices();
  }, [showError]);

  const handleAddPrice = async (price: UnitPrice) => {
    // Recarrega lista do banco após adicionar
    const refreshPrices = async () => {
      try {
        const pricesFromDB = await unitPriceService.getUnitPrices();
        setPrices(pricesFromDB);
      } catch (err) {
        console.error("Erro ao recarregar preços:", err);
      }
    };

    await unitPriceService.createUnitPrice(price);
    refreshPrices();
    setShowForm(false);
  };

  const handleEditPrice = (price: UnitPrice) => {
    setEditingPrice(price);
    setShowForm(true);
  };

  const handleUpdatePrice = async (updatedPrice: UnitPrice) => {
    // Recarrega lista do banco após atualizar
    const refreshPrices = async () => {
      try {
        const pricesFromDB = await unitPriceService.getUnitPrices();
        setPrices(pricesFromDB);
      } catch (err) {
        console.error("Erro ao recarregar preços:", err);
      }
    };

    refreshPrices();
    setEditingPrice(null);
    setShowForm(false);
    await unitPriceService.updateUnitPrice(updatedPrice.id!, updatedPrice);
  };

  const handleDeletePrice = async (id: string) => {
    // Recarrega lista do banco após deletar
    const refreshPrices = async () => {
      try {
        const pricesFromDB = await unitPriceService.getUnitPrices();
        setPrices(pricesFromDB);
      } catch (err) {
        console.error("Erro ao recarregar preços:", err);
      }
      await unitPriceService.deleteUnitPrice(id);
    };

    refreshPrices();
  };

  const handleCancelForm = () => {
    setEditingPrice(null);
    setShowForm(false);
  };

  return (
    <div className="prices-page">
      <div className="prices-page__header">
        <h1 className="prices-page__title">Cadastro de Preços Unitários</h1>
        <button
          className="prices-page__add-btn"
          onClick={() => setShowForm(true)}
          type="button"
        >
          Novo Preço Unitário
        </button>
      </div>

      {loading && (
        <div className="prices-page__loading">
          <p>Carregando preços unitários...</p>
        </div>
      )}

      {error && (
        <div className="prices-page__error">
          <p>Erro: {error}</p>
        </div>
      )}

      {showForm && (
        <div className="prices-page__form-section">
          <PriceForm
            price={editingPrice}
            onSubmit={editingPrice ? handleUpdatePrice : handleAddPrice}
            onCancel={handleCancelForm}
          />
        </div>
      )}

      <div className="prices-page__list-section">
        <PriceList
          prices={prices}
          onEdit={handleEditPrice}
          onDelete={handleDeletePrice}
        />
      </div>
    </div>
  );
};

export default PricesPage;
