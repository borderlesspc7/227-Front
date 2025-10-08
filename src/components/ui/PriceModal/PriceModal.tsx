import React, { useState } from "react";
import Modal from "../Modal/Modal";
import PriceForm from "../../../pages/Prices/Form/PriceForm";
import "./PriceModal.css";

interface PriceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPriceSaved: (price: any) => void;
    price?: any; // Para edição
}

const PriceModal: React.FC<PriceModalProps> = ({
    isOpen,
    onClose,
    onPriceSaved,
    price,
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handlePriceSaved = async (newPrice: any) => {
        setIsSubmitting(true);
        try {
            await onPriceSaved(newPrice);
            onClose();
        } catch (error) {
            console.error("Erro ao salvar preço:", error);
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
        <Modal isOpen={isOpen} onClose={handleCancel} size="large" title="Gerenciar Preços">
            <div className="price-modal">
                <div className="price-modal__content">
                    <PriceForm
                        price={price}
                        onSubmit={handlePriceSaved}
                        onCancel={handleCancel}
                        isSubmitting={isSubmitting}
                    />
                </div>
            </div>
        </Modal>
    );
};

export default PriceModal;
