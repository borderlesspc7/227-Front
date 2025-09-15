import React from "react";
import "./Charts.css";

interface BarChartData {
  name: string;
  value: number;
  color: string;
}

interface BarChartProps {
  data: BarChartData[];
}

const BarChart: React.FC<BarChartProps> = ({ data }) => {
  const maxValue = Math.max(...data.map((item) => item.value));

  if (maxValue === 0) {
    return (
      <div className="chart-empty">
        <div className="chart-empty__icon">📊</div>
        <p className="chart-empty__text">Nenhum dado disponível</p>
      </div>
    );
  }

  return (
    <div className="bar-chart">
      <div className="bar-chart__container">
        {data.map((item, index) => {
          const height = maxValue > 0 ? (item.value / maxValue) * 100 : 0;

          return (
            <div key={index} className="bar-chart__item">
              <div className="bar-chart__bar-container">
                <div
                  className="bar-chart__bar"
                  style={{
                    height: `${height}%`,
                    backgroundColor: item.color,
                    animationDelay: `${index * 0.1}s`,
                  }}
                >
                  <div className="bar-chart__value">{item.value}</div>
                </div>
              </div>
              <div className="bar-chart__label">{item.name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BarChart;
