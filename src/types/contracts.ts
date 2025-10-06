export interface Contract {
  id: string;
  companyId: string; // Referência para a empresa
  cliente: string;
  obra: string;
  numeroContrato: string;
  vigenciaInicio: string;
  vigenciaFim: string;
  valor: number; // Valor como número para armazenamento
  pdfFile: File | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  status: "ativo" | "inativo" | "pendente";
}

// Tipo para o formulário onde valor é string (formatado)
export interface ContractFormData {
  id: string;
  companyId: string; // Referência para a empresa
  cliente: string;
  obra: string;
  numeroContrato: string;
  vigenciaInicio: string;
  vigenciaFim: string;
  valor: string; // Valor como string formatado
  pdfFile: File | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  status: "ativo" | "inativo" | "pendente";
}

export interface UpdateContractData {
  cliente?: string;
  obra?: string;
  numeroContrato?: string;
  vigenciaInicio?: string;
  vigenciaFim?: string;
  valor?: number;
  status?: "ativo" | "inativo" | "pendente";
}
