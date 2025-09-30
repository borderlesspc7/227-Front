// src/services/systemInitializer.ts
import { optionsService } from "./optionsService";
import { workflowService } from "./workflowService";

class SystemInitializer {
    /**
     * Inicializar sistema com dados padrão
     */
    async initializeSystem(): Promise<void> {
        try {
            console.log("Inicializando sistema...");

            // Inicializar opções do sistema
            await optionsService.initializeDefaultOptions();
            console.log("✅ Opções do sistema inicializadas");

            // Inicializar workflow padrão
            await workflowService.setupDefaultWorkflow();
            console.log("✅ Workflow padrão configurado");

            console.log("🎉 Sistema inicializado com sucesso!");
        } catch (error) {
            console.error("❌ Erro ao inicializar sistema:", error);
            throw error;
        }
    }

    /**
     * Verificar se o sistema precisa ser inicializado
     */
    async needsInitialization(): Promise<boolean> {
        try {
            // Tentar carregar opções - se falhar, precisa inicializar
            await optionsService.getPriorityOptions();
            return false;
        } catch {
            return true;
        }
    }
}

export const systemInitializer = new SystemInitializer();
