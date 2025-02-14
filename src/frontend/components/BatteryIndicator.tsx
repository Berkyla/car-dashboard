import React from "react";

interface BatteryIndicatorProps {
  chargeLevel: number; // Уровень заряда (в процентах: 0–100)
  voltage: number; // Текущее напряжение батареи
  isCharging: boolean; // Состояние зарядки
}

const BatteryIndicator: React.FC<BatteryIndicatorProps> = ({
  chargeLevel,
  voltage,
  isCharging,
}) => {
  const segmentCount = 3; // Количество сегментов
  const activeSegments = Math.ceil((chargeLevel / 100) * segmentCount);

  return (
    <div className="battery-indicator-container">
      {/* Корпус батареи и уровень заряда */}
      <div className="battery-status">
        <div className="battery-case">
          {[...Array(segmentCount)].map((_, index) => (
            <div
              key={index}
              className={`battery-segment ${
                index < activeSegments ? `active segment-${index + 1}` : ""
              }`}
            ></div>
          ))}
        </div>
        <span className="battery-charge">{chargeLevel.toFixed(0)}%</span>
      </div>

      {/* Напряжение батареи и иконка зарядки */}
      <div className="battery-info">
        {isCharging && <span className="battery-icon">⚡</span>}
        <span className="battery-voltage">{voltage.toFixed(1)} V</span>
      </div>
    </div>
  );
};

export default BatteryIndicator;
