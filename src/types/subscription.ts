export type SubscriptionPlan = "starter" | "business" | "enterprise";

export interface SubscriptionLimits {
    maxActiveContracts: number;
    maxUsers: number;
    maxItems: number;
    maxFormalizations: number;
    maxAdditiveRequests: number;
    storageGB: number;
    supportLevel: "basic" | "priority" | "dedicated";
    features: {
        analytics: boolean;
        customReports: boolean;
        apiAccess: boolean;
        whiteLabel: boolean;
        sso: boolean;
        auditLogs: boolean;
    };
}

export interface SubscriptionPlanConfig {
    id: SubscriptionPlan;
    name: string;
    description: string;
    price: number; // Preço mensal em reais
    limits: SubscriptionLimits;
    features: string[];
}

export interface Company {
    id: string;
    cnpj: string;
    companyName: string;
    tradeName?: string;
    email: string;
    phone: string;
    address: {
        street: string;
        number: string;
        complement?: string;
        neighborhood: string;
        city: string;
        state: string;
        zipCode: string;
    };
    subscription: {
        plan: SubscriptionPlan;
        status: "active" | "inactive" | "suspended" | "trial";
        startDate: Date;
        endDate: Date;
        trialEndDate?: Date;
        autoRenew: boolean;
        paymentMethod?: string;
    };
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
}

export interface SubscriptionUsage {
    companyId: string;
    activeContracts: number;
    totalUsers: number;
    totalItems: number;
    totalFormalizations: number;
    totalAdditiveRequests: number;
    storageUsedGB: number;
    lastUpdated: Date;
}

export interface SubscriptionStatus {
    plan: SubscriptionPlan;
    status: "active" | "inactive" | "suspended" | "trial";
    usage: SubscriptionUsage;
    limits: SubscriptionLimits;
    canUpgrade: boolean;
    canDowngrade: boolean;
    daysUntilRenewal: number;
    trialDaysRemaining?: number;
}
