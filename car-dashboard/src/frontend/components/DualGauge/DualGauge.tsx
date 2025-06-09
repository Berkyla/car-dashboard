import React, { useEffect, useState } from "react";
import DualGaugeView from "./DualGaugeView";

// Пропсы для двойного датчика температуры и топлива
interface DualGaugeProps {
  temperature: number;     // Текущая температура
  maxTemperature: number;  // Максимальная температура
  fuelLevel: number;       // Текущий уровень топлива
  maxFuelLevel: number;    // Максимальный уровень топлива
}

const DualGauge: React.FC<DualGaugeProps> = ({
  temperature,
  maxTemperature,
  fuelLevel,
  maxFuelLevel,
}) => {
  const [smoothTemp, setSmoothTemp] = useState(temperature); // Сглаженное значение температуры
  const [smoothFuel, setSmoothFuel] = useState(fuelLevel);   // Сглаженное значение топлива

  useEffect(() => {
    let frameId: number;

    // Анимация плавного перехода значений температуры и топлива
    const animate = () => {
      setSmoothTemp((prev) => {
        const delta = temperature - prev;
        return Math.abs(delta) < 0.2 ? temperature : prev + delta * 0.1;
      });

      setSmoothFuel((prev) => {
        const delta = fuelLevel - prev;
        return Math.abs(delta) < 0.2 ? fuelLevel : prev + delta * 0.1;
      });

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    // Очистка при размонтировании
    return () => cancelAnimationFrame(frameId);
  }, [temperature, fuelLevel]);

  return (
    <DualGaugeView
      smoothTemp={smoothTemp}
      maxTemperature={maxTemperature}
      smoothFuel={smoothFuel}
      maxFuelLevel={maxFuelLevel}
    />
  );
};

export default DualGauge;
