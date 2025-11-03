// Utilitário para capturar informações de auditoria do cliente

export interface ClientAuditInfo {
  ipAddress: string | null;
  userAgent: string;
  timestamp: Date;
}

/**
 * Obtém informações de auditoria do cliente (IP e User Agent)
 * Nota: IP só pode ser obtido via backend, aqui retornamos null e pode ser preenchido no backend
 */
export async function getClientAuditInfo(): Promise<ClientAuditInfo> {
  const userAgent = navigator.userAgent || "unknown";
  
  // Tentar obter IP via serviço externo (opcional)
  let ipAddress: string | null = null;
  
  try {
    // Usando serviço público para obter IP (pode ser movido para backend em produção)
    const response = await fetch("https://api.ipify.org?format=json", {
      method: "GET",
      headers: { "Accept": "application/json" },
      // Timeout de 3 segundos
      signal: AbortSignal.timeout(3000),
    });
    
    if (response.ok) {
      const data = await response.json();
      ipAddress = data.ip || null;
    }
  } catch (error) {
    // Falha silenciosa - IP não é crítico para funcionamento
    console.warn("Não foi possível obter IP do cliente:", error);
    ipAddress = null;
  }
  
  return {
    ipAddress,
    userAgent,
    timestamp: new Date(),
  };
}

/**
 * Obtém versão do documento baseada em timestamp ou hash
 */
export function getDocumentVersion(documentId: string, timestamp?: Date): string {
  const date = timestamp || new Date();
  // Versão baseada em timestamp (YYYYMMDDHHmmss)
  const version = date.toISOString().replace(/[-:T.]/g, "").slice(0, 14);
  return `${documentId}_v${version}`;
}
