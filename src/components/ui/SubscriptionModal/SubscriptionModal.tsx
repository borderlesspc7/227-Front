import { useState } from "react";
import { FiSettings, FiCalendar, FiCreditCard, FiDownload, FiPause, FiPlay, FiX } from "react-icons/fi";
import { useToast } from "../../../hooks/useToast";
import { BillingDataModal } from "../BillingDataModal/BillingDataModal";
import "./SubscriptionModal.css";

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    subscription: any;
}

export function SubscriptionModal({ isOpen, onClose, subscription }: SubscriptionModalProps) {
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [showBillingModal, setShowBillingModal] = useState(false);

    if (!isOpen) return null;

    const handlePauseSubscription = async () => {
        setIsLoading(true);
        try {
            // Simular chamada à API
            await new Promise(resolve => setTimeout(resolve, 1000));
            showToast("Assinatura pausada com sucesso!", "success");
            onClose();
        } catch (error) {
            showToast("Erro ao pausar assinatura", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResumeSubscription = async () => {
        setIsLoading(true);
        try {
            // Simular chamada à API
            await new Promise(resolve => setTimeout(resolve, 1000));
            showToast("Assinatura reativada com sucesso!", "success");
            onClose();
        } catch (error) {
            showToast("Erro ao reativar assinatura", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelSubscription = async () => {
        setIsLoading(true);
        try {
            // Simular chamada à API
            await new Promise(resolve => setTimeout(resolve, 1000));
            showToast("Assinatura cancelada com sucesso!", "success");
            setShowCancelConfirm(false);
            onClose();
        } catch (error) {
            showToast("Erro ao cancelar assinatura", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadInvoice = () => {
        showToast("Download da fatura iniciado!", "info");
    };

    const handleUpdateBillingInfo = () => {
        setShowBillingModal(true);
    };

    return (
        <>
            <div className="subscription-modal">
                <div className="subscription-modal__content">
                    <div className="subscription-modal__header">
                        <div className="subscription-modal__title">
                            <FiSettings className="subscription-modal__icon" />
                            Gerenciar Assinatura
                        </div>
                        <button className="subscription-modal__close" onClick={onClose}>
                            <FiX />
                        </button>
                    </div>

                    <div className="subscription-modal__body">
                        {/* Status da Assinatura */}
                        <div className="subscription-section">
                            <h3 className="subscription-section__title">Status da Assinatura</h3>
                            <div className="subscription-status">
                                <div className="subscription-status__item">
                                    <span className="subscription-status__label">Status:</span>
                                    <span className={`subscription-status__value subscription-status__value--${subscription?.status?.toLowerCase() || 'active'}`}>
                                        {subscription?.status || 'Ativa'}
                                    </span>
                                </div>
                                <div className="subscription-status__item">
                                    <span className="subscription-status__label">Plano:</span>
                                    <span className="subscription-status__value">{subscription?.plan?.name || 'Starter'}</span>
                                </div>
                                <div className="subscription-status__item">
                                    <span className="subscription-status__label">Próxima Cobrança:</span>
                                    <span className="subscription-status__value">{subscription?.nextBilling || '31/01/2024'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Ações Principais */}
                        <div className="subscription-section">
                            <h3 className="subscription-section__title">Ações Principais</h3>
                            <div className="subscription-actions">
                                <button
                                    className="subscription-action subscription-action--primary"
                                    onClick={handleUpdateBillingInfo}
                                >
                                    <FiCreditCard />
                                    Atualizar Dados de Cobrança
                                </button>

                                <button
                                    className="subscription-action subscription-action--secondary"
                                    onClick={handleDownloadInvoice}
                                >
                                    <FiDownload />
                                    Baixar Fatura
                                </button>
                            </div>
                        </div>

                        {/* Controle da Assinatura */}
                        <div className="subscription-section">
                            <h3 className="subscription-section__title">Controle da Assinatura</h3>
                            <div className="subscription-controls">
                                {subscription?.status === 'Pausada' ? (
                                    <button
                                        className="subscription-control subscription-control--resume"
                                        onClick={handleResumeSubscription}
                                        disabled={isLoading}
                                    >
                                        <FiPlay />
                                        Reativar Assinatura
                                    </button>
                                ) : (
                                    <button
                                        className="subscription-control subscription-control--pause"
                                        onClick={handlePauseSubscription}
                                        disabled={isLoading}
                                    >
                                        <FiPause />
                                        Pausar Assinatura
                                    </button>
                                )}

                                <button
                                    className="subscription-control subscription-control--cancel"
                                    onClick={() => setShowCancelConfirm(true)}
                                    disabled={isLoading}
                                >
                                    <FiX />
                                    Cancelar Assinatura
                                </button>
                            </div>
                        </div>

                        {/* Histórico de Cobrança */}
                        <div className="subscription-section">
                            <h3 className="subscription-section__title">Histórico de Cobrança</h3>
                            <div className="billing-history">
                                <div className="billing-item">
                                    <div className="billing-item__date">31/12/2023</div>
                                    <div className="billing-item__description">Cobrança Mensal - Starter</div>
                                    <div className="billing-item__amount">R$ 99,90</div>
                                    <button className="billing-item__download" onClick={handleDownloadInvoice}>
                                        <FiDownload />
                                    </button>
                                </div>
                                <div className="billing-item">
                                    <div className="billing-item__date">30/11/2023</div>
                                    <div className="billing-item__description">Cobrança Mensal - Starter</div>
                                    <div className="billing-item__amount">R$ 99,90</div>
                                    <button className="billing-item__download" onClick={handleDownloadInvoice}>
                                        <FiDownload />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Informações Importantes */}
                        <div className="subscription-info">
                            <h4>Informações Importantes:</h4>
                            <ul>
                                <li>• A pausa da assinatura mantém seus dados por até 30 dias</li>
                                <li>• O cancelamento remove permanentemente todos os dados</li>
                                <li>• Mudanças de plano são aplicadas na próxima cobrança</li>
                                <li>• Faturas ficam disponíveis por 12 meses</li>
                            </ul>
                        </div>
                    </div>

                    {/* Modal de Confirmação de Cancelamento */}
                    {showCancelConfirm && (
                        <div className="subscription-modal__overlay">
                            <div className="subscription-modal__confirm">
                                <h3>Confirmar Cancelamento</h3>
                                <p>
                                    Tem certeza que deseja cancelar sua assinatura?
                                    Esta ação não pode ser desfeita e todos os seus dados serão removidos permanentemente.
                                </p>
                                <div className="subscription-modal__confirm-actions">
                                    <button
                                        className="subscription-modal__confirm-button subscription-modal__confirm-button--cancel"
                                        onClick={() => setShowCancelConfirm(false)}
                                    >
                                        Manter Assinatura
                                    </button>
                                    <button
                                        className="subscription-modal__confirm-button subscription-modal__confirm-button--confirm"
                                        onClick={handleCancelSubscription}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Cancelando...' : 'Sim, Cancelar'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Dados de Cobrança */}
            <BillingDataModal
                isOpen={showBillingModal}
                onClose={() => setShowBillingModal(false)}
                companyData={subscription}
            />
        </>
    );
}