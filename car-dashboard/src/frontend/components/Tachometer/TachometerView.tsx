import React from "react";

// Интерфейс пропсов для визуального отображения тахометра
interface TachometerViewProps {
  needleAngle: number; // Угол поворота стрелки
  outerRadius: number; // Радиус внешнего круга
  innerRadius: number; // Радиус внутреннего круга (центрального круга)
  segments: number; // Количество делений тахометра
  centerX: number; // Центр круга по оси X
  centerY: number; // Центр круга по оси Y
  redArc: {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    largeArcFlag: string;
  }; // Геометрия красного сектора (зоны опасных оборотов)
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
    <svg width={200} height={200}>
      {/* Фоновый круг тахометра */}
      <circle cx={centerX} cy={centerY} r={outerRadius} fill="#222" stroke="#555" strokeWidth={6} />

      {/* Красный сектор (опасные обороты) */}
      <path
        d={`M ${redArc.startX} ${redArc.startY} A ${outerRadius - 3} ${outerRadius - 3} 0 ${redArc.largeArcFlag} 1 ${redArc.endX} ${redArc.endY}`}
        fill="none"
        stroke="red"
        strokeWidth={6}
      />

      {/* Стрелка тахометра */}
      <polygon
        points={`${tipX},${tipY} ${baseLeftX},${baseLeftY} ${baseRightX},${baseRightY}`}
        fill="red"
      />

      {/* Деления и числовые отметки */}
      {Array.from({ length: segments + 1 }).map((_, i) => {
        const angle = Math.PI / 2 + (2 * Math.PI * i) / (segments + 1);
        const markX1 = centerX + Math.cos(angle) * (outerRadius - 10);
        const markY1 = centerY + Math.sin(angle) * (outerRadius - 10);
        const markX2 = centerX + Math.cos(angle) * outerRadius;
        const markY2 = centerY + Math.sin(angle) * outerRadius;
        const numberX = centerX + Math.cos(angle) * (outerRadius - 25);
        const numberY = centerY + Math.sin(angle) * (outerRadius - 25);

        return (
          <g key={i}>
            {i !== segments && (
              <line x1={markX1} y1={markY1} x2={markX2} y2={markY2} stroke="#FFF" strokeWidth={2} />
            )}
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

      {/* Центральный круг под стрелкой */}
      <circle cx={centerX} cy={centerY} r={innerRadius} fill="#000" />

      {/* Подпись к тахометру */}
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
