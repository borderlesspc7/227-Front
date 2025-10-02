"use client";

import React, { useState } from "react";
import { itemService } from "../../../services/itemService";
import { useToast } from "../../../hooks/useToast";
import { masks } from "../../../utils/masks";
import "./ItemModal.css";

interface ItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onItemCreated: (item: any) => void;
}

const ItemModal: React.FC<ItemModalProps> = ({ isOpen, onClose, onItemCreated }) => {
    const { showSuccess, showError } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        descricao: "",
        unidade: "unid",
        precoUnitario: 0,
        observacoes: "",
        categoria: "",
    });
    const [maskedPrice, setMaskedPrice] = useState("");

    const unitOptions = [
        { value: "unid", label: "Unidade" },
        { value: "kg", label: "Quilograma" },
        { value: "m", label: "Metro" },
        { value: "m²", label: "Metro Quadrado" },
        { value: "m³", label: "Metro Cúbico" },
        { value: "l", label: "Litro" },
        { value: "h", label: "Hora" },
        { value: "dia", label: "Dia" },
    ];

    const categoryOptions = [
        { value: "material", label: "Material" },
        { value: "servico", label: "Serviço" },
        { value: "equipamento", label: "Equipamento" },
        { value: "mao-de-obra", label: "Mão de Obra" },
        { value: "outros", label: "Outros" },
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name === "precoUnitario") {
            const maskedValue = masks.currency(value);
            const numericValue = masks.removeCurrencyMask(maskedValue);
            setMaskedPrice(maskedValue);
            setFormData(prev => ({ ...prev, [name]: numericValue }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const userId = "current-user-id"; // TODO: Get from auth context
            const itemId = await itemService.createItem(formData, userId);

            const newItem = {
                id: itemId,
                ...formData,
                ativo: true,
                createdBy: userId,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            showSuccess("Item criado!", "O novo item foi criado com sucesso.");
            onItemCreated(newItem);
            handleClose();
        } catch (error) {
            showError("Erro ao criar item", "Erro ao criar o novo item. Tente novamente.");
            console.error("Erro ao criar item:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            descricao: "",
            unidade: "unid",
            precoUnitario: 0,
            observacoes: "",
            categoria: "",
        });
        setMaskedPrice("");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="item-modal__backdrop" onClick={handleClose}>
            <div className="item-modal__container" onClick={(e) => e.stopPropagation()}>
                <div className="item-modal__header">
                    <h2 className="item-modal__title">Novo Item</h2>
                    <button className="item-modal__close" onClick={handleClose}>
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="item-modal__form">
                    <div className="item-modal__field">
                        <label className="item-modal__label">
                            Descrição*
                            <input
                                type="text"
                                name="descricao"
                                value={formData.descricao}
                                onChange={handleInputChange}
                                className="item-modal__input"
                                required
                                placeholder="Digite a descrição do item"
                            />
                        </label>
                    </div>

                    <div className="item-modal__field">
                        <label className="item-modal__label">
                            Categoria*
                            <select
                                name="categoria"
                                value={formData.categoria}
                                onChange={handleInputChange}
                                className="item-modal__select"
                                required
                            >
                                <option value="">Selecione uma categoria</option>
                                {categoryOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <div className="item-modal__row">
                        <div className="item-modal__field">
                            <label className="item-modal__label">
                                Unidade*
                                <select
                                    name="unidade"
                                    value={formData.unidade}
                                    onChange={handleInputChange}
                                    className="item-modal__select"
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

                        <div className="item-modal__field">
                            <label className="item-modal__label">
                                Preço Unitário (R$)*
                                <input
                                    type="text"
                                    name="precoUnitario"
                                    value={maskedPrice}
                                    onChange={handleInputChange}
                                    className="item-modal__input"
                                    placeholder="R$ 0,00"
                                    required
                                />
                            </label>
                        </div>
                    </div>

                    <div className="item-modal__field">
                        <label className="item-modal__label">
                            Observações
                            <textarea
                                name="observacoes"
                                value={formData.observacoes}
                                onChange={handleInputChange}
                                className="item-modal__textarea"
                                rows={3}
                                placeholder="Observações opcionais sobre o item"
                            />
                        </label>
                    </div>

                    <div className="item-modal__actions">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="item-modal__btn item-modal__btn--cancel"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="item-modal__btn item-modal__btn--submit"
                            disabled={loading}
                        >
                            {loading ? "Criando..." : "Criar Item"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ItemModal;
