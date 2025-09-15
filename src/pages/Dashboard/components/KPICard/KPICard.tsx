import React from "react";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";
import "./KPICard.css";

interface KPICardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  trendType?: "positive" | "negative" | "neutral";
  color?: "blue" | "green" | "purple" | "orange" | "red" | "gray";
  subtitle?: string;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  icon,
  trend,
  trendType = "neutral",
  color = "blue",
  subtitle,
}) => {
  return (
    <div className={`kpi-card kpi-card--${color}`}>
      <div className="kpi-card__header">
        <div className="kpi-card__icon-container">
          <div className={`kpi-card__icon kpi-card__icon--${color}`}>
            {icon}
          </div>
        </div>
        <div className="kpi-card__title-section">
          <h3 className="kpi-card__title">{title}</h3>
          {subtitle && <p className="kpi-card__subtitle">{subtitle}</p>}
        </div>
      </div>

      <div className="kpi-card__content">
        <div className="kpi-card__value">{value}</div>

        {trend && (
          <div className={`kpi-card__trend kpi-card__trend--${trendType}`}>
            <div className="kpi-card__trend-icon">
              {trendType === "positive" && <FiTrendingUp />}
              {trendType === "negative" && <FiTrendingDown />}
            </div>
            <span className="kpi-card__trend-text">{trend}</span>
            <span className="kpi-card__trend-label">vs último período</span>
          </div>
        )}
      </div>

      <div className="kpi-card__background-icon">{icon}</div>
    </div>
  );
};

export default KPICard;
