import React from "react";

interface TachometerViewProps {
  needleAngle: number; // Угол стрелки
  outerRadius: number; // Внешний радиус
  innerRadius: number; // Внутренний радиус
  segments: number; // Количество сегментов
  centerX: number; // Центр по X
  centerY: number; // Центр по Y
  redArc: { startX: number; startY: number; endX: number; endY: number; largeArcFlag: string }; // Координаты красного сектора
}

const TachometerView: React.FC<TachometerViewProps> = ({
  needleAngle,
  outerRadius,
  innerRadius,
  segments,
  centerX,
  centerY,
  redArc,
}) => {
  const arrowLength = outerRadius - 8;
  const arrowWidth = 20;

  const tipX = centerX + Math.cos(needleAngle) * arrowLength;
  const tipY = centerY + Math.sin(needleAngle) * arrowLength;

  const baseLeftX = centerX + Math.cos(needleAngle + Math.PI / 2) * (arrowWidth / 2);
  const baseLeftY = centerY + Math.sin(needleAngle + Math.PI / 2) * (arrowWidth / 2);

  const baseRightX = centerX + Math.cos(needleAngle - Math.PI / 2) * (arrowWidth / 2);
  const baseRightY = centerY + Math.sin(needleAngle - Math.PI / 2) * (arrowWidth / 2);

  return (
    <svg width={200} height={200} >
      {/* Фоновый круг */}
      <circle cx={centerX} cy={centerY} r={outerRadius} fill="#222" stroke="#555" strokeWidth={6} />

      {/* Красный отрезок */}
      <path
        d={`M ${redArc.startX} ${redArc.startY} A ${outerRadius - 3} ${
          outerRadius - 3
        } 0 ${redArc.largeArcFlag} 1 ${redArc.endX} ${redArc.endY}`}
        fill="none"
        stroke="red"
        strokeWidth={6}
      />

      {/* Стрелка */}
      <polygon
        points={`${tipX},${tipY} ${baseLeftX},${baseLeftY} ${baseRightX},${baseRightY}`}
        fill="red"
      />

      {/* Отметки и цифры */}
      {Array.from({ length: segments + 1 }).map((_, i) => {
        const angle = Math.PI / 2 + (2 * Math.PI * i) / (segments + 1); // Смещение углов с интервалом
        const markX1 = centerX + Math.cos(angle) * (outerRadius - 10);
        const markY1 = centerY + Math.sin(angle) * (outerRadius - 10);
        const markX2 = centerX + Math.cos(angle) * outerRadius;
        const markY2 = centerY + Math.sin(angle) * outerRadius;

        const numberX = centerX + Math.cos(angle) * (outerRadius - 25);
        const numberY = centerY + Math.sin(angle) * (outerRadius - 25);

        return (
          <g key={i}>
            {/* Отметки */}
            {i !== segments && (
              <line
                x1={markX1}
                y1={markY1}
                x2={markX2}
                y2={markY2}
                stroke={i === segments ? "transparent" : "#FFF"}
                strokeWidth={2}
              />
            )}
            {/* Цифры */}
            {i !== 0 && i !== segments && (
              <text
                x={numberX}
                y={numberY}
                fill="#FFF"
                fontSize="16"
                fontWeight="bold"
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {i}
              </text>
            )}
          </g>
        );
      })}

      {/* Центр стрелки */}
      <circle cx={centerX} cy={centerY} r={innerRadius} fill="#000" />

      {/* Текст внутри */}
      <text
        x={centerX}
        y={centerY + 5}
        fill="#FFF"
        fontSize="16"
        fontWeight="bold"
        textAnchor="middle"
        alignmentBaseline="middle"
      >
        x1000rpm
      </text>
    </svg>
  );
};

export default TachometerView;
