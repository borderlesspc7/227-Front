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
            // Inicializar opções do sistema
            await optionsService.initializeDefaultOptions();

            // Inicializar workflow padrão
            await workflowService.setupDefaultWorkflow();

            // Inicializar sistema de alertas avançados
            this.startAdvancedAlertsSystem();
        } catch (error) {
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
            } catch (error) {
                // Silencioso
            }
        }, 6 * 60 * 60 * 1000); // 6 horas
    }

    /**
     * Parar sistema de alertas avançados
     */
    stopAdvancedAlertsSystem(): void {
        if (this.alertInterval) {
            clearInterval(this.alertInterval);
            this.alertInterval = null;
        }
    }

    /**
     * Executar alertas manualmente para uma empresa específica
     */
    async runAlertsForCompany(companyId: string): Promise<void> {
        try {
            await notificationService.runAdvancedAlerts(companyId);
        } catch (error) {
            throw error;
        }
    }
}

export const systemInitializer = new SystemInitializer();
