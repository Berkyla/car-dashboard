import React, { useEffect, useRef, useState } from "react";
import TachometerView from "./TachometerView";

interface TachometerProps {
  rpm: number;     // Текущее значение оборотов
  maxRpm: number;  // Максимально возможное значение оборотов
}

const Tachometer: React.FC<TachometerProps> = ({ rpm, maxRpm }) => {
  const [displayRpm, setDisplayRpm] = useState(rpm);
  const animationRef = useRef<number | null>(null);

  // Плавная анимация стрелки тахометра
  useEffect(() => {
    const animate = () => {
      setDisplayRpm((prev) => {
        const delta = rpm - prev;
        const step = delta * 0.2;
        if (Math.abs(delta) < 0.5) return rpm;
        return prev + step;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [rpm]);

  // Геометрия тахометра
  const width = 200;
  const height = 200;
  const centerX = width / 2;
  const centerY = height / 2;
  const outerRadius = Math.min(width, height) / 2 - 10;
  const innerRadius = outerRadius - 50;

  const segments = 8;
  const segmentAngle = (2 * Math.PI) / (segments + 1);

  // Вычисление угла поворота стрелки
  const calculateRotation = (rpmVal: number) => {
    const percentage = Math.min(rpmVal / maxRpm, 1);
    return (-Math.PI * 3) / 2 + percentage * (Math.PI * 7.1) / 4;
  };

  const needleAngle = calculateRotation(displayRpm);

  // Геометрия красной зоны тахометра
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
