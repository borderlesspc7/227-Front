import React from "react";
import "./Charts.css";

interface LineChartData {
  month: string;
  total: number;
  aprovados: number;
  valor: number;
}

interface LineChartProps {
  data: LineChartData[];
}

const LineChart: React.FC<LineChartProps> = ({ data }) => {
  const maxTotal = Math.max(...data.map((item) => item.total));
  const maxAprovados = Math.max(...data.map((item) => item.aprovados));
  const maxValue = Math.max(maxTotal, maxAprovados);

  if (maxValue === 0) {
    return (
      <div className="chart-empty">
        <div className="chart-empty__icon">📈</div>
        <p className="chart-empty__text">Nenhum dado disponível</p>
      </div>
    );
  }

  const width = 420;
  const height = 200;
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Calcular pontos para as linhas
  const totalPoints = data
    .map((item, index) => {
      const x = padding + (index * chartWidth) / (data.length - 1);
      const y = padding + chartHeight - (item.total / maxValue) * chartHeight;
      return `${x},${y}`;
    })
    .join(" ");

  const aprovadosPoints = data
    .map((item, index) => {
      const x = padding + (index * chartWidth) / (data.length - 1);
      const y =
        padding + chartHeight - (item.aprovados / maxValue) * chartHeight;
      return `${x},${y}`;
    })
    .join(" ");

  // Formatar valores monetários
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      notation: "compact",
    }).format(value);
  };

  return (
    <div className="line-chart">
      <div className="line-chart__chart-section">
        <div className="line-chart__container">
          <svg
            className="line-chart__svg"
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
          >
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map((i) => {
              const y = padding + (i * chartHeight) / 4;
              return (
                <line
                  key={i}
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke="rgba(0, 0, 0, 0.1)"
                  strokeWidth="1"
                />
              );
            })}

            {/* Total line */}
            <polyline
              points={totalPoints}
              fill="none"
              stroke="#3B82F6"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="line-chart__line line-chart__line--total"
            />

            {/* Aprovados line */}
            <polyline
              points={aprovadosPoints}
              fill="none"
              stroke="#10B981"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="line-chart__line line-chart__line--aprovados"
            />

            {/* Data points - Total */}
            {data.map((item, index) => {
              const x = padding + (index * chartWidth) / (data.length - 1);
              const y =
                padding + chartHeight - (item.total / maxValue) * chartHeight;
              return (
                <circle
                  key={`total-${index}`}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#3B82F6"
                  className="line-chart__point"
                />
              );
            })}

            {/* Data points - Aprovados */}
            {data.map((item, index) => {
              const x = padding + (index * chartWidth) / (data.length - 1);
              const y =
                padding +
                chartHeight -
                (item.aprovados / maxValue) * chartHeight;
              return (
                <circle
                  key={`aprovados-${index}`}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#10B981"
                  className="line-chart__point"
                />
              );
            })}

            {/* X-axis labels */}
            {data.map((item, index) => {
              const x = padding + (index * chartWidth) / (data.length - 1);
              return (
                <text
                  key={index}
                  x={x}
                  y={height - 5}
                  textAnchor="middle"
                  className="line-chart__label"
                  fontSize="10"
                >
                  {item.month.length > 4
                    ? item.month.substring(0, 4)
                    : item.month}
                </text>
              );
            })}
          </svg>
        </div>

        <div className="line-chart__legend">
          <div className="line-chart__legend-item">
            <div className="line-chart__legend-color line-chart__legend-color--total" />
            <span>Total de Solicitações</span>
          </div>
          <div className="line-chart__legend-item">
            <div className="line-chart__legend-color line-chart__legend-color--aprovados" />
            <span>Solicitações Aprovadas</span>
          </div>
        </div>
      </div>

      {/* Data table */}
      <div className="line-chart__data">
        <div className="line-chart__data-header">
          <span>Mês</span>
          <span>Total</span>
          <span>Aprovados</span>
          <span>Valor</span>
        </div>
        {data.map((item, index) => (
          <div key={index} className="line-chart__data-row">
            <span>{item.month}</span>
            <span>{item.total}</span>
            <span>{item.aprovados}</span>
            <span>{formatCurrency(item.valor)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LineChart;
