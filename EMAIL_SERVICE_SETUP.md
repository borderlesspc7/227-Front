# 📧 Configuração do Serviço de E-mails Automáticos

Este documento descreve como configurar o sistema de envio de e-mails automáticos do AddControl.

## 📋 Visão Geral

O sistema de e-mails automáticos envia notificações por e-mail quando ocorrem eventos importantes no sistema:

- ✅ Nova solicitação para aprovação
- ✅ Aprovação necessária
- ✅ Solicitação aprovada/rejeitada/devolvida
- ✅ Documento pendente de assinatura
- ✅ Documento assinado com sucesso
- ✅ Alertas de limites e pendências

## 🚀 Opções de Implementação

### Opção 1: Firebase Cloud Functions (Recomendado para Produção)

Esta é a opção recomendada para produção. Crie uma Cloud Function que processa o envio de e-mails.

#### Passo 1: Criar Cloud Function

1. Instale o Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Inicialize o projeto (se ainda não fez):
```bash
firebase init functions
```

3. Crie a função `sendEmail` em `functions/src/index.ts`:

```typescript
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as sgMail from "@sendgrid/mail";

admin.initializeApp();

sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");

export const sendEmail = functions.https.onRequest(async (req, res) => {
  // Habilitar CORS
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  try {
    const { to, toName, type, subject, data, templateData } = req.body;

    // Gerar conteúdo do e-mail (usar templates similares ao emailService.ts)
    const htmlContent = generateEmailHTML(type, data, templateData);
    const textContent = generateEmailText(type, data);

    const msg = {
      to: to,
      from: {
        email: process.env.FROM_EMAIL || "noreply@addcontrol.com.br",
        name: process.env.FROM_NAME || "AddControl",
      },
      subject: subject || getDefaultSubject(type),
      text: textContent,
      html: htmlContent,
    };

    await sgMail.send(msg);

    res.status(200).json({
      success: true,
      messageId: "email-sent",
    });
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
});

function getDefaultSubject(type: string): string {
  const subjects: Record<string, string> = {
    new_request: "Nova solicitação para aprovação - AddControl",
    approval_required: "Aprovação necessária - AddControl",
    approved: "Solicitação aprovada - AddControl",
    rejected: "Solicitação rejeitada - AddControl",
    returned: "Solicitação devolvida - AddControl",
    request_submitted: "Solicitação enviada para aprovação - AddControl",
    signature_pending: "Documento pendente de assinatura - AddControl",
    signature_completed: "Documento assinado com sucesso - AddControl",
  };
  return subjects[type] || "Notificação - AddControl";
}

function generateEmailHTML(type: string, data: any, templateData?: any): string {
  // Implementar templates HTML (similar ao emailService.ts)
  // ...
}

function generateEmailText(type: string, data: any): string {
  // Implementar versão texto (similar ao emailService.ts)
  // ...
}
```

4. Configure variáveis de ambiente:
```bash
firebase functions:config:set sendgrid.api_key="YOUR_SENDGRID_API_KEY"
firebase functions:config:set email.from="noreply@addcontrol.com.br"
firebase functions:config:set email.from_name="AddControl"
```

5. Instale dependências:
```bash
cd functions
npm install @sendgrid/mail
npm install --save-dev @types/node
```

6. Faça deploy:
```bash
firebase deploy --only functions
```

7. Configure a URL no `.env`:
```env
VITE_EMAIL_API_URL=https://us-central1-your-project.cloudfunctions.net/sendEmail
```

### Opção 2: SendGrid Direto (Apenas para Desenvolvimento/Testes)

⚠️ **NÃO RECOMENDADO PARA PRODUÇÃO** - Use apenas para testes locais.

#### Passo 1: Criar Conta SendGrid

1. Acesse: https://sendgrid.com
2. Crie uma conta gratuita (100 e-mails/dia)
3. Vá em **Settings** → **API Keys**
4. Crie uma nova API Key com permissão de **Mail Send**

