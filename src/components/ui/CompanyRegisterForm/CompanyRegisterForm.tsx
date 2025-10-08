"use client";

import React from "react";
import { useState } from "react";
import InputField from "../../../components/ui/InputField/InputField";
import { SelectField } from "../../../components/ui/SelectField/SelectField";
import { Button } from "../../../components/ui/Button/Button";
import { PlanSelector } from "../../../components/ui/PlanSelector/PlanSelector";
import type { RegisterCredentials, UserRole } from "../../../types/auth";
import type { SubscriptionPlanConfig } from "../../../types/subscription";
import { useAuth } from "../../../hooks/useAuth";
import { optionsService } from "../../../services/optionsService";
import { subscriptionService } from "../../../services/subscriptionService";
import "./CompanyRegisterForm.css";

type FormData = {
    // Dados pessoais
    displayName: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: string;
    cpf: string;
    phone: string;

    // Dados da empresa
    companyName: string;
    companyCnpj: string;
    companyEmail: string;
    companyPhone: string;

    // Endereço da empresa
    companyAddress: {
        street: string;
        number: string;
        complement: string;
        neighborhood: string;
        city: string;
        state: string;
        zipCode: string;
    };

    // Plano de assinatura
    subscriptionPlan: string;
};

type FormErrors = Partial<Record<keyof FormData, string>> & {
    street?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
};

interface CompanyRegisterFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

