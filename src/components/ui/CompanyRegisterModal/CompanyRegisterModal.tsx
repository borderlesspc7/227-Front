import { useState } from "react";
import { FiX, FiChevronLeft, FiChevronRight, FiCheck } from "react-icons/fi";
import { authService } from "../../../services/authService";
import { subscriptionService } from "../../../services/subscriptionService";
import { useAuth } from "../../../hooks/useAuth";
import "./CompanyRegisterModal.css";

// Funções de formatação
const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
        return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
        return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
};

const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
};

interface CompanyRegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

interface StepData {
    personalData: {
        displayName: string;
        email: string;
        password: string;
        confirmPassword: string;
        cpf: string;
        role: string;
    };
    companyData: {
        companyName: string;
        companyCnpj: string;
        phone: string;
    };
    addressData: {
        street: string;
        number: string;
        complement: string;
        neighborhood: string;
        city: string;
        state: string;
        zipCode: string;
    };
    planData: {
        subscriptionPlan: "starter" | "business" | "enterprise";
    };
}

const STEPS = [
    { id: "personal", title: "Dados Pessoais", icon: "👤" },
    { id: "company", title: "Empresa", icon: "🏢" },
    { id: "address", title: "Endereço", icon: "📍" },
    { id: "plan", title: "Plano", icon: "💎" },
];

