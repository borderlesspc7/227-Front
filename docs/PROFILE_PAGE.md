# Página de Perfil e Assinatura

## Visão Geral

A página de perfil e assinatura foi implementada com todas as funcionalidades necessárias para gerenciar informações da empresa, assinatura, cobrança e segurança.

## Funcionalidades Implementadas

### 1. **Visão Geral** 
- Exibe informações completas da empresa
- Dados de endereço
- Informações de contato
- CNPJ e razão social

### 2. **Assinatura**
- Plano atual com detalhes e recursos
- Status da assinatura (Ativo, Período de Teste, Inativo)
- Datas de início e próxima cobrança
- Renovação automática
- Botões para alterar plano e gerenciar assinatura

### 3. **Cobrança**
- Métodos de pagamento cadastrados
- Histórico de faturas com status de pagamento
- Data e valor de cada fatura

### 4. **Segurança**
- Autenticação de dois fatores
- Alteração de senha
- Gerenciamento de sessões ativas

## Como Acessar

### Pela Interface

1. Faça login no sistema
2. Clique no ícone de perfil no cabeçalho
3. Ou acesse diretamente pela URL: `/admin/profile`

### Pelas Rotas

A página está registrada nas rotas:
- `/admin/profile` - Para usuários admin
- `/dashboard/profile` - Para todos os usuários autenticados

## Planos Disponíveis

### Starter - R$ 99,90/mês
- 5 Contratos Ativos
- 3 Usuários
- 1 GB Armazenamento

### Business - R$ 299,90/mês
- 25 Contratos Ativos
- 10 Usuários
- 10 GB Armazenamento
- Relatórios Avançados

### Enterprise - R$ 799,90/mês
- Contratos Ilimitados
- Usuários Ilimitados
- Armazenamento Ilimitado
- Todos os Recursos Premium
- Suporte Prioritário

## Status da Assinatura

- **Ativo** (verde): Assinatura ativa e funcionando normalmente
- **Período de Teste** (laranja): Em período de teste gratuito
- **Inativo** (vermelho): Assinatura inativa
- **Cancelado** (cinza): Assinatura cancelada

## Estrutura de Arquivos

```
src/pages/Profile/
├── ProfilePage.tsx      # Componente principal
└── ProfilePage.css      # Estilos da página
```

## Componentes Utilizados

### ProfilePage
O componente principal que gerencia as diferentes seções:
- Usa o contexto `CompanyContext` para obter dados da empresa
- Gerencia o estado da aba ativa
- Renderiza as diferentes seções baseado na aba selecionada

## Context e Hooks

### useCompany()
Hook personalizado que fornece acesso aos dados da empresa:

```typescript
const { company, loading, subscriptionStatus, refreshCompany, refreshSubscription } = useCompany();
```

### CompanyProvider
Provider que envolve o layout e fornece dados da empresa para toda a aplicação:

```typescript
<CompanyProvider user={user}>
  <AdminLayout />
</CompanyProvider>
```

## Navegação entre Abas

A navegação é feita através de botões laterais:

```typescript
const [activeTab, setActiveTab] = useState("overview");

// Abas disponíveis:
// - "overview" - Visão Geral
// - "subscription" - Assinatura
// - "billing" - Cobrança
// - "security" - Segurança
```

## Estilos e Design

### Cores do Tema
- **Primary**: Gradiente roxo (#667eea → #764ba2)
- **Success**: Verde (#10b981)
- **Warning**: Laranja (#f59e0b)
- **Error**: Vermelho (#ef4444)
- **Gray**: (#6b7280)

### Responsividade
A página é totalmente responsiva e se adapta a:
- Desktop (acima de 768px)
- Tablet e Mobile (abaixo de 768px)

## Próximas Melhorias

1. **Alterar Plano**: Implementar modal para alteração de plano
2. **Gerenciar Assinatura**: Adicionar funcionalidades de cancelamento e pausar
3. **Métodos de Pagamento**: Integração com gateway de pagamento
4. **Faturas**: Download de faturas em PDF
5. **2FA**: Implementar autenticação de dois fatores
6. **Alteração de Senha**: Modal para alterar senha
7. **Sessões Ativas**: Lista de dispositivos conectados

## Exemplo de Uso

```typescript
import { ProfilePage } from "./pages/Profile/ProfilePage";

// Em suas rotas:
<Route path="profile" element={<ProfilePage />} />
```

## Observações Importantes

1. **Autenticação Necessária**: A página só é acessível para usuários autenticados
2. **CompanyProvider Obrigatório**: O `CompanyProvider` deve envolver a rota
3. **Dados da Empresa**: Os dados são carregados automaticamente do Firestore
4. **Atualização Automática**: Os dados são atualizados quando o `companyId` do usuário muda

## Troubleshooting

### Erro: "useCompany must be used within a CompanyProvider"
**Solução**: Certifique-se de que o `CompanyProvider` está envolvendo o layout:
```typescript
<CompanyProvider user={user}>
  <AdminLayout />
</CompanyProvider>
```

### Dados da empresa não carregam
**Solução**: Verifique se:
1. O usuário está autenticado
2. O usuário tem um `companyId` válido
3. A empresa existe no Firestore na coleção `companies`

### Página em branco
**Solução**: Abra o console do navegador e verifique se há erros. Certifique-se de que:
1. As rotas estão configuradas corretamente
2. O `CompanyProvider` está funcionando
3. Os dados da empresa estão sendo carregados

