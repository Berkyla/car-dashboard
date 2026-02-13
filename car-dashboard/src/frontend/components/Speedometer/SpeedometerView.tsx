import React from "react";

type ZoneArc = {
  startAngle: number;
  endAngle: number;
  stroke: string;
  strokeWidth?: number;
};

interface SpeedometerViewProps {
  speed: number;
  maxSpeed: number;
  unit: string;
  needleAngle: number;
  outerRadius: number;
  innerRadius: number;
  centerX: number;
  centerY: number;
  totalMarks: number;
  zonesArcs: ZoneArc[];
}

const describeArc = (
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string => {
  const startX = centerX + Math.cos(startAngle) * radius;
  const startY = centerY + Math.sin(startAngle) * radius;
  const endX = centerX + Math.cos(endAngle) * radius;
  const endY = centerY + Math.sin(endAngle) * radius;
  const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

  return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;
};

const SpeedometerView: React.FC<SpeedometerViewProps> = ({
  speed,
  maxSpeed,
  unit,
  needleAngle,
  outerRadius,
  innerRadius,
  centerX,
  centerY,
  totalMarks,
  zonesArcs,
}) => {
  const arrowLength = outerRadius - 8;
  const arrowWidth = 50;
  const contourColor = "#555";
  const angleOffset = Math.PI / 5;

  const displaySpeed = Math.min(maxSpeed, Math.round(speed));

  const tipX = centerX + Math.cos(needleAngle) * arrowLength;
  const tipY = centerY + Math.sin(needleAngle) * arrowLength;
  const baseLeftX = centerX + Math.cos(needleAngle + Math.PI / 2) * (arrowWidth / 2);
  const baseLeftY = centerY + Math.sin(needleAngle + Math.PI / 2) * (arrowWidth / 2);
  const baseRightX = centerX + Math.cos(needleAngle - Math.PI / 2) * (arrowWidth / 2);
  const baseRightY = centerY + Math.sin(needleAngle - Math.PI / 2) * (arrowWidth / 2);

  const zoneRadius = outerRadius - 6;

  return (
    <svg width={375} height={375}>
      <circle cx={centerX} cy={centerY} r={outerRadius} fill="#222" stroke={contourColor} strokeWidth={6} />

      {zonesArcs.map((zoneArc, idx) => (
        <path
          key={`${zoneArc.stroke}-${idx}`}
          d={describeArc(centerX, centerY, zoneRadius, zoneArc.startAngle, zoneArc.endAngle)}
          stroke={zoneArc.stroke}
          strokeWidth={zoneArc.strokeWidth ?? 10}
          fill="none"
          strokeLinecap="butt"
        />
      ))}

      {Array.from({ length: totalMarks + 1 }).map((_, i) => {
        const value = Math.round((i * maxSpeed) / totalMarks);
        const angle = Math.PI / 2 + angleOffset + (2 * Math.PI * 0.8 * i) / totalMarks;
        const isMajor = value % 10 === 0;

        const markX1 = centerX + Math.cos(angle) * (outerRadius - 20);
        const markY1 = centerY + Math.sin(angle) * (outerRadius - 20);
        const markX2 = centerX + Math.cos(angle) * outerRadius;
        const markY2 = centerY + Math.sin(angle) * outerRadius;

        const numberX = centerX + Math.cos(angle) * (outerRadius - 40);
        const numberY = centerY + Math.sin(angle) * (outerRadius - 40);

        return (
          <g key={`tick-${i}`}>
            <line
              x1={markX1}
              y1={markY1}
              x2={markX2}
              y2={markY2}
              stroke={isMajor ? "#FFF" : contourColor}
              strokeWidth={isMajor ? 3 : 2}
            />
            {isMajor && (
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

      <polygon points={`${tipX},${tipY} ${baseLeftX},${baseLeftY} ${baseRightX},${baseRightY}`} fill="red" />

      <circle cx={centerX} cy={centerY} r={innerRadius} fill="#000" />

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

      <text
        x={centerX}
        y={centerY + 30}
        fill="#FFF"
        fontSize="24"
        fontWeight="bold"
        textAnchor="middle"
        alignmentBaseline="middle"
      >
        {unit}
      </text>
    </svg>
  );
};

export default SpeedometerView;