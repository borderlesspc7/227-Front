export interface Item {
    id: string;
    descricao: string;
    unidade: string;
    precoUnitario: number;
    observacoes?: string;
    categoria?: string;
    imagemUrl?: string;
    ativo: boolean;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ItemFormData {
    descricao: string;
    unidade: string;
    precoUnitario: number;
    observacoes?: string;
    categoria?: string;
    imagemUrl?: string;
}

export interface UpdateItemData {
    descricao?: string;
    unidade?: string;
    precoUnitario?: number;
    observacoes?: string;
    categoria?: string;
    imagemUrl?: string;
    ativo?: boolean;
}