#### Passo 2: Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_USE_SENDGRID=true
VITE_SENDGRID_API_KEY=SG.your_api_key_here
VITE_FROM_EMAIL=noreply@addcontrol.com.br
VITE_FROM_NAME=AddControl
```

⚠️ **IMPORTANTE**: 
- Nunca commite o arquivo `.env` no Git
- Adicione `.env` ao `.gitignore`
- Use variáveis de ambiente do servidor em produção

## 📝 Configuração das Variáveis de Ambiente

### Variáveis Obrigatórias (para Cloud Functions)

```env
VITE_EMAIL_API_URL=https://us-central1-your-project.cloudfunctions.net/sendEmail
```

### Variáveis Opcionais

```env
# Configurações do Remetente
VITE_FROM_EMAIL=noreply@addcontrol.com.br
VITE_FROM_NAME=AddControl

# SendGrid (apenas para desenvolvimento)
VITE_USE_SENDGRID=false
VITE_SENDGRID_API_KEY=your_api_key_here
```

## 🔧 Como Funciona

1. **Eventos Disparam Notificações**: Quando ocorre um evento (nova solicitação, aprovação, etc.), o sistema cria uma notificação interna no Firestore.

2. **Envio Automático de E-mail**: O serviço `notificationService` automaticamente tenta enviar um e-mail para o usuário relacionado.

3. **Não Bloqueante**: Se o envio de e-mail falhar, a notificação interna ainda é criada. O erro é logado mas não interrompe o fluxo.

4. **Busca de E-mail**: O sistema busca o e-mail do usuário no Firestore automaticamente.

## 📧 Tipos de E-mail Suportados

- `new_request` - Nova solicitação para aprovação
- `approval_required` - Aprovação necessária
- `approved` - Solicitação aprovada
- `rejected` - Solicitação rejeitada
- `returned` - Solicitação devolvida
- `request_submitted` - Solicitação enviada
- `signature_pending` - Documento pendente de assinatura
- `signature_completed` - Documento assinado
- `contract_limit_warning` - Alerta de limite de contratos
- `pending_returns` - Devoluções pendentes
- `pending_formalizations` - Formalizações pendentes

## 🧪 Testando

### Teste Manual

1. Configure as variáveis de ambiente
2. Crie uma nova solicitação de aditivo
3. Verifique se o e-mail foi enviado para o aprovador
4. Verifique os logs do console para erros

### Teste com Cloud Functions

1. Faça deploy da função
2. Teste a função diretamente:
```bash
curl -X POST https://us-central1-your-project.cloudfunctions.net/sendEmail \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "type": "new_request",
    "data": {
      "protocolo": "TEST-001",
      "valorTotal": 1000,
      "senderName": "Sistema"
    }
  }'
```

## 🐛 Troubleshooting

### E-mails não estão sendo enviados

1. **Verifique as variáveis de ambiente**: Certifique-se de que `VITE_EMAIL_API_URL` ou `VITE_SENDGRID_API_KEY` estão configuradas.

2. **Verifique os logs**: Os erros são logados no console do navegador (F12 → Console).

3. **Verifique a Cloud Function**: Se usando Cloud Functions, verifique os logs:
```bash
firebase functions:log
```

4. **Verifique permissões**: Certifique-se de que a API Key do SendGrid tem permissão de "Mail Send".

### E-mails vão para Spam

1. Configure SPF/DKIM no domínio do remetente
2. Use um domínio verificado no SendGrid
3. Evite palavras que podem ser filtradas (especialmente no assunto)

## 📚 Recursos Adicionais

- [Documentação SendGrid](https://docs.sendgrid.com/)
- [Firebase Cloud Functions](https://firebase.google.com/docs/functions)
- [Guia de Deliverability](https://docs.sendgrid.com/ui/sending-email/how-to-send-email-with-dynamic-templates)

## 🔒 Segurança

- ⚠️ **NUNCA** commite API Keys no código
- ⚠️ Use variáveis de ambiente ou Firebase Functions Config
- ⚠️ Limite o acesso à API Key do SendGrid
- ⚠️ Use Cloud Functions em produção (não SendGrid direto no frontend)

## ✅ Checklist de Implementação

- [ ] Criar conta SendGrid
- [ ] Configurar Cloud Function (se usar)
- [ ] Configurar variáveis de ambiente
- [ ] Testar envio de e-mail
- [ ] Verificar e-mails na caixa de entrada
- [ ] Verificar e-mails não vão para spam
- [ ] Configurar domínio verificado no SendGrid (opcional mas recomendado)

