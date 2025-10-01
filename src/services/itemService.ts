import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../lib/firebaseconfig";
import type { Item, ItemFormData, UpdateItemData } from "../types/item";

export const itemService = {
    // Criar novo item
    async createItem(itemData: ItemFormData, userId: string): Promise<string> {
        try {
            const docRef = await addDoc(collection(db, "items"), {
                ...itemData,
                ativo: true,
                createdBy: userId,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            return docRef.id;
        } catch (error) {
            console.error("Erro ao criar item:", error);
            throw new Error("Erro ao criar item");
        }
    },

    // Buscar todos os itens
    async getAllItems(): Promise<Item[]> {
        try {
            const q = query(collection(db, "items"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate() || new Date(),
            })) as Item[];
        } catch (error) {
            console.error("Erro ao buscar itens:", error);
            throw new Error("Erro ao buscar itens");
        }
    },

    // Buscar itens ativos
    async getActiveItems(): Promise<Item[]> {
        try {
            const q = query(
                collection(db, "items"),
                where("ativo", "==", true),
                orderBy("descricao", "asc")
            );
            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate() || new Date(),
            })) as Item[];
        } catch (error) {
            console.error("Erro ao buscar itens ativos:", error);
            throw new Error("Erro ao buscar itens ativos");
        }
    },

    // Buscar item por ID
    async getItemById(id: string): Promise<Item | null> {
        try {
            const q = query(collection(db, "items"), where("__name__", "==", id));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                return null;
            }

            const doc = querySnapshot.docs[0];
            return {
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate() || new Date(),
            } as Item;
        } catch (error) {
            console.error("Erro ao buscar item:", error);
            throw new Error("Erro ao buscar item");
        }
    },

    // Atualizar item
    async updateItem(id: string, updateData: UpdateItemData): Promise<void> {
        try {
            const itemRef = doc(db, "items", id);
            await updateDoc(itemRef, {
                ...updateData,
                updatedAt: new Date(),
            });
        } catch (error) {
            console.error("Erro ao atualizar item:", error);
            throw new Error("Erro ao atualizar item");
        }
    },

    // Deletar item (soft delete - marcar como inativo)
    async deleteItem(id: string): Promise<void> {
        try {
            await this.updateItem(id, { ativo: false });
        } catch (error) {
            console.error("Erro ao deletar item:", error);
            throw new Error("Erro ao deletar item");
        }
    },

    // Buscar itens por categoria
    async getItemsByCategory(categoria: string): Promise<Item[]> {
        try {
            const q = query(
                collection(db, "items"),
                where("categoria", "==", categoria),
                where("ativo", "==", true),
                orderBy("descricao", "asc")
            );
            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate() || new Date(),
            })) as Item[];
        } catch (error) {
            console.error("Erro ao buscar itens por categoria:", error);
            throw new Error("Erro ao buscar itens por categoria");
        }
    },
};
