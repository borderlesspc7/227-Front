import type { AdditiveRequest } from "./additiveRequest";

export interface OSAGroup {
    id: string;
    name: string;
    description?: string;
    osas: AdditiveRequest[];
    totalValue: number;
    cutoffCriteria: CutoffCriteria;
    createdAt: Date;
    createdBy: string;
    status: "draft" | "ready" | "formalized" | "cancelled";
    formalizationData?: FormalizationData;
}

export interface CutoffCriteria {
    type: "value" | "period" | "contract" | "manual";
    value?: number; // Para critério de valor
    startDate?: Date; // Para critério de período
    endDate?: Date; // Para critério de período
    contractId?: string; // Para critério de contrato
    description?: string; // Para critério manual
}

export interface FormalizationData {
    documentNumber: string;
    generatedAt: Date;
    generatedBy: string;
    pdfUrl?: string;
    signedAt?: Date;
    signedBy?: string;
    signatureProvider?: "clicksign" | "zapsign" | "docusign";
    signatureId?: string;
}

export interface OSAFormalizationFormData {
    name: string;
    description?: string;
    cutoffCriteria: CutoffCriteria;
    selectedOSAs: string[]; // IDs das OSAs selecionadas
}

export interface UpdateOSAGroupData {
    name?: string;
    description?: string;
    cutoffCriteria?: CutoffCriteria;
    status?: OSAGroup["status"];
    formalizationData?: FormalizationData;
}
