"use client";

import React, { useState } from "react";
import type { Item, ItemFormData } from "../../../types/item";
import { useToast } from "../../../hooks/useToast";
import "./ItemForm.css";

interface ItemFormProps {
    item?: Item | null;
    onSubmit: (item: ItemFormData) => void;
    onCancel: () => void;
}

const unidades = [
    "UN",
    "M",
    "M²",
    "M³",
    "KG",
    "TON",
    "L",
    "M³",
    "H",
    "DIA",
    "MÊS",
    "ANO",
];

const categorias = [
    "Material",
    "Serviço",
    "Equipamento",
    "Mão de Obra",
    "Outros",
];

export const ItemForm: React.FC<ItemFormProps> = ({
    item,
    onSubmit,
    onCancel,
}) => {
    const { showToast } = useToast();
    const [formData, setFormData] = useState<ItemFormData>({
        descricao: item?.descricao || "",
        unidade: item?.unidade || "",
        precoUnitario: item?.precoUnitario || 0,
        observacoes: item?.observacoes || "",
        categoria: item?.categoria || "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        if (name === "precoUnitario") {
            const numericValue = parseFloat(value) || 0;
            setFormData(prev => ({ ...prev, [name]: numericValue }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        // Limpar erro do campo quando o usuário começar a digitar
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.descricao.trim()) {
            newErrors.descricao = "Descrição é obrigatória";
        }

        if (!formData.unidade.trim()) {
            newErrors.unidade = "Unidade é obrigatória";
        }

        if (formData.precoUnitario <= 0) {
            newErrors.precoUnitario = "Preço unitário deve ser maior que zero";
        }

        if (!formData.categoria.trim()) {
            newErrors.categoria = "Categoria é obrigatória";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            showToast("Por favor, corrija os erros no formulário", "error");
            return;
        }

        onSubmit(formData);
    };

    return (
        <div className="item-form">
            <div className="item-form__header">
                <h2 className="item-form__title">
                    {item ? "Editar Item" : "Novo Item"}
                </h2>
                <p className="item-form__subtitle">
                    {item
                        ? "Atualize as informações do item"
                        : "Preencha as informações para criar um novo item reutilizável"
                    }
                </p>
            </div>

            <form onSubmit={handleSubmit} className="item-form__form">
                <div className="item-form__grid">
                    <div className="item-form__field">
                        <label htmlFor="descricao" className="item-form__label">
                            Descrição *
                        </label>
                        <input
                            type="text"
                            id="descricao"
                            name="descricao"
                            value={formData.descricao}
                            onChange={handleInputChange}
                            className={`item-form__input ${errors.descricao ? "item-form__input--error" : ""}`}
                            placeholder="Ex: Cimento Portland CP-II-Z-32"
                        />
                        {errors.descricao && (
                            <span className="item-form__error">{errors.descricao}</span>
                        )}
                    </div>

                    <div className="item-form__field">
                        <label htmlFor="unidade" className="item-form__label">
                            Unidade *
                        </label>
                        <select
                            id="unidade"
                            name="unidade"
                            value={formData.unidade}
                            onChange={handleInputChange}
                            className={`item-form__select ${errors.unidade ? "item-form__select--error" : ""}`}
                        >
                            <option value="">Selecione uma unidade</option>
                            {unidades.map((unidade) => (
                                <option key={unidade} value={unidade}>
                                    {unidade}
                                </option>
                            ))}
                        </select>
                        {errors.unidade && (
                            <span className="item-form__error">{errors.unidade}</span>
                        )}
                    </div>

                    <div className="item-form__field">
                        <label htmlFor="precoUnitario" className="item-form__label">
                            Preço Unitário *
                        </label>
                        <input
                            type="number"
                            id="precoUnitario"
                            name="precoUnitario"
                            value={formData.precoUnitario}
                            onChange={handleInputChange}
                            className={`item-form__input ${errors.precoUnitario ? "item-form__input--error" : ""}`}
                            placeholder="0,00"
                            step="0.01"
                            min="0"
                        />
                        {errors.precoUnitario && (
                            <span className="item-form__error">{errors.precoUnitario}</span>
                        )}
                    </div>

                    <div className="item-form__field">
                        <label htmlFor="categoria" className="item-form__label">
                            Categoria *
                        </label>
                        <select
                            id="categoria"
                            name="categoria"
                            value={formData.categoria}
                            onChange={handleInputChange}
                            className={`item-form__select ${errors.categoria ? "item-form__select--error" : ""}`}
                        >
                            <option value="">Selecione uma categoria</option>
                            {categorias.map((categoria) => (
                                <option key={categoria} value={categoria}>
                                    {categoria}
                                </option>
                            ))}
                        </select>
                        {errors.categoria && (
                            <span className="item-form__error">{errors.categoria}</span>
                        )}
                    </div>
                </div>

                <div className="item-form__field item-form__field--full">
                    <label htmlFor="observacoes" className="item-form__label">
                        Observações
                    </label>
                    <textarea
                        id="observacoes"
                        name="observacoes"
                        value={formData.observacoes}
                        onChange={handleInputChange}
                        className="item-form__textarea"
                        placeholder="Informações adicionais sobre o item..."
                        rows={4}
                    />
                </div>

                <div className="item-form__actions">
                    <div className="item-form__action-buttons">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="item-form__cancel-btn"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="item-form__submit-btn"
                        >
                            {item ? "Atualizar Item" : "Criar Item"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};
