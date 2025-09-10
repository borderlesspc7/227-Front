// Utilitário de máscaras para inputs

export const masks = {
  // Máscara para valores monetários (R$)
  currency: (value: string): string => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, "");

    // Se não há números, retorna vazio
    if (!numbers) return "";

    // Converte para centavos e formata
    const amount = parseInt(numbers) / 100;

    // Formata como moeda brasileira
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  },

  // Máscara para códigos (apenas letras e números)
  code: (value: string): string => {
    return value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  },

  // Máscara para números decimais (espessura)
  decimal: (value: string): string => {
    // Remove caracteres não numéricos exceto ponto e vírgula
    let cleanValue = value.replace(/[^0-9.,]/g, "");

    // Substitui vírgula por ponto para padronização
    cleanValue = cleanValue.replace(",", ".");

    // Garante apenas um ponto decimal
    const parts = cleanValue.split(".");
    if (parts.length > 2) {
      cleanValue = parts[0] + "." + parts.slice(1).join("");
    }

    return cleanValue;
  },

  // Máscara para quantidade (números inteiros e decimais)
  quantity: (value: string): string => {
    // Remove caracteres não numéricos exceto ponto e vírgula
    let cleanValue = value.replace(/[^0-9.,]/g, "");

    // Substitui vírgula por ponto
    cleanValue = cleanValue.replace(",", ".");

    // Garante apenas um ponto decimal
    const parts = cleanValue.split(".");
    if (parts.length > 2) {
      cleanValue = parts[0] + "." + parts.slice(1).join("");
    }

    return cleanValue;
  },

  // Remove máscara de moeda e retorna número
  removeCurrencyMask: (value: string): number => {
    const numbers = value.replace(/\D/g, "");
    return numbers ? parseInt(numbers) / 100 : 0;
  },

  // Remove máscara decimal e retorna número
  removeDecimalMask: (value: string): number => {
    const cleanValue = value.replace(/[^0-9.,]/g, "").replace(",", ".");
    return cleanValue ? parseFloat(cleanValue) : 0;
  },
};
