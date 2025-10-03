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
        imagemUrl: "",
    });
    const [maskedPrice, setMaskedPrice] = useState("");
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validar tipo de arquivo
            if (!file.type.startsWith('image/')) {
                showError("Por favor, selecione apenas arquivos de imagem.");
                return;
            }

            // Validar tamanho (máximo 5MB)
            if (file.size > 5 * 1024 * 1024) {
                showError("A imagem deve ter no máximo 5MB.");
                return;
            }

            setSelectedImage(file);

            // Criar preview da imagem
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        setFormData(prev => ({ ...prev, imagemUrl: "" }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let imageUrl = "";

            // Se há uma imagem selecionada, fazer upload
            if (selectedImage) {
                // Por enquanto, vamos usar uma URL temporária baseada no preview
                // Em produção, você faria upload para um serviço como Firebase Storage
                imageUrl = imagePreview || "";
            }

            const itemData = {
                ...formData,
                imagemUrl: imageUrl,
            };

            const userId = "current-user-id"; // TODO: Get from auth context
            const itemId = await itemService.createItem(itemData, userId);

            const newItem = {
                id: itemId,
                ...itemData,
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
            imagemUrl: "",
        });
        setMaskedPrice("");
        setSelectedImage(null);
        setImagePreview(null);
        onClose();
    };

    if (!isOpen) return null;

    console.log("🖼️ CAMPO DE IMAGEM RENDERIZADO - selectedImage:", selectedImage);
    console.log("🖼️ imagePreview:", imagePreview);

    return (
        <div className="item-modal__backdrop" onClick={handleClose}>
            <div className="item-modal__container" onClick={(e) => e.stopPropagation()}>
                <button className="item-modal__close" onClick={handleClose}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

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

                    {/* Campo de Upload de Imagem */}
                    <div className="item-modal__field" style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '3px solid #10b981' }}>
                        <label className="item-modal__label" style={{ fontSize: '16px', fontWeight: 'bold', color: '#10b981' }}>
                            📷 IMAGEM DO ITEM (OPCIONAL) - TESTE
                            <div className="item-modal__image-upload">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        console.log("📸 ARQUIVO SELECIONADO:", e.target.files?.[0]);
                                        handleImageChange(e);
                                    }}
                                    className="item-modal__image-input"
                                    id="item-image"
                                />
                                <label htmlFor="item-image" className="item-modal__image-label" style={{ backgroundColor: '#10b981', color: 'white', fontSize: '14px', fontWeight: 'bold' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                        <circle cx="8.5" cy="8.5" r="1.5" />
                                        <polyline points="21,15 16,10 5,21" />
                                    </svg>
                                    {selectedImage ? "✅ ALTERAR IMAGEM" : "📸 CLIQUE AQUI PARA SELECIONAR IMAGEM"}
                                </label>
                                {imagePreview && (
                                    <div className="item-modal__image-preview">
                                        <img src={imagePreview} alt="Preview" />
                                        <button type="button" onClick={removeImage} className="item-modal__remove-image">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                                <line x1="6" y1="6" x2="18" y2="18"></line>
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </div>
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
