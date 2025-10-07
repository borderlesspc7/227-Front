import { useState, useCallback, useMemo } from "react";

export interface ValidationRule {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | null;
    email?: boolean;
    url?: boolean;
    number?: boolean;
    min?: number;
    max?: number;
    cpf?: boolean;
    cnpj?: boolean;
    phone?: boolean;
    cep?: boolean;
}

export interface ValidationErrors {
    [key: string]: string | undefined;
}

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationErrors;
}

export interface UseFormValidationOptions {
    initialValues?: Record<string, any>;
    validationRules?: Record<string, ValidationRule>;
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
}

export const useFormValidation = (options: UseFormValidationOptions = {}) => {
    const {
        initialValues = {},
        validationRules = {},
        validateOnChange = true,
        validateOnBlur = true,
    } = options;

    const [values, setValues] = useState<Record<string, any>>(initialValues);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    // Common validation patterns
    const patterns = {
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        url: /^https?:\/\/.+/,
        phone: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
        cep: /^\d{5}-\d{3}$/,
        cpf: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
        cnpj: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
    };

    // Validation functions
    const validateField = useCallback((fieldName: string, value: any): string | null => {
        const rule = validationRules[fieldName];
        if (!rule) return null;

        // Required validation
        if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
            return `${fieldName} é obrigatório`;
        }

        // Skip other validations if value is empty and not required
        if (!value || (typeof value === 'string' && !value.trim())) {
            return null;
        }

        // String validations
        if (typeof value === 'string') {
            // Length validations
            if (rule.minLength && value.length < rule.minLength) {
                return `${fieldName} deve ter pelo menos ${rule.minLength} caracteres`;
            }
            if (rule.maxLength && value.length > rule.maxLength) {
                return `${fieldName} deve ter no máximo ${rule.maxLength} caracteres`;
            }

            // Pattern validations
            if (rule.pattern && !rule.pattern.test(value)) {
                return `${fieldName} tem formato inválido`;
            }

            // Specific format validations
            if (rule.email && !patterns.email.test(value)) {
                return `${fieldName} deve ser um email válido`;
            }
            if (rule.url && !patterns.url.test(value)) {
                return `${fieldName} deve ser uma URL válida`;
            }
            if (rule.phone && !patterns.phone.test(value)) {
                return `${fieldName} deve ser um telefone válido`;
            }
            if (rule.cep && !patterns.cep.test(value)) {
                return `${fieldName} deve ser um CEP válido`;
            }
            if (rule.cpf && !patterns.cpf.test(value)) {
                return `${fieldName} deve ser um CPF válido`;
            }
            if (rule.cnpj && !patterns.cnpj.test(value)) {
                return `${fieldName} deve ser um CNPJ válido`;
            }
        }

        // Number validations
        if (rule.number || rule.min !== undefined || rule.max !== undefined) {
            const numValue = typeof value === 'string' ? parseFloat(value) : value;
            if (isNaN(numValue)) {
                return `${fieldName} deve ser um número válido`;
            }
            if (rule.min !== undefined && numValue < rule.min) {
                return `${fieldName} deve ser maior ou igual a ${rule.min}`;
            }
            if (rule.max !== undefined && numValue > rule.max) {
                return `${fieldName} deve ser menor ou igual a ${rule.max}`;
            }
        }

        // Custom validation
        if (rule.custom) {
            const customError = rule.custom(value);
            if (customError) return customError;
        }

        return null;
    }, [validationRules]);

    const validateForm = useCallback((): ValidationResult => {
        const newErrors: ValidationErrors = {};
        let isValid = true;

        Object.keys(validationRules).forEach(fieldName => {
            const error = validateField(fieldName, values[fieldName]);
            if (error) {
                newErrors[fieldName] = error;
                isValid = false;
            }
        });

        setErrors(newErrors);
        return { isValid, errors: newErrors };
    }, [values, validationRules, validateField]);

    const validateFieldValue = useCallback((fieldName: string, value: any) => {
        const error = validateField(fieldName, value);
        setErrors(prev => ({
            ...prev,
            [fieldName]: error || undefined,
        }));
        return error === null;
    }, [validateField]);

    const setValue = useCallback((fieldName: string, value: any) => {
        setValues(prev => ({ ...prev, [fieldName]: value }));

        if (validateOnChange) {
            validateFieldValue(fieldName, value);
        }
    }, [validateOnChange, validateFieldValue]);

    const setFieldTouched = useCallback((fieldName: string) => {
        setTouched(prev => ({ ...prev, [fieldName]: true }));

        if (validateOnBlur) {
            validateFieldValue(fieldName, values[fieldName]);
        }
    }, [validateOnBlur, validateFieldValue, values]);

    const resetForm = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
    }, [initialValues]);

    const resetField = useCallback((fieldName: string) => {
        setValues(prev => ({ ...prev, [fieldName]: initialValues[fieldName] || '' }));
        setErrors(prev => ({ ...prev, [fieldName]: undefined }));
        setTouched(prev => ({ ...prev, [fieldName]: false }));
    }, [initialValues]);

    // Computed values
    const isValid = useMemo(() => {
        return Object.keys(errors).length === 0 && Object.keys(validationRules).every(
            fieldName => !validationRules[fieldName].required || values[fieldName]
        );
    }, [errors, validationRules, values]);

    const isFieldValid = useCallback((fieldName: string) => {
        return !errors[fieldName] && (!validationRules[fieldName]?.required || values[fieldName]);
    }, [errors, validationRules, values]);

    const isFieldTouched = useCallback((fieldName: string) => {
        return touched[fieldName] || false;
    }, [touched]);

    const getFieldError = useCallback((fieldName: string) => {
        return errors[fieldName];
    }, [errors]);

    return {
        values,
        errors,
        touched,
        isValid,
        setValue,
        setFieldTouched,
        validateForm,
        validateFieldValue,
        resetForm,
        resetField,
        isFieldValid,
        isFieldTouched,
        getFieldError,
    };
};

