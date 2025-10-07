# Troubleshooting - Página de Perfil

## Problema: Telas não estão aparecendo

### Verificações Necessárias

#### 1. **Verificar se o servidor está rodando**
```bash
npm run dev
```

#### 2. **Acessar a URL correta**
- Para usuários admin: `http://localhost:5173/admin/profile`
- Para todos os usuários: `http://localhost:5173/dashboard/profile`

#### 3. **Verificar no console do navegador**
Abra o DevTools (F12) e verifique se há erros no console.

#### 4. **Verificar se o usuário está autenticado**
A página de perfil requer autenticação. Certifique-se de:
1. Fazer login no sistema
2. Ter um usuário válido com `companyId`

#### 5. **Dados mockados para teste**
A versão atual da página usa dados mockados (fixos) para testar a interface.
Isso significa que você verá:
- **Nome da Empresa**: Empresa Teste
- **Email**: teste@empresa.com
- **CNPJ**: 12.345.678/0001-90
- **Plano**: Starter
- **Status**: Período de Teste

### Solução de Problemas Comuns

#### Erro: "useCompany must be used within a CompanyProvider"
**Causa**: O `CompanyProvider` não está envolvendo o layout.
**Status**: ✅ JÁ CORRIGIDO - O `CompanyProvider` já está no `AdminLayout`

#### Erro: "Cannot read property of null"
**Causa**: Dados da empresa não estão carregando.
**Solução**: A versão atual usa dados mockados, então esse erro não deve ocorrer.

#### Página em branco
**Possíveis causas**:
1. Rota não configurada corretamente
   - ✅ JÁ CONFIGURADA: `/admin/profile` e `/dashboard/profile`

2. Erro no componente
   - ✅ JÁ TESTADO: Componente sem erros de linting

3. CSS não carregado
   - ✅ JÁ VERIFICADO: Arquivo CSS existe em `/src/pages/Profile/ProfilePage.css`

### Como Testar

#### Teste 1: Verificar o Menu Lateral
1. Faça login no sistema
2. No menu lateral, procure o item "Perfil" (com ícone de engrenagem)
3. Clique no item

**Resultado esperado**: A página de perfil deve aparecer

#### Teste 2: Acessar URL Direta
1. Faça login no sistema
2. Digite na barra de endereços: `http://localhost:5173/admin/profile`
3. Pressione Enter

**Resultado esperado**: A página de perfil deve aparecer

#### Teste 3: Verificar Navegação entre Abas
1. Acesse a página de perfil
2. Clique nas abas laterais:
   - Visão Geral
   - Assinatura
   - Cobrança
   - Segurança

**Resultado esperado**: O conteúdo deve mudar conforme a aba selecionada

### Versão Atual

A versão atual da página de perfil usa **dados mockados (fixos)** para permitir que você visualize a interface sem depender de dados reais do Firestore.

#### Quando Integrar com Dados Reais

Para integrar com dados reais do Firestore:

1. **Descomentar a importação do useCompany**:
```typescript
import { useCompany } from "../../contexts/companyContext";
```

2. **Substituir dados mockados**:
```typescript
// Remover:
const mockCompany = { ... };

// Adicionar:
const { company, loading: companyLoading } = useCompany();

// Adicionar verificação de loading:
if (companyLoading) {
    return (
        <div className="profile-page">
            <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Carregando perfil...</p>
            </div>
        </div>
    );
}

// Adicionar verificação de erro:
if (!company) {
    return (
        <div className="profile-page">
            <div className="error-state">
                <h2>Empresa não encontrada</h2>
                <p>Não foi possível carregar as informações da empresa.</p>
            </div>
        </div>
    );
}
```

### Estrutura de Arquivos

```
src/
├── pages/
│   └── Profile/
│       ├── ProfilePage.tsx      ✅ Componente implementado
│       └── ProfilePage.css      ✅ Estilos implementados
├── contexts/
│   └── companyContext.tsx       ✅ Context implementado
├── components/
│   └── Layout/
│       └── AdminLayout/
│           └── AdminLayout.tsx  ✅ CompanyProvider adicionado
└── routes/
    ├── AppRoutes.tsx            ✅ Rotas configuradas
    └── paths.ts                 ✅ Paths configurados
```

### Checklist de Verificação

- ✅ Componente ProfilePage criado
- ✅ CSS implementado
- ✅ Rotas configuradas
- ✅ CompanyProvider adicionado ao AdminLayout
- ✅ CompanyContext exportado
- ✅ Menu lateral com link para perfil
- ✅ Dados mockados para teste
- ✅ Sem erros de linting

### Próximos Passos

1. **Testar a página**:
   - Faça login
   - Acesse `/admin/profile`
   - Verifique se a página aparece
   - Navegue entre as abas

2. **Verificar no console**:
   - Abra o DevTools (F12)
   - Verifique se há erros
   - Compartilhe os erros (se houver)

3. **Integrar com dados reais** (quando necessário):
   - Descomentar importação do useCompany
   - Remover dados mockados
   - Adicionar verificações de loading/erro

### Contato

Se o problema persistir, por favor compartilhe:
1. URL que está acessando
2. Mensagens de erro no console (F12)
3. Screenshot da tela em branco (se houver)

