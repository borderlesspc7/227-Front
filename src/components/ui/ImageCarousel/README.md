# ImageCarousel Component

Um componente de carrossel de imagens moderno e responsivo para exibir evidências em solicitações de aditivo.

## Funcionalidades

- ✅ **Navegação por setas**: Botões de anterior/próximo
- ✅ **Miniaturas**: Navegação rápida por miniaturas
- ✅ **Tela cheia**: Visualização em modal fullscreen
- ✅ **Contador**: Indicação da imagem atual
- ✅ **Informações da imagem**: Nome e tipo do arquivo
- ✅ **Responsivo**: Adapta-se a diferentes tamanhos de tela
- ✅ **Acessibilidade**: Suporte a navegação por teclado
- ✅ **Estados vazios**: Tratamento quando não há imagens

## Como usar

### 1. Importar o componente

```tsx
import ImageCarousel from "../../../components/ui/ImageCarousel/ImageCarousel";
```

### 2. Usar no componente

```tsx
<ImageCarousel 
  images={request.evidencias.map(evidence => ({
    id: evidence.id,
    nome: evidence.nome,
    url: evidence.url,
    tipo: evidence.tipo
  }))}
  className="custom-carousel-class"
/>
```

### 3. Estrutura dos dados

As imagens devem seguir esta estrutura:

```typescript
interface ImageData {
  id: string;
  nome: string;
  url: string;
  tipo: string;
}
```

## Controles

### Navegação
- **Setas**: Clique nas setas laterais para navegar
- **Miniaturas**: Clique nas miniaturas para ir diretamente para uma imagem
- **Teclado**: Use as setas do teclado para navegar (← →)
- **Tela cheia**: Clique na imagem ou no botão de fullscreen

### Tela cheia
- **Abrir**: Clique na imagem ou no botão de fullscreen
- **Fechar**: Clique no X ou pressione ESC
- **Navegar**: Use as setas ou teclado dentro do modal

## Estilos

O componente inclui estilos responsivos que se adaptam automaticamente:

- **Desktop**: Imagem principal 400px de altura
- **Tablet**: Imagem principal 300px de altura  
- **Mobile**: Imagem principal 250px de altura

## Personalização

Você pode personalizar o carrossel usando classes CSS:

```css
.custom-carousel-class .image-carousel__image-wrapper {
  height: 500px; /* Altura personalizada */
}

.custom-carousel-class .image-carousel__thumbnail {
  width: 100px; /* Tamanho personalizado das miniaturas */
  height: 100px;
}
```

## Integração com AdditiveRequestView

O carrossel já está integrado no componente `AdditiveRequestView` e será exibido automaticamente quando houver evidências na solicitação.

## Estados

### Com imagens
- Exibe o carrossel completo com navegação
- Mostra miniaturas se houver mais de uma imagem
- Botões de navegação aparecem apenas quando necessário

### Sem imagens
- Exibe mensagem "Nenhuma imagem disponível"
- Ícone de câmera para indicar área de imagens
- Design consistente com o resto da interface

## Acessibilidade

- Suporte completo a navegação por teclado
- Labels ARIA apropriados
- Contraste adequado para leitores de tela
- Foco visível em todos os elementos interativos
