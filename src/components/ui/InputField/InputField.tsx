"use client";

import React, { useState, useCallback } from "react";
import { FiEye, FiEyeOff, FiCheck, FiX, FiAlertCircle } from "react-icons/fi";
import "./InputField.css";

interface InputFieldProps {
  label: string;
  type?: "text" | "email" | "password" | "number" | "tel" | "url" | "search";
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string;
  success?: boolean;
  required?: boolean;
  disabled?: boolean;
  loading?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  className?: string;
  format?: "cpf" | "cnpj" | "phone" | "cep" | "currency";
  helpText?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

export default function InputField({
  label,
  type = "text",
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  success = false,
  required = false,
  disabled = false,
  loading = false,
  maxLength,
  minLength,
  pattern,
  autoComplete,
  autoFocus = false,
  className = "",
  format,
  helpText,
  icon,
  iconPosition = "left",
}: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    onBlur?.();
  }, [onBlur]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    // Apply formatting
    if (format) {
      switch (format) {
        case "cpf":
          newValue = newValue.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
          break;
        case "cnpj":
          newValue = newValue.replace(/\D/g, '').replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
          break;
        case "phone":
          newValue = newValue.replace(/\D/g, '');
          if (newValue.length <= 10) {
            newValue = newValue.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
          } else {
            newValue = newValue.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
          }
          break;
        case "cep":
          newValue = newValue.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2');
          break;
        case "currency":
          newValue = newValue.replace(/\D/g, '');
          break;
      }
    }

    onChange(newValue);
  }, [onChange, format]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(!showPassword);
  }, [showPassword]);

  const getInputType = () => {
    if (type === "password") {
      return showPassword ? "text" : "password";
    }
    return type;
  };

  const getStatusIcon = () => {
    if (loading) {
      return <div className="input-field__loading-spinner" />;
    }
    if (error) {
      return <FiX className="input-field__status-icon input-field__status-icon--error" />;
    }
    if (success && value) {
      return <FiCheck className="input-field__status-icon input-field__status-icon--success" />;
    }
    return null;
  };

  const getFieldClasses = () => {
    const classes = ["input-field"];

    if (error) classes.push("input-field--error");
    if (success && value) classes.push("input-field--success");
    if (disabled) classes.push("input-field--disabled");
    if (isFocused) classes.push("input-field--focused");
    if (icon) classes.push(`input-field--with-icon input-field--icon-${iconPosition}`);
    if (className) classes.push(className);

    return classes.join(" ");
  };

  return (
    <div className={getFieldClasses()}>
      <label className="input-field__label">
        {label}
        {required && <span className="input-field__required">*</span>}
      </label>

      <div className="input-field__wrapper">
        {icon && iconPosition === "left" && (
          <div className="input-field__icon input-field__icon--left">
            {icon}
          </div>
        )}

        <input
          type={getInputType()}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          className="input-field__input"
        />

        {type === "password" && (
          <button
            type="button"
            className="input-field__password-toggle"
            onClick={togglePasswordVisibility}
            tabIndex={-1}
          >
            {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
        )}

        {getStatusIcon()}

        {icon && iconPosition === "right" && (
          <div className="input-field__icon input-field__icon--right">
            {icon}
          </div>
        )}
      </div>

      {error && (
        <div className="input-field__error-message">
          <FiAlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      {helpText && !error && (
        <div className="input-field__help-text">
          {helpText}
        </div>
      )}
    </div>
  );
}
