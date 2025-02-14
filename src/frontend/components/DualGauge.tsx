import React from "react";

interface DualGaugeProps {
  temperature: number; // Температура охлаждающей жидкости
  maxTemperature: number; // Максимальная температура
  fuelLevel: number; // Уровень топлива
  maxFuelLevel: number; // Максимальный уровень топлива
}

const DualGauge: React.FC<DualGaugeProps> = ({
  temperature,
  maxTemperature,
  fuelLevel,
  maxFuelLevel,
}) => {
  const width = 172;
  const height = 172;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 10;

  const contourColor = "#555";

  // Углы стрелок
  const minTemperature = 50; // Минимальная температура
  const tempAngle =
    (-4 * Math.PI) / 3 +
    ((temperature - minTemperature) / (maxTemperature - minTemperature)) *
      ((2 * Math.PI) / 3); // Угол температуры от -4π/3 до -2π/3

  const fuelAngle =
    Math.PI / 3 - ((fuelLevel / maxFuelLevel) * (2 * Math.PI)) / 3; // Угол топлива от π/3 до -π/3

  // Координаты для стрелок
  const arrowLength = radius - 8;
  const arrowWidth = 20;

  const getArrowPoints = (angle: number) => {
    const tipX = centerX + Math.cos(angle) * arrowLength;
    const tipY = centerY + Math.sin(angle) * arrowLength;

    const baseLeftX =
      centerX + Math.cos(angle + Math.PI / 2) * (arrowWidth / 2);
    const baseLeftY =
      centerY + Math.sin(angle + Math.PI / 2) * (arrowWidth / 2);

    const baseRightX =
      centerX + Math.cos(angle - Math.PI / 2) * (arrowWidth / 2);
    const baseRightY =
      centerY + Math.sin(angle - Math.PI / 2) * (arrowWidth / 2);

    return `${tipX},${tipY} ${baseLeftX},${baseLeftY} ${baseRightX},${baseRightY}`;
  };

  return (
    <div className="dual-gauge-container">
    <svg width={width} height={height}>
      {/* Фоновый круг */}
      <circle
        cx={centerX}
        cy={centerY}
        r={radius}
        fill="#222"
        stroke={contourColor}
        strokeWidth={4}
      />

      {/* Красный сектор температуры */}
      <path
        d={`M ${centerX + Math.cos((-4 * Math.PI) / 3 + ((2 * Math.PI) / 3) * 0.75) * radius}
          ${centerY + Math.sin((-4 * Math.PI) / 3 + ((2 * Math.PI) / 3) * 0.75) * radius}
          A ${radius} ${radius} 0 0 1
          ${centerX + Math.cos((-4 * Math.PI) / 3 + ((2 * Math.PI) / 3)) * radius}
          ${centerY + Math.sin((-4 * Math.PI) / 3 + ((2 * Math.PI) / 3)) * radius}
          L ${centerX + Math.cos((-4 * Math.PI) / 3 + ((2 * Math.PI) / 3)) * (radius - 10)}
          ${centerY + Math.sin((-4 * Math.PI) / 3 + ((2 * Math.PI) / 3)) * (radius - 10)}
          A ${radius - 10} ${radius - 10} 0 0 0
          ${centerX + Math.cos((-4 * Math.PI) / 3 + ((2 * Math.PI) / 3) * 0.75) * (radius - 10)}
          ${centerY + Math.sin((-4 * Math.PI) / 3 + ((2 * Math.PI) / 3) * 0.75) * (radius - 10)}
          Z`}
        fill="#FF0000"
        stroke="none"
      />

      {/* Красный сектор топлива */}
      <path
        d={`M ${centerX + Math.cos(Math.PI / 3) * radius}
          ${centerY + Math.sin(Math.PI / 3) * radius}
          A ${radius} ${radius} 0 0 0
          ${centerX + Math.cos(Math.PI / 3 - ((2 * Math.PI) / 3) * 0.25) * radius}
          ${centerY + Math.sin(Math.PI / 3 - ((2 * Math.PI) / 3) * 0.25) * radius}
          L ${centerX + Math.cos(Math.PI / 3 - ((2 * Math.PI) / 3) * 0.25) * (radius - 10)}
          ${centerY + Math.sin(Math.PI / 3 - ((2 * Math.PI) / 3) * (0.25)) * (radius - 10)}
          A ${radius - 10} ${radius - 10} 0 0 1
          ${centerX + Math.cos(Math.PI / 3) * (radius - 10)}
          ${centerY + Math.sin(Math.PI / 3) * (radius - 10)}
          Z`}
        fill="#FF0000"
        stroke="none"
      />

      {/* Стрелка температуры */}
      <polygon points={getArrowPoints(tempAngle)} fill="#FF0000" />

      {/* Стрелка топлива */}
      <polygon points={getArrowPoints(fuelAngle)} fill="#FF0000" />

      {/* Метки температуры */}
      {Array.from({ length: 5 }).map((_, i) => {
        const value = minTemperature + ((maxTemperature - minTemperature) / 4) * i;
        const angle = (-4 * Math.PI) / 3 + ((2 * Math.PI) / 3) * (i / 4);
        const x1 = centerX + Math.cos(angle) * (radius - 20);
        const y1 = centerY + Math.sin(angle) * (radius - 20);
        const x2 = centerX + Math.cos(angle) * radius;
        const y2 = centerY + Math.sin(angle) * radius;
        const textX = centerX + Math.cos(angle) * (radius - 35);
        const textY = centerY + Math.sin(angle) * (radius - 35);

        // Пропускаем значения 110 и 70
        if (value === 110 || value === 70) {
          return null;
        }

        return (
          <g key={`temp-tick-${i}`}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FFF" strokeWidth={2} />
            <text
              x={textX}
              y={textY}
              fill="#FFF"
              fontSize="16"
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {Math.round(value)}
            </text>
          </g>
        );
      })}

      {/* Промежуточные метки температуры */}
      {Array.from({ length: 2 }).map((_, i) => {
        const angle =
          (-4 * Math.PI) / 3 + ((2 * Math.PI) / 3) * ((i + 0.5) / 2);
        const x1 = centerX + Math.cos(angle) * (radius - 20);
        const y1 = centerY + Math.sin(angle) * (radius - 20);
        const x2 = centerX + Math.cos(angle) * radius;
        const y2 = centerY + Math.sin(angle) * radius;

        return (
          <line
            key={`temp-intermediate-${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={contourColor}
            strokeWidth={2}
          />
        );
      })}

      {/* Метки топлива */}
      {Array.from({ length: 3 }).map((_, i) => {
        const value = i * 0.5;
        const angle = Math.PI / 3 - ((2 * Math.PI) / 3) * (value / 1);
        const x1 = centerX + Math.cos(angle) * (radius - 20);
        const y1 = centerY + Math.sin(angle) * (radius - 20);
        const x2 = centerX + Math.cos(angle) * radius;
        const y2 = centerY + Math.sin(angle) * radius;
        const textX = centerX + Math.cos(angle) * (radius - 35);
        const textY = centerY + Math.sin(angle) * (radius - 35);

        return (
          <g key={`fuel-tick-${i}`}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FFF" strokeWidth={2} />
            <text
              x={textX}
              y={textY}
              fill="#FFF"
              fontSize="16"
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {value}
            </text>
          </g>
        );
      })}

      {/* Промежуточные метки топлива */}
      {Array.from({ length: 2 }).map((_, i) => {
        const angle =
          Math.PI / 3 - ((2 * Math.PI) / 3) * ((i + 0.5) / 2);
        const x1 = centerX + Math.cos(angle) * (radius - 20);
        const y1 = centerY + Math.sin(angle) * (radius - 20);
        const x2 = centerX + Math.cos(angle) * radius;
        const y2 = centerY + Math.sin(angle) * radius;

        return (
          <line
            key={`fuel-intermediate-${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={contourColor}
            strokeWidth={2}
          />
        );
      })}

      {/* Центральный круг */}
      <circle cx={centerX} cy={centerY} r={radius / 3} fill="#000" />
    </svg>
    </div>
  );
};

export default DualGauge;
