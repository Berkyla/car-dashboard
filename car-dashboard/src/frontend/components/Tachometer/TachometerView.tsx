import React from "react";
import type { ZoneKind } from "spec/parameters";

type ZoneArc = {
  kind: ZoneKind;
  startAngle: number;
  endAngle: number;
  stroke: string;
  strokeWidth?: number;
};

type TickMark = {
  angle: number;
  value: number;
  label?: number;
};

interface TachometerViewProps {
  needleAngle: number;
  outerRadius: number;
  innerRadius: number;
  centerX: number;
  centerY: number;
  zonesArcs: ZoneArc[];
  majorTicks: TickMark[];
  minorTicks: TickMark[];
}

const buildArcPath = (
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
): string => {
  const sx = cx + Math.cos(startAngle) * radius;
  const sy = cy + Math.sin(startAngle) * radius;
  const ex = cx + Math.cos(endAngle) * radius;
  const ey = cy + Math.sin(endAngle) * radius;
  const largeArcFlag = Math.abs(endAngle - startAngle) > Math.PI ? "1" : "0";

  return `M ${sx} ${sy} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${ex} ${ey}`;
};

const TachometerView: React.FC<TachometerViewProps> = ({
  needleAngle,
  outerRadius,
  innerRadius,
  centerX,
  centerY,
  zonesArcs,
  majorTicks,
  minorTicks,
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
      <circle cx={centerX} cy={centerY} r={outerRadius} fill="#222" stroke="#555" strokeWidth={6} />

      {zonesArcs.map((arc, index) => (
        <path
          key={`${arc.kind}-${index}`}
          d={buildArcPath(centerX, centerY, outerRadius - 3, arc.startAngle, arc.endAngle)}
          fill="none"
          stroke={arc.stroke}
          strokeWidth={arc.strokeWidth ?? 6}
        />
      ))}

      {minorTicks.map((tick, index) => {
        const tickStartX = centerX + Math.cos(tick.angle) * (outerRadius - 6);
        const tickStartY = centerY + Math.sin(tick.angle) * (outerRadius - 6);
        const tickEndX = centerX + Math.cos(tick.angle) * outerRadius;
        const tickEndY = centerY + Math.sin(tick.angle) * outerRadius;

        return (
          <line
            key={`minor-${index}`}
            x1={tickStartX}
            y1={tickStartY}
            x2={tickEndX}
            y2={tickEndY}
            stroke="#FFF"
            strokeWidth={1}
            opacity={0.75}
          />
        );
      })}

      {majorTicks.map((tick, index) => {
        const tickStartX = centerX + Math.cos(tick.angle) * (outerRadius - 11);
        const tickStartY = centerY + Math.sin(tick.angle) * (outerRadius - 11);
        const tickEndX = centerX + Math.cos(tick.angle) * outerRadius;
        const tickEndY = centerY + Math.sin(tick.angle) * outerRadius;

        const numberX = centerX + Math.cos(tick.angle) * (outerRadius - 27);
        const numberY = centerY + Math.sin(tick.angle) * (outerRadius - 27);

        return (
          <g key={`major-${index}`}>
            <line x1={tickStartX} y1={tickStartY} x2={tickEndX} y2={tickEndY} stroke="#FFF" strokeWidth={2} />
            {tick.label !== undefined && (
              <text
                x={numberX}
                y={numberY}
                fill="#FFF"
                fontSize="15"
                fontWeight="bold"
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {tick.label}
              </text>
            )}
          </g>
        );
      })}

      <polygon
        points={`${tipX},${tipY} ${baseLeftX},${baseLeftY} ${baseRightX},${baseRightY}`}
        fill="red"
      />

      <circle cx={centerX} cy={centerY} r={innerRadius} fill="#000" />

      <text
        x={centerX}
        y={centerY - 6}
        fill="#FFF"
        fontSize="16"
        fontWeight="bold"
        fontFamily="Roboto, sans-serif"
        textAnchor="middle"
      >
        <tspan x={centerX} dy="0">x1000</tspan>
        <tspan x={centerX} dy="18" fontSize="12">об/мин</tspan>
      </text>
    </svg>
  );
};

export default TachometerView;