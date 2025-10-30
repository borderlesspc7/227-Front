// src/services/pdfService.ts
import { db } from "../lib/firebaseconfig";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import type { AdditiveRequest } from "../types/additiveRequest";
import type { Contract } from "../types/contracts";
import { jsPDF } from "jspdf";

export const pdfService = {
  // Gerar PDF da solicitação aprovada
  generateApprovedRequestPDF: async (requestId: string): Promise<string> => {
    try {
      // Buscar dados da solicitação
      const requestRef = doc(db, "additiveRequests", requestId);
      const requestDoc = await getDoc(requestRef);

      if (!requestDoc.exists()) {
        throw new Error("Solicitação não encontrada");
      }

      const request = requestDoc.data() as AdditiveRequest;

      // Simular geração de PDF (aqui você integraria com jsPDF, Puppeteer, etc.)
      const pdfUrl = await generatePDFContent(request);

      // Salvar URL do PDF na solicitação
      await updateDoc(requestRef, {
        pdfUrl,
        updatedAt: serverTimestamp(),
      });

      return pdfUrl;
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      throw error;
    }
  },

  // Gerar PDF de relatório de aprovação
  generateApprovalReport: async (requestId: string): Promise<string> => {
    try {
      // Implementar geração de relatório
      // Por enquanto, retorna URL simulada
      return `https://example.com/reports/${requestId}.pdf`;
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      throw error;
    }
  },

  // Geração de PDF do aditivo (sem assinatura)
  generateAdditivePDF: async (
    contract: Contract,
    additive: AdditiveRequest
  ): Promise<Blob> => {
    const docPdf = new jsPDF({ unit: "pt", format: "a4" });

    const margin = 40;
    let cursorY = margin;

    docPdf.setFontSize(16);
    docPdf.text("Aditivo Contratual", margin, cursorY);
    cursorY += 24;

    docPdf.setFontSize(11);
    docPdf.text(`Contrato: ${contract.numeroContrato}`, margin, cursorY);
    cursorY += 16;
    docPdf.text(`Cliente: ${contract.cliente}`, margin, cursorY);
    cursorY += 16;
    docPdf.text(`Obra: ${contract.obra}`, margin, cursorY);
    cursorY += 16;
    docPdf.text(`Vigência: ${contract.vigenciaInicio} a ${contract.vigenciaFim}`, margin, cursorY);
    cursorY += 24;

    docPdf.setFontSize(12);
    docPdf.text("Descrição do Aditivo:", margin, cursorY);
    cursorY += 18;

    const description = additive.descricao || "";
    const descriptionLines = docPdf.splitTextToSize(description, 515);
    docPdf.text(descriptionLines, margin, cursorY);
    cursorY += descriptionLines.length * 14 + 10;

    docPdf.text("Justificativa:", margin, cursorY);
    cursorY += 18;
    const justification = additive.justificativa || "";
    const justificationLines = docPdf.splitTextToSize(justification, 515);
    docPdf.text(justificationLines, margin, cursorY);
    cursorY += justificationLines.length * 14 + 20;

    docPdf.text(`Valor Total: R$ ${Number(additive.valorTotal || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, margin, cursorY);
    cursorY += 40;

    docPdf.setDrawColor(150);
    docPdf.line(margin, cursorY, 300, cursorY);
    docPdf.text("Assinatura do Cliente", margin, cursorY + 14);

    const blob = docPdf.output("blob");
    return blob;
  },

  // Geração de PDF do aditivo com assinatura (dataURL de imagem do canvas)
  generateAdditivePDFWithSignature: async (
    contract: Contract,
    additive: AdditiveRequest,
    signatureDataUrl: string
  ): Promise<Blob> => {
    const docPdf = new jsPDF({ unit: "pt", format: "a4" });

    const margin = 40;
    let cursorY = margin;

    docPdf.setFontSize(16);
    docPdf.text("Aditivo Contratual", margin, cursorY);
    cursorY += 24;

    docPdf.setFontSize(11);
    docPdf.text(`Contrato: ${contract.numeroContrato}`, margin, cursorY);
    cursorY += 16;
    docPdf.text(`Cliente: ${contract.cliente}`, margin, cursorY);
    cursorY += 16;
    docPdf.text(`Obra: ${contract.obra}`, margin, cursorY);
    cursorY += 16;
    docPdf.text(`Vigência: ${contract.vigenciaInicio} a ${contract.vigenciaFim}`, margin, cursorY);
    cursorY += 24;

    docPdf.setFontSize(12);
    docPdf.text("Descrição do Aditivo:", margin, cursorY);
    cursorY += 18;

    const description = additive.descricao || "";
    const descriptionLines = docPdf.splitTextToSize(description, 515);
    docPdf.text(descriptionLines, margin, cursorY);
    cursorY += descriptionLines.length * 14 + 10;

    docPdf.text("Justificativa:", margin, cursorY);
    cursorY += 18;
    const justification = additive.justificativa || "";
    const justificationLines = docPdf.splitTextToSize(justification, 515);
    docPdf.text(justificationLines, margin, cursorY);
    cursorY += justificationLines.length * 14 + 20;

    docPdf.text(`Valor Total: R$ ${Number(additive.valorTotal || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, margin, cursorY);
    cursorY += 20;

    // Área da assinatura
    const lineY = cursorY + 110;
    docPdf.setDrawColor(150);
    docPdf.line(margin, lineY, 300, lineY);
    docPdf.text("Assinatura do Cliente", margin, lineY + 14);

    // Inserir imagem da assinatura (dataURL)
    try {
      docPdf.addImage(signatureDataUrl, "PNG", margin, cursorY, 260, 100, undefined, "FAST");
    } catch (e) {
      // Se falhar a decodificação, apenas segue sem imagem
      console.warn("Falha ao inserir imagem de assinatura:", e);
    }

    const blob = docPdf.output("blob");
    return blob;
  },
};

// Função auxiliar para gerar conteúdo do PDF
async function generatePDFContent(request: AdditiveRequest): Promise<string> {
  // Aqui você implementaria a geração real do PDF
  // Por enquanto, retorna uma URL simulada
  return `https://example.com/pdfs/osa-${request.protocolo}.pdf`;
}
