import React from "react";

interface OdometerProps {
  mileage: number; // Пробег автомобиля в километрах
}

// Компонент отображает одометр с форматированным значением пробега
const Odometer: React.FC<OdometerProps> = ({ mileage }) => {
  const safeMileage = isFinite(mileage) ? mileage : 0;

  return (
    <div className="odometer-container">
      <span className="odometer-label">ODO</span>
      <div className="odometer-value">
        {safeMileage.toFixed(1)} <span className="odometer-unit">км</span>
      </div>
    </div>
  );
};

export default Odometer;
