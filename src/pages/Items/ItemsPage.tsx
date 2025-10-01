"use client";

import React, { useState, useEffect, useContext } from "react";
import type { Item, ItemFormData } from "../../types/item";
import { itemService } from "../../services/itemService";
import { useToast } from "../../hooks/useToast";
import { AuthContext } from "../../contexts/authContext";
import Modal from "../../components/ui/Modal/Modal";
import { ItemForm } from "./Form/ItemForm";
import { ItemList } from "./List/ItemList";
import "./ItemsPage.css";

export const ItemsPage: React.FC = () => {
    const { user } = useContext(AuthContext);
    const { showToast } = useToast();

    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<Item | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");

    const categorias = [
        "Material",
        "Serviço",
        "Equipamento",
        "Mão de Obra",
        "Outros",
    ];

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        try {
            setLoading(true);
            const allItems = await itemService.getAllItems();
            setItems(allItems);
        } catch (error) {
            showToast("Erro ao carregar itens", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateItem = async (itemData: ItemFormData) => {
        try {
            if (!user?.uid) {
                showToast("Usuário não autenticado", "error");
                return;
            }

            await itemService.createItem(itemData, user.uid);
            showToast("Item criado com sucesso!", "success");
            setShowForm(false);
            loadItems();
        } catch (error) {
            showToast("Erro ao criar item", "error");
        }
    };

    const handleUpdateItem = async (itemData: ItemFormData) => {
        try {
            if (!editingItem) return;

            await itemService.updateItem(editingItem.id, itemData);
            showToast("Item atualizado com sucesso!", "success");
            setShowForm(false);
            setEditingItem(null);
            loadItems();
        } catch (error) {
            showToast("Erro ao atualizar item", "error");
        }
    };

    const handleEditItem = (item: Item) => {
        setEditingItem(item);
        setShowForm(true);
    };

    const handleDeleteItem = (itemId: string) => {
        setItems(prev => prev.filter(item => item.id !== itemId));
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingItem(null);
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.observacoes?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || item.categoria === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    if (loading) {
        return (
            <div className="items-page">
                <div className="items-page__loading">
                    <div className="items-page__spinner"></div>
                    <p>Carregando itens...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="items-page">
            <div className="items-page__header">
                <div className="items-page__title-section">
                    <h1 className="items-page__title">Cadastro de Itens</h1>
                    <p className="items-page__subtitle">
                        Gerencie itens reutilizáveis para suas solicitações de aditivos
                    </p>
                </div>

                <button
                    onClick={() => setShowForm(true)}
                    className="items-page__add-btn"
                >
                    <span className="items-page__add-icon">+</span>
                    Novo Item
                </button>
            </div>

            <div className="items-page__filters">
                <div className="items-page__search">
                    <input
                        type="text"
                        placeholder="Buscar por descrição ou observações..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="items-page__search-input"
                    />
                </div>

                <div className="items-page__category-filter">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="items-page__category-select"
                    >
                        <option value="">Todas as categorias</option>
                        {categorias.map(categoria => (
                            <option key={categoria} value={categoria}>
                                {categoria}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="items-page__content">
                <ItemList
                    items={filteredItems}
                    onEdit={handleEditItem}
                    onDelete={handleDeleteItem}
                    onRefresh={loadItems}
                />
            </div>

            {/* Modal de criação/edição */}
            {showForm && (
                <Modal
                    isOpen={showForm}
                    onClose={handleCancelForm}
                    title={editingItem ? "Editar Item" : "Novo Item"}
                    size="large"
                >
                    <ItemForm
                        item={editingItem}
                        onSubmit={editingItem ? handleUpdateItem : handleCreateItem}
                        onCancel={handleCancelForm}
                    />
                </Modal>
            )}
        </div>
    );
};