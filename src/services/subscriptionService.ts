import { db } from "../lib/firebaseconfig";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    query,
    where,
    addDoc,
    Timestamp
} from "firebase/firestore";
import type {
    Company,
    SubscriptionPlan,
    SubscriptionLimits,
    SubscriptionPlanConfig,
    SubscriptionUsage,
    SubscriptionStatus
} from "../types/subscription";

// Configurações dos planos de assinatura
export const SUBSCRIPTION_PLANS: Record<SubscriptionPlan, SubscriptionPlanConfig> = {
    starter: {
        id: "starter",
        name: "Starter",
        description: "Ideal para pequenas empresas iniciando no mercado",
        price: 99.90,
        limits: {
            maxActiveContracts: 5,
            maxUsers: 3,
            maxItems: 50,
            maxFormalizations: 20,
            maxAdditiveRequests: 10,
            storageGB: 1,
            supportLevel: "basic",
            features: {
                analytics: false,
                customReports: false,
                apiAccess: false,
                whiteLabel: false,
                sso: false,
                auditLogs: false,
            },
        },
        features: [
            "Até 5 contratos ativos",
            "Até 3 usuários",
            "Suporte básico por email",
            "Relatórios padrão",
        ],
    },
    business: {
        id: "business",
        name: "Business",
        description: "Para empresas em crescimento que precisam de mais recursos",
        price: 299.90,
        limits: {
            maxActiveContracts: 25,
            maxUsers: 10,
            maxItems: 200,
            maxFormalizations: 100,
            maxAdditiveRequests: 50,
            storageGB: 10,
            supportLevel: "priority",
            features: {
                analytics: true,
                customReports: true,
                apiAccess: true,
                whiteLabel: false,
                sso: false,
                auditLogs: true,
            },
        },
        features: [
            "Até 25 contratos ativos",
            "Até 10 usuários",
            "Suporte prioritário",
            "Relatórios personalizados",
            "Acesso à API",
            "Analytics avançado",
            "Logs de auditoria",
        ],
    },
    enterprise: {
        id: "enterprise",
        name: "Enterprise",
        description: "Solução completa para grandes empresas",
        price: 799.90,
        limits: {
            maxActiveContracts: -1, // Ilimitado
            maxUsers: -1, // Ilimitado
            maxItems: -1, // Ilimitado
            maxFormalizations: -1, // Ilimitado
            maxAdditiveRequests: -1, // Ilimitado
            storageGB: 100,
            supportLevel: "dedicated",
            features: {
                analytics: true,
                customReports: true,
                apiAccess: true,
                whiteLabel: true,
                sso: true,
                auditLogs: true,
            },
        },
        features: [
            "Contratos ilimitados",
            "Usuários ilimitados",
            "Suporte dedicado",
            "White label",
            "SSO integrado",
            "Todos os recursos",
            "SLA garantido",
        ],
    },
};

