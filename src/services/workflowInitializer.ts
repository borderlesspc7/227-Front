// src/services/workflowInitializer.ts
import { workflowService } from "./workflowService";

export const initializeWorkflow = async (): Promise<void> => {
  try {
    console.log("Inicializando workflow de aprovação...");

    // Configurar workflow padrão
    await workflowService.setupDefaultWorkflow();

    console.log("Workflow de aprovação inicializado com sucesso!");
  } catch (error) {
    console.error("Erro ao inicializar workflow:", error);
    throw error;
  }
};
