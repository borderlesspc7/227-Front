# Sistema de Alertas Avançados - AddControl

## ✅ Funcionalidades Implementadas

### 🚨 Alertas de Limite de Contrato
- **Monitoramento Automático**: Sistema verifica automaticamente os limites de uso da assinatura
- **Alertas Proativos**: Notificações enviadas quando o uso atinge 90% dos limites
- **Alertas Urgentes**: Notificações urgentes quando o uso atinge 95% dos limites
- **Limites Monitorados**:
  - Contratos ativos
  - Usuários cadastrados
  - Armazenamento utilizado

### 📋 Notificações de Devoluções Pendentes
- **Detecção Automática**: Sistema identifica solicitações devolvidas há mais de 24 horas
- **Notificações Inteligentes**: Alertas enviados para todos os usuários da empresa
- **Ação Direta**: Links diretos para visualizar solicitações devolvidas
- **Prioridade Alta**: Notificações marcadas como alta prioridade

### 📄 Notificações de Formalizações Pendentes
- **Monitoramento de Agrupamentos**: Sistema acompanha agrupamentos prontos para formalização
- **Tempo de Espera**: Alertas para agrupamentos prontos há mais de 48 horas
- **Notificações Contextuais**: Mensagens específicas sobre formalizações pendentes
- **Prioridade Média**: Notificações marcadas como prioridade média

### 📊 Dashboard com Métricas em Tempo Real
- **Componente AlertDashboard**: Interface dedicada para visualização de alertas
- **Atualização Automática**: Métricas atualizadas a cada 5 minutos
- **Execução Manual**: Botão para executar verificações de alertas manualmente
- **Estatísticas Completas**:
  - Total de alertas ativos
  - Alertas de limite de contrato
  - Devoluções pendentes
  - Formalizações pendentes
  - Notificações urgentes

## 🏗️ Arquitetura Implementada

### Serviços

#### notificationService.ts
```typescript
// Novas funcionalidades adicionadas:
- checkContractLimits(companyId: string): Promise<void>
- notifyPendingReturns(companyId: string): Promise<void>
- notifyPendingFormalizations(companyId: string): Promise<void>
- runAdvancedAlerts(companyId: string): Promise<void>
- getAlertStats(companyId: string): Promise<AlertStats>
```

#### systemInitializer.ts
```typescript
// Sistema de alertas automáticos:
- startAdvancedAlertsSystem(): void
- stopAdvancedAlertsSystem(): void
- runAlertsForCompany(companyId: string): Promise<void>
```

### Componentes

#### AlertDashboard.tsx
- Interface visual para métricas de alertas
- Atualização em tempo real
- Execução manual de verificações
- Navegação para ações relacionadas

#### NotificationBell.tsx (Atualizado)
- Suporte para novos tipos de notificação
- Ícones específicos para cada tipo de alerta
- Priorização visual baseada na urgência

### Tipos de Notificação Expandidos

```typescript
type NotificationType = 
  | "new_request"
  | "approval_required"
  | "approved"
  | "rejected"
  | "returned"
  | "request_submitted"
  | "contract_limit_warning"      // ✅ NOVO
  | "user_limit_warning"          // ✅ NOVO
  | "storage_limit_warning"       // ✅ NOVO
  | "pending_returns"             // ✅ NOVO
  | "pending_formalizations";      // ✅ NOVO
```

## 🔄 Funcionamento Automático

### Sistema de Verificações Periódicas
- **Frequência**: A cada 6 horas
- **Escopo**: Todas as empresas ativas
- **Processo**:
  1. Busca todas as empresas cadastradas
  2. Executa verificações de alertas para cada empresa
  3. Registra logs de execução
  4. Trata erros individualmente por empresa

### Verificações Executadas
1. **Limites de Contrato**: Verifica uso vs. limites da assinatura
2. **Devoluções Pendentes**: Identifica solicitações devolvidas há mais de 24h
3. **Formalizações Pendentes**: Identifica agrupamentos prontos há mais de 48h

## 📱 Interface do Usuário

### Dashboard Principal
- **Posicionamento**: AlertDashboard aparece no topo do dashboard
- **Design Responsivo**: Adapta-se a diferentes tamanhos de tela
- **Indicadores Visuais**: Cores e ícones indicam níveis de urgência
- **Ações Rápidas**: Botões para navegar para páginas relacionadas

### Notificações
- **Campainha de Notificação**: Atualizada com novos tipos de alerta
- **Priorização Visual**: Ícones e cores indicam urgência
- **Ações Contextuais**: Links diretos para resolver problemas

## 🎯 Benefícios

### Para Administradores
- **Visibilidade Completa**: Visão geral de todos os alertas ativos
- **Ação Proativa**: Identificação antecipada de problemas
- **Gestão de Recursos**: Monitoramento de limites de assinatura

### Para Usuários
- **Notificações Relevantes**: Alertas específicos para ações necessárias
- **Navegação Direta**: Links para páginas de resolução
- **Priorização Clara**: Diferenciação visual de urgência

### Para o Sistema
- **Monitoramento Automático**: Reduz necessidade de intervenção manual
- **Prevenção de Problemas**: Identifica questões antes que se tornem críticas
- **Otimização de Recursos**: Ajuda no planejamento de upgrades de assinatura

## 🚀 Como Usar

### Para Desenvolvedores
1. **Integração Automática**: Sistema inicia automaticamente com o sistema
2. **Execução Manual**: Use `systemInitializer.runAlertsForCompany(companyId)`
3. **Estatísticas**: Use `notificationService.getAlertStats(companyId)`

### Para Usuários
1. **Dashboard**: Visualize alertas no dashboard principal
2. **Notificações**: Receba alertas na campainha de notificação
3. **Ações**: Clique nos botões de ação para resolver problemas

## 🔧 Configuração

### Intervalos de Verificação
- **Alertas Automáticos**: 6 horas
- **Atualização do Dashboard**: 5 minutos
- **Notificações**: Tempo real

### Limites de Alerta
- **Limites de Contrato**: 90% para alerta, 95% para urgente
- **Devoluções**: 24 horas para alerta
- **Formalizações**: 48 horas para alerta

## 📈 Métricas Disponíveis

```typescript
interface AlertStats {
  contractLimitAlerts: number;      // Alertas de limite de contrato
  pendingReturns: number;           // Devoluções pendentes
  pendingFormalizations: number;    // Formalizações pendentes
  urgentNotifications: number;     // Notificações urgentes
}
```

## 🎉 Conclusão

O sistema de alertas avançados está completamente implementado e funcional, proporcionando:

- ✅ **Monitoramento Proativo** de limites e pendências
- ✅ **Notificações Inteligentes** com priorização adequada
- ✅ **Dashboard em Tempo Real** com métricas atualizadas
- ✅ **Sistema Automático** de verificações periódicas
- ✅ **Interface Intuitiva** para gestão de alertas

O sistema está pronto para uso em produção e irá melhorar significativamente a experiência do usuário e a gestão proativa de problemas.
