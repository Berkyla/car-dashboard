import React from "react";

interface VoltageIndicatorProps {
  voltage: number; // Текущее напряжение в вольтах
}

// Компонент отображает текущее напряжение на панели
const VoltageIndicator: React.FC<VoltageIndicatorProps> = ({ voltage }) => {
  const safeVoltage = isFinite(voltage) ? voltage : 0;

  return (
    <div className="voltage-indicator-container">
      <span className="voltage-label">VOLT</span>
      <div className="voltage-value">
        {safeVoltage.toFixed(1)}
        <span className="voltage-unit"></span>
      </div>
    </div>
  );
};

export default VoltageIndicator;
