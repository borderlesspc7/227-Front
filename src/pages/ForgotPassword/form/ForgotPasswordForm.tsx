import React, { useState } from "react";
import { Button } from "../../../components/ui/Button/Button";
import InputField from "../../../components/ui/InputField/InputField";
import "./ForgotPasswordForm.css";
import { authService } from "../../../services/authService";
import { useNavigate, Link } from "react-router-dom";
import { paths } from "../../../routes/paths";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await authService.sendPasswordResetEmail(email);
      setSuccess(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Erro ao enviar email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (error) setError(null);
  };

  if (success) {
    return (
      <div className="forgot-password-form">
        <div className="forgot-password-form__header">
          <h2 className="forgot-password-form__title">Email enviado!</h2>
          <p className="forgot-password-form__subtitle">
            Verifique sua caixa de entrada e siga as instruções para redefinir
            sua senha.
          </p>
        </div>
        <div className="forgot-password-form__actions">
          <Button
            type="button"
            variant="primary"
            onClick={() => navigate(paths.login)}
          >
            Voltar para o login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-form">
      <div className="forgot-password-form__header">
        <h1 className="forgot-password-form__title">Esqueceu sua senha?</h1>
        <p className="forgot-password-form__subtitle">
          Digite seu email e enviaremos um link para redefinir sua senha
        </p>
      </div>

      <form onSubmit={handleSubmit} className="forgot-password-form__form">
        <InputField
          label="Email"
          type="email"
          value={email}
          onChange={handleEmailChange}
          placeholder="Digite seu email"
          required
          autoFocus
        />

        {error && (
          <div className="forgot-password-form__error">
            <p>{error}</p>
          </div>
        )}

        <Button type="submit" variant="primary" loading={isLoading}>
          {isLoading ? "Enviando..." : "Enviar link de recuperação"}
        </Button>

        <Link to={paths.login} className="forgot-password-form__back-link">
          Voltar para o login
        </Link>
      </form>
    </div>
  );
}
