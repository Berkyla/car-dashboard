import React from "react";

interface SpeedometerViewProps {
  speed: number; // Текущая скорость
  maxSpeed: number; // Максимальная скорость
  needleAngle: number; // Угол стрелки
  outerRadius: number; // Внешний радиус шкалы
  innerRadius: number; // Внутренний радиус
  centerX: number; // Центр X
  centerY: number; // Центр Y
  totalMarks: number; // Количество делений
}

const SpeedometerView: React.FC<SpeedometerViewProps> = ({
  speed,
  maxSpeed,
  needleAngle,
  outerRadius,
  innerRadius,
  centerX,
  centerY,
  totalMarks,
}) => {
  const arrowLength = outerRadius - 8;
  const arrowWidth = 50;
  const contourColor = "#555";
  const angleOffset = Math.PI / 5;

  const displaySpeed = Math.min(maxSpeed, Math.round(speed));

  // Координаты стрелки
  const tipX = centerX + Math.cos(needleAngle) * arrowLength;
  const tipY = centerY + Math.sin(needleAngle) * arrowLength;
  const baseLeftX = centerX + Math.cos(needleAngle + Math.PI / 2) * (arrowWidth / 2);
  const baseLeftY = centerY + Math.sin(needleAngle + Math.PI / 2) * (arrowWidth / 2);
  const baseRightX = centerX + Math.cos(needleAngle - Math.PI / 2) * (arrowWidth / 2);
  const baseRightY = centerY + Math.sin(needleAngle - Math.PI / 2) * (arrowWidth / 2);

  return (
    <svg width={375} height={375}>
      {/* Фон шкалы */}
      <circle cx={centerX} cy={centerY} r={outerRadius} fill="#222" stroke={contourColor} strokeWidth={6} />

      {/* Деления и цифры */}
      {Array.from({ length: totalMarks + 1 }).map((_, i) => {
        const value = (i * maxSpeed) / totalMarks;
        const angle = Math.PI / 2 + angleOffset + (2 * Math.PI * 0.8 * i) / totalMarks;
        const isVisible = value <= maxSpeed;

        const markX1 = centerX + Math.cos(angle) * (outerRadius - 20);
        const markY1 = centerY + Math.sin(angle) * (outerRadius - 20);
        const markX2 = centerX + Math.cos(angle) * outerRadius;
        const markY2 = centerY + Math.sin(angle) * outerRadius;

        const numberX = centerX + Math.cos(angle) * (outerRadius - 40);
        const numberY = centerY + Math.sin(angle) * (outerRadius - 40);

        return (
          <g key={i}>
            {isVisible && (
              <line
                x1={markX1}
                y1={markY1}
                x2={markX2}
                y2={markY2}
                stroke={i % 2 === 0 ? "#FFF" : contourColor}
                strokeWidth={i % 2 === 0 ? 3 : 2}
              />
            )}
            {isVisible && i % 2 === 0 && (
              <text
                x={numberX}
                y={numberY}
                fill="#FFF"
                fontSize="20"
                fontWeight="bold"
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {value}
              </text>
            )}
          </g>
        );
      })}

      {/* Стрелка */}
      <polygon
        points={`${tipX},${tipY} ${baseLeftX},${baseLeftY} ${baseRightX},${baseRightY}`}
        fill="red"
      />

      {/* Центр стрелки */}
      <circle cx={centerX} cy={centerY} r={innerRadius} fill="#000" />

      {/* Цифровая скорость */}
      <text
        x={centerX}
        y={centerY - 10}
        fill="#FFF"
        fontSize="48"
        fontWeight="bold"
        textAnchor="middle"
        alignmentBaseline="middle"
      >
        {displaySpeed}
      </text>

      {/* Единицы измерения */}
      <text
        x={centerX}
        y={centerY + 30}
        fill="#FFF"
        fontSize="24"
        fontWeight="bold"
        textAnchor="middle"
        alignmentBaseline="middle"
      >
        km/h
      </text>
    </svg>
  );
};

export default SpeedometerView;
