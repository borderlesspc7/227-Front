# Limpeza de Dados de Teste

Este sistema inclui funcionalidades para remover automaticamente dados de teste/mockados que não estão registrados oficialmente no Firebase.

## 🧹 Funcionalidades Implementadas

### 1. **Botão "Limpar Testes" na Interface**
- Localizado na página de Cadastro de Itens
- Botão vermelho ao lado do botão "Novo Item"
- Remove automaticamente itens que contêm palavras-chave de teste

### 2. **Função `clearTestData()` no Serviço**
- Método no `itemService` para limpeza programática
- Filtra itens por palavras-chave: "teste", "testeaasd", "mock", "demo", "exemplo", "fake"
- Remove permanentemente do Firebase

### 3. **Script de Console**
- Script JavaScript para execução direta no console do navegador
- Útil para limpeza manual ou em casos especiais

## 🎯 Como Usar

### **Opção 1: Interface Web (Recomendado)**
1. Acesse a página "Cadastro de Itens"
2. Clique no botão vermelho "Limpar Testes"
3. Confirme a operação
4. Os dados de teste serão removidos automaticamente

### **Opção 2: Console do Navegador**
1. Abra o console do navegador (F12)
2. Execute o script em `scripts/clearTestData.js`
3. Confirme a operação quando solicitado

### **Opção 3: Programática**
```typescript
import { itemService } from './services/itemService';

// Limpar dados de teste
await itemService.clearTestData();
```

## 🔍 Critérios de Identificação

O sistema identifica dados de teste baseado nas seguintes palavras-chave na descrição do item:

- `teste` (case insensitive)
- `testeaasd`
- `mock`
- `demo`
- `exemplo`
- `fake`

## ⚠️ Avisos Importantes

- **Irreversível**: A operação remove permanentemente os dados do Firebase
- **Confirmação**: Sempre pede confirmação antes de executar
- **Logs**: Registra todas as operações no console para auditoria
- **Backup**: Recomenda-se fazer backup antes de executar em produção

## 🛡️ Segurança

- Apenas usuários autenticados podem executar a limpeza
- Operação registrada com logs detalhados
- Confirmação obrigatória antes da execução
- Filtros específicos para evitar remoção acidental

## 📊 Relatório de Execução

Após a execução, o sistema fornece:
- Número total de itens encontrados
- Número de itens identificados como teste
- Lista dos itens que serão removidos
- Contador de itens removidos com sucesso
- Log de erros (se houver)

## 🔧 Personalização

Para adicionar novas palavras-chave de identificação, edite o arquivo `src/services/itemService.ts`:

```typescript
const testItems = allItems.filter(item => 
    item.descricao.toLowerCase().includes('teste') ||
    item.descricao.toLowerCase().includes('testeaasd') ||
    item.descricao.toLowerCase().includes('mock') ||
    item.descricao.toLowerCase().includes('demo') ||
    item.descricao.toLowerCase().includes('exemplo') ||
    item.descricao.toLowerCase().includes('fake') ||
    item.descricao.toLowerCase().includes('nova-palavra-chave') // Adicione aqui
);
```
