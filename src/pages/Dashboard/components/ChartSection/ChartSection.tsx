import React from "react";
import {
  FiPieChart,
  FiBarChart,
  FiTrendingUp,
  FiActivity,
} from "react-icons/fi";
import PieChart from "../Charts/PieChart";
import BarChart from "../Charts/BarChart";
import LineChart from "../Charts/LineChart";
import "./ChartSection.css";

interface ChartData {
  statusData: Array<{ name: string; value: number; color: string }>;
  priorityData: Array<{ name: string; value: number; color: string }>;
  monthlyData: Array<{
    month: string;
    total: number;
    aprovados: number;
    valor: number;
  }>;
}

interface ChartSectionProps {
  statusData: ChartData["statusData"];
  priorityData: ChartData["priorityData"];
  monthlyData: ChartData["monthlyData"];
}

const ChartSection: React.FC<ChartSectionProps> = ({
  statusData,
  priorityData,
  monthlyData,
}) => {
  return (
    <div className="chart-section">
      <div className="chart-section__header">
        <h3 className="chart-section__title">
          <FiActivity />
          Análises e Tendências
        </h3>
      </div>

      <div className="chart-section__grid">
        {/* Status Distribution */}
        <div className="chart-section__card">
          <div className="chart-section__card-header">
            <h4 className="chart-section__card-title">
              <FiPieChart />
              Distribuição por Status
            </h4>
            <p className="chart-section__card-subtitle">
              Panorama atual das solicitações
            </p>
          </div>
          <div className="chart-section__card-content">
            <PieChart data={statusData} />
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="chart-section__card">
          <div className="chart-section__card-header">
            <h4 className="chart-section__card-title">
              <FiBarChart />
              Distribuição por Prioridade
            </h4>
            <p className="chart-section__card-subtitle">
              Análise de criticidade das demandas
            </p>
          </div>
          <div className="chart-section__card-content">
            <BarChart data={priorityData} />
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="chart-section__card chart-section__card--wide">
          <div className="chart-section__card-header">
            <h4 className="chart-section__card-title">
              <FiTrendingUp />
              Evolução Mensal
            </h4>
            <p className="chart-section__card-subtitle">
              Tendência de solicitações e aprovações nos últimos 6 meses
            </p>
          </div>
          <div className="chart-section__card-content">
            <LineChart data={monthlyData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartSection;
