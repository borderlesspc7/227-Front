"use client";

import React, { useState, useEffect, useContext } from "react";
import type {
  AdditiveRequest,
  AdditiveRequestFormData,
} from "../../../types/additiveRequest";
import { additiveRequestService } from "../../../services/additiveRequestService";
import { contractService } from "../../../services/contractService";
import { optionsService } from "../../../services/optionsService";
import { itemService } from "../../../services/itemService";
import { useToast } from "../../../hooks/useToast";
import { masks } from "../../../utils/masks";
import { ConfirmModal } from "../../../components/ui/ConfirmModal/ConfirmModal";
import ItemModal from "../../../components/ui/ItemModal/ItemModal";
import { AuthContext } from "../../../contexts/authContext";
import type { Item } from "../../../types/item";
import "./AdditiveRequestForm.css";

interface AdditiveRequestFormProps {
  request?: AdditiveRequest | null;
  onSubmit: (request: AdditiveRequestFormData) => void;
  onCancel: () => void;
}

// Opções serão carregadas do Firestore

const AdditiveRequestForm: React.FC<AdditiveRequestFormProps> = ({
  request,
  onSubmit,
  onCancel,
}) => {
  const { showSuccess, showError } = useToast();
  const { user } = useContext(AuthContext) || {};

  const [formData, setFormData] = useState<AdditiveRequestFormData>({
    contratoId: "",
    descricao: "",
    justificativa: "",
    prioridade: "media",
    itens: [],
    evidencias: [],
  });

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  const [generatedProtocol, setGeneratedProtocol] = useState<string>("");
  const [showProtocol, setShowProtocol] = useState(false);

  const [contracts, setContracts] = useState<
    Array<{ id: string; numeroContrato: string; cliente: string; obra: string }>
  >([]);
  const [priorityOptions, setPriorityOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [unitOptions, setUnitOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [availableItems, setAvailableItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [maskedValues, setMaskedValues] = useState<Record<string, string>>({});
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    loading: boolean;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => { },
    loading: false,
  });

  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string>("");

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("Carregando dados...");

        const [contractsFromDB, priorityOpts, unitOpts, itemsFromDB] = await Promise.all([
          contractService.getContracts(user?.companyId || ""),
          optionsService.getPriorityOptions(),
          optionsService.getUnitOptions(),
          itemService.getActiveItems(),
        ]);

        console.log("Contratos carregados:", contractsFromDB.length);
        console.log("Opções de prioridade:", priorityOpts.length);
        console.log("Opções de unidade:", unitOpts.length);
        console.log("Itens carregados:", itemsFromDB.length, itemsFromDB);

        setContracts(contractsFromDB);
        setPriorityOptions(priorityOpts.map(opt => ({ value: opt.value, label: opt.label })));
        setUnitOptions(unitOpts.map(opt => ({ value: opt.value, label: opt.label })));
        setAvailableItems(itemsFromDB);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        showError("Erro ao carregar", "Erro ao carregar dados do formulário. Tente recarregar a página.");
      }
    };
    loadData();
  }, [showError]);

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

  const selectItem = (itemId: string) => {
    const selectedItem = availableItems.find(item => item.id === itemId);
    if (selectedItem) {
      setFormData((prev) => ({
        ...prev,
        itens: [
          ...prev.itens,
          {
            descricao: selectedItem.descricao,
            quantidade: 0,
            unidade: selectedItem.unidade,
            precoUnitario: selectedItem.precoUnitario,
            observacoes: selectedItem.observacoes || "",
          },
        ],
      }));
    }
    setSelectedItemId("");
  };

  const openNewItemModal = () => {
    setShowItemModal(true);
  };

  const handleItemCreated = (newItem: Item) => {
    setAvailableItems(prev => [newItem, ...prev]);
    setFormData(prev => ({
      ...prev,
      itens: [
        ...prev.itens,
        {
          descricao: newItem.descricao,
          quantidade: 0,
          unidade: newItem.unidade,
          precoUnitario: newItem.precoUnitario,
          observacoes: newItem.observacoes || "",
        },
      ],
    }));
    setShowItemModal(false);
  };

  const reloadItems = async () => {
    try {
      console.log("Recarregando itens...");
      const itemsFromDB = await itemService.getActiveItems();
      console.log("Itens recarregados:", itemsFromDB);
      setAvailableItems(itemsFromDB);
      showSuccess("Itens recarregados", `${itemsFromDB.length} item(s) carregado(s) com sucesso.`);
    } catch (error) {
      console.error("Erro ao recarregar itens:", error);
      showError("Erro ao recarregar", "Erro ao recarregar itens. Tente novamente.");
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages: File[] = [];
    const newPreviewUrls: string[] = [];

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        newImages.push(file);
        const previewUrl = URL.createObjectURL(file);
        newPreviewUrls.push(previewUrl);
      }
    });

    setSelectedImages(prev => [...prev, ...newImages]);
    setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const removeItem = (index: number) => {
    const item = formData.itens[index];
    const itemDescription = item?.descricao || `item ${index + 1}`;

    setConfirmModal({
      isOpen: true,
      title: "Confirmar Remoção",
      message: `Tem certeza que deseja remover o item "${itemDescription}"?`,
      onConfirm: () => {
        setFormData((prev) => ({
          ...prev,
          itens: prev.itens.filter((_, i) => i !== index),
        }));
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
      loading: false,
    });
  };

  const closeConfirmModal = () => {
    if (!confirmModal.loading) {
      setConfirmModal({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: () => { },
        loading: false,
      });
    }
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
        imagens: selectedImages,
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
        const createdRequest =
          await additiveRequestService.createAdditiveRequest(
            requestData,
            user?.uid
          );
        setGeneratedProtocol(createdRequest.protocolo);
        setShowProtocol(true);
        showSuccess(
          "Solicitação criada!",
          `Solicitação criada com sucesso! Protocolo: ${createdRequest.protocolo}`
        );
      }

      onSubmit(requestData);
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

  const handleSubmitForApproval = async (e: React.FormEvent) => {
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
        imagens: selectedImages,
      };

      if (request) {
        // Atualizar e enviar para aprovação
        await additiveRequestService.updateAdditiveRequest(
          request.id!,
          requestData
        );
        await additiveRequestService.submitForApproval(request.id!);
        showSuccess(
          "Enviado para aprovação!",
          "A solicitação foi enviada para aprovação com sucesso."
        );
      } else {
        // Criar e enviar para aprovação
        const createdRequest =
          await additiveRequestService.createAdditiveRequest(
            requestData,
            user?.uid
          );
        await additiveRequestService.submitForApproval(createdRequest.id!);
        setGeneratedProtocol(createdRequest.protocolo);
        setShowProtocol(true);
        showSuccess(
          "Enviado para aprovação!",
          `Solicitação enviada para aprovação! Protocolo: ${createdRequest.protocolo}`
        );
      }

      onSubmit(requestData);
    } catch (err) {
      const errorMessage = "Erro ao enviar para aprovação";
      setError(errorMessage);
      showError(
        "Erro ao enviar",
        errorMessage + ". Tente novamente ou verifique os dados."
      );
      console.error("Erro ao enviar para aprovação:", err);
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

        {showProtocol && generatedProtocol && (
          <div className="additive-request-form__protocol-display">
            <span className="additive-request-form__protocol-label">
              Protocolo Gerado:
            </span>
            <span className="additive-request-form__protocol-value">
              {generatedProtocol}
            </span>
          </div>
        )}
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
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Descrição */}
          <div className="additive-request-form__field additive-request-form__field--half">
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

          <div className="additive-request-form__field additive-request-form__field--half">
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

        {/* Seção de Imagens */}
        <div className="additive-request-form__images-section">
          <div className="additive-request-form__images-header">
            <h3 className="additive-request-form__section-title">Imagens de Evidência</h3>
            <p className="additive-request-form__section-description">
              Adicione imagens que comprovem a necessidade do aditivo
            </p>
          </div>

          <div className="additive-request-form__image-upload">
            <input
              type="file"
              id="image-upload"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="additive-request-form__file-input"
            />
            <label htmlFor="image-upload" className="additive-request-form__upload-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
              Adicionar Imagens
            </label>
          </div>

          {imagePreviewUrls.length > 0 && (
            <div className="additive-request-form__image-preview">
              <h4 className="additive-request-form__preview-title">
                Imagens Selecionadas ({imagePreviewUrls.length})
              </h4>
              <div className="additive-request-form__image-grid">
                {imagePreviewUrls.map((url, index) => (
                  <div key={index} className="additive-request-form__image-item">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="additive-request-form__preview-image"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="additive-request-form__remove-image-btn"
                      title="Remover imagem"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6L6 18" />
                        <path d="M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Seção de Itens */}
        <div className="additive-request-form__items-section">
          <div className="additive-request-form__items-header">
            <h3 className="additive-request-form__items-title">
              Itens da Solicitação
            </h3>
            <div className="additive-request-form__item-selection">
              <select
                value={selectedItemId}
                onChange={(e) => selectItem(e.target.value)}
                className="additive-request-form__item-select"
              >
                <option value="">
                  {availableItems.length === 0
                    ? "Nenhum item cadastrado"
                    : "Selecionar item cadastrado"}
                </option>
                {availableItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.descricao} - R$ {item.precoUnitario.toFixed(2)}/{item.unidade}
                  </option>
                ))}
              </select>
              {availableItems.length > 0 && (
                <small className="additive-request-form__item-count">
                  {availableItems.length} item(s) disponível(is)
                </small>
              )}
              <div className="additive-request-form__item-buttons">
                <button
                  type="button"
                  onClick={reloadItems}
                  className="additive-request-form__reload-btn"
                  title="Recarregar itens"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                    <path d="M21 3v5h-5" />
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                    <path d="M3 21v-5h5" />
                  </svg>
                  Recarregar
                </button>
                <button
                  type="button"
                  onClick={openNewItemModal}
                  className="additive-request-form__new-item-btn"
                >
                  + Novo Item
                </button>
                <button
                  type="button"
                  onClick={addItem}
                  className="additive-request-form__add-item-btn"
                >
                  + Adicionar Manual
                </button>
              </div>
            </div>
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
                      {unitOptions.map((option) => (
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

                <div className="">
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

          <div className="additive-request-form__action-buttons">
            <button
              type="button"
              onClick={handleSubmitForApproval}
              className="additive-request-form__submit-for-approval-btn"
              disabled={loading}
            >
              {loading
                ? "Enviando..."
                : request
                  ? "Atualizar e Enviar para Aprovação"
                  : "Criar e Enviar para Aprovação"}
            </button>

            <button
              type="submit"
              className="additive-request-form__submit-btn"
              disabled={loading}
            >
              {loading
                ? "Salvando..."
                : request
                  ? "Salvar Rascunho"
                  : "Salvar como Rascunho"}
            </button>
          </div>
        </div>
      </form>

      {error && <p className="additive-request-form__error">{error}</p>}

      {/* Modal de confirmação para remover itens */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Remover"
        cancelText="Cancelar"
        type="warning"
        isLoading={confirmModal.loading}
      />

      {/* Modal para criar novo item */}
      <ItemModal
        isOpen={showItemModal}
        onClose={() => setShowItemModal(false)}
        onItemCreated={handleItemCreated}
      />
    </div>
  );
};

export default AdditiveRequestForm;
