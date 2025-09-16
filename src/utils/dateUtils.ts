// src/utils/dateUtils.ts

export const formatDate = (
  date: Date | string | unknown,
  includeTime = true
): string => {
  try {
    let dateObj: Date;

    if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === "string") {
      dateObj = new Date(date);
    } else if (date && typeof date === "object" && "toDate" in date) {
      // Firebase Timestamp
      dateObj = (date as { toDate: () => Date }).toDate();
    } else if (date && typeof date === "object" && "seconds" in date) {
      // Firebase Timestamp format
      dateObj = new Date((date as { seconds: number }).seconds * 1000);
    } else {
      return "Data inválida";
    }

    // Verificar se a data é válida
    if (isNaN(dateObj.getTime())) {
      return "Data inválida";
    }

    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    };

    if (includeTime) {
      options.hour = "2-digit";
      options.minute = "2-digit";
    }

    return dateObj.toLocaleDateString("pt-BR", options);
  } catch (error) {
    return "Data inválida";
  }
};

export const formatCurrency = (value: number): string => {
  try {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  } catch (error) {
    return `R$ ${value.toFixed(2)}`;
  }
};

export const formatDateShort = (date: Date | string | unknown): string => {
  return formatDate(date, false);
};

export const formatDateTime = (date: Date | string | unknown): string => {
  return formatDate(date, true);
};
