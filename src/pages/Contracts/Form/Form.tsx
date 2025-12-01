"use client";

import React, { useState, useEffect } from "react";
import "./Form.css";
import InputField from "../../../components/ui/InputField/InputField";
import FileUpload from "../../../components/FileUpload/FileUpload";
import Button from "../../../components/ui/Button/Button";
import type { Contract, ContractFormData } from "../../../types/contracts";
import { contractService } from "../../../services/contractService";
import { useAuth } from "../../../hooks/useAuth";

interface FormProps {
  onContractSaved: (contract: Contract) => void;
  onCancel?: () => void;
  contract?: Contract;
  isSubmitting?: boolean;
}

export const Form: React.FC<FormProps> = ({ onContractSaved, onCancel, contract, isSubmitting = false }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<ContractFormData>({
    id: "",
    companyId: user?.companyId || "",
    cliente: "",
    obra: "",
    numeroContrato: "",
    vigenciaInicio: "",
    vigenciaFim: "",
    valor: "",
    pdfFile: null as File | null,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: "",
    status: "pendente",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Carregar dados do contrato quando estiver editando
  useEffect(() => {
    if (contract) {
      setFormData({
        id: contract.id,
        companyId: contract.companyId,
        cliente: contract.cliente,
        obra: contract.obra,
        numeroContrato: contract.numeroContrato,
        vigenciaInicio: contract.vigenciaInicio,
        vigenciaFim: contract.vigenciaFim,
        valor: formatCurrency(contract.valor.toString()),
        status: contract.status,
        pdfFile: contract.pdfFile,
        createdAt: contract.createdAt,
        updatedAt: contract.updatedAt,
        createdBy: contract.createdBy,
      });
    }
  }, [contract]);

  const formatCurrency = (value: string): string => {
    const numbers = value.replace(/\D/g, "");

    if (!numbers) return "";

    const numberValue = Number.parseInt(numbers) / 100;
    return numberValue.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const parseCurrencyToNumber = (value: string): number => {
    const numbers = value.replace(/\D/g, "");
    return numbers ? Number.parseInt(numbers) / 100 : 0;
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === "valor") {
      setFormData((prev) => ({
        ...prev,
        [field]: formatCurrency(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleFileChange = (file: File | null) => {
    setFormData((prev) => ({
      ...prev,
      pdfFile: file,
    }));

    if (errors.pdfFile) {
      setErrors((prev) => ({
        ...prev,
        pdfFile: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.cliente.trim()) {
      newErrors.cliente = "Cliente é obrigatório";
    }

    if (!formData.obra.trim()) {
      newErrors.obra = "Obra é obrigatória";
    }

    if (!formData.numeroContrato.trim()) {
      newErrors.numeroContrato = "Número do contrato é obrigatório";
    }

    if (!formData.vigenciaInicio) {
      newErrors.vigenciaInicio = "Data de início é obrigatória";
    }

    if (!formData.vigenciaFim) {
      newErrors.vigenciaFim = "Data de fim é obrigatória";
    }

    if (formData.vigenciaInicio && formData.vigenciaFim) {
      const inicio = new Date(formData.vigenciaInicio);
      const fim = new Date(formData.vigenciaFim);

      if (fim <= inicio) {
        newErrors.vigenciaFim =
          "Data de fim deve ser posterior à data de início";
      }
    }

    if (!formData.valor.trim()) {
      newErrors.valor = "Valor é obrigatório";
    } else {
      const valorNumerico = parseCurrencyToNumber(formData.valor);
      if (valorNumerico <= 0) {
        newErrors.valor = "Valor deve ser maior que zero";
      }
    }

    if (!formData.pdfFile) {
      newErrors.pdfFile = "Upload do PDF é obrigatório";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!user) {
      setSubmitMessage({
        type: "error",
        text: "Você precisa estar logado para salvar um contrato",
      });
      return;
    }

    setIsLoading(true);
    setSubmitMessage(null);

    try {
      const contractDataForFirebse = {
        companyId: user?.companyId || "",
        cliente: formData.cliente.trim(),
        obra: formData.obra.trim(),
        numeroContrato: formData.numeroContrato.trim(),
        vigenciaInicio: formData.vigenciaInicio,
        vigenciaFim: formData.vigenciaFim,
        valor: formData.valor,
        pdfFile: formData.pdfFile,
        createdBy: user.uid,
        status: formData.status,
      };

      const newContract = await contractService.createContract(
        contractDataForFirebse,
        user.role
      );

      onContractSaved(newContract);

      setSubmitMessage({
        type: "success",
        text: "Contrato salvo com sucesso",
      });

      // Limpar formulário
      setFormData({
        cliente: "",
        obra: "",
        numeroContrato: "",
        vigenciaInicio: "",
        vigenciaFim: "",
        valor: "",
        pdfFile: null,
        id: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: user.uid,
        status: "ativo",
      } as ContractFormData);

    } catch (error) {
      setSubmitMessage({
        type: "error",
        text: "Erro ao salvar contrato",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="contract-form">
      <div className="contract-form__header">
        <h2 className="contract-form__title">
          Cadastro de Contratos Principais
        </h2>
        <p className="contract-form__subtitle">
          Preencha as informações do contrato principal
        </p>
      </div>

      {submitMessage && (
        <div
          className={`contract-form__message contract-form__message--${submitMessage.type}`}
        >
          {submitMessage.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="contract-form__form">
        <div className="contract-form__row">
          <InputField
            label="Cliente"
            type="text"
            value={formData.cliente}
            onChange={(value) => handleInputChange("cliente", value)}
            error={errors.cliente}
            placeholder="Nome do cliente"
            required
          />

          <InputField
            label="Obra"
            type="text"
            value={formData.obra}
            onChange={(value) => handleInputChange("obra", value)}
            error={errors.obra}
            placeholder="Nome da obra"
            required
          />
        </div>

        <div className="contract-form__row">
          <InputField
            label="Número do Contrato"
            type="text"
            value={formData.numeroContrato}
            onChange={(value) => handleInputChange("numeroContrato", value)}
            error={errors.numeroContrato}
            placeholder="Ex: CT-2024-001"
            required
          />

          <InputField
            label="Valor do Contrato"
            type="text"
            value={formData.valor}
            onChange={(value) => handleInputChange("valor", value)}
            error={errors.valor}
            placeholder="R$ 0,00"
            required
          />
        </div>

        <div className="contract-form__row">
          <InputField
            label="Vigência - Início"
            type="date"
            value={formData.vigenciaInicio}
            onChange={(value) => handleInputChange("vigenciaInicio", value)}
            error={errors.vigenciaInicio}
            required
          />

          <InputField
            label="Vigência - Fim"
            type="date"
            value={formData.vigenciaFim}
            onChange={(value) => handleInputChange("vigenciaFim", value)}
            error={errors.vigenciaFim}
            required
          />
        </div>

        <div className="contract-form__file-section">
          <FileUpload
            label="Contrato em PDF"
            accept=".pdf"
            onChange={handleFileChange}
            error={errors.pdfFile}
            required
          />
        </div>

        <div className="contract-form__actions">
          <Button
            type="submit"
            variant="primary"
            loading={isLoading || isSubmitting}
            disabled={isLoading || isSubmitting}
          >
            {isLoading || isSubmitting ? "Salvando..." : contract ? "Atualizar Contrato" : "Salvar Contrato"}
          </Button>

          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isLoading || isSubmitting}
            >
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default Form;