export const CompanyRegisterForm: React.FC<CompanyRegisterFormProps> = ({
    onSuccess,
    onCancel
}) => {
    const { register } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanConfig | null>(null);

    const [formData, setFormData] = useState<FormData>({
        displayName: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "",
        cpf: "",
        phone: "",
        companyName: "",
        companyCnpj: "",
        companyEmail: "",
        companyPhone: "",
        companyAddress: {
            street: "",
            number: "",
            complement: "",
            neighborhood: "",
            city: "",
            state: "",
            zipCode: "",
        },
        subscriptionPlan: "",
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [userRoleOptions, setUserRoleOptions] = useState<Array<{ value: string; label: string }>>([]);
    const [availablePlans, setAvailablePlans] = useState<SubscriptionPlanConfig[]>([]);

    React.useEffect(() => {
        const loadOptions = async () => {
            try {
                const [roleOptions, plans] = await Promise.all([
                    optionsService.getUserRoleOptions(),
                    Promise.resolve(subscriptionService.getAvailablePlans())
                ]);

                setUserRoleOptions(roleOptions.map(opt => ({ value: opt.value, label: opt.label })));
                setAvailablePlans(plans);
            } catch (error) {
                console.error("Erro ao carregar opções:", error);
            }
        };
        loadOptions();
    }, []);

    const formatCPF = (value: string) => {
        const numbers = value.replace(/\D/g, "");
        if (numbers.length <= 11) {
            return numbers
                .replace(/(\d{3})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d{1,2})/, "$1-$2");
        }
        return numbers
            .slice(0, 11)
            .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    };

    const formatCNPJ = (value: string) => {
        const numbers = value.replace(/\D/g, "");
        if (numbers.length <= 14) {
            return numbers
                .replace(/(\d{2})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d)/, "$1/$2")
                .replace(/(\d{4})(\d{1,2})/, "$1-$2");
        }
        return numbers
            .slice(0, 14)
            .replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
    };

    const formatCEP = (value: string) => {
        const numbers = value.replace(/\D/g, "");
        if (numbers.length <= 8) {
            return numbers.replace(/(\d{5})(\d)/, "$1-$2");
        }
        return numbers.slice(0, 8).replace(/(\d{5})(\d{3})/, "$1-$2");
    };

    const validateStep = (step: number): boolean => {
        const newErrors: FormErrors = {};

        if (step === 1) {
            // Validação dos dados pessoais
            if (!formData.displayName.trim()) {
                newErrors.displayName = "Nome é obrigatório";
            } else if (formData.displayName.trim().length < 2) {
                newErrors.displayName = "Nome deve ter pelo menos 2 caracteres";
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!formData.email.trim()) {
                newErrors.email = "Email é obrigatório";
            } else if (!emailRegex.test(formData.email)) {
                newErrors.email = "Email inválido";
            }

            if (!formData.password) {
                newErrors.password = "Senha é obrigatória";
            } else if (formData.password.length < 6) {
                newErrors.password = "Senha deve ter pelo menos 6 caracteres";
            }

            if (!formData.confirmPassword) {
                newErrors.confirmPassword = "Confirmação de senha é obrigatória";
            } else if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = "Senhas não coincidem";
            }

            const cpfNumbers = formData.cpf.replace(/\D/g, "");
            if (!formData.cpf.trim()) {
                newErrors.cpf = "CPF é obrigatório";
            } else if (cpfNumbers.length !== 11) {
                newErrors.cpf = "CPF deve ter 11 dígitos";
            }

            if (!formData.role) {
                newErrors.role = "Tipo de usuário é obrigatório";
            }
        }

        if (step === 2) {
            // Validação dos dados da empresa
            if (!formData.companyName.trim()) {
                newErrors.companyName = "Nome da empresa é obrigatório";
            }

            const cnpjNumbers = formData.companyCnpj.replace(/\D/g, "");
            if (!formData.companyCnpj.trim()) {
                newErrors.companyCnpj = "CNPJ é obrigatório";
            } else if (cnpjNumbers.length !== 14) {
                newErrors.companyCnpj = "CNPJ deve ter 14 dígitos";
            } else if (!subscriptionService.validateCNPJ(formData.companyCnpj)) {
                newErrors.companyCnpj = "CNPJ inválido";
            }

            if (!formData.companyEmail.trim()) {
                newErrors.companyEmail = "Email da empresa é obrigatório";
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.companyEmail)) {
                newErrors.companyEmail = "Email inválido";
            }
        }

        if (step === 3) {
            // Validação do endereço
            if (!formData.companyAddress.street.trim()) {
                newErrors.street = "Rua é obrigatória";
            }
            if (!formData.companyAddress.number.trim()) {
                newErrors.number = "Número é obrigatório";
            }
            if (!formData.companyAddress.neighborhood.trim()) {
                newErrors.neighborhood = "Bairro é obrigatório";
            }
            if (!formData.companyAddress.city.trim()) {
                newErrors.city = "Cidade é obrigatória";
            }
            if (!formData.companyAddress.state.trim()) {
                newErrors.state = "Estado é obrigatório";
            }
            if (!formData.companyAddress.zipCode.trim()) {
                newErrors.zipCode = "CEP é obrigatório";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field: keyof FormData) => (value: string) => {
        if (field === "cpf") {
            value = formatCPF(value);
        } else if (field === "companyCnpj") {
            value = formatCNPJ(value);
        } else if (field === "companyAddress") {
            // Handle nested address fields - this should be handled differently
            // For now, just pass the value as is
        }

        setFormData((prevData) => ({
            ...prevData,
            [field]: value,
        }));

        if (errors[field]) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                [field]: undefined,
            }));
        }
    };

    const handleAddressChange = (field: keyof FormData["companyAddress"]) => (value: string) => {
        if (field === "zipCode") {
            value = formatCEP(value);
        }

        setFormData((prevData) => ({
            ...prevData,
            companyAddress: {
                ...prevData.companyAddress,
                [field]: value,
            },
        }));

        if (errors[field as keyof FormErrors]) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                [field]: undefined,
            }));
        }
    };

    const handlePlanSelect = (plan: SubscriptionPlanConfig) => {
        setSelectedPlan(plan);
        setFormData((prevData) => ({
            ...prevData,
            subscriptionPlan: plan.id,
        }));
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateStep(3) || !selectedPlan) {
            return;
        }

        setIsSubmitting(true);

        try {
            const payload: RegisterCredentials = {
                displayName: formData.displayName,
                email: formData.email,
                password: formData.password,
                cpf: formData.cpf,
                phone: formData.phone,
                role: formData.role as UserRole,
                companyName: formData.companyName,
                companyCnpj: formData.companyCnpj,
                companyAddress: formData.companyAddress,
                subscriptionPlan: selectedPlan.id as "starter" | "business" | "enterprise",
            };

            await register(payload);

            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error("Erro ao registrar empresa:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStep1 = () => (
        <div className="register-step">
            <h2>Dados Pessoais</h2>
            <div className="form-grid">
                <InputField
                    label="Nome completo"
                    type="text"
                    value={formData.displayName}
                    onChange={handleInputChange("displayName")}
                    placeholder="Digite seu nome completo"
                    error={errors.displayName}
                    required
                />

                <InputField
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange("email")}
                    placeholder="Digite seu email"
                    error={errors.email}
                    required
                />

                <InputField
                    label="Senha"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange("password")}
                    placeholder="Digite sua senha"
                    error={errors.password}
                    required
                />

                <InputField
                    label="Confirmar Senha"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange("confirmPassword")}
                    placeholder="Confirme sua senha"
                    error={errors.confirmPassword}
                    required
                />

                <InputField
                    label="CPF"
                    type="text"
                    value={formData.cpf}
                    onChange={handleInputChange("cpf")}
                    placeholder="000.000.000-00"
                    error={errors.cpf}
                    required
                />

                <SelectField
                    label="Tipo de usuário"
                    value={formData.role}
                    onChange={handleInputChange("role")}
                    options={userRoleOptions}
                    placeholder="Selecione o tipo de usuário"
                    error={errors.role}
                    required
                />

                <InputField
                    label="Telefone"
                    type="text"
                    value={formData.phone}
                    onChange={handleInputChange("phone")}
                    placeholder="(00) 00000-0000"
                />
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="register-step">
            <h2>Dados da Empresa</h2>
            <div className="form-grid">
                <InputField
                    label="Nome da Empresa"
                    type="text"
                    value={formData.companyName}
                    onChange={handleInputChange("companyName")}
                    placeholder="Digite o nome da empresa"
                    error={errors.companyName}
                    required
                />

                <InputField
                    label="CNPJ"
                    type="text"
                    value={formData.companyCnpj}
                    onChange={handleInputChange("companyCnpj")}
                    placeholder="00.000.000/0000-00"
                    error={errors.companyCnpj}
                    required
                />

                <InputField
                    label="Email da Empresa"
                    type="email"
                    value={formData.companyEmail}
                    onChange={handleInputChange("companyEmail")}
                    placeholder="Digite o email da empresa"
                    error={errors.companyEmail}
                    required
                />

                <InputField
                    label="Telefone da Empresa"
                    type="text"
                    value={formData.companyPhone}
                    onChange={handleInputChange("companyPhone")}
                    placeholder="(00) 00000-0000"
                />
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="register-step">
            <h2>Endereço da Empresa</h2>
            <div className="form-grid">
                <InputField
                    label="Rua"
                    type="text"
                    value={formData.companyAddress.street}
                    onChange={handleAddressChange("street")}
                    placeholder="Digite o nome da rua"
                    error={errors.street}
                    required
                />

                <InputField
                    label="Número"
                    type="text"
                    value={formData.companyAddress.number}
                    onChange={handleAddressChange("number")}
                    placeholder="Digite o número"
                    error={errors.number}
                    required
                />

                <InputField
                    label="Complemento"
                    type="text"
                    value={formData.companyAddress.complement}
                    onChange={handleAddressChange("complement")}
                    placeholder="Apartamento, sala, etc."
                />

                <InputField
                    label="Bairro"
                    type="text"
                    value={formData.companyAddress.neighborhood}
                    onChange={handleAddressChange("neighborhood")}
                    placeholder="Digite o bairro"
                    error={errors.neighborhood}
                    required
                />

                <InputField
                    label="Cidade"
                    type="text"
                    value={formData.companyAddress.city}
                    onChange={handleAddressChange("city")}
                    placeholder="Digite a cidade"
                    error={errors.city}
                    required
                />

                <InputField
                    label="Estado"
                    type="text"
                    value={formData.companyAddress.state}
                    onChange={handleAddressChange("state")}
                    placeholder="Digite o estado"
                    error={errors.state}
                    required
                />

                <InputField
                    label="CEP"
                    type="text"
                    value={formData.companyAddress.zipCode}
                    onChange={handleAddressChange("zipCode")}
                    placeholder="00000-000"
                    error={errors.zipCode}
                    required
                />
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="register-step">
            <h2>Escolha seu Plano</h2>
            <PlanSelector
                plans={availablePlans}
                selectedPlan={selectedPlan?.id}
                onPlanSelect={handlePlanSelect}
            />
        </div>
    );

    return (
        <div className="company-register-form">
            <div className="register-header">
                <h1>Cadastro de Empresa</h1>
                <p>Preencha os dados abaixo para criar sua conta empresarial</p>
            </div>

            <div className="step-indicator">
                <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
                    <span>1</span>
                    <label>Dados Pessoais</label>
                </div>
                <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
                    <span>2</span>
                    <label>Empresa</label>
                </div>
                <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
                    <span>3</span>
                    <label>Endereço</label>
                </div>
                <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>
                    <span>4</span>
                    <label>Plano</label>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
                {currentStep === 4 && renderStep4()}

                <div className="form-actions">
                    {currentStep > 1 && (
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handlePrevious}
                            disabled={isSubmitting}
                        >
                            Anterior
                        </Button>
                    )}

                    {currentStep < 4 ? (
                        <Button
                            type="button"
                            variant="primary"
                            onClick={handleNext}
                            disabled={isSubmitting}
                        >
                            Próximo
                        </Button>
                    ) : (
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={isSubmitting || !selectedPlan}
                        >
                            {isSubmitting ? "Criando Conta..." : "Criar Conta"}
                        </Button>
                    )}

                    {onCancel && (
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onCancel}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>
                    )}
                </div>
            </form>
        </div>
    );
};
