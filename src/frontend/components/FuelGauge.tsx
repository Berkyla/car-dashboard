import React from "react";

interface FuelGaugeProps {
  fuelLevel: number; // Уровень топлива
  maxFuelLevel: number; // Максимальный уровень топлива
}

const FuelGauge: React.FC<FuelGaugeProps> = ({ fuelLevel, maxFuelLevel }) => {
  const width = 300;
  const height = 300;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 10;

  // Ограничение уровня топлива
  const clampedFuelLevel = Math.min(Math.max(fuelLevel, 0), maxFuelLevel);

  // Нормализация уровня топлива
  const normalizedFuelLevel = clampedFuelLevel / maxFuelLevel;

  // Углы для красного сектора
  const redStartAngle = Math.PI / 3;
  const redEndAngle = redStartAngle - ((2 * Math.PI) / 3) * 0.25;

  const redStartX = centerX + Math.cos(redStartAngle) * radius;
  const redStartY = centerY + Math.sin(redStartAngle) * radius;
  const redEndX = centerX + Math.cos(redEndAngle) * radius;
  const redEndY = centerY + Math.sin(redEndAngle) * radius;

  // Угол стрелки
  const fuelAngle =
    Math.PI / 3 - normalizedFuelLevel * ((2 * Math.PI) / 3);

  // Координаты для треугольной стрелки
  const arrowLength = radius - 8; // Длина стрелки чуть меньше радиуса
  const arrowWidth = 20; // Ширина основания стрелки

  const tipX = centerX + Math.cos(fuelAngle) * arrowLength;
  const tipY = centerY + Math.sin(fuelAngle) * arrowLength;

  const baseLeftX = centerX + Math.cos(fuelAngle + Math.PI / 2) * (arrowWidth / 2);
  const baseLeftY = centerY + Math.sin(fuelAngle + Math.PI / 2) * (arrowWidth / 2);

  const baseRightX = centerX + Math.cos(fuelAngle - Math.PI / 2) * (arrowWidth / 2);
  const baseRightY = centerY + Math.sin(fuelAngle - Math.PI / 2) * (arrowWidth / 2);

  return (
    <svg width={width} height={height}>
      {/* Фоновый круг */}
      <circle cx={centerX} cy={centerY} r={radius} fill="#222" stroke="#555" strokeWidth={4} />

      {/* Красный сектор */}
      <path
        d={`
          M ${redStartX} ${redStartY}
          A ${radius} ${radius} 0 0 0 ${redEndX} ${redEndY}
          L ${centerX + Math.cos(redEndAngle) * (radius - 10)} 
          ${centerY + Math.sin(redEndAngle) * (radius - 10)}
          A ${radius - 10} ${radius - 10} 0 0 1 
          ${centerX + Math.cos(redStartAngle) * (radius - 10)} 
          ${centerY + Math.sin(redStartAngle) * (radius - 10)}
          Z
        `}
        fill="#FF0000"
        stroke="none"
      />

      {/* Стрелка топлива (треугольная) */}
      <polygon
        points={`${tipX},${tipY} ${baseLeftX},${baseLeftY} ${baseRightX},${baseRightY}`}
        fill="#FF0000"
      />

      {/* Метки топлива */}
      {[0, 0.5, 1].map((value, i) => {
        const angle = Math.PI / 3 - ((2 * Math.PI) / 3) * (value / maxFuelLevel);
        const x1 = centerX + Math.cos(angle) * (radius - 20);
        const y1 = centerY + Math.sin(angle) * (radius - 20);
        const x2 = centerX + Math.cos(angle) * radius;
        const y2 = centerY + Math.sin(angle) * radius;
        const textX = centerX + Math.cos(angle) * (radius - 45);
        const textY = centerY + Math.sin(angle) * (radius - 45);

        return (
          <g key={`fuel-tick-${i}`}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fff" strokeWidth={2} />
            <text
              x={textX}
              y={textY}
              fill="#fff"
              fontSize="16px"
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {value}
            </text>
          </g>
        );
      })}

      {/* Промежуточные метки */}
      {[0.25, 0.75].map((value, i) => {
        const angle = Math.PI / 3 - ((2 * Math.PI) / 3) * (value / maxFuelLevel);
        const x1 = centerX + Math.cos(angle) * radius; // Начало на контуре
        const y1 = centerY + Math.sin(angle) * radius;
        const x2 = centerX + Math.cos(angle) * (radius - 20); // Конец как у основных меток
        const y2 = centerY + Math.sin(angle) * (radius - 20);

        return (
          <line
            key={`intermediate-tick-${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#555" // Цвет как у контура
            strokeWidth={2} // Ширина как у основных меток
          />
        );
      })}

      {/* Центральный круг */}
      <circle cx={centerX} cy={centerY} r={radius / 2} fill="#000" />
    </svg>
  );
};

export default FuelGauge;
