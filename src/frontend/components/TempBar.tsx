import React from "react";

interface TempBarProps {
  temperature: number; // Текущая температура
  minTemperature: number; // Минимальная температура
  maxTemperature: number; // Максимальная температура
}

const TempBar: React.FC<TempBarProps> = ({
  temperature,
  minTemperature,
  maxTemperature,
}) => {
  const barWidth = 300; // Ширина шкалы

  // Ограничиваем значение температуры
  const clampedTemperature = Math.min(
    Math.max(temperature, minTemperature),
    maxTemperature
  );

  // Длина заполненной шкалы
  const filledWidth =
    ((clampedTemperature - minTemperature) /
      (maxTemperature - minTemperature)) *
    barWidth;

  // Общее время анимации
  const animationDuration = "0.3s"; // Синхронизированная длительность анимации

  return (
    <div className="temp-bar-container relative" style={{ width: `${barWidth}px` }}>
      {/* Корпус шкалы */}
      <div className="temp-bar bg-gray-800 border border-white rounded-full h-4 relative overflow-hidden">
        {/* Заполненная шкала */}
        <div
          className="temp-bar-level h-full"
          style={{
            width: `${filledWidth}px`,
            backgroundColor: "#FFFFFF",
            transition: `width ${animationDuration} ease`, // Синхронизированная анимация шкалы
          }}
        ></div>
      </div>

      {/* Индикатор текущей температуры */}
      <div
        className="temp-bar-indicator absolute top-[-20px] bg-red-500 text-white font-bold text-sm px-2 py-1 rounded"
        style={{
          left: `${filledWidth}px`,
          transform: "translateX(-50%)",
          transition: `left ${animationDuration} ease`, // Синхронизированная анимация индикатора
        }}
      >
        {Math.round(clampedTemperature)}°C
      </div>

      {/* Метки температуры */}
      <div className="temp-bar-labels flex justify-between text-white text-xs mt-2">
        <span>{minTemperature}°C</span>
        <span>{maxTemperature}°C</span>
      </div>
    </div>
  );
};

export default TempBar;