// Utility functions for common validations
export const validationUtils = {
    // CPF validation
    validateCPF: (cpf: string): boolean => {
        const cleanCPF = cpf.replace(/\D/g, '');
        if (cleanCPF.length !== 11 || /^(\d)\1{10}$/.test(cleanCPF)) return false;

        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
        }
        let remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cleanCPF.charAt(9))) return false;

        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
        }
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        return remainder === parseInt(cleanCPF.charAt(10));
    },

    // CNPJ validation
    validateCNPJ: (cnpj: string): boolean => {
        const cleanCNPJ = cnpj.replace(/\D/g, '');
        if (cleanCNPJ.length !== 14 || /^(\d)\1{13}$/.test(cleanCNPJ)) return false;

        const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

        let sum = 0;
        for (let i = 0; i < 12; i++) {
            sum += parseInt(cleanCNPJ.charAt(i)) * weights1[i];
        }
        let remainder = sum % 11;
        const digit1 = remainder < 2 ? 0 : 11 - remainder;
        if (digit1 !== parseInt(cleanCNPJ.charAt(12))) return false;

        sum = 0;
        for (let i = 0; i < 13; i++) {
            sum += parseInt(cleanCNPJ.charAt(i)) * weights2[i];
        }
        remainder = sum % 11;
        const digit2 = remainder < 2 ? 0 : 11 - remainder;
        return digit2 === parseInt(cleanCNPJ.charAt(13));
    },

    // Phone formatting
    formatPhone: (value: string): string => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 10) {
            return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        } else {
            return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        }
    },

    // CEP formatting
    formatCEP: (value: string): string => {
        const numbers = value.replace(/\D/g, '');
        return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
    },

    // CPF formatting
    formatCPF: (value: string): string => {
        const numbers = value.replace(/\D/g, '');
        return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    },

    // CNPJ formatting
    formatCNPJ: (value: string): string => {
        const numbers = value.replace(/\D/g, '');
        return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    },

    // Currency formatting
    formatCurrency: (value: string): string => {
        const numbers = value.replace(/\D/g, '');
        const amount = parseInt(numbers) / 100;
        return amount.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });
    },
};
