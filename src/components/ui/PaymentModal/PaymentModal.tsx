import { useState } from "react";
import { FiPlus, FiTrash2, FiEdit, FiX } from "react-icons/fi";
import { useToast } from "../../../hooks/useToast";
import "./PaymentModal.css";

interface PaymentMethod {
  id: string;
  type: "credit" | "debit" | "pix";
  last4: string;
  brand: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PaymentModal({ isOpen, onClose }: PaymentModalProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: "1",
      type: "credit",
      last4: "1234",
      brand: "Visa",
      expiryMonth: "12",
      expiryYear: "2025",
      isDefault: true,
    },
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [, setEditingMethod] = useState<PaymentMethod | null>(null);
  const { showSuccess, showError } = useToast();

  const handleAddMethod = () => {
    setShowAddForm(true);
  };

  const handleEditMethod = (method: PaymentMethod) => {
    setEditingMethod(method);
  };

  const handleDeleteMethod = (methodId: string) => {
    if (paymentMethods.length === 1) {
      showError("Erro", "Você deve ter pelo menos um método de pagamento cadastrado.");
      return;
    }

    setPaymentMethods(prev => prev.filter(method => method.id !== methodId));
    showSuccess("Sucesso", "Método de pagamento removido com sucesso.");
  };

  const handleSetDefault = (methodId: string) => {
    setPaymentMethods(prev =>
      prev.map(method => ({
        ...method,
        isDefault: method.id === methodId
      }))
    );
    showSuccess("Sucesso", "Método de pagamento padrão alterado com sucesso.");
  };

  const getCardIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case "visa":
        return "💳";
      case "mastercard":
        return "💳";
      case "amex":
        return "💳";
      default:
        return "💳";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "credit":
        return "Cartão de Crédito";
      case "debit":
        return "Cartão de Débito";
      case "pix":
        return "PIX";
      default:
        return type;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal">
        <div className="payment-modal__header">
          <h2>Gerenciar Métodos de Pagamento</h2>
          <button className="payment-modal__close" onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        <div className="payment-modal__content">
          <div className="payment-methods-list">
            {paymentMethods.map((method) => (
              <div key={method.id} className="payment-method-card">
                <div className="payment-method-info">
                  <div className="payment-method-icon">
                    {getCardIcon(method.brand)}
                  </div>
                  <div className="payment-method-details">
                    <h4>{getTypeLabel(method.type)}</h4>
                    <p>{method.brand} •••• {method.last4}</p>
                    <p>Expira em {method.expiryMonth}/{method.expiryYear}</p>
                    {method.isDefault && (
                      <span className="default-badge">Padrão</span>
                    )}
                  </div>
                </div>
                <div className="payment-method-actions">
                  {!method.isDefault && (
                    <button
                      className="btn-set-default"
                      onClick={() => handleSetDefault(method.id)}
                    >
                      Definir como Padrão
                    </button>
                  )}
                  <button
                    className="btn-edit"
                    onClick={() => handleEditMethod(method)}
                  >
                    <FiEdit size={16} />
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteMethod(method.id)}
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="payment-modal__actions">
            <button className="btn-add-method" onClick={handleAddMethod}>
              <FiPlus size={16} />
              Adicionar Método de Pagamento
            </button>
          </div>

          {showAddForm && (
            <div className="add-payment-form">
              <h3>Adicionar Novo Método de Pagamento</h3>
              <div className="form-group">
                <label>Tipo de Pagamento</label>
                <select>
                  <option value="credit">Cartão de Crédito</option>
                  <option value="debit">Cartão de Débito</option>
                  <option value="pix">PIX</option>
                </select>
              </div>
              <div className="form-group">
                <label>Número do Cartão</label>
                <input type="text" placeholder="1234 5678 9012 3456" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Mês de Expiração</label>
                  <select>
                    <option value="01">01</option>
                    <option value="02">02</option>
                    <option value="03">03</option>
                    <option value="04">04</option>
                    <option value="05">05</option>
                    <option value="06">06</option>
                    <option value="07">07</option>
                    <option value="08">08</option>
                    <option value="09">09</option>
                    <option value="10">10</option>
                    <option value="11">11</option>
                    <option value="12">12</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Ano de Expiração</label>
                  <select>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                    <option value="2028">2028</option>
                    <option value="2029">2029</option>
                    <option value="2030">2030</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>CVV</label>
                <input type="text" placeholder="123" maxLength={4} />
              </div>
              <div className="form-group">
                <label>Nome no Cartão</label>
                <input type="text" placeholder="João Silva" />
              </div>
              <div className="form-actions">
                <button className="btn-cancel" onClick={() => setShowAddForm(false)}>
                  Cancelar
                </button>
                <button className="btn-save" onClick={() => {
                  setShowAddForm(false);
                  showSuccess("Sucesso", "Método de pagamento adicionado com sucesso!");
                }}>
                  Salvar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
