import React from "react";
import TachometerView from "./TachometerView";

interface TachometerProps {
  rpm: number;
  maxRpm: number;
}

const Tachometer: React.FC<TachometerProps> = ({ rpm, maxRpm }) => {
  const width = 200;
  const height = 200;
  const centerX = width / 2;
  const centerY = height / 2;
  const outerRadius = Math.min(width, height) / 2 - 10;
  const innerRadius = outerRadius - 50;

  const segments = 8;
  const segmentAngle = (2 * Math.PI) / (segments + 1);

  const calculateRotation = (rpm: number) => {
    const percentage = Math.min(rpm / maxRpm, 1);
    return Math.PI / 2 + percentage * (7 * segmentAngle);
  };

  const needleAngle = calculateRotation(rpm);

  const redStartAngle = Math.PI / 2 + 6 * segmentAngle;
  const redEndAngle = Math.PI / 2 + 7 * segmentAngle;

  const redArc = {
    startX: centerX + Math.cos(redStartAngle) * (outerRadius - 3),
    startY: centerY + Math.sin(redStartAngle) * (outerRadius - 3),
    endX: centerX + Math.cos(redEndAngle) * (outerRadius - 3),
    endY: centerY + Math.sin(redEndAngle) * (outerRadius - 3),
    largeArcFlag: redEndAngle - redStartAngle <= Math.PI ? "0" : "1",
  };

  return (
    <TachometerView
      needleAngle={needleAngle}
      outerRadius={outerRadius}
      innerRadius={innerRadius}
      segments={segments}
      centerX={centerX}
      centerY={centerY}
      redArc={redArc}
    />
  );
};

export default Tachometer;
