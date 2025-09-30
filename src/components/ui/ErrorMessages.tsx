export default function getFirebaseErrorMessage(error: any): string {
  if (typeof error === "string") {
    return error;
  }

  const errorCode = error?.code || "";

  switch (errorCode) {
    case "auth/email-already-in-use":
      return "Este email já está em uso. Tente fazer login ou use outro email.";

    case "auth/invalid-credential":
      return "Email ou senha incorretos. Verifique suas credenciais.";

    case "auth/user-not-found":
      return "Usuário não encontrado. Verifique seu email.";

    case "auth/wrong-password":
      return "Senha incorreta. Tente novamente.";

    case "auth/invalid-email":
      return "Email inválido. Verifique o formato.";

    case "auth/too-many-requests":
      return "Muitas tentativas. Tente novamente em alguns minutos.";

    case "auth/user-disabled":
      return "Conta desabilitada. Entre em contato com o suporte.";

    case "auth/network-request-failed":
      return "Erro de conexão. Verifique sua internet.";

    case "auth/invalid-api-key":
      return "Erro de configuração. Entre em contato com o suporte.";

    default:
      return "Erro inesperado. Tente novamente.";
  }
}
