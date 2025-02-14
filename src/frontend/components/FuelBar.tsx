import React from "react";

interface FuelBarProps {
  fuelLevel: number; // Уровень топлива в процентах
}

const FuelBar: React.FC<FuelBarProps> = ({ fuelLevel }) => {
  const barWidth = 300; // Ширина шкалы

  // Ограничиваем значение уровня топлива
  const clampedFuelLevel = Math.min(Math.max(fuelLevel, 0), 100);
  const filledWidth = (clampedFuelLevel / 100) * barWidth; // Длина заполненной шкалы

  return (
    <div className="fuel-bar-container relative" style={{ width: `${barWidth}px` }}>
      {/* Корпус шкалы */}
      <div className="fuel-bar bg-gray-800 border border-white rounded-full h-4 relative overflow-hidden">
        {/* Заполненная шкала (ускоренная анимация) */}
        <div
          className="fuel-bar-level h-full"
          style={{
            width: `${filledWidth}px`,
            backgroundColor: "#FFFFFF",
            transition: "width 0.3s ease", // Ускоренная анимация белой шкалы
          }}
        ></div>
      </div>

      {/* Индикатор текущего уровня топлива */}
      <div
        className="fuel-bar-indicator absolute top-[-20px] bg-red-500 text-white font-bold text-sm px-2 py-1 rounded"
        style={{
          left: `${filledWidth}px`,
          transform: "translateX(-50%)",
          transition: "left 1s ease", // Обычная скорость для красного индикатора
        }}
      >
        {Math.round(clampedFuelLevel)}%
      </div>
    </div>
  );
};

export default FuelBar;
