// src/services/systemInitializer.ts
import { optionsService } from "./optionsService";
import { workflowService } from "./workflowService";
import { notificationService } from "./notificationService";

class SystemInitializer {
    private alertInterval: NodeJS.Timeout | null = null;

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

            // Inicializar sistema de alertas avançados
            this.startAdvancedAlertsSystem();
            console.log("✅ Sistema de alertas avançados iniciado");

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

    /**
     * Iniciar sistema de alertas avançados
     */
    startAdvancedAlertsSystem(): void {
        // Executar alertas a cada 6 horas
        this.alertInterval = setInterval(async () => {
            try {
                console.log("🔄 Executando verificações de alertas avançados...");

                // Buscar todas as empresas ativas
                const { db } = await import("../lib/firebaseconfig");
                const { collection, getDocs } = await import("firebase/firestore");

                const companiesRef = collection(db, "companies");
                const companiesSnapshot = await getDocs(companiesRef);

                const companies = companiesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // Executar alertas para cada empresa
                const alertPromises = companies.map(async (company: any) => {
                    if (company.id) {
                        await notificationService.runAdvancedAlerts(company.id);
                    }
                });

                await Promise.all(alertPromises);
                console.log("✅ Verificações de alertas concluídas");
            } catch (error) {
                console.error("❌ Erro ao executar alertas avançados:", error);
            }
        }, 6 * 60 * 60 * 1000); // 6 horas

        console.log("🚀 Sistema de alertas avançados iniciado (verificações a cada 6 horas)");
    }

    /**
     * Parar sistema de alertas avançados
     */
    stopAdvancedAlertsSystem(): void {
        if (this.alertInterval) {
            clearInterval(this.alertInterval);
            this.alertInterval = null;
            console.log("🛑 Sistema de alertas avançados parado");
        }
    }

    /**
     * Executar alertas manualmente para uma empresa específica
     */
    async runAlertsForCompany(companyId: string): Promise<void> {
        try {
            console.log(`🔄 Executando alertas para empresa ${companyId}...`);
            await notificationService.runAdvancedAlerts(companyId);
            console.log(`✅ Alertas executados para empresa ${companyId}`);
        } catch (error) {
            console.error(`❌ Erro ao executar alertas para empresa ${companyId}:`, error);
            throw error;
        }
    }
}

export const systemInitializer = new SystemInitializer();
