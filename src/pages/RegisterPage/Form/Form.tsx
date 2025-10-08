"use client";

import React from "react";
import { useState, useEffect } from "react";
import InputField from "../../../components/ui/InputField/InputField";
import { SelectField } from "../../../components/ui/SelectField/SelectField";
import { Button } from "../../../components/ui/Button/Button";
import type { UserRegisterCredentials, UserRole } from "../../../types/auth";
import { useAuth } from "../../../hooks/useAuth";
import { authService } from "../../../services/authService";
import { optionsService } from "../../../services/optionsService";
import { userService } from "../../../services/userService";

type FormData = {
  displayName: string;
  email: string;
  password: string;
  role: string;
  cpf: string;
  phone: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

// Opções serão carregadas do Firestore

interface UserRegisterFormProps {
  onUserSaved?: (user: any) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  user?: any; // Para edição
}

export const UserRegisterForm: React.FC<UserRegisterFormProps> = ({ onUserSaved, onCancel, isSubmitting = false, user }) => {
  const { } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    displayName: "",
    email: "",
    password: "",
    role: "",
    cpf: "",
    phone: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [userRoleOptions, setUserRoleOptions] = useState<Array<{ value: string; label: string }>>([]);

  useEffect(() => {
    const loadUserRoleOptions = async () => {
      try {
        const options = await optionsService.getUserRoleOptions();
        setUserRoleOptions(options.map(opt => ({ value: opt.value, label: opt.label })));
      } catch (error) {
        console.error("Erro ao carregar opções de role:", error);
      }
    };
    loadUserRoleOptions();
  }, []);

  // Carregar dados do usuário quando estiver editando
  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || "",
        email: user.email || "",
        password: "", // Não mostrar senha atual
        role: user.role || "",
        cpf: user.cpf || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const formatCPF = (value: string) => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, "");

    // Apply CPF mask: XXX.XXX.XXX-XX
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

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.displayName.trim()) {
      newErrors.displayName = "Nome é obrigatório";
    } else if (formData.displayName.trim().length < 2) {
      newErrors.displayName = "Nome deve ter pelo menos 2 caracteres";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    // Password validation
    if (!user) {
      // Para novos usuários, senha é obrigatória
      if (!formData.password) {
        newErrors.password = "Senha é obrigatória";
      } else if (formData.password.length < 6) {
        newErrors.password = "Senha deve ter pelo menos 6 caracteres";
      }
    } else if (formData.password && formData.password.length < 6) {
      // Para edição, se forneceu senha, deve ter pelo menos 6 caracteres
      newErrors.password = "Senha deve ter pelo menos 6 caracteres";
    }

    // CPF validation
    const cpfNumbers = formData.cpf.replace(/\D/g, "");
    if (!formData.cpf.trim()) {
      newErrors.cpf = "CPF é obrigatório";
    } else if (cpfNumbers.length !== 11) {
      newErrors.cpf = "CPF deve ter 11 dígitos";
    }

    // User type validation
    if (!formData.role) {
      newErrors.role = "Tipo de usuário é obrigatório";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData) => (value: string) => {
    if (field === "cpf") {
      value = formatCPF(value);
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (user) {
        // Edição de usuário existente
        const updateData: any = {
          displayName: formData.displayName,
          email: formData.email,
          cpf: formData.cpf,
          phone: formData.phone,
          role: formData.role as UserRole,
        };

        // Só atualiza senha se foi fornecida
        if (formData.password) {
          updateData.password = formData.password;
        }

        await userService.updateUser(user.id, updateData);

        if (onUserSaved) {
          onUserSaved({ ...user, ...updateData });
        }
      } else {
        // Criação de novo usuário
        const payload: UserRegisterCredentials = {
          displayName: formData.displayName,
          email: formData.email,
          password: formData.password,
          cpf: formData.cpf,
          phone: formData.phone,
          role: formData.role as UserRole,
        };

        const newUser = await authService.registerForAdmin(payload);

        setFormData({
          displayName: "",
          email: "",
          password: "",
          role: "",
          cpf: "",
          phone: "",
        });

        if (onUserSaved) {
          onUserSaved(newUser);
        }
      }
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
    }
  };

  return (
    <div className="user-register-form">
      <div className="user-register-form__header">
        <h1 className="user-register-form__title">
          Cadastro de Usuário - AddControl
        </h1>
        <p className="user-register-form__subtitle">
          Preencha os dados abaixo para cadastrar um novo usuário no sistema
        </p>
      </div>

      <form className="user-register-form__form" onSubmit={handleSubmit}>
        <div className="user-register-form__fields">
          <InputField
            label="Nome completo"
            type="text"
            value={formData.displayName}
            onChange={handleInputChange("displayName")}
            placeholder="Digite o nome completo"
            error={errors.displayName}
            required
          />

          <InputField
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleInputChange("email")}
            placeholder="Digite o email"
            error={errors.email}
            required
          />

          <InputField
            label={user ? "Senha (deixe em branco para manter a atual)" : "Senha *"}
            type="password"
            value={formData.password}
            onChange={handleInputChange("password")}
            placeholder={user ? "Digite uma nova senha (opcional)" : "Digite a senha"}
            error={errors.password}
            required={!user}
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

        <div className="user-register-form__actions">
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="user-register-form__submit-btn"
          >
            {isSubmitting ? (user ? "Atualizando..." : "Cadastrando...") : (user ? "Atualizar Usuário" : "Cadastrar Usuário")}
          </Button>

          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isSubmitting}
              className="user-register-form__cancel-btn"
            >
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};
