// Exemplo de como as imagens devem ser estruturadas no campo evidencias
// Este é um exemplo para demonstração - em produção, as imagens virão do Firebase Storage

export const exampleEvidenceImages = [
    {
        id: "img-001",
        nome: "Evidência 1 - Estado atual da obra",
        tipo: "image/jpeg",
        tamanho: 2048576, // 2MB em bytes
        url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop",
        uploadedAt: new Date("2024-01-15T10:30:00Z")
    },
    {
        id: "img-002",
        nome: "Evidência 2 - Detalhe do problema",
        tipo: "image/jpeg",
        tamanho: 1536000, // 1.5MB em bytes
        url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=600&fit=crop",
        uploadedAt: new Date("2024-01-15T10:35:00Z")
    },
    {
        id: "img-003",
        nome: "Evidência 3 - Material necessário",
        tipo: "image/png",
        tamanho: 3072000, // 3MB em bytes
        url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
        uploadedAt: new Date("2024-01-15T10:40:00Z")
    },
    {
        id: "img-004",
        nome: "Evidência 4 - Planta baixa",
        tipo: "image/jpeg",
        tamanho: 4096000, // 4MB em bytes
        url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop",
        uploadedAt: new Date("2024-01-15T10:45:00Z")
    }
];

// Exemplo de como usar no componente AdditiveRequestView:
/*
const requestWithImages = {
  ...request,
  evidencias: exampleEvidenceImages
};
*/
