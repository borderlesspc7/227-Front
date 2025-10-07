import React from "react";
import { FiLoader } from "react-icons/fi";
import "./LoadingSpinner.css";

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg" | "xl";
    variant?: "spinner" | "dots" | "pulse" | "skeleton";
    text?: string;
    fullScreen?: boolean;
    overlay?: boolean;
    className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = "md",
    variant = "spinner",
    text,
    fullScreen = false,
    overlay = false,
    className = "",
}) => {
    const getSizeClasses = () => {
        switch (size) {
            case "sm":
                return "loading-spinner--sm";
            case "md":
                return "loading-spinner--md";
            case "lg":
                return "loading-spinner--lg";
            case "xl":
                return "loading-spinner--xl";
            default:
                return "loading-spinner--md";
        }
    };

    const getVariantClasses = () => {
        switch (variant) {
            case "spinner":
                return "loading-spinner--spinner";
            case "dots":
                return "loading-spinner--dots";
            case "pulse":
                return "loading-spinner--pulse";
            case "skeleton":
                return "loading-spinner--skeleton";
            default:
                return "loading-spinner--spinner";
        }
    };

    const renderSpinner = () => {
        switch (variant) {
            case "dots":
                return (
                    <div className="loading-dots">
                        <div className="loading-dots__dot"></div>
                        <div className="loading-dots__dot"></div>
                        <div className="loading-dots__dot"></div>
                    </div>
                );
            case "pulse":
                return <div className="loading-pulse"></div>;
            case "skeleton":
                return (
                    <div className="loading-skeleton">
                        <div className="loading-skeleton__line loading-skeleton__line--short"></div>
                        <div className="loading-skeleton__line loading-skeleton__line--medium"></div>
                        <div className="loading-skeleton__line loading-skeleton__line--long"></div>
                    </div>
                );
            default:
                return <FiLoader className="loading-spinner__icon" />;
        }
    };

    const content = (
        <div className={`loading-spinner ${getSizeClasses()} ${getVariantClasses()} ${className}`}>
            {renderSpinner()}
            {text && <span className="loading-spinner__text">{text}</span>}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="loading-spinner--fullscreen">
                {content}
            </div>
        );
    }

    if (overlay) {
        return (
            <div className="loading-spinner--overlay">
                {content}
            </div>
        );
    }

    return content;
};

export default LoadingSpinner;
