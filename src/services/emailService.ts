// src/services/emailService.ts
import { db } from "../lib/firebaseconfig";
import { doc, getDoc } from "firebase/firestore";
import type { User } from "../types/auth";

// Tipos de e-mail suportados
export type EmailType =
    | "new_request"
    | "approval_required"
    | "approved"
    | "rejected"
    | "returned"
    | "request_submitted"
    | "signature_pending"
    | "signature_completed"
    | "contract_limit_warning"
    | "pending_returns"
    | "pending_formalizations";

export interface EmailParams {
    to: string;
    toName?: string;
    type: EmailType;
    subject?: string;
    data: Record<string, string | number | undefined>;
    templateData?: Record<string, string | number | undefined>;
}

export interface EmailResult {
    success: boolean;
    messageId?: string;
    error?: string;
}

// Configuração do serviço de e-mail
const EMAIL_CONFIG = {
    // URL da Cloud Function (se usar Firebase Functions)
    // ou URL da sua API de e-mail personalizada
    apiUrl: import.meta.env.VITE_EMAIL_API_URL || "https://us-central1-addcontrol-81689.cloudfunctions.net/sendEmail",

    // Se usar SendGrid diretamente no frontend (não recomendado para produção)
    useSendGrid: import.meta.env.VITE_USE_SENDGRID === "true",
    sendGridApiKey: import.meta.env.VITE_SENDGRID_API_KEY,

    // Configurações do remetente
    fromEmail: import.meta.env.VITE_FROM_EMAIL || "noreply@addcontrol.com.br",
    fromName: import.meta.env.VITE_FROM_NAME || "AddControl",
};

class EmailService {
    /**
     * Enviar e-mail usando Cloud Function ou API REST
     */
    async sendEmail(params: EmailParams): Promise<EmailResult> {
        try {
            // Validar parâmetros
            if (!params.to || !params.type) {
                throw new Error("Parâmetros obrigatórios ausentes: 'to' e 'type'");
            }

            // Se usar SendGrid diretamente (não recomendado em produção)
            if (EMAIL_CONFIG.useSendGrid && EMAIL_CONFIG.sendGridApiKey) {
                return await this.sendViaSendGrid(params);
            }

            // Usar Cloud Function ou API REST (recomendado)
            return await this.sendViaAPI(params);
        } catch (error) {
            console.error("Erro ao enviar e-mail:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Erro desconhecido",
            };
        }
    }