export const subscriptionService = {
    // Validação de CNPJ
    validateCNPJ(cnpj: string): boolean {
        // Remove caracteres não numéricos
        const cleanCNPJ = cnpj.replace(/[^\d]/g, "");

        // Verifica se tem 14 dígitos
        if (cleanCNPJ.length !== 14) return false;

        // Verifica se não são todos iguais
        if (/^(\d)\1+$/.test(cleanCNPJ)) return false;

        // Validação dos dígitos verificadores
        let sum = 0;
        let weight = 5;

        // Primeiro dígito verificador
        for (let i = 0; i < 12; i++) {
            sum += parseInt(cleanCNPJ[i]) * weight;
            weight = weight === 2 ? 9 : weight - 1;
        }

        const firstDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
        if (parseInt(cleanCNPJ[12]) !== firstDigit) return false;

        // Segundo dígito verificador
        sum = 0;
        weight = 6;

        for (let i = 0; i < 13; i++) {
            sum += parseInt(cleanCNPJ[i]) * weight;
            weight = weight === 2 ? 9 : weight - 1;
        }

        const secondDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
        return parseInt(cleanCNPJ[13]) === secondDigit;
    },

    // Criar empresa
    async createCompany(companyData: Omit<Company, "id" | "createdAt" | "updatedAt">): Promise<Company> {
        try {
            const now = new Date();
            const company: Company = {
                ...companyData,
                id: "", // Será definido pelo Firestore
                createdAt: now,
                updatedAt: now,
            };

            const docRef = await addDoc(collection(db, "companies"), {
                ...company,
                createdAt: Timestamp.fromDate(now),
                updatedAt: Timestamp.fromDate(now),
                subscription: {
                    ...company.subscription,
                    startDate: Timestamp.fromDate(company.subscription.startDate),
                    endDate: Timestamp.fromDate(company.subscription.endDate),
                    trialEndDate: company.subscription.trialEndDate
                        ? Timestamp.fromDate(company.subscription.trialEndDate)
                        : null,
                },
            });

            return { ...company, id: docRef.id };
        } catch (error) {
            throw new Error(`Erro ao criar empresa: ${error}`);
        }
    },

    // Buscar empresa por CNPJ
    async getCompanyByCNPJ(cnpj: string): Promise<Company | null> {
        try {
            const q = query(
                collection(db, "companies"),
                where("cnpj", "==", cnpj)
            );

            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) return null;

            const doc = querySnapshot.docs[0];
            const data = doc.data();

            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt.toDate(),
                updatedAt: data.updatedAt.toDate(),
                subscription: {
                    ...data.subscription,
                    startDate: data.subscription.startDate.toDate(),
                    endDate: data.subscription.endDate.toDate(),
                    trialEndDate: data.subscription.trialEndDate?.toDate(),
                },
            } as Company;
        } catch (error) {
            throw new Error(`Erro ao buscar empresa: ${error}`);
        }
    },

    // Buscar empresa por ID
    async getCompanyById(companyId: string): Promise<Company | null> {
        try {
            const docRef = doc(db, "companies", companyId);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) return null;

            const data = docSnap.data();

            return {
                id: docSnap.id,
                ...data,
                createdAt: data.createdAt.toDate(),
                updatedAt: data.updatedAt.toDate(),
                subscription: {
                    ...data.subscription,
                    startDate: data.subscription.startDate.toDate(),
                    endDate: data.subscription.endDate.toDate(),
                    trialEndDate: data.subscription.trialEndDate?.toDate(),
                },
            } as Company;
        } catch (error) {
            throw new Error(`Erro ao buscar empresa: ${error}`);
        }
    },

    // Atualizar empresa
    async updateCompany(companyId: string, updates: Partial<Company>): Promise<void> {
        try {
            const docRef = doc(db, "companies", companyId);
            const updateData = {
                ...updates,
                updatedAt: Timestamp.fromDate(new Date()),
            };

            if (updates.subscription) {
                updateData.subscription = {
                    ...updates.subscription,
                    startDate: updates.subscription.startDate,
                    endDate: updates.subscription.endDate,
                    trialEndDate: updates.subscription.trialEndDate,
                };
            }

            await updateDoc(docRef, updateData);
        } catch (error) {
            throw new Error(`Erro ao atualizar empresa: ${error}`);
        }
    },

    // Obter uso atual da empresa
    async getCompanyUsage(companyId: string): Promise<SubscriptionUsage> {
        try {
            const docRef = doc(db, "subscriptionUsage", companyId);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                // Retorna uso zerado se não existir
                return {
                    companyId,
                    activeContracts: 0,
                    totalUsers: 0,
                    totalItems: 0,
                    totalFormalizations: 0,
                    totalAdditiveRequests: 0,
                    storageUsedGB: 0,
                    lastUpdated: new Date(),
                };
            }

            const data = docSnap.data();
            return {
                ...data,
                lastUpdated: data.lastUpdated.toDate(),
            } as SubscriptionUsage;
        } catch (error) {
            throw new Error(`Erro ao obter uso da empresa: ${error}`);
        }
    },

    // Atualizar uso da empresa
    async updateCompanyUsage(companyId: string, usage: Partial<SubscriptionUsage>): Promise<void> {
        try {
            const docRef = doc(db, "subscriptionUsage", companyId);
            const updateData = {
                ...usage,
                lastUpdated: Timestamp.fromDate(new Date()),
            };

            await setDoc(docRef, updateData, { merge: true });
        } catch (error) {
            throw new Error(`Erro ao atualizar uso da empresa: ${error}`);
        }
    },

    // Verificar status da assinatura
    async getSubscriptionStatus(companyId: string): Promise<SubscriptionStatus> {
        try {
            const company = await this.getCompanyById(companyId);
            if (!company) throw new Error("Empresa não encontrada");

            const usage = await this.getCompanyUsage(companyId);
            const planConfig = SUBSCRIPTION_PLANS[company.subscription.plan];

            const now = new Date();
            const daysUntilRenewal = Math.ceil(
                (company.subscription.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            );

            const trialDaysRemaining = company.subscription.trialEndDate
                ? Math.ceil(
                    (company.subscription.trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                )
                : undefined;

            return {
                plan: company.subscription.plan,
                status: company.subscription.status,
                usage,
                limits: planConfig.limits,
                canUpgrade: company.subscription.plan !== "enterprise",
                canDowngrade: company.subscription.plan !== "starter",
                daysUntilRenewal,
                trialDaysRemaining,
            };
        } catch (error) {
            throw new Error(`Erro ao obter status da assinatura: ${error}`);
        }
    },

    // Verificar se empresa pode executar ação baseada nos limites
    async canExecuteAction(
        companyId: string,
        action: keyof SubscriptionLimits
    ): Promise<{ canExecute: boolean; currentUsage: number; limit: number }> {
        try {
            const status = await this.getSubscriptionStatus(companyId);
            const currentUsage = status.usage[action === "maxActiveContracts" ? "activeContracts" :
                action === "maxUsers" ? "totalUsers" :
                    action === "maxItems" ? "totalItems" :
                        action === "maxFormalizations" ? "totalFormalizations" :
                            action === "maxAdditiveRequests" ? "totalAdditiveRequests" :
                                "storageUsedGB"] as number;

            const limit = status.limits[action];
            const canExecute = typeof limit === 'number' ? (limit === -1 || currentUsage < limit) : true;

            return {
                canExecute,
                currentUsage,
                limit: typeof limit === 'number' ? limit : 0,
            };
        } catch (error) {
            throw new Error(`Erro ao verificar limites: ${error}`);
        }
    },

    // Obter todos os planos disponíveis
    getAvailablePlans(): SubscriptionPlanConfig[] {
        return Object.values(SUBSCRIPTION_PLANS);
    },

    // Obter configuração de um plano específico
    getPlanConfig(plan: SubscriptionPlan): SubscriptionPlanConfig {
        return SUBSCRIPTION_PLANS[plan];
    },
};
