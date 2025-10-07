import { createContext, useState, useEffect, useContext, useCallback } from "react";
import type { ReactNode } from "react";
import type { Company, SubscriptionStatus } from "../types/subscription";
import { subscriptionService } from "../services/subscriptionService";
import type { User } from "../types/auth";

interface CompanyContextType {
    company: Company | null;
    subscriptionStatus: SubscriptionStatus | null;
    loading: boolean;
    error: string | null;
    refreshCompany: () => Promise<void>;
    refreshSubscription: () => Promise<void>;
}

export const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children, user }: { children: ReactNode; user: User | null }) {
    const [company, setCompany] = useState<Company | null>(null);
    const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refreshCompany = useCallback(async () => {
        if (!user?.companyId) return;

        try {
            setLoading(true);
            setError(null);
            const companyData = await subscriptionService.getCompanyById(user.companyId);
            setCompany(companyData);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao carregar dados da empresa");
        } finally {
            setLoading(false);
        }
    }, [user?.companyId]);

    const refreshSubscription = useCallback(async () => {
        if (!user?.companyId) return;

        try {
            const status = await subscriptionService.getSubscriptionStatus(user.companyId);
            setSubscriptionStatus(status);
        } catch (err) {
            console.error("Erro ao carregar status da assinatura:", err);
        }
    }, [user?.companyId]);

    useEffect(() => {
        if (user?.companyId) {
            refreshCompany();
            refreshSubscription();
        } else {
            setCompany(null);
            setSubscriptionStatus(null);
            setLoading(false);
        }
    }, [user?.companyId, refreshCompany, refreshSubscription]);

    const value = {
        company,
        subscriptionStatus,
        loading,
        error,
        refreshCompany,
        refreshSubscription,
    };

    return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
}

export function useCompany() {
    const context = useContext(CompanyContext);
    if (context === undefined) {
        throw new Error("useCompany must be used within a CompanyProvider");
    }
    return context;
}
