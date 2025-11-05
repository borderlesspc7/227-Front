// src/services/pdfService.ts
import { db } from "../lib/firebaseconfig";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import type { AdditiveRequest } from "../types/additiveRequest";
import type { Contract } from "../types/contracts";
import type { WorkflowStatus } from "../types/approvalWorkflow";
import { jsPDF } from "jspdf";

export const pdfService = {
  // Gerar PDF da solicitação aprovada
  generateApprovedRequestPDF: async (requestId: string): Promise<Blob> => {
    try {
      // Buscar dados da solicitação
      const requestRef = doc(db, "additiveRequests", requestId);
      const requestDoc = await getDoc(requestRef);

      if (!requestDoc.exists()) {
        throw new Error("Solicitação não encontrada");
      }

      const request = requestDoc.data() as AdditiveRequest;

      // Verificar se a solicitação está aprovada
      if (request.status !== "aprovado") {
        throw new Error("Solicitação não está aprovada");
      }

      // Buscar contrato relacionado
      let contract: Contract | null = null;
      if (request.contratoId) {
        const contractRef = doc(db, "contracts", request.contratoId);
        const contractDoc = await getDoc(contractRef);
        if (contractDoc.exists()) {
          const contractData = contractDoc.data();
          contract = {
            id: contractDoc.id,
            companyId: contractData.companyId,
            cliente: contractData.cliente,
            obra: contractData.obra,
            numeroContrato: contractData.numeroContrato,
            vigenciaInicio: contractData.vigenciaInicio,
            vigenciaFim: contractData.vigenciaFim,
            valor: Number(contractData.valor) || 0,
            pdfFile: null,
            createdAt: contractData?.createdAt?.toDate?.() || new Date(),
            updatedAt: contractData?.updatedAt?.toDate?.() || new Date(),
            createdBy: contractData.createdBy || "",
            status: contractData.status || "pendente",
          } as Contract;
        }
      }

      // Gerar PDF usando jsPDF
      const docPdf = new jsPDF({ unit: "pt", format: "a4" });
      const margin = 40;
      let cursorY = margin;

      // Cabeçalho
      docPdf.setFontSize(16);
      docPdf.setFont("helvetica", "bold");
      docPdf.text("SOLICITAÇÃO DE ADITIVO APROVADA", margin, cursorY);
      cursorY += 24;

      // Informações do protocolo e status
      docPdf.setFontSize(11);
      docPdf.setFont("helvetica", "normal");
      docPdf.text(`Protocolo: ${request.protocolo}`, margin, cursorY);
      cursorY += 16;
      docPdf.text(`Status: ${request.status.toUpperCase()}`, margin, cursorY);
      cursorY += 16;
      
      if (request.approvedBy) {
        docPdf.text(`Aprovado por: ${request.approvedBy}`, margin, cursorY);
        cursorY += 16;
      }
      
      if (request.approvedAt) {
        const approvedDate = request.approvedAt instanceof Date 
          ? request.approvedAt 
          : (request.approvedAt as any)?.toDate?.() || new Date();
        docPdf.text(
          `Data de aprovação: ${approvedDate.toLocaleDateString("pt-BR")}`, 
          margin, 
          cursorY
        );
        cursorY += 16;
      }
      cursorY += 10;

      // Informações do contrato
      if (contract) {
        docPdf.setFontSize(12);
        docPdf.setFont("helvetica", "bold");
        docPdf.text("Informações do Contrato", margin, cursorY);
        cursorY += 20;

        docPdf.setFontSize(11);
        docPdf.setFont("helvetica", "normal");
        docPdf.text(`Contrato: ${contract.numeroContrato}`, margin, cursorY);
        cursorY += 16;
        docPdf.text(`Cliente: ${contract.cliente}`, margin, cursorY);
        cursorY += 16;
        docPdf.text(`Obra: ${contract.obra}`, margin, cursorY);
        cursorY += 16;
        docPdf.text(
          `Vigência: ${contract.vigenciaInicio} a ${contract.vigenciaFim}`, 
          margin, 
          cursorY
        );
        cursorY += 24;
      }

      // Descrição
      docPdf.setFontSize(12);
      docPdf.setFont("helvetica", "bold");
      docPdf.text("Descrição do Aditivo:", margin, cursorY);
      cursorY += 18;

      docPdf.setFontSize(11);
      docPdf.setFont("helvetica", "normal");
      const description = request.descricao || "";
      const descriptionLines = docPdf.splitTextToSize(description, 515);
      docPdf.text(descriptionLines, margin, cursorY);
      cursorY += descriptionLines.length * 14 + 10;

      // Justificativa
      docPdf.setFontSize(12);
      docPdf.setFont("helvetica", "bold");
      docPdf.text("Justificativa:", margin, cursorY);
      cursorY += 18;

      docPdf.setFontSize(11);
      docPdf.setFont("helvetica", "normal");
      const justification = request.justificativa || "";
      const justificationLines = docPdf.splitTextToSize(justification, 515);
      docPdf.text(justificationLines, margin, cursorY);
      cursorY += justificationLines.length * 14 + 20;

      // Itens
      if (request.itens && request.itens.length > 0) {
        docPdf.setFontSize(12);
        docPdf.setFont("helvetica", "bold");
        docPdf.text("Itens do Aditivo:", margin, cursorY);
        cursorY += 20;

        docPdf.setFontSize(10);
        docPdf.setFont("helvetica", "normal");
        
        request.itens.forEach((item, index) => {
          if (cursorY > 700) {
            docPdf.addPage();
            cursorY = margin;
          }

          docPdf.text(
            `${index + 1}. ${item.descricao || "Item sem descrição"}`, 
            margin, 
            cursorY
          );
          cursorY += 14;
          
          docPdf.text(
            `   Quantidade: ${item.quantidade} | Preço Unitário: R$ ${Number(item.precoUnitario || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} | Total: R$ ${Number(item.valorTotal || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
            margin + 10,
            cursorY
          );
          cursorY += 16;
        });
      }

      // Valor total
      cursorY += 10;
      docPdf.setFontSize(12);
      docPdf.setFont("helvetica", "bold");
      docPdf.text(
        `Valor Total: R$ ${Number(request.valorTotal || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
        margin,
        cursorY
      );

      // Gerar blob do PDF
      const blob = docPdf.output("blob");
      
      // Salvar referência na solicitação (opcional - pode salvar no storage)
      await updateDoc(requestRef, {
        pdfGeneratedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return blob;
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      throw error;
    }
  },

  // Gerar PDF de relatório de aprovação
  generateApprovalReport: async (requestId: string): Promise<Blob> => {
    try {
      // Buscar dados da solicitação
      const requestRef = doc(db, "additiveRequests", requestId);
      const requestDoc = await getDoc(requestRef);

      if (!requestDoc.exists()) {
        throw new Error("Solicitação não encontrada");
      }

      const request = requestDoc.data() as AdditiveRequest;

      // Buscar status do workflow
      const workflowRef = doc(db, "workflowStatuses", requestId);
      const workflowDoc = await getDoc(workflowRef);
      
      let workflowStatus: WorkflowStatus | null = null;
      if (workflowDoc.exists()) {
        const workflowData = workflowDoc.data();
        workflowStatus = {
          requestId,
          currentStep: workflowData.currentStep,
          completedSteps: workflowData.completedSteps || [],
          isCompleted: workflowData.isCompleted || false,
          isRejected: workflowData.isRejected || false,
          isReturned: workflowData.isReturned || false,
          actions: (workflowData.actions || []).map((action: any) => ({
            ...action,
            timestamp: action.timestamp?.toDate?.() || new Date(action.timestamp),
          })),
          startedAt: workflowData.startedAt?.toDate?.() || new Date(),
        };
      }

      // Buscar configuração do workflow para obter nomes das etapas
      const configRef = doc(db, "workflowConfigs", "default-workflow");
      const configDoc = await getDoc(configRef);
      const steps = configDoc.exists() ? (configDoc.data() as any)?.steps || [] : [];

      // Gerar PDF usando jsPDF
      const docPdf = new jsPDF({ unit: "pt", format: "a4" });
      const margin = 40;
      let cursorY = margin;

      // Cabeçalho
      docPdf.setFontSize(16);
      docPdf.setFont("helvetica", "bold");
      docPdf.text("RELATÓRIO DE APROVAÇÃO", margin, cursorY);
      cursorY += 24;

      // Informações da solicitação
      docPdf.setFontSize(11);
      docPdf.setFont("helvetica", "normal");
      docPdf.text(`Protocolo: ${request.protocolo}`, margin, cursorY);
      cursorY += 16;
      docPdf.text(`Status: ${request.status.toUpperCase()}`, margin, cursorY);
      cursorY += 16;
      docPdf.text(
        `Data de criação: ${request.createdAt instanceof Date ? request.createdAt.toLocaleDateString("pt-BR") : (request.createdAt as any)?.toDate?.()?.toLocaleDateString("pt-BR") || "N/A"}`,
        margin,
        cursorY
      );
      cursorY += 20;

      // Informações do workflow
      if (workflowStatus) {
        docPdf.setFontSize(12);
        docPdf.setFont("helvetica", "bold");
        docPdf.text("Status do Workflow de Aprovação", margin, cursorY);
        cursorY += 20;

        docPdf.setFontSize(11);
        docPdf.setFont("helvetica", "normal");
        
        const startedAt = workflowStatus.startedAt instanceof Date 
          ? workflowStatus.startedAt 
          : new Date();
        docPdf.text(
          `Iniciado em: ${startedAt.toLocaleDateString("pt-BR")} ${startedAt.toLocaleTimeString("pt-BR")}`,
          margin,
          cursorY
        );
        cursorY += 16;

        docPdf.text(
          `Status: ${workflowStatus.isCompleted ? "COMPLETO" : workflowStatus.isRejected ? "REJEITADO" : workflowStatus.isReturned ? "DEVOLVIDO" : "EM ANDAMENTO"}`,
          margin,
          cursorY
        );
        cursorY += 16;

        if (workflowStatus.isCompleted && request.workflowCompletedAt) {
          const completedAt = request.workflowCompletedAt instanceof Date
            ? request.workflowCompletedAt
            : (request.workflowCompletedAt as any)?.toDate?.() || new Date();
          docPdf.text(
            `Concluído em: ${completedAt.toLocaleDateString("pt-BR")} ${completedAt.toLocaleTimeString("pt-BR")}`,
            margin,
            cursorY
          );
          cursorY += 16;
        }

        cursorY += 10;

        // Histórico de ações
        if (workflowStatus.actions && workflowStatus.actions.length > 0) {
          docPdf.setFontSize(12);
          docPdf.setFont("helvetica", "bold");
          docPdf.text("Histórico de Aprovações", margin, cursorY);
          cursorY += 20;

          workflowStatus.actions.forEach((action, index) => {
            if (cursorY > 700) {
              docPdf.addPage();
              cursorY = margin;
            }

            docPdf.setFontSize(11);
            docPdf.setFont("helvetica", "bold");
            
            const actionLabel = 
              action.action === "approve" ? "✅ APROVADO" :
              action.action === "reject" ? "❌ REJEITADO" :
              "↩️ DEVOLVIDO";
            
            docPdf.text(`${index + 1}. ${actionLabel}`, margin, cursorY);
            cursorY += 16;

            docPdf.setFont("helvetica", "normal");
            
            // Encontrar nome da etapa
            const step = steps.find((s: any) => s.id === action.stepId);
            if (step) {
              docPdf.text(`   Etapa: ${step.name}`, margin + 10, cursorY);
              cursorY += 14;
            }

            docPdf.text(`   Aprovador: ${action.approverName}`, margin + 10, cursorY);
            cursorY += 14;

            const actionDate = action.timestamp instanceof Date
              ? action.timestamp
              : new Date(action.timestamp);
            docPdf.text(
              `   Data: ${actionDate.toLocaleDateString("pt-BR")} ${actionDate.toLocaleTimeString("pt-BR")}`,
              margin + 10,
              cursorY
            );
            cursorY += 14;

            if (action.comments) {
              const commentLines = docPdf.splitTextToSize(
                `   Comentário: ${action.comments}`,
                485
              );
              docPdf.text(commentLines, margin + 10, cursorY);
              cursorY += commentLines.length * 14;
            }

            cursorY += 10;
          });
        }

        // Etapas completadas
        if (workflowStatus.completedSteps && workflowStatus.completedSteps.length > 0) {
          cursorY += 10;
          docPdf.setFontSize(12);
          docPdf.setFont("helvetica", "bold");
          docPdf.text("Etapas Completadas", margin, cursorY);
          cursorY += 20;

          docPdf.setFontSize(11);
          docPdf.setFont("helvetica", "normal");
          
          workflowStatus.completedSteps.forEach((stepId) => {
            if (cursorY > 700) {
              docPdf.addPage();
              cursorY = margin;
            }

            const step = steps.find((s: any) => s.id === stepId);
            if (step) {
              docPdf.text(`✓ ${step.name}`, margin + 10, cursorY);
              cursorY += 16;
            }
          });
        }
      }

      // Gerar blob do PDF
      const blob = docPdf.output("blob");
      return blob;
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

