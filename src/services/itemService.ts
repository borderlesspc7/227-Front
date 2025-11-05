import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../lib/firebaseconfig";
import type { Item, ItemFormData, UpdateItemData } from "../types/item";
import type { UserRole } from "../utils/rolePermissions";
import { requirePermission } from "../utils/servicePermissions";

export const itemService = {
    // Criar novo item
    async createItem(itemData: ItemFormData, userId: string, userRole?: UserRole): Promise<string> {
        try {
            requirePermission(userRole, "create_items");
            
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
            throw error;
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
            console.log("Buscando itens ativos no Firestore...");

            const q = query(
                collection(db, "items"),
                where("ativo", "==", true),
                orderBy("descricao", "asc")
            );
            const querySnapshot = await getDocs(q);

            console.log("Query executada, documentos encontrados:", querySnapshot.docs.length);

            const items = querySnapshot.docs.map(doc => {
                const data = doc.data();
                console.log("Item encontrado:", doc.id, data);
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                } as Item;
            });

            console.log("Itens processados:", items);
            return items;
        } catch (error) {
            console.error("Erro ao buscar itens ativos:", error);
            // Se der erro com orderBy, tenta sem orderBy
            try {
                console.log("Tentando buscar sem orderBy...");
                const q = query(
                    collection(db, "items"),
                    where("ativo", "==", true)
                );
                const querySnapshot = await getDocs(q);

                const items = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        createdAt: data.createdAt?.toDate() || new Date(),
                        updatedAt: data.updatedAt?.toDate() || new Date(),
                    } as Item;
                });

                // Ordena manualmente
                items.sort((a, b) => a.descricao.localeCompare(b.descricao));
                console.log("Itens carregados sem orderBy:", items);
                return items;
            } catch (fallbackError) {
                console.error("Erro no fallback:", fallbackError);
                throw new Error("Erro ao buscar itens ativos");
            }
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
    async updateItem(id: string, updateData: UpdateItemData, userRole?: UserRole): Promise<void> {
        try {
            requirePermission(userRole, "edit_items");
            
            const itemRef = doc(db, "items", id);
            await updateDoc(itemRef, {
                ...updateData,
                updatedAt: new Date(),
            });
        } catch (error) {
            console.error("Erro ao atualizar item:", error);
            throw error;
        }
    },

    // Deletar item (soft delete - marcar como inativo)
    async deleteItem(id: string, userRole?: UserRole): Promise<void> {
        try {
            requirePermission(userRole, "delete_items");
            await this.updateItem(id, { ativo: false }, userRole);
        } catch (error) {
            console.error("Erro ao deletar item:", error);
            throw error;
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

    // Limpar dados de teste/mockados
    async clearTestData(userRole?: UserRole): Promise<void> {
        try {
            requirePermission(userRole, "delete_items");
            
            console.log("Limpando dados de teste...");

            // Buscar todos os itens
            const allItems = await this.getAllItems();

            // Filtrar itens que parecem ser de teste
            const testItems = allItems.filter(item =>
                item.descricao.toLowerCase().includes('teste') ||
                item.descricao.toLowerCase().includes('testeaasd') ||
                item.descricao.toLowerCase().includes('mock') ||
                item.descricao.toLowerCase().includes('demo') ||
                item.descricao.toLowerCase().includes('exemplo') ||
                item.descricao.toLowerCase().includes('fake')
            );

            console.log(`Encontrados ${testItems.length} itens de teste para remover`);

            // Deletar cada item de teste
            for (const item of testItems) {
                try {
                    await deleteDoc(doc(db, "items", item.id));
                    console.log(`Item removido: ${item.descricao}`);
                } catch (error) {
                    console.error(`Erro ao remover item ${item.id}:`, error);
                }
            }

            console.log("Limpeza de dados de teste concluída");
        } catch (error) {
            console.error("Erro ao limpar dados de teste:", error);
            throw error;
        }
    },
};
