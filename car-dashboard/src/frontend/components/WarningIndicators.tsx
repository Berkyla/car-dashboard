import React from "react";

interface Props {
  overheat: boolean;   // true, если температура двигателя превышает допустимый предел
  lowFuel: boolean;    // true, если уровень топлива ниже критического значения
  lowVoltage: boolean; // true, если напряжение аккумулятора ниже безопасного порога
}

// Компонент визуализирует предупреждающие индикаторы на панели
const WarningIndicators: React.FC<Props> = ({
  overheat = false,
  lowFuel = false,
  lowVoltage = false,
}) => {
  return (
    <div className="indicator-layer">
      {/* Индикатор перегрева */}
      <img
        src={`frontend/assets/images/indicators/coolant_${overheat ? "on" : "off"}.png`}
        alt="Coolant Warning"
        className="indicator-icon indicator-coolant"
      />

      {/* Индикатор низкого уровня топлива */}
      <img
        src={`frontend/assets/images/indicators/fuel_${lowFuel ? "on" : "off"}.png`}
        alt="Low Fuel"
        className="indicator-icon indicator-fuel"
      />

      {/* Индикатор низкого напряжения */}
      <img
        src={`frontend/assets/images/indicators/voltage_${lowVoltage ? "on" : "off"}.png`}
        alt="Low Voltage"
        className="indicator-icon indicator-voltage"
      />
    </div>
  );
};

export default WarningIndicators;
