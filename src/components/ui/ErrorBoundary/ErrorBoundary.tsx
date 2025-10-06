import React, { Component, ReactNode } from "react";
import "./ErrorBoundary.css";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="error-boundary">
                    <div className="error-content">
                        <div className="error-icon">⚠️</div>
                        <h2>Algo deu errado</h2>
                        <p>
                            Ocorreu um erro inesperado. Por favor, recarregue a página ou tente novamente.
                        </p>
                        <div className="error-actions">
                            <button
                                className="retry-btn"
                                onClick={() => window.location.reload()}
                            >
                                Recarregar Página
                            </button>
                            <button
                                className="back-btn"
                                onClick={() => window.history.back()}
                            >
                                Voltar
                            </button>
                        </div>
                        {process.env.NODE_ENV === "development" && this.state.error && (
                            <details className="error-details">
                                <summary>Detalhes do erro (desenvolvimento)</summary>
                                <pre>{this.state.error.stack}</pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
