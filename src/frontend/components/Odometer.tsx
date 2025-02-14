import React from "react";

interface OdometerProps {
  mileage: number; // Пробег автомобиля
}

const Odometer: React.FC<OdometerProps> = ({ mileage }) => {
  return (
    <div className="odometer-container">
      <span className="odometer-label">ODO</span>
      <div className="odometer-value">
        {mileage.toFixed(1)} <span className="odometer-unit">км</span>
      </div>
    </div>
  );
};

export default Odometer;
