import React from "react";
import DualGauge from "./DualGauge";
import Speedometer from "./Speedometer/Speedometer";
import Tachometer from "./Tachometer/Tachometer";
import StartEngine from "./StartEngine";
import BatteryIndicator from "./BatteryIndicator";
import Odometer from "./Odometer";
import { useDashboardLogic } from "./hooks/useDashboardLogic";

const App: React.FC = () => {
  const { engineStarted, setEngineStarted, currentValues, mileage } =
    useDashboardLogic();

  return (
    <div className="dashboard-container">
      {/* Фон панели */}
      <img
        src="frontend/assets/images/dashboard_background.png"
        alt="Dashboard Background"
        className="dashboard-background dashboard-layer"
      />

      {/* Рамка панели */}
      <img
        src="frontend/assets/images/dashboard_frame.png"
        alt="Dashboard Frame"
        className="dashboard-frame dashboard-layer"
      />

      {/* Кнопка старта двигателя */}
      <div className="engine-indicator">
        <StartEngine
          isStarted={engineStarted}
          onToggle={(state) => setEngineStarted(state)}
        />
        <img
          src={
            engineStarted
              ? "frontend/assets/images/engine_on_indicator.png"
              : "frontend/assets/images/engine_off_indicator.png"
          }
          alt={engineStarted ? "Engine On" : "Engine Off"}
          className="engine-indicator dashboard-layer"
        />
      </div>

      {/* Индикатор поворотников */}
      <div className="blinkers-indicator movable">
        <img
          src="frontend/assets/images/blinkers_indicator.png"
          alt="Blinkers Indicator"
          className="blinkers-indicator dashboard-layer"
        />
      </div>

      {/* Индикатор заряда аккумулятора */}
      <div className="battery-indicator-position">
        <BatteryIndicator
          chargeLevel={currentValues.batteryLevel * 100}
          voltage={currentValues.voltage}
          isCharging={true}
        />
      </div>

      {/* Центральная часть приборной панели */}
      <div className="dashboard-content">
        {/* Тахометр */}
        <div className="gauge-container gauge-left">
          <Tachometer rpm={currentValues.rpm} maxRpm={8000} />
        </div>

        {/* Спидометр */}
        <div className="gauge-container gauge-center">
          <Speedometer speed={currentValues.speed} maxSpeed={200} />
        </div>

        {/* Индикатор температуры и уровня топлива */}
        <div className="gauge-container gauge-right">
          <DualGauge
            temperature={currentValues.temperature}
            maxTemperature={130}
            fuelLevel={currentValues.fuelLevel}
            maxFuelLevel={1}
          />
        </div>
      </div>

      {/* Одометр */}
      <div className="odometer-position">
        <Odometer mileage={mileage} />
      </div>
    </div>
  );
};

export default App;
