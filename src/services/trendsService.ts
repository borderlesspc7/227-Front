// src/services/trendsService.ts
import { db } from "../lib/firebaseconfig";
import {
    collection,
    query,
    where,
    orderBy,
    getDocs,
    Timestamp,
} from "firebase/firestore";
import type { AdditiveRequest } from "../types/additiveRequest";

export interface TrendData {
    current: number;
    previous: number;
    trend: string;
    trendType: "positive" | "negative" | "neutral";
}

export interface TrendsData {
    totalRequests: TrendData;
    approvalRate: TrendData;
    totalValue: TrendData;
    approvedValue: TrendData;
    pendingRequests: TrendData;
    rejectedRequests: TrendData;
}

class TrendsService {
    /**
     * Calcular trends comparando período atual com período anterior
     */
    async calculateTrends(companyId?: string): Promise<TrendsData> {
        try {
            const now = new Date();
            const currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const previousPeriodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const previousPeriodEnd = new Date(now.getFullYear(), now.getMonth(), 0);

            // Buscar dados do período atual
            const currentData = await this.getPeriodData(currentPeriodStart, now, companyId);

            // Buscar dados do período anterior
            const previousData = await this.getPeriodData(previousPeriodStart, previousPeriodEnd, companyId);

            return {
                totalRequests: this.calculateTrend(currentData.totalRequests, previousData.totalRequests),
                approvalRate: this.calculateTrend(currentData.approvalRate, previousData.approvalRate),
                totalValue: this.calculateTrend(currentData.totalValue, previousData.totalValue),
                approvedValue: this.calculateTrend(currentData.approvedValue, previousData.approvedValue),
                pendingRequests: this.calculateTrend(currentData.pendingRequests, previousData.pendingRequests),
                rejectedRequests: this.calculateTrend(currentData.rejectedRequests, previousData.rejectedRequests),
            };
        } catch (error) {
            console.error("Erro ao calcular trends:", error);
            // Retornar trends neutras em caso de erro
            return this.getNeutralTrends();
        }
    }

    /**
     * Buscar dados de um período específico
     */
    private async getPeriodData(startDate: Date, endDate: Date, companyId?: string) {
        const requestsRef = collection(db, "additiveRequests");

        let q;
        if (companyId) {
            q = query(
                requestsRef,
                where("companyId", "==", companyId),
                where("createdAt", ">=", Timestamp.fromDate(startDate)),
                where("createdAt", "<=", Timestamp.fromDate(endDate)),
                orderBy("createdAt", "desc")
            );
        } else {
            q = query(
                requestsRef,
                where("createdAt", ">=", Timestamp.fromDate(startDate)),
                where("createdAt", "<=", Timestamp.fromDate(endDate)),
                orderBy("createdAt", "desc")
            );
        }

        const snapshot = await getDocs(q);
        const requests = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as AdditiveRequest[];

        const totalRequests = requests.length;
        const approvedRequests = requests.filter(r => r.status === "aprovado").length;
        const pendingRequests = requests.filter(r => r.status === "pendente").length;
        const rejectedRequests = requests.filter(r => r.status === "rejeitado").length;

        const totalValue = requests.reduce((sum, r) => sum + r.valorTotal, 0);
        const approvedValue = requests
            .filter(r => r.status === "aprovado")
            .reduce((sum, r) => sum + r.valorTotal, 0);

        const approvalRate = totalRequests > 0 ? (approvedRequests / totalRequests) * 100 : 0;

        return {
            totalRequests,
            approvalRate,
            totalValue,
            approvedValue,
            pendingRequests,
            rejectedRequests,
        };
    }

    /**
     * Calcular trend entre dois valores
     */
    private calculateTrend(current: number, previous: number): TrendData {
        if (previous === 0) {
            return {
                current,
                previous,
                trend: current > 0 ? "+100%" : "0%",
                trendType: current > 0 ? "positive" : "neutral",
            };
        }

        const percentageChange = ((current - previous) / previous) * 100;
        const trend = `${percentageChange >= 0 ? "+" : ""}${percentageChange.toFixed(1)}%`;

        let trendType: "positive" | "negative" | "neutral" = "neutral";
        if (percentageChange > 0.1) trendType = "positive";
        else if (percentageChange < -0.1) trendType = "negative";

        return {
            current,
            previous,
            trend,
            trendType,
        };
    }

    /**
     * Retornar trends neutras em caso de erro
     */
    private getNeutralTrends(): TrendsData {
        return {
            totalRequests: { current: 0, previous: 0, trend: "0%", trendType: "neutral" },
            approvalRate: { current: 0, previous: 0, trend: "0%", trendType: "neutral" },
            totalValue: { current: 0, previous: 0, trend: "0%", trendType: "neutral" },
            approvedValue: { current: 0, previous: 0, trend: "0%", trendType: "neutral" },
            pendingRequests: { current: 0, previous: 0, trend: "0%", trendType: "neutral" },
            rejectedRequests: { current: 0, previous: 0, trend: "0%", trendType: "neutral" },
        };
    }
}

export const trendsService = new TrendsService();
