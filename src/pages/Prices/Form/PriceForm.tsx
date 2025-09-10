"use client";

import React, { useState, useEffect } from "react";
import type { UnitPrice } from "../../../types/unitPrice";
import { masks } from "../../../utils/masks";
import { unitPriceService } from "../../../services/unitPrice";
import { useToast } from "../../../hooks/useToast";
import "./PriceForm.css";

interface PriceFormProps {
  price?: UnitPrice | null;
  onSubmit: (price: Omit<UnitPrice, "id">) => void;
  onCancel: () => void;
}

const UNIT_OPTION = [
  { value: "m2", label: "m2" },
  { value: "m1", label: "m1" },
  { value: "unid", label: "unid" },
  { value: "peça", label: "peça" },
];

const PriceForm: React.FC<PriceFormProps> = ({ price, onSubmit, onCancel }) => {
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState<UnitPrice>({
    codigo: "",
    tipo: "",
    espessura: "",
    estrutura: "",
    chapaFace1: "",
    chapaFace2: "",
    isolamento: "",
    quantidade: 0,
    unidade: "m2",
    unitMaterial: 0,
    unitMaoObra: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [maskedValues, setMaskedValues] = useState({
    codigo: "",
    espessura: "",
    quantidade: "",
    unitMaterial: "",
    unitMaoObra: "",
  });

  useEffect(() => {
    if (price) {
      setFormData({
        codigo: price.codigo,
        tipo: price.tipo,
        espessura: price.espessura,
        estrutura: price.estrutura,
        chapaFace1: price.chapaFace1,
        chapaFace2: price.chapaFace2,
        isolamento: price.isolamento,
        quantidade: price.quantidade,
        unidade: price.unidade,
        unitMaterial: price.unitMaterial,
        unitMaoObra: price.unitMaoObra,
      });
      setMaskedValues({
        codigo: price.codigo,
        espessura: price.espessura,
        quantidade: price.quantidade.toString(),
        unitMaterial: masks.currency((price.unitMaterial * 100).toString()),
        unitMaoObra: masks.currency((price.unitMaoObra * 100).toString()),
      });
    } else {
      setMaskedValues({
        codigo: "",
        espessura: "",
        quantidade: "",
        unitMaterial: "",
        unitMaoObra: "",
      });
    }
  }, [price]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "codigo") {
      const maskedValue = masks.code(value);
      setMaskedValues((prev) => ({ ...prev, codigo: maskedValue }));
      setFormData((prev) => ({ ...prev, codigo: maskedValue }));
    } else if (name === "espessura") {
      const maskedValue = masks.decimal(value);
      setMaskedValues((prev) => ({ ...prev, espessura: maskedValue }));
      setFormData((prev) => ({ ...prev, espessura: maskedValue }));
    } else if (name === "quantidade") {
      const maskedValue = masks.quantity(value);
      const numericValue = masks.removeDecimalMask(maskedValue);
      setMaskedValues((prev) => ({ ...prev, quantidade: maskedValue }));
      setFormData((prev) => ({ ...prev, quantidade: numericValue }));
    } else if (name === "unitMaterial") {
      const maskedValue = masks.currency(value);
      const numericValue = masks.removeCurrencyMask(maskedValue);
      setMaskedValues((prev) => ({ ...prev, unitMaterial: maskedValue }));
      setFormData((prev) => ({ ...prev, unitMaterial: numericValue }));
    } else if (name === "unitMaoObra") {
      const maskedValue = masks.currency(value);
      const numericValue = masks.removeCurrencyMask(maskedValue);
      setMaskedValues((prev) => ({ ...prev, unitMaoObra: maskedValue }));
      setFormData((prev) => ({ ...prev, unitMaoObra: numericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const totalMaterial = formData.unitMaterial * formData.quantidade;
      const totalMaoObra = formData.unitMaoObra * formData.quantidade;

      const priceData = {
        ...formData,
        totalMaterial,
        totalMaoObra,
      };

      if (price) {
        await unitPriceService.updateUnitPrice(price.id!, priceData);
        showSuccess(
          "Preço atualizado!",
          `O preço unitário "${formData.codigo}" foi atualizado com sucesso.`
        );
      } else {
        await unitPriceService.createUnitPrice(priceData);
        showSuccess(
          "Preço cadastrado!",
          `O preço unitário "${formData.codigo}" foi cadastrado com sucesso.`
        );
      }

      onSubmit(priceData);
    } catch (err) {
      const errorMessage = "Erro ao salvar preço unitário";
      setError(errorMessage);
      showError(
        "Erro ao salvar",
        errorMessage + ". Tente novamente ou verifique os dados."
      );
      console.error("Erro ao salvar preço:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="price-form">
      <div className="price-form__header">
        <h2 className="price-form__title">
          {price ? "Editar Preço Unitário" : "Novo Preço Unitário"}
        </h2>
        <p className="price-form__subtitle">
          {price
            ? "Atualize as informações do preço unitário"
            : "Preencha as informações para cadastrar um novo preço unitário"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="price-form__form">
        <div className="price-form__grid">
          <div className="price-form__field">
            <label className="price-form__label">
              Codigo*
              <input
                type="text"
                name="codigo"
                value={maskedValues.codigo}
                onChange={handleInputChange}
                className="price-form__input"
                required
              />
            </label>
          </div>
          <div className="price-form__field">
            <label className="price-form__label">
              Tipo*
              <input
                type="text"
                name="tipo"
                value={formData.tipo}
                onChange={handleInputChange}
                className="price-form__select"
                required
              />
            </label>
          </div>

          <div className="price-form__field">
            <label className="price-form__label">
              Espessura
              <input
                type="text"
                name="espessura"
                value={maskedValues.espessura}
                onChange={handleInputChange}
                className="price-form__input"
                placeholder="Ex: 0.5 ou 1,2"
              />
            </label>
          </div>

          <div className="price-form__field">
            <label className="price-form__label">
              Estrutura
              <input
                type="text"
                name="estrutura"
                value={formData.estrutura}
                onChange={handleInputChange}
                className="price-form__input"
              />
            </label>
          </div>

          <div className="price-form__field">
            <label className="price-form__label">
              Chapa Face 1
              <input
                type="text"
                name="chapaFace1"
                value={formData.chapaFace1}
                onChange={handleInputChange}
                className="price-form__input"
              />
            </label>
          </div>

          <div className="price-form__field">
            <label className="price-form__label">
              Chapa Face 2
              <input
                type="text"
                name="chapaFace2"
                value={formData.chapaFace2}
                onChange={handleInputChange}
                className="price-form__input"
              />
            </label>
          </div>

          <div className="price-form__field">
            <label className="price-form__label">
              Isolamento
              <input
                type="text"
                name="isolamento"
                value={formData.isolamento}
                onChange={handleInputChange}
                className="price-form__input"
              />
            </label>
          </div>

          <div className="price-form__field">
            <label className="price-form__label">
              Quantidade *
              <input
                type="text"
                name="quantidade"
                value={maskedValues.quantidade}
                onChange={handleInputChange}
                className="price-form__input"
                placeholder="Ex: 10 ou 10,5"
                required
              />
            </label>
          </div>

          <div className="price-form__field">
            <label className="price-form__label">
              Unidade*
              <select
                name="unidade"
                value={formData.unidade}
                onChange={handleInputChange}
                className="price-form__select"
                required
              >
                {UNIT_OPTION.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="price-form__field">
            <label className="price-form__label">
              Unit. Material (R$) *
              <input
                type="text"
                name="unitMaterial"
                value={maskedValues.unitMaterial}
                onChange={handleInputChange}
                className="price-form__input"
                placeholder="R$ 0,00"
                required
              />
            </label>
          </div>

          <div className="price-form__field">
            <label className="price-form__label">
              Unit. Mão de Obra (R$) *
              <input
                type="text"
                name="unitMaoObra"
                value={maskedValues.unitMaoObra}
                onChange={handleInputChange}
                className="price-form__input"
                placeholder="R$ 0,00"
                required
              />
            </label>
          </div>
        </div>

        <div className="price-form__totals">
          <div className="price-form__total-item">
            <span className="price-form__total-label">Total Material:</span>
            <span className="price-form__total-value">
              R$ {(formData.quantidade * formData.unitMaterial).toFixed(2)}
            </span>
          </div>
          <div className="price-form__total-item">
            <span className="price-form__total-label">Total Mão de Obra:</span>
            <span className="price-form__total-value">
              R$ {(formData.quantidade * formData.unitMaoObra).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="price-form__actions">
          <button
            type="button"
            onClick={onCancel}
            className="price-form__cancel-btn"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="price-form__submit-btn"
            disabled={loading}
          >
            {loading ? "Salvando..." : price ? "Atualizar" : "Cadastrar"}
          </button>
        </div>
      </form>
      {error && <p className="price-form__error">{error}</p>}
    </div>
  );
};

export default PriceForm;
