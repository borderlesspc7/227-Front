import React, { useState } from "react";
import Modal from "../Modal/Modal";
import { UserRegisterForm } from "../../../pages/RegisterPage/Form/Form";
import "./UserModal.css";

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUserSaved: (user: any) => void;
    user?: any; // Para edição futura
}

const UserModal: React.FC<UserModalProps> = ({
    isOpen,
    onClose,
    onUserSaved,
    user,
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleUserSaved = async (newUser: any) => {
        setIsSubmitting(true);
        try {
            await onUserSaved(newUser);
            onClose();
        } catch (error) {
            console.error("Erro ao salvar usuário:", error);
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
        <Modal isOpen={isOpen} onClose={handleCancel} size="large" title="Gerenciar Usuários">
            <div className="user-modal">
                <div className="user-modal__content">
                    <UserRegisterForm
                        onUserSaved={handleUserSaved}
                        onCancel={handleCancel}
                        isSubmitting={isSubmitting}
                        user={user}
                    />
                </div>
            </div>
        </Modal>
    );
};

export default UserModal;
