import React from "react";
import "./Charts.css";

interface PieChartData {
  name: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieChartData[];
}

const PieChart: React.FC<PieChartProps> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div className="chart-empty">
        <div className="chart-empty__icon">📊</div>
        <p className="chart-empty__text">Nenhum dado disponível</p>
      </div>
    );
  }

  let cumulativePercentage = 0;
  const radius = 80;
  const strokeWidth = 16;
  const normalizedRadius = radius - strokeWidth * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;

  const segments = data.map((item) => {
    const percentage = (item.value / total) * 100;
    const strokeDasharray = `${
      (percentage / 100) * circumference
    } ${circumference}`;
    const strokeDashoffset = (-cumulativePercentage * circumference) / 100;

    cumulativePercentage += percentage;

    return {
      ...item,
      percentage,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div className="pie-chart">
      <div className="pie-chart__chart-section">
        <div className="pie-chart__container">
          <svg
            className="pie-chart__svg"
            width={radius * 2}
            height={radius * 2}
            viewBox={`0 0 ${radius * 2} ${radius * 2}`}
          >
            {segments.map((segment, index) => (
              <circle
                key={index}
                className="pie-chart__segment"
                stroke={segment.color}
                fill="transparent"
                strokeWidth={strokeWidth}
                strokeDasharray={segment.strokeDasharray}
                strokeDashoffset={segment.strokeDashoffset}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                style={{
                  transform: "rotate(-90deg)",
                  transformOrigin: "50% 50%",
                  transition: "all 0.3s ease",
                }}
              />
            ))}

            {/* Center text */}
            <text
              x={radius}
              y={radius - 8}
              textAnchor="middle"
              className="pie-chart__total-label"
            >
              Total
            </text>
            <text
              x={radius}
              y={radius + 8}
              textAnchor="middle"
              className="pie-chart__total-value"
            >
              {total}
            </text>
          </svg>
        </div>
      </div>

      <div className="pie-chart__legend">
        {segments.map((segment, index) => (
          <div key={index} className="pie-chart__legend-item">
            <div
              className="pie-chart__legend-color"
              style={{ backgroundColor: segment.color }}
            />
            <span className="pie-chart__legend-label">{segment.name}</span>
            <span className="pie-chart__legend-value">
              {segment.value} ({segment.percentage.toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PieChart;
