// src/components/ui/ContractModal/ContractModal.tsx
import React, { useState } from "react";
import Modal from "../Modal/Modal";
import Form from "../../../pages/Contracts/Form/Form";
import "./ContractModal.css";

interface ContractModalProps {
    isOpen: boolean;
    onClose: () => void;
    onContractSaved: (contract: any) => void;
    contract?: any; // Para edição
}

const ContractModal: React.FC<ContractModalProps> = ({
    isOpen,
    onClose,
    onContractSaved,
    contract,
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleContractSaved = async (newContract: any) => {
        setIsSubmitting(true);
        try {
            await onContractSaved(newContract);
            onClose();
        } catch (error) {
            console.error("Erro ao salvar contrato:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (!isSubmitting) {
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleCancel} size="large" title="Visualizar Contrato">
            <div className="contract-modal">
                <div className="contract-modal__content">
                    <Form
                        onContractSaved={handleContractSaved}
                        onCancel={handleCancel}
                        contract={contract}
                        isSubmitting={isSubmitting}
                    />
                </div>
            </div>
        </Modal>
    );
};

export default ContractModal;
