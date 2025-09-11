"use client";

import React, { useState, useEffect } from "react";
import type {
  AdditiveRequest,
  AdditiveRequestFormData,
} from "../../../types/additiveRequest";
import { additiveRequestService } from "../../../services/additiveRequestService";
import { contractService } from "../../../services/contractService";
import { useToast } from "../../../hooks/useToast";
import { masks } from "../../../utils/masks";
import "./AdditiveRequestForm.css";

interface AdditiveRequestFormProps {
  request?: AdditiveRequest | null;
  onSubmit: (request: Omit<AdditiveRequest, "id">) => void;
  onCancel: () => void;
}

const PRIORITY_OPTIONS = [
  { value: "baixa", label: "Baixa" },
  { value: "media", label: "Média" },
  { value: "alta", label: "Alta" },
  { value: "urgente", label: "Urgente" },
];

const UNIT_OPTIONS = [
  { value: "m2", label: "m²" },
  { value: "m1", label: "m" },
  { value: "unid", label: "unid" },
  { value: "peça", label: "peça" },
  { value: "kg", label: "kg" },
  { value: "ton", label: "ton" },
];

const AdditiveRequestForm: React.FC<AdditiveRequestFormProps> = ({
  request,
  onSubmit,
  onCancel,
}) => {
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState<AdditiveRequestFormData>({
    contratoId: "",
    descricao: "",
    justificativa: "",
    prioridade: "media",
    itens: [],
    evidencias: [],
  });

  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [maskedValues, setMaskedValues] = useState<Record<string, any>>({});

  useEffect(() => {
    const loadContracts = async () => {
      try {
        const contractsFromDB = await contractService.getContracts();
        setContracts(contractsFromDB);
      } catch (error) {
        console.error(error);
      }
    };
    loadContracts();
  }, []);

  useEffect(() => {
    if (request) {
      setFormData({
        contratoId: request.contratoId,
        descricao: request.descricao,
        justificativa: request.justificativa,
        prioridade: request.prioridade,
        itens: request.itens.map((item) => ({
          descricao: item.descricao,
          quantidade: item.quantidade,
          unidade: item.unidade,
          precoUnitario: item.precoUnitario,
          observacoes: item.observacoes || "",
        })),
        evidencias: [],
      });
    }
  }, [request]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleItemChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      itens: prev.itens.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));

    if (field === "quantidade" || field === "precoUnitario") {
      const updatedItem = { ...formData.itens[index], [field]: value };
      const valorTotal = updatedItem.quantidade * updatedItem.precoUnitario;

      setFormData((prev) => ({
        ...prev,
        itens: prev.itens.map((item, i) =>
          i === index ? { ...item, valorTotal } : item
        ),
      }));
    }
  };

  const handleItemInputChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const itemId = `item-${index}`;

    if (field === "precoUnitario") {
      const maskedValue = masks.currency(value);
      const numericValue = masks.removeCurrencyMask(maskedValue);

      setMaskedValues((prev) => ({
        ...prev,
        [`${itemId}-precoUnitario`]: maskedValue,
      }));

      handleItemChange(index, field, numericValue);
    } else if (field === "quantidade") {
      const maskedValue = masks.quantity(value);
      const numericValue = masks.removeDecimalMask(maskedValue);

      setMaskedValues((prev) => ({
        ...prev,
        [`${itemId}-quantidade`]: maskedValue,
      }));

      handleItemChange(index, field, numericValue);
    } else {
      handleItemChange(index, field, value);
    }
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      itens: [
        ...prev.itens,
        {
          descricao: "",
          quantidade: 0,
          unidade: "unid",
          precoUnitario: 0,
          observacoes: "",
        },
      ],
    }));
  };

  const removeItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      itens: prev.itens.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const requestData = {
        ...formData,
        itens: formData.itens.map((item) => ({
          ...item,
          valorTotal: item.quantidade * item.precoUnitario,
        })),
      };

      if (request) {
        // Atualizar
        await additiveRequestService.updateAdditiveRequest(
          request.id!,
          requestData
        );
        showSuccess(
          "Solicitação atualizada!",
          "A solicitação de aditivo foi atualizada com sucesso."
        );
      } else {
        // Criar
        await additiveRequestService.createAdditiveRequest(requestData);
        showSuccess(
          "Solicitação criada!",
          "A solicitação de aditivo foi criada com sucesso."
        );
      }

      onSubmit(requestData as any);
    } catch (err) {
      const errorMessage = "Erro ao salvar solicitação";
      setError(errorMessage);
      showError(
        "Erro ao salvar",
        errorMessage + ". Tente novamente ou verifique os dados."
      );
      console.error("Erro ao salvar solicitação:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return formData.itens.reduce(
      (total, item) => total + item.quantidade * item.precoUnitario,
      0
    );
  };

  return (
    <div className="additive-request-form">
      <div className="additive-request-form__header">
        <h2 className="additive-request-form__title">
          {request ? "Editar Solicitação" : "Nova Solicitação de Aditivo"}
        </h2>
        <p className="additive-request-form__subtitle">
          {request
            ? "Atualize as informações da solicitação"
            : "Preencha as informações para criar uma nova solicitação de aditivo"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="additive-request-form__form">
        <div className="additive-request-form__grid">
          {/* Seleção de Contrato */}
          <div className="additive-request-form__field">
            <label className="additive-request-form__label">
              Contrato*
              <select
                name="contratoId"
                value={formData.contratoId}
                onChange={handleInputChange}
                className="additive-request-form__select"
                required
              >
                <option value="">Selecione um contrato</option>
                {contracts.map((contract) => (
                  <option key={contract.id} value={contract.id}>
                    {contract.numeroContrato} - {contract.cliente} -{" "}
                    {contract.obra}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="additive-request-form__field">
            <label className="additive-request-form__label">
              Prioridade*
              <select
                name="prioridade"
                value={formData.prioridade}
                onChange={handleInputChange}
                className="additive-request-form__select"
                required
              >
                {PRIORITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Descrição */}
          <div className="additive-request-form__field additive-request-form__field--full">
            <label className="additive-request-form__label">
              Descrição*
              <textarea
                name="descricao"
                value={formData.descricao}
                onChange={handleInputChange}
                className="additive-request-form__textarea"
                rows={3}
                required
                placeholder="Descreva o que está sendo solicitado..."
              />
            </label>
          </div>

          <div className="additive-request-form__field additive-request-form__field--full">
            <label className="additive-request-form__label">
              Justificativa*
              <textarea
                name="justificativa"
                value={formData.justificativa}
                onChange={handleInputChange}
                className="additive-request-form__textarea"
                rows={3}
                required
                placeholder="Justifique a necessidade desta solicitação..."
              />
            </label>
          </div>
        </div>

        {/* Seção de Itens */}
        <div className="additive-request-form__items-section">
          <div className="additive-request-form__items-header">
            <h3 className="additive-request-form__items-title">
              Itens da Solicitação
            </h3>
            <button
              type="button"
              onClick={addItem}
              className="additive-request-form__add-item-btn"
            >
              + Adicionar Item
            </button>
          </div>

          {formData.itens.map((item, index) => (
            <div key={index} className="additive-request-form__item">
              <div className="additive-request-form__item-grid">
                <div className="additive-request-form__field">
                  <label className="additive-request-form__label">
                    Descrição*
                    <input
                      type="text"
                      value={item.descricao}
                      onChange={(e) =>
                        handleItemInputChange(
                          index,
                          "descricao",
                          e.target.value
                        )
                      }
                      className="additive-request-form__input"
                      required
                    />
                  </label>
                </div>

                <div className="additive-request-form__field">
                  <label className="additive-request-form__label">
                    Quantidade*
                    <input
                      type="text"
                      value={
                        maskedValues[`item-${index}-quantidade`] ||
                        item.quantidade
                      }
                      onChange={(e) =>
                        handleItemInputChange(
                          index,
                          "quantidade",
                          e.target.value
                        )
                      }
                      className="additive-request-form__input"
                      placeholder="Ex: 10 ou 10,5"
                      required
                    />
                  </label>
                </div>

                <div className="additive-request-form__field">
                  <label className="additive-request-form__label">
                    Unidade*
                    <select
                      value={item.unidade}
                      onChange={(e) =>
                        handleItemChange(index, "unidade", e.target.value)
                      }
                      className="additive-request-form__select"
                      required
                    >
                      {UNIT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="additive-request-form__field">
                  <label className="additive-request-form__label">
                    Preço Unitário (R$)*
                    <input
                      type="text"
                      value={
                        maskedValues[`item-${index}-precoUnitario`] ||
                        masks.currency((item.precoUnitario * 100).toString())
                      }
                      onChange={(e) =>
                        handleItemInputChange(
                          index,
                          "precoUnitario",
                          e.target.value
                        )
                      }
                      className="additive-request-form__input"
                      placeholder="R$ 0,00"
                      required
                    />
                  </label>
                </div>

                <div className="additive-request-form__field">
                  <label className="additive-request-form__label">
                    Observações
                    <input
                      type="text"
                      value={item.observacoes || ""}
                      onChange={(e) =>
                        handleItemChange(index, "observacoes", e.target.value)
                      }
                      className="additive-request-form__input"
                      placeholder="Observações opcionais..."
                    />
                  </label>
                </div>

                <div className="additive-request-form__field">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="additive-request-form__remove-item-btn"
                  >
                    Remover
                  </button>
                </div>
              </div>

              <div className="additive-request-form__item-total">
                <span className="additive-request-form__item-total-label">
                  Total do Item:
                </span>
                <span className="additive-request-form__item-total-value">
                  R$ {(item.quantidade * item.precoUnitario).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Total Geral */}
        <div className="additive-request-form__total">
          <div className="additive-request-form__total-item">
            <span className="additive-request-form__total-label">
              Valor Total da Solicitação:
            </span>
            <span className="additive-request-form__total-value">
              R$ {calculateTotal().toFixed(2)}
            </span>
          </div>
        </div>

        {/* Ações */}
        <div className="additive-request-form__actions">
          <button
            type="button"
            onClick={onCancel}
            className="additive-request-form__cancel-btn"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="additive-request-form__submit-btn"
            disabled={loading}
          >
            {loading
              ? "Salvando..."
              : request
              ? "Atualizar"
              : "Criar Solicitação"}
          </button>
        </div>
      </form>

      {error && <p className="additive-request-form__error">{error}</p>}
    </div>
  );
};

export default AdditiveRequestForm;
