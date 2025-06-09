import React, { useEffect, useRef, useState } from "react";
import SpeedometerView from "./SpeedometerView";

interface SpeedometerProps {
  speed: number;    // Текущая скорость, получаемая от системы
  maxSpeed: number; // Максимально возможная скорость, отображаемая на шкале
}

const Speedometer: React.FC<SpeedometerProps> = ({ speed, maxSpeed }) => {
  const [displaySpeed, setDisplaySpeed] = useState(0);
  const targetSpeedRef = useRef(speed);
  const animationRef = useRef<number | null>(null);

  // Обновляем целевое значение при изменении скорости
  useEffect(() => {
    targetSpeedRef.current = speed;
  }, [speed]);

  // Анимация стрелки спидометра
  useEffect(() => {
    const animate = () => {
      setDisplaySpeed((prev) => {
        const target = targetSpeedRef.current;
        const delta = target - prev;
        const step = delta * 0.2;
        return Math.abs(delta) < 0.1 ? target : prev + step;
      });
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Геометрия и вычисления
  const width = 375;
  const height = 375;
  const centerX = width / 2;
  const centerY = height / 2;
  const outerRadius = Math.min(width, height) / 2 - 10;
  const innerRadius = outerRadius * 0.65;
  const totalMarks = 20;
  const angleOffset = Math.PI / 5;

  const clampedSpeed = Math.min(displaySpeed, maxSpeed);

  const calculateRotation = (value: number) => {
    const percentage = value / maxSpeed;
    return Math.PI / 2 + percentage * (2 * Math.PI * 0.8);
  };

  const needleAngle = calculateRotation(clampedSpeed) + angleOffset;

  return (
    <SpeedometerView
      speed={clampedSpeed}
      needleAngle={needleAngle}
      outerRadius={outerRadius}
      innerRadius={innerRadius}
      centerX={centerX}
      centerY={centerY}
      totalMarks={totalMarks}
      maxSpeed={maxSpeed}
    />
  );
};

export default Speedometer;
