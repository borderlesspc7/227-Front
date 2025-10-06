"use client";

import React, { useEffect, useState } from "react";
import { Button } from "../../../components/ui/Button/Button";
import InputField from "../../../components/ui/InputField/InputField";
import "./LoginForm.css";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { paths } from "../../../routes/paths";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user, login, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    clearError();

    try {
      await login({ email, password, cnpj: cnpj || undefined });
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      // Navigate based on user role
      if (user.role === 'admin') {
        navigate(paths.adminRoot, { replace: true });
      } else {
        navigate(paths.dashboard, { replace: true });
      }
    }
  }, [user, navigate]);

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (error) clearError();
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (error) clearError();
  };

  const handleCnpjChange = (value: string) => {
    setCnpj(value);
    if (error) clearError();
  };

  return (
    <div className="login-form">
      <div className="login-form__header">
        <h1 className="login-form__title">Bem-Vindo de volta!</h1>
        <p className="login-form__subtitle">
          Bem-vindo ao AddControl, sua plataforma de gestão de contratos e OSAs
        </p>
      </div>

      <form onSubmit={handleSubmit} className="login-form__form">
        <InputField
          label="Email"
          type="text"
          value={email}
          onChange={handleEmailChange}
          placeholder="Digite seu email"
          required
        />

        <InputField
          label="Senha"
          type="password"
          value={password}
          onChange={handlePasswordChange}
          placeholder="Digite sua senha"
          required
        />

        <InputField
          label="CNPJ da Empresa (Opcional)"
          type="text"
          value={cnpj}
          onChange={handleCnpjChange}
          placeholder="00.000.000/0000-00"
        />

        {error && (
          <div className="login-form__error">
            <p>{error}</p>
          </div>
        )}

        <Button type="submit" variant="primary" loading={isLoading}>
          {isLoading ? "Entrando..." : "Entrar"}
        </Button>

        <a href="#" className="login-form__forgot-password">
          Esqueceu sua senha?
        </a>
      </form>
    </div>
  );
}
