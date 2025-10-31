// src/services/optionsService.ts
import { db } from "../lib/firebaseconfig";
import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp,
} from "firebase/firestore";

export interface PriorityOption {
    value: string;
    label: string;
    order: number;
    color: string;
}

export interface UnitOption {
    value: string;
    label: string;
    order: number;
    symbol: string;
}

export interface UserRoleOption {
    value: string;
    label: string;
    order: number;
    department?: string;
}

class OptionsService {
    /**
     * Inicializar opções padrão no Firestore
     */
    async initializeDefaultOptions(): Promise<void> {
        try {
            // Prioridades padrão
            const priorityOptions: PriorityOption[] = [
                { value: "baixa", label: "Baixa", order: 1, color: "#10b981" },
                { value: "media", label: "Média", order: 2, color: "#f59e0b" },
                { value: "alta", label: "Alta", order: 3, color: "#ef4444" },
                { value: "urgente", label: "Urgente", order: 4, color: "#dc2626" },
            ];

            // Unidades padrão
            const unitOptions: UnitOption[] = [
                { value: "m2", label: "m²", order: 1, symbol: "m²" },
                { value: "m1", label: "m", order: 2, symbol: "m" },
                { value: "unid", label: "unid", order: 3, symbol: "unid" },
                { value: "peça", label: "peça", order: 4, symbol: "peça" },
                { value: "kg", label: "kg", order: 5, symbol: "kg" },
                { value: "ton", label: "ton", order: 6, symbol: "ton" },
            ];

            // Roles de usuário padrão
            const userRoleOptions: UserRoleOption[] = [
                { value: "admin", label: "Administrador", order: 1, department: "admin" },
                { value: "solicitante", label: "Solicitante de OSAs", order: 2, department: "operacional" },
                { value: "engenheiro", label: "Engenheiro Aprovador", order: 3, department: "engenharia" },
                { value: "suprimento", label: "Suprimentos", order: 4, department: "suprimentos" },
                { value: "diretor", label: "Diretor/Financeiro", order: 5, department: "diretoria" },
                { value: "cliente", label: "Cliente", order: 6, department: "cliente" },
            ];

            // Salvar no Firestore
            await setDoc(doc(db, "systemOptions", "priorities"), {
                options: priorityOptions,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            await setDoc(doc(db, "systemOptions", "units"), {
                options: unitOptions,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            await setDoc(doc(db, "systemOptions", "userRoles"), {
                options: userRoleOptions,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

        } catch (error) {
            console.error("Erro ao inicializar opções padrão:", error);
            throw error;
        }
    }

    /**
     * Obter opções de prioridade
     */
    async getPriorityOptions(): Promise<PriorityOption[]> {
        try {
            const docRef = doc(db, "systemOptions", "priorities");
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return docSnap.data().options;
            } else {
                // Se não existir, inicializar com padrões
                await this.initializeDefaultOptions();
                return await this.getPriorityOptions();
            }
        } catch (error: any) {
            console.error("Erro ao obter opções de prioridade:", error);
            if (error.code === 'permission-denied') {
                console.error("Permissão negada: Verifique as regras do Firestore. A coleção 'systemOptions' precisa permitir leitura para usuários autenticados.");
            }
            // Fallback para opções hardcoded em caso de erro
            return [
                { value: "baixa", label: "Baixa", order: 1, color: "#10b981" },
                { value: "media", label: "Média", order: 2, color: "#f59e0b" },
                { value: "alta", label: "Alta", order: 3, color: "#ef4444" },
                { value: "urgente", label: "Urgente", order: 4, color: "#dc2626" },
            ];
        }
    }

    /**
     * Obter opções de unidade
     */
    async getUnitOptions(): Promise<UnitOption[]> {
        try {
            const docRef = doc(db, "systemOptions", "units");
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return docSnap.data().options;
            } else {
                // Se não existir, inicializar com padrões
                await this.initializeDefaultOptions();
                return await this.getUnitOptions();
            }
        } catch (error) {
            console.error("Erro ao obter opções de unidade:", error);
            // Fallback para opções hardcoded em caso de erro
            return [
                { value: "m2", label: "m²", order: 1, symbol: "m²" },
                { value: "m1", label: "m", order: 2, symbol: "m" },
                { value: "unid", label: "unid", order: 3, symbol: "unid" },
                { value: "peça", label: "peça", order: 4, symbol: "peça" },
                { value: "kg", label: "kg", order: 5, symbol: "kg" },
                { value: "ton", label: "ton", order: 6, symbol: "ton" },
            ];
        }
    }

    /**
     * Obter opções de role de usuário
     */
    async getUserRoleOptions(): Promise<UserRoleOption[]> {
        try {
            const docRef = doc(db, "systemOptions", "userRoles");
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const existingOptions = docSnap.data().options as UserRoleOption[];
                
                // Verificar se todas as 6 roles estão presentes
                const requiredRoles = ["admin", "solicitante", "engenheiro", "suprimento", "diretor", "cliente"];
                const existingValues = existingOptions.map(opt => opt.value);
                const missingRoles = requiredRoles.filter(role => !existingValues.includes(role));
                
                // Se faltar alguma role, atualizar o documento
                if (missingRoles.length > 0) {
                    console.log("Atualizando roles faltantes:", missingRoles);
                    const updatedOptions: UserRoleOption[] = [
                        { value: "admin", label: "Administrador", order: 1, department: "admin" },
                        { value: "solicitante", label: "Solicitante de OSAs", order: 2, department: "operacional" },
                        { value: "engenheiro", label: "Engenheiro Aprovador", order: 3, department: "engenharia" },
                        { value: "suprimento", label: "Suprimentos", order: 4, department: "suprimentos" },
                        { value: "diretor", label: "Diretor/Financeiro", order: 5, department: "diretoria" },
                        { value: "cliente", label: "Cliente", order: 6, department: "cliente" },
                    ];
                    
                    await setDoc(doc(db, "systemOptions", "userRoles"), {
                        options: updatedOptions,
                        updatedAt: serverTimestamp(),
                    });
                    
                    return updatedOptions;
                }
                
                return existingOptions;
            } else {
                // Se não existir, inicializar com padrões
                await this.initializeDefaultOptions();
                return await this.getUserRoleOptions();
            }
        } catch (error) {
            console.error("Erro ao obter opções de role:", error);
            // Fallback para opções hardcoded em caso de erro
            return [
                { value: "admin", label: "Administrador", order: 1, department: "admin" },
                { value: "solicitante", label: "Solicitante de OSAs", order: 2, department: "operacional" },
                { value: "engenheiro", label: "Engenheiro Aprovador", order: 3, department: "engenharia" },
                { value: "suprimento", label: "Suprimentos", order: 4, department: "suprimentos" },
                { value: "diretor", label: "Diretor/Financeiro", order: 5, department: "diretoria" },
                { value: "cliente", label: "Cliente", order: 6, department: "cliente" },
            ];
        }
    }

    /**
     * Atualizar opções de prioridade
     */
    async updatePriorityOptions(options: PriorityOption[]): Promise<void> {
        try {
            await setDoc(doc(db, "systemOptions", "priorities"), {
                options,
                updatedAt: serverTimestamp(),
            });
        } catch (error) {
            console.error("Erro ao atualizar opções de prioridade:", error);
            throw error;
        }
    }

    /**
     * Atualizar opções de unidade
     */
    async updateUnitOptions(options: UnitOption[]): Promise<void> {
        try {
            await setDoc(doc(db, "systemOptions", "units"), {
                options,
                updatedAt: serverTimestamp(),
            });
        } catch (error) {
            console.error("Erro ao atualizar opções de unidade:", error);
            throw error;
        }
    }

    /**
     * Atualizar opções de role de usuário
     */
    async updateUserRoleOptions(options: UserRoleOption[]): Promise<void> {
        try {
            await setDoc(doc(db, "systemOptions", "userRoles"), {
                options,
                updatedAt: serverTimestamp(),
            });
        } catch (error) {
            console.error("Erro ao atualizar opções de role:", error);
            throw error;
        }
    }
}

export const optionsService = new OptionsService();