export function CompanyRegisterModal({ isOpen, onClose, onSuccess }: CompanyRegisterModalProps) {
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<StepData>({
        personalData: {
            displayName: "",
            email: "",
            password: "",
            confirmPassword: "",
            cpf: "",
            role: "",
        },
        companyData: {
            companyName: "",
            companyCnpj: "",
            phone: "",
        },
        addressData: {
            street: "",
            number: "",
            complement: "",
            neighborhood: "",
            city: "",
            state: "",
            zipCode: "",
        },
        planData: {
            subscriptionPlan: "starter",
        },
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleClose = () => {
        setCurrentStep(0);
        setFormData({
            personalData: { displayName: "", email: "", password: "", confirmPassword: "", cpf: "", role: "" },
            companyData: { companyName: "", companyCnpj: "", phone: "" },
            addressData: { street: "", number: "", complement: "", neighborhood: "", city: "", state: "", zipCode: "" },
            planData: { subscriptionPlan: "starter" },
        });
        setErrors({});
        onClose();
    };

    const validateStep = (stepIndex: number): boolean => {
        const newErrors: Record<string, string> = {};

        switch (stepIndex) {
            case 0: // Personal Data
                if (!formData.personalData.displayName.trim()) {
                    newErrors.displayName = "Nome completo é obrigatório";
                }
                if (!formData.personalData.email.trim()) {
                    newErrors.email = "Email é obrigatório";
                } else if (!/\S+@\S+\.\S+/.test(formData.personalData.email)) {
                    newErrors.email = "Email inválido";
                }
                if (!formData.personalData.password.trim()) {
                    newErrors.password = "Senha é obrigatória";
                } else if (formData.personalData.password.length < 6) {
                    newErrors.password = "Senha deve ter pelo menos 6 caracteres";
                }
                if (formData.personalData.password !== formData.personalData.confirmPassword) {
                    newErrors.confirmPassword = "Senhas não coincidem";
                }
                if (!formData.personalData.cpf.trim()) {
                    newErrors.cpf = "CPF é obrigatório";
                }
                if (!formData.personalData.role.trim()) {
                    newErrors.role = "Tipo de usuário é obrigatório";
                }
                break;

            case 1: // Company Data
                if (!formData.companyData.companyName.trim()) {
                    newErrors.companyName = "Nome da empresa é obrigatório";
                }
                if (!formData.companyData.companyCnpj.trim()) {
                    newErrors.companyCnpj = "CNPJ é obrigatório";
                }
                if (!formData.companyData.phone.trim()) {
                    newErrors.phone = "Telefone é obrigatório";
                }
                break;

            case 2: // Address Data
                if (!formData.addressData.street.trim()) {
                    newErrors.street = "Rua é obrigatória";
                }
                if (!formData.addressData.number.trim()) {
                    newErrors.number = "Número é obrigatório";
                }
                if (!formData.addressData.neighborhood.trim()) {
                    newErrors.neighborhood = "Bairro é obrigatório";
                }
                if (!formData.addressData.city.trim()) {
                    newErrors.city = "Cidade é obrigatória";
                }
                if (!formData.addressData.state.trim()) {
                    newErrors.state = "Estado é obrigatório";
                }
                if (!formData.addressData.zipCode.trim()) {
                    newErrors.zipCode = "CEP é obrigatório";
                }
                break;

            case 3: // Plan Data
                if (!formData.planData.subscriptionPlan) {
                    newErrors.subscriptionPlan = "Plano é obrigatório";
                }
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
        }
    };

    const handlePrevious = () => {
        setCurrentStep(prev => Math.max(prev - 1, 0));
    };

    const handleSubmit = async () => {
        if (!validateStep(currentStep)) return;

        setLoading(true);
        try {
            // Remover formatação do CNPJ
            const cnpjNumbers = formData.companyData.companyCnpj.replace(/\D/g, '');

            // Verificar se já existe empresa com este CNPJ
            const existingCompany = await subscriptionService.getCompanyByCNPJ(cnpjNumbers);
            if (existingCompany) {
                setErrors({ companyCnpj: "Já existe uma empresa cadastrada com este CNPJ" });
                setCurrentStep(1); // Voltar para o step da empresa
                return;
            }

            // Criar empresa no Firestore
            const companyData = {
                cnpj: cnpjNumbers, // Usar CNPJ sem formatação
                companyName: formData.companyData.companyName,
                email: formData.personalData.email,
                phone: formData.companyData.phone.replace(/\D/g, ''), // Remover formatação do telefone
                address: {
                    street: formData.addressData.street,
                    number: formData.addressData.number,
                    complement: formData.addressData.complement,
                    neighborhood: formData.addressData.neighborhood,
                    city: formData.addressData.city,
                    state: formData.addressData.state,
                    zipCode: formData.addressData.zipCode.replace(/\D/g, ''), // Remover formatação do CEP
                },
                subscription: {
                    plan: formData.planData.subscriptionPlan,
                    status: "trial" as const,
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 dias de trial
                    trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                    autoRenew: false,
                },
                createdBy: user?.uid || "",
            };

            const newCompany = await subscriptionService.createCompany(companyData);

            // Inicializar uso da empresa
            await subscriptionService.updateCompanyUsage(newCompany.id, {
                activeContracts: 0,
                totalUsers: 1,
                totalItems: 0,
                totalFormalizations: 0,
                totalAdditiveRequests: 0,
                storageUsedGB: 0,
            });

            // Atualizar o usuário com o companyId
            if (user?.uid) {
                await authService.updateUserCompanyId(user.uid, newCompany.id);
            }

            console.log("Empresa criada com sucesso:", newCompany);
            console.log("CompanyId atualizado para o usuário:", newCompany.id);

            if (onSuccess) {
                onSuccess();
            }
            handleClose();
        } catch (error) {
            console.error("Erro ao cadastrar empresa:", error);
            setErrors({ general: "Erro ao cadastrar empresa. Tente novamente." });
        } finally {
            setLoading(false);
        }
    };

    const updateFormData = (section: keyof StepData, field: string, value: string) => {
        let formattedValue = value;

        // Aplicar formatações específicas
        switch (field) {
            case 'cpf':
                formattedValue = formatCPF(value);
                break;
            case 'companyCnpj':
                formattedValue = formatCNPJ(value);
                break;
            case 'phone':
                formattedValue = formatPhone(value);
                break;
            case 'zipCode':
                formattedValue = formatCEP(value);
                break;
        }

        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: formattedValue,
            },
        }));

        // Limpar erro do campo quando o usuário começar a digitar
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="company-register-modal-overlay">
            <div className="company-register-modal">
                {/* Header */}
                <div className="modal-header">
                    <div className="modal-title">
                        <h2>Cadastro de Empresa</h2>
                        <p>Configure sua empresa para acessar todas as funcionalidades</p>
                    </div>
                    <button className="close-btn" onClick={handleClose}>
                        <FiX />
                    </button>
                </div>

                {/* Progress Steps */}
                <div className="steps-container">
                    {STEPS.map((step, index) => (
                        <div
                            key={step.id}
                            className={`step ${index < currentStep ? "completed" : index === currentStep ? "active" : ""}`}
                        >
                            <div className="step-icon">
                                {index < currentStep ? <FiCheck /> : step.icon}
                            </div>
                            <div className="step-content">
                                <span className="step-number">{index + 1}</span>
                                <span className="step-title">{step.title}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Form Content */}
                <div className="modal-content">
                    {errors.general && (
                        <div className="error-banner">
                            <span className="error-message">{errors.general}</span>
                        </div>
                    )}

                    {currentStep === 0 && (
                        <div className="step-content">
                            <h3>Dados Pessoais</h3>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Nome completo *</label>
                                    <input
                                        type="text"
                                        value={formData.personalData.displayName}
                                        onChange={(e) => updateFormData("personalData", "displayName", e.target.value)}
                                        placeholder="Digite seu nome completo"
                                        className={errors.displayName ? "error" : ""}
                                    />
                                    {errors.displayName && <span className="error-message">{errors.displayName}</span>}
                                </div>

                                <div className="form-group">
                                    <label>Email *</label>
                                    <input
                                        type="email"
                                        value={formData.personalData.email}
                                        onChange={(e) => updateFormData("personalData", "email", e.target.value)}
                                        placeholder="Digite seu email"
                                        className={errors.email ? "error" : ""}
                                    />
                                    {errors.email && <span className="error-message">{errors.email}</span>}
                                </div>

                                <div className="form-group">
                                    <label>Senha *</label>
                                    <input
                                        type="password"
                                        value={formData.personalData.password}
                                        onChange={(e) => updateFormData("personalData", "password", e.target.value)}
                                        placeholder="Digite sua senha"
                                        className={errors.password ? "error" : ""}
                                    />
                                    {errors.password && <span className="error-message">{errors.password}</span>}
                                </div>

                                <div className="form-group">
                                    <label>Confirmar Senha *</label>
                                    <input
                                        type="password"
                                        value={formData.personalData.confirmPassword}
                                        onChange={(e) => updateFormData("personalData", "confirmPassword", e.target.value)}
                                        placeholder="Confirme sua senha"
                                        className={errors.confirmPassword ? "error" : ""}
                                    />
                                    {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                                </div>

                                <div className="form-group">
                                    <label>CPF *</label>
                                    <input
                                        type="text"
                                        value={formData.personalData.cpf}
                                        onChange={(e) => updateFormData("personalData", "cpf", e.target.value)}
                                        placeholder="000.000.000-00"
                                        className={errors.cpf ? "error" : ""}
                                        maxLength={14}
                                    />
                                    {errors.cpf && <span className="error-message">{errors.cpf}</span>}
                                </div>

                                <div className="form-group">
                                    <label>Tipo de usuário *</label>
                                    <select
                                        value={formData.personalData.role}
                                        onChange={(e) => updateFormData("personalData", "role", e.target.value)}
                                        className={errors.role ? "error" : ""}
                                    >
                                        <option value="">Selecione o tipo de usuário</option>
                                        <option value="admin">Administrador</option>
                                        <option value="user">Usuário</option>
                                    </select>
                                    {errors.role && <span className="error-message">{errors.role}</span>}
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 1 && (
                        <div className="step-content">
                            <h3>Dados da Empresa</h3>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Nome da empresa *</label>
                                    <input
                                        type="text"
                                        value={formData.companyData.companyName}
                                        onChange={(e) => updateFormData("companyData", "companyName", e.target.value)}
                                        placeholder="Digite o nome da empresa"
                                        className={errors.companyName ? "error" : ""}
                                    />
                                    {errors.companyName && <span className="error-message">{errors.companyName}</span>}
                                </div>

                                <div className="form-group">
                                    <label>CNPJ *</label>
                                    <input
                                        type="text"
                                        value={formData.companyData.companyCnpj}
                                        onChange={(e) => updateFormData("companyData", "companyCnpj", e.target.value)}
                                        placeholder="00.000.000/0000-00"
                                        className={errors.companyCnpj ? "error" : ""}
                                        maxLength={18}
                                    />
                                    {errors.companyCnpj && <span className="error-message">{errors.companyCnpj}</span>}
                                </div>

                                <div className="form-group">
                                    <label>Telefone *</label>
                                    <input
                                        type="text"
                                        value={formData.companyData.phone}
                                        onChange={(e) => updateFormData("companyData", "phone", e.target.value)}
                                        placeholder="(00) 00000-0000"
                                        className={errors.phone ? "error" : ""}
                                        maxLength={15}
                                    />
                                    {errors.phone && <span className="error-message">{errors.phone}</span>}
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="step-content">
                            <h3>Endereço da Empresa</h3>
                            <div className="form-grid">
                                <div className="form-group full-width">
                                    <label>Rua *</label>
                                    <input
                                        type="text"
                                        value={formData.addressData.street}
                                        onChange={(e) => updateFormData("addressData", "street", e.target.value)}
                                        placeholder="Digite o nome da rua"
                                        className={errors.street ? "error" : ""}
                                    />
                                    {errors.street && <span className="error-message">{errors.street}</span>}
                                </div>

                                <div className="form-group">
                                    <label>Número *</label>
                                    <input
                                        type="text"
                                        value={formData.addressData.number}
                                        onChange={(e) => updateFormData("addressData", "number", e.target.value)}
                                        placeholder="123"
                                        className={errors.number ? "error" : ""}
                                    />
                                    {errors.number && <span className="error-message">{errors.number}</span>}
                                </div>

                                <div className="form-group">
                                    <label>Complemento</label>
                                    <input
                                        type="text"
                                        value={formData.addressData.complement}
                                        onChange={(e) => updateFormData("addressData", "complement", e.target.value)}
                                        placeholder="Apto 101"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Bairro *</label>
                                    <input
                                        type="text"
                                        value={formData.addressData.neighborhood}
                                        onChange={(e) => updateFormData("addressData", "neighborhood", e.target.value)}
                                        placeholder="Centro"
                                        className={errors.neighborhood ? "error" : ""}
                                    />
                                    {errors.neighborhood && <span className="error-message">{errors.neighborhood}</span>}
                                </div>

                                <div className="form-group">
                                    <label>Cidade *</label>
                                    <input
                                        type="text"
                                        value={formData.addressData.city}
                                        onChange={(e) => updateFormData("addressData", "city", e.target.value)}
                                        placeholder="São Paulo"
                                        className={errors.city ? "error" : ""}
                                    />
                                    {errors.city && <span className="error-message">{errors.city}</span>}
                                </div>

                                <div className="form-group">
                                    <label>Estado *</label>
                                    <select
                                        value={formData.addressData.state}
                                        onChange={(e) => updateFormData("addressData", "state", e.target.value)}
                                        className={errors.state ? "error" : ""}
                                    >
                                        <option value="">Selecione o estado</option>
                                        <option value="SP">São Paulo</option>
                                        <option value="RJ">Rio de Janeiro</option>
                                        <option value="MG">Minas Gerais</option>
                                        {/* Adicione outros estados conforme necessário */}
                                    </select>
                                    {errors.state && <span className="error-message">{errors.state}</span>}
                                </div>

                                <div className="form-group">
                                    <label>CEP *</label>
                                    <input
                                        type="text"
                                        value={formData.addressData.zipCode}
                                        onChange={(e) => updateFormData("addressData", "zipCode", e.target.value)}
                                        placeholder="00000-000"
                                        className={errors.zipCode ? "error" : ""}
                                        maxLength={9}
                                    />
                                    {errors.zipCode && <span className="error-message">{errors.zipCode}</span>}
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="step-content">
                            <h3>Escolha seu Plano</h3>
                            <div className="plans-grid">
                                {["starter", "business", "enterprise"].map((plan) => (
                                    <div
                                        key={plan}
                                        className={`plan-card ${formData.planData.subscriptionPlan === plan ? "selected" : ""}`}
                                        onClick={() => updateFormData("planData", "subscriptionPlan", plan)}
                                    >
                                        <div className="plan-header">
                                            <h4>{plan === "starter" ? "Starter" : plan === "business" ? "Business" : "Enterprise"}</h4>
                                            <div className="plan-price">
                                                R$ {plan === "starter" ? "99,90" : plan === "business" ? "299,90" : "799,90"}
                                                <span>/mês</span>
                                            </div>
                                        </div>
                                        <div className="plan-features">
                                            {plan === "starter" && (
                                                <ul>
                                                    <li>5 Contratos Ativos</li>
                                                    <li>3 Usuários</li>
                                                    <li>1 GB Armazenamento</li>
                                                </ul>
                                            )}
                                            {plan === "business" && (
                                                <ul>
                                                    <li>25 Contratos Ativos</li>
                                                    <li>10 Usuários</li>
                                                    <li>10 GB Armazenamento</li>
                                                    <li>Relatórios Avançados</li>
                                                </ul>
                                            )}
                                            {plan === "enterprise" && (
                                                <ul>
                                                    <li>Contratos Ilimitados</li>
                                                    <li>Usuários Ilimitados</li>
                                                    <li>Armazenamento Ilimitado</li>
                                                    <li>Todos os Recursos Premium</li>
                                                    <li>Suporte Prioritário</li>
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="modal-footer">
                    <div className="footer-buttons">
                        {currentStep > 0 && (
                            <button className="btn-secondary" onClick={handlePrevious}>
                                <FiChevronLeft />
                                Anterior
                            </button>
                        )}

                        <div className="spacer" />

                        {currentStep < STEPS.length - 1 ? (
                            <button className="btn-primary" onClick={handleNext}>
                                Próximo
                                <FiChevronRight />
                            </button>
                        ) : (
                            <button
                                className="btn-primary"
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? "Cadastrando..." : "Finalizar Cadastro"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
