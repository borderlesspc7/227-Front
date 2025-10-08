import { useState } from "react";
import { FiCreditCard, FiUser, FiMapPin, FiMail, FiX, FiSave, FiEdit } from "react-icons/fi";
import { useToast } from "../../../hooks/useToast";
import "./BillingDataModal.css";

interface BillingDataModalProps {
    isOpen: boolean;
    onClose: () => void;
    companyData?: any;
}

export function BillingDataModal({ isOpen, onClose, companyData }: BillingDataModalProps) {
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Estados do formulário
    const [formData, setFormData] = useState({
        // Dados da Empresa
        companyName: companyData?.name || "Empresa Teste",
        companyEmail: companyData?.email || "teste@empresa.com",
        companyPhone: companyData?.phone || "(11) 99999-9999",
        companyDocument: companyData?.document || "12.345.678/0001-90",

        // Endereço de Cobrança
        billingAddress: {
            street: "Rua das Flores, 123",
            neighborhood: "Centro",
            city: "São Paulo",
            state: "SP",
            zipCode: "01234-567",
            country: "Brasil"
        },

        // Dados de Contato para Cobrança
        billingContact: {
            name: "João Silva",
            email: "cobranca@empresa.com",
            phone: "(11) 88888-8888",
            position: "Financeiro"
        },

        // Configurações de Cobrança
        billingSettings: {
            invoiceEmail: companyData?.email || "teste@empresa.com",
            paymentMethod: "credit_card",
            billingCycle: "monthly",
            autoRenewal: true,
            latePaymentFee: 0,
            gracePeriod: 7
        }
    });

    const [errors, setErrors] = useState<any>({});

    if (!isOpen) return null;

    const handleInputChange = (field: string, value: any) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent as keyof typeof prev],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }

        // Limpar erro do campo
        if (errors[field]) {
            setErrors((prev: Record<string, string>) => ({
                ...prev,
                [field]: null
            }));
        }
    };

    const validateForm = () => {
        const newErrors: any = {};

        if (!formData.companyName.trim()) {
            newErrors.companyName = "Nome da empresa é obrigatório";
        }

        if (!formData.companyEmail.trim()) {
            newErrors.companyEmail = "Email da empresa é obrigatório";
        } else if (!/\S+@\S+\.\S+/.test(formData.companyEmail)) {
            newErrors.companyEmail = "Email inválido";
        }

        if (!formData.companyDocument.trim()) {
            newErrors.companyDocument = "CNPJ é obrigatório";
        }

        if (!formData.billingAddress.street.trim()) {
            newErrors.street = "Endereço é obrigatório";
        }

        if (!formData.billingAddress.city.trim()) {
            newErrors.city = "Cidade é obrigatória";
        }

        if (!formData.billingAddress.zipCode.trim()) {
            newErrors.zipCode = "CEP é obrigatório";
        }

        if (!formData.billingContact.name.trim()) {
            newErrors.contactName = "Nome do contato é obrigatório";
        }

        if (!formData.billingContact.email.trim()) {
            newErrors.contactEmail = "Email do contato é obrigatório";
        } else if (!/\S+@\S+\.\S+/.test(formData.billingContact.email)) {
            newErrors.contactEmail = "Email inválido";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            showToast({ type: "error", title: "Por favor, corrija os erros no formulário" });
            return;
        }

        setIsLoading(true);
        try {
            // Simular chamada à API
            await new Promise(resolve => setTimeout(resolve, 1500));
            showToast({ type: "success", title: "Dados de cobrança atualizados com sucesso!" });
            setIsEditing(false);
            onClose();
        } catch (error) {
            showToast({ type: "error", title: "Erro ao atualizar dados de cobrança" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setErrors({});
        // Resetar dados para os originais se necessário
    };

    return (
        <div className="billing-modal">
            <div className="billing-modal__content">
                <div className="billing-modal__header">
                    <div className="billing-modal__title">
                        <FiCreditCard className="billing-modal__icon" />
                        Atualizar Dados de Cobrança
                    </div>
                    <button className="billing-modal__close" onClick={onClose}>
                        <FiX />
                    </button>
                </div>

                <div className="billing-modal__body">
                    {/* Dados da Empresa */}
                    <div className="billing-section">
                        <div className="billing-section__header">
                            <h3 className="billing-section__title">
                                <FiUser />
                                Dados da Empresa
                            </h3>
                            {!isEditing && (
                                <button
                                    className="billing-section__edit"
                                    onClick={() => setIsEditing(true)}
                                >
                                    <FiEdit />
                                    Editar
                                </button>
                            )}
                        </div>

                        <div className="billing-form">
                            <div className="billing-form__row">
                                <div className="billing-form__field">
                                    <label className="billing-form__label">Nome da Empresa *</label>
                                    <input
                                        type="text"
                                        className={`billing-form__input ${errors.companyName ? 'billing-form__input--error' : ''}`}
                                        value={formData.companyName}
                                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                                        disabled={!isEditing}
                                    />
                                    {errors.companyName && <span className="billing-form__error">{errors.companyName}</span>}
                                </div>

                                <div className="billing-form__field">
                                    <label className="billing-form__label">Email da Empresa *</label>
                                    <input
                                        type="email"
                                        className={`billing-form__input ${errors.companyEmail ? 'billing-form__input--error' : ''}`}
                                        value={formData.companyEmail}
                                        onChange={(e) => handleInputChange('companyEmail', e.target.value)}
                                        disabled={!isEditing}
                                    />
                                    {errors.companyEmail && <span className="billing-form__error">{errors.companyEmail}</span>}
                                </div>
                            </div>

                            <div className="billing-form__row">
                                <div className="billing-form__field">
                                    <label className="billing-form__label">Telefone</label>
                                    <input
                                        type="tel"
                                        className="billing-form__input"
                                        value={formData.companyPhone}
                                        onChange={(e) => handleInputChange('companyPhone', e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>

                                <div className="billing-form__field">
                                    <label className="billing-form__label">CNPJ *</label>
                                    <input
                                        type="text"
                                        className={`billing-form__input ${errors.companyDocument ? 'billing-form__input--error' : ''}`}
                                        value={formData.companyDocument}
                                        onChange={(e) => handleInputChange('companyDocument', e.target.value)}
                                        disabled={!isEditing}
                                    />
                                    {errors.companyDocument && <span className="billing-form__error">{errors.companyDocument}</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Endereço de Cobrança */}
                    <div className="billing-section">
                        <div className="billing-section__header">
                            <h3 className="billing-section__title">
                                <FiMapPin />
                                Endereço de Cobrança
                            </h3>
                        </div>

                        <div className="billing-form">
                            <div className="billing-form__field billing-form__field--full">
                                <label className="billing-form__label">Endereço Completo *</label>
                                <input
                                    type="text"
                                    className={`billing-form__input ${errors.street ? 'billing-form__input--error' : ''}`}
                                    value={formData.billingAddress.street}
                                    onChange={(e) => handleInputChange('billingAddress.street', e.target.value)}
                                    disabled={!isEditing}
                                />
                                {errors.street && <span className="billing-form__error">{errors.street}</span>}
                            </div>

                            <div className="billing-form__row">
                                <div className="billing-form__field">
                                    <label className="billing-form__label">Bairro</label>
                                    <input
                                        type="text"
                                        className="billing-form__input"
                                        value={formData.billingAddress.neighborhood}
                                        onChange={(e) => handleInputChange('billingAddress.neighborhood', e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>

                                <div className="billing-form__field">
                                    <label className="billing-form__label">Cidade *</label>
                                    <input
                                        type="text"
                                        className={`billing-form__input ${errors.city ? 'billing-form__input--error' : ''}`}
                                        value={formData.billingAddress.city}
                                        onChange={(e) => handleInputChange('billingAddress.city', e.target.value)}
                                        disabled={!isEditing}
                                    />
                                    {errors.city && <span className="billing-form__error">{errors.city}</span>}
                                </div>
                            </div>

                            <div className="billing-form__row">
                                <div className="billing-form__field">
                                    <label className="billing-form__label">Estado</label>
                                    <input
                                        type="text"
                                        className="billing-form__input"
                                        value={formData.billingAddress.state}
                                        onChange={(e) => handleInputChange('billingAddress.state', e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>

                                <div className="billing-form__field">
                                    <label className="billing-form__label">CEP *</label>
                                    <input
                                        type="text"
                                        className={`billing-form__input ${errors.zipCode ? 'billing-form__input--error' : ''}`}
                                        value={formData.billingAddress.zipCode}
                                        onChange={(e) => handleInputChange('billingAddress.zipCode', e.target.value)}
                                        disabled={!isEditing}
                                    />
                                    {errors.zipCode && <span className="billing-form__error">{errors.zipCode}</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contato para Cobrança */}
                    <div className="billing-section">
                        <div className="billing-section__header">
                            <h3 className="billing-section__title">
                                <FiMail />
                                Contato para Cobrança
                            </h3>
                        </div>

                        <div className="billing-form">
                            <div className="billing-form__row">
                                <div className="billing-form__field">
                                    <label className="billing-form__label">Nome do Contato *</label>
                                    <input
                                        type="text"
                                        className={`billing-form__input ${errors.contactName ? 'billing-form__input--error' : ''}`}
                                        value={formData.billingContact.name}
                                        onChange={(e) => handleInputChange('billingContact.name', e.target.value)}
                                        disabled={!isEditing}
                                    />
                                    {errors.contactName && <span className="billing-form__error">{errors.contactName}</span>}
                                </div>

                                <div className="billing-form__field">
                                    <label className="billing-form__label">Email do Contato *</label>
                                    <input
                                        type="email"
                                        className={`billing-form__input ${errors.contactEmail ? 'billing-form__input--error' : ''}`}
                                        value={formData.billingContact.email}
                                        onChange={(e) => handleInputChange('billingContact.email', e.target.value)}
                                        disabled={!isEditing}
                                    />
                                    {errors.contactEmail && <span className="billing-form__error">{errors.contactEmail}</span>}
                                </div>
                            </div>

                            <div className="billing-form__row">
                                <div className="billing-form__field">
                                    <label className="billing-form__label">Telefone do Contato</label>
                                    <input
                                        type="tel"
                                        className="billing-form__input"
                                        value={formData.billingContact.phone}
                                        onChange={(e) => handleInputChange('billingContact.phone', e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>

                                <div className="billing-form__field">
                                    <label className="billing-form__label">Cargo</label>
                                    <input
                                        type="text"
                                        className="billing-form__input"
                                        value={formData.billingContact.position}
                                        onChange={(e) => handleInputChange('billingContact.position', e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Configurações de Cobrança */}
                    <div className="billing-section">
                        <div className="billing-section__header">
                            <h3 className="billing-section__title">
                                <FiCreditCard />
                                Configurações de Cobrança
                            </h3>
                        </div>

                        <div className="billing-form">
                            <div className="billing-form__row">
                                <div className="billing-form__field">
                                    <label className="billing-form__label">Email para Faturas</label>
                                    <input
                                        type="email"
                                        className="billing-form__input"
                                        value={formData.billingSettings.invoiceEmail}
                                        onChange={(e) => handleInputChange('billingSettings.invoiceEmail', e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>

                                <div className="billing-form__field">
                                    <label className="billing-form__label">Método de Pagamento</label>
                                    <select
                                        className="billing-form__input"
                                        value={formData.billingSettings.paymentMethod}
                                        onChange={(e) => handleInputChange('billingSettings.paymentMethod', e.target.value)}
                                        disabled={!isEditing}
                                    >
                                        <option value="credit_card">Cartão de Crédito</option>
                                        <option value="debit_card">Cartão de Débito</option>
                                        <option value="pix">PIX</option>
                                        <option value="bank_transfer">Transferência Bancária</option>
                                    </select>
                                </div>
                            </div>

                            <div className="billing-form__row">
                                <div className="billing-form__field">
                                    <label className="billing-form__label">Ciclo de Cobrança</label>
                                    <select
                                        className="billing-form__input"
                                        value={formData.billingSettings.billingCycle}
                                        onChange={(e) => handleInputChange('billingSettings.billingCycle', e.target.value)}
                                        disabled={!isEditing}
                                    >
                                        <option value="monthly">Mensal</option>
                                        <option value="quarterly">Trimestral</option>
                                        <option value="yearly">Anual</option>
                                    </select>
                                </div>

                                <div className="billing-form__field">
                                    <label className="billing-form__label">Período de Carência (dias)</label>
                                    <input
                                        type="number"
                                        className="billing-form__input"
                                        value={formData.billingSettings.gracePeriod}
                                        onChange={(e) => handleInputChange('billingSettings.gracePeriod', parseInt(e.target.value))}
                                        disabled={!isEditing}
                                        min="0"
                                        max="30"
                                    />
                                </div>
                            </div>

                            <div className="billing-form__checkbox">
                                <label className="billing-form__checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.billingSettings.autoRenewal}
                                        onChange={(e) => handleInputChange('billingSettings.autoRenewal', e.target.checked)}
                                        disabled={!isEditing}
                                    />
                                    <span className="billing-form__checkbox-text">
                                        Renovação automática ativada
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="billing-modal__footer">
                    {isEditing ? (
                        <div className="billing-modal__actions">
                            <button
                                className="billing-modal__button billing-modal__button--secondary"
                                onClick={handleCancel}
                                disabled={isLoading}
                            >
                                Cancelar
                            </button>
                            <button
                                className="billing-modal__button billing-modal__button--primary"
                                onClick={handleSave}
                                disabled={isLoading}
                            >
                                <FiSave />
                                {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        </div>
                    ) : (
                        <div className="billing-modal__actions">
                            <button
                                className="billing-modal__button billing-modal__button--primary"
                                onClick={onClose}
                            >
                                Fechar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