    /**
     * Enviar via Cloud Function ou API REST
     */
    private async sendViaAPI(params: EmailParams): Promise<EmailResult> {
        try {
            const emailData = {
                to: params.to,
                toName: params.toName,
                type: params.type,
                subject: params.subject || this.getDefaultSubject(params.type),
                data: params.data,
                templateData: params.templateData || {},
            };

            const response = await fetch(EMAIL_CONFIG.apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(emailData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
            }

            const result = await response.json();
            return {
                success: true,
                messageId: result.messageId,
            };
        } catch (error) {
            console.error("Erro ao enviar e-mail via API:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Erro ao enviar e-mail",
            };
        }
    }

    /**
     * Enviar via SendGrid diretamente (não recomendado para produção)
     * Use apenas para desenvolvimento/testes
     */
    private async sendViaSendGrid(params: EmailParams): Promise<EmailResult> {
        try {
            const htmlContent = this.generateEmailHTML(params.type, params.data, params.templateData);
            const textContent = this.generateEmailText(params.type, params.data);

            const emailPayload = {
                personalizations: [
                    {
                        to: [
                            {
                                email: params.to,
                                name: params.toName || params.to,
                            },
                        ],
                    },
                ],
                from: {
                    email: EMAIL_CONFIG.fromEmail,
                    name: EMAIL_CONFIG.fromName,
                },
                subject: params.subject || this.getDefaultSubject(params.type),
                content: [
                    {
                        type: "text/plain",
                        value: textContent,
                    },
                    {
                        type: "text/html",
                        value: htmlContent,
                    },
                ],
            };

            const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${EMAIL_CONFIG.sendGridApiKey}`,
                },
                body: JSON.stringify(emailPayload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`SendGrid Error: ${response.status} - ${errorText}`);
            }

            const messageId = response.headers.get("X-Message-Id") || undefined;

            return {
                success: true,
                messageId,
            };
        } catch (error) {
            console.error("Erro ao enviar e-mail via SendGrid:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Erro ao enviar e-mail",
            };
        }
    }

    /**
     * Obter assunto padrão baseado no tipo de e-mail
     */
    private getDefaultSubject(type: EmailType): string {
        const subjects: Record<EmailType, string> = {
            new_request: "Nova solicitação para aprovação - AddControl",
            approval_required: "Aprovação necessária - AddControl",
            approved: "Solicitação aprovada - AddControl",
            rejected: "Solicitação rejeitada - AddControl",
            returned: "Solicitação devolvida - AddControl",
            request_submitted: "Solicitação enviada para aprovação - AddControl",
            signature_pending: "Documento pendente de assinatura - AddControl",
            signature_completed: "Documento assinado com sucesso - AddControl",
            contract_limit_warning: "Alerta de limite de contratos - AddControl",
            pending_returns: "Devoluções pendentes - AddControl",
            pending_formalizations: "Formalizações pendentes - AddControl",
        };

        return subjects[type] || "Notificação - AddControl";
    }

    /**
     * Gerar HTML do e-mail
     */
    private generateEmailHTML(
        type: EmailType,
        data: Record<string, string | number | undefined>,
        templateData?: Record<string, string | number | undefined>
    ): string {
        const baseTemplate = this.getBaseEmailTemplate();
        const content = this.getEmailContent(type, data, templateData);

        return baseTemplate.replace("{{CONTENT}}", content);
    }

    /**
     * Gerar texto simples do e-mail
     */
    private generateEmailText(type: EmailType, data: Record<string, string | number | undefined>): string {
        const content = this.getEmailContent(type, data, {}, false);
        // Remover HTML tags para versão texto
        return content.replace(/<[^>]*>/g, "").replace(/\n\s*\n/g, "\n");
    }

    /**
     * Template base HTML para e-mails
     */
    private getBaseEmailTemplate(): string {
        return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AddControl - Notificação</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .email-container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #3b82f6;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #3b82f6;
      margin-bottom: 10px;
    }
    .content {
      margin-bottom: 30px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #3b82f6;
      color: #ffffff;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
    }
    .button:hover {
      background-color: #2563eb;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
    }
    .info-box {
      background-color: #f3f4f6;
      border-left: 4px solid #3b82f6;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .alert-box {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .error-box {
      background-color: #fee2e2;
      border-left: 4px solid #ef4444;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .success-box {
      background-color: #d1fae5;
      border-left: 4px solid #10b981;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="logo">AddControl</div>
      <p style="color: #6b7280; margin: 0;">Sistema de Gestão de Aditivos</p>
    </div>
    <div class="content">
      {{CONTENT}}
    </div>
    <div class="footer">
      <p>Este é um e-mail automático do sistema AddControl.</p>
      <p>Por favor, não responda a este e-mail.</p>
    </div>
  </div>
</body>
</html>
    `.trim();
    }

    /**
     * Obter conteúdo do e-mail baseado no tipo
     */
    private getEmailContent(
        type: EmailType,
        data: Record<string, string | number | undefined>,
        _templateData?: Record<string, string | number | undefined>,
        isHTML: boolean = true
    ): string {
        const br = isHTML ? "<br>" : "\n";

        switch (type) {
            case "new_request":
                return `
          <h2>Nova Solicitação para Aprovação</h2>
          <p>Olá,</p>
          <p>Uma nova solicitação de aditivo foi enviada para sua aprovação:</p>
          <div class="info-box">
            <strong>Protocolo:</strong> ${data.protocolo || "N/A"}${br}
            <strong>Valor:</strong> R$ ${data.valorTotal?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) || "0,00"}${br}
            <strong>Enviado por:</strong> ${data.senderName || "Sistema"}${br}
            ${data.department ? `<strong>Departamento:</strong> ${data.department}${br}` : ""}
          </div>
          ${data.actionUrl ? `<a href="${data.actionUrl}" class="button">Ver Solicitação</a>` : ""}
        `;

            case "approval_required":
                return `
          <h2>Aprovação Necessária</h2>
          <p>Olá,</p>
          <p>Uma solicitação requer sua aprovação:</p>
          <div class="alert-box">
            <strong>Protocolo:</strong> ${data.protocolo || "N/A"}${br}
            <strong>Aprovado por:</strong> ${data.senderName || "Sistema"}${br}
            ${data.comments ? `<strong>Comentários:</strong> ${data.comments}${br}` : ""}
          </div>
          ${data.actionUrl ? `<a href="${data.actionUrl}" class="button">Aprovar/Rejeitar</a>` : ""}
        `;

            case "approved":
                return `
          <h2>✅ Solicitação Aprovada</h2>
          <p>Olá,</p>
          <p>Sua solicitação foi <strong>aprovada</strong> com sucesso!</p>
          <div class="success-box">
            <strong>Protocolo:</strong> ${data.protocolo || "N/A"}${br}
            <strong>Aprovado por:</strong> ${data.senderName || "Sistema"}${br}
            ${data.comments ? `<strong>Comentários:</strong> ${data.comments}${br}` : ""}
          </div>
          <p>O documento de assinatura será gerado automaticamente.</p>
          ${data.actionUrl ? `<a href="${data.actionUrl}" class="button">Ver Solicitação</a>` : ""}
        `;

            case "rejected":
                return `
          <h2>❌ Solicitação Rejeitada</h2>
          <p>Olá,</p>
          <p>Infelizmente, sua solicitação foi <strong>rejeitada</strong>:</p>
          <div class="error-box">
            <strong>Protocolo:</strong> ${data.protocolo || "N/A"}${br}
            <strong>Rejeitado por:</strong> ${data.senderName || "Sistema"}${br}
            ${data.comments ? `<strong>Motivo:</strong> ${data.comments}${br}` : ""}
          </div>
          ${data.actionUrl ? `<a href="${data.actionUrl}" class="button">Ver Solicitação</a>` : ""}
        `;

            case "returned":
                return `
          <h2>↩️ Solicitação Devolvida</h2>
          <p>Olá,</p>
          <p>Sua solicitação foi <strong>devolvida</strong> para correções:</p>
          <div class="alert-box">
            <strong>Protocolo:</strong> ${data.protocolo || "N/A"}${br}
            <strong>Devolvido por:</strong> ${data.senderName || "Sistema"}${br}
            ${data.comments ? `<strong>Comentários:</strong> ${data.comments}${br}` : ""}
          </div>
          ${data.actionUrl ? `<a href="${data.actionUrl}" class="button">Corrigir Solicitação</a>` : ""}
        `;

            case "request_submitted":
                return `
          <h2>Solicitação Enviada</h2>
          <p>Olá,</p>
          <p>Sua solicitação foi enviada para aprovação com sucesso:</p>
          <div class="info-box">
            <strong>Protocolo:</strong> ${data.protocolo || "N/A"}${br}
            <strong>Primeira Etapa:</strong> ${data.stepName || "Aprovação"}${br}
          </div>
          <p>Você será notificado quando houver atualizações.</p>
          ${data.actionUrl ? `<a href="${data.actionUrl}" class="button">Acompanhar Solicitação</a>` : ""}
        `;

            case "signature_pending":
                return `
          <h2>📝 Documento Pendente de Assinatura</h2>
          <p>Olá,</p>
          <p>Você tem um documento <strong>pendente de assinatura</strong>:</p>
          <div class="alert-box">
            <strong>Protocolo:</strong> ${data.protocolo || "N/A"}${br}
            <strong>Contrato:</strong> ${data.contractNumber || "N/A"}${br}
            <strong>Valor:</strong> R$ ${data.valorTotal?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) || "0,00"}${br}
          </div>
          <p>Por favor, acesse o sistema para assinar o documento digitalmente.</p>
          ${data.actionUrl ? `<a href="${data.actionUrl}" class="button">Assinar Documento</a>` : ""}
        `;

            case "signature_completed":
                return `
          <h2>✅ Documento Assinado</h2>
          <p>Olá,</p>
          <p>O documento foi <strong>assinado com sucesso</strong>:</p>
          <div class="success-box">
            <strong>Protocolo:</strong> ${data.protocolo || "N/A"}${br}
            <strong>Contrato:</strong> ${data.contractNumber || "N/A"}${br}
            <strong>Data de Assinatura:</strong> ${data.signatureDate || new Date().toLocaleDateString("pt-BR")}${br}
          </div>
          ${data.actionUrl ? `<a href="${data.actionUrl}" class="button">Ver Documento Assinado</a>` : ""}
        `;

            case "contract_limit_warning":
                return `
          <h2>⚠️ Alerta de Limite</h2>
          <p>Olá,</p>
          <p>Você está próximo do limite de contratos ativos:</p>
          <div class="alert-box">
            <strong>Uso atual:</strong> ${data.currentUsage || 0} / ${data.maxLimit || 0}${br}
            <strong>Percentual:</strong> ${data.percentage || 0}%${br}
          </div>
          <p>Considere fazer upgrade do plano para continuar adicionando contratos.</p>
          ${data.actionUrl ? `<a href="${data.actionUrl}" class="button">Ver Planos</a>` : ""}
        `;

            case "pending_returns":
                return `
          <h2>📋 Devoluções Pendentes</h2>
          <p>Olá,</p>
          <p>Você tem <strong>${data.count || 0} solicitação(ões)</strong> devolvida(s) há mais de 24 horas que precisam de atenção.</p>
          <div class="alert-box">
            <p>Por favor, acesse o sistema para revisar e corrigir as solicitações devolvidas.</p>
          </div>
          ${data.actionUrl ? `<a href="${data.actionUrl}" class="button">Ver Devoluções</a>` : ""}
        `;

            case "pending_formalizations":
                return `
          <h2>📄 Formalizações Pendentes</h2>
          <p>Olá,</p>
          <p>Você tem <strong>${data.count || 0} agrupamento(s)</strong> pronto(s) para formalização há mais de 48 horas.</p>
          <div class="info-box">
            <p>Por favor, acesse o sistema para realizar a formalização.</p>
          </div>
          ${data.actionUrl ? `<a href="${data.actionUrl}" class="button">Ver Formalizações</a>` : ""}
        `;

            default:
                return `
          <h2>Notificação</h2>
          <p>Olá,</p>
          <p>Você recebeu uma nova notificação do sistema AddControl.</p>
          ${data.message ? `<p>${data.message}</p>` : ""}
        `;
        }
    }

    /**
     * Buscar e-mail do usuário no Firestore
     */
    async getUserEmail(userId: string): Promise<string | null> {
        try {
            const userRef = doc(db, "users", userId);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
                const userData = userDoc.data() as User;
                return userData.email || null;
            }

            return null;
        } catch (error) {
            console.error("Erro ao buscar e-mail do usuário:", error);
            return null;
        }
    }
}

export const emailService = new EmailService();
export default emailService;

