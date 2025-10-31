# Configuração do Firebase - Regras Completas

## 🔐 Configuração Necessária

Este documento contém instruções para configurar as regras do Firebase Storage e Firestore.

---

## 📦 Firebase Storage - Documentos Assinados

### Problema: Erro CORS ao fazer upload

Se você está recebendo erro de CORS ao tentar gerar documentos ou fazer upload de PDFs, as regras do Firebase Storage provavelmente estão bloqueando as requisições.

## Solução: Configurar Regras do Firebase Storage

### Passo 1: Acessar Firebase Console
1. Acesse: https://console.firebase.google.com
2. Selecione seu projeto: `addcontrol-81689`
3. Vá em **Storage** → **Rules** (no menu lateral)

### Passo 2: Configurar as Regras

Substitua as regras atuais por:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Permitir acesso aos documentos de assinatura
    match /documentos/{allPaths=**} {
      // Permitir leitura e escrita para usuários autenticados
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Permitir acesso a outros arquivos para usuários autenticados
    match /{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

### Passo 3: Publicar as Regras
1. Clique em **Publicar** (botão no topo)
2. Aguarde a confirmação de publicação

### Passo 4: Testar Novamente
Tente gerar o documento novamente após publicar as regras.

## Explicação das Regras

- `request.auth != null`: Verifica se o usuário está autenticado
- `match /documentos/{allPaths=**}`: Aplica as regras a todos os arquivos na pasta `documentos` e subpastas
- `allow read`: Permite leitura (download/visualização)
- `allow write`: Permite escrita (upload)

## Regras Mais Restritivas (Recomendado para Produção)

Se quiser ser mais específico:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /documentos/{contratoId}/aditivos/{aditivoId}/{fileName} {
      // Permitir upload apenas para o próprio documento
      allow write: if request.auth != null 
                   && resource == null; // Apenas criar novos, não sobrescrever
      
      // Permitir leitura para usuários autenticados
      allow read: if request.auth != null;
    }
  }
}
```

## Verificar se as Regras Estão Funcionando

1. Depois de publicar, verifique os logs no Firebase Console → Storage → Files
2. Tente fazer upload novamente
3. Se ainda houver erro, verifique o console do navegador para mais detalhes

---

## 🔥 Firestore Database - Regras de Segurança

### Problema: Missing or insufficient permissions

Se você está recebendo erros de "Missing or insufficient permissions", as regras do Firestore precisam ser configuradas.

### Solução: Configurar Regras do Firestore

#### Passo 1: Acessar Firebase Console
1. Acesse: https://console.firebase.google.com
2. Selecione seu projeto: `addcontrol-81689`
3. Vá em **Firestore Database** → **Rules** (no menu lateral)

#### Passo 2: Configurar as Regras

**Para Desenvolvimento (Simplificado):**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir tudo para usuários autenticados (APENAS PARA DESENVOLVIMENTO)
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**Para Produção (Mais Seguro):**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Regras para coleção de usuários
    match /users/{userId} {
      allow read: if request.auth != null && (request.auth.uid == userId || 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.companyId == resource.data.companyId);
      allow write: if request.auth != null && (request.auth.uid == userId || 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    // Regras para opções do sistema
    match /systemOptions/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Regras para outras coleções
    match /{collection}/{documentId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

#### Passo 3: Publicar as Regras
1. Clique em **Publicar** (botão no topo)
2. Aguarde a confirmação de publicação

#### Passo 4: Testar Novamente
Recarregue a página e verifique se os erros desapareceram.

⚠️ **IMPORTANTE**: As regras simplificadas são apenas para desenvolvimento. Para produção, use regras mais restritivas baseadas em roles e companyId.

