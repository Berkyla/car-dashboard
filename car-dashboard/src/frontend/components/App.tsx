import React, { useEffect, useState } from "react";
import DualGauge from "./DualGauge/DualGauge";
import Speedometer from "./Speedometer/Speedometer";
import Tachometer from "./Tachometer/Tachometer";
import VoltageIndicator from "./VoltageIndicator";
import Odometer from "./Odometer";
import WarningIndicators from "./WarningIndicators";

// TODO: поправь путь под свой проект
import { useDashboardLogic } from "./hooks/useDashboardLogic";

const BASE_WIDTH = 1024;
const BASE_HEIGHT = 768;

const calculateScale = () =>
  Math.min(window.innerWidth / BASE_WIDTH, window.innerHeight / BASE_HEIGHT);

const App: React.FC = () => {
  const {
    speed,
    rpm,
    fuelLevel,
    temperature,
    voltage,
    mileage,
    gear,
    indicators,
  } = useDashboardLogic();

  const [scale, setScale] = useState<number>(() => calculateScale());

  useEffect(() => {
    const handleResize = () => {
      setScale(calculateScale());
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="viewport">
      <div className="screen" style={{ transform: `scale(${scale})` }}>
        <div className="dashboard-wrapper">
          <div className="dashboard-container">
            {/* Фоновое изображение приборной панели */}
            <img
              src="frontend/assets/images/dashboard_background.png"
              alt="Dashboard Background"
              className="dashboard-background dashboard-layer"
            />

            {/* Передняя рамка приборной панели */}
            <img
              src="frontend/assets/images/dashboard_frame.png"
              alt="Dashboard Frame"
              className="dashboard-frame dashboard-layer"
            />

            {/* Индикатор поворотников (Будет реализовано в будущем) */}
            <div className="blinkers-indicator movable">
              <img
                src="frontend/assets/images/blinkers_indicator.png"
                alt="Blinkers Indicator"
                className="blinkers-indicator dashboard-layer"
              />
            </div>

            {/* Отображение напряжения */}
            <div className="voltage-indicator-position">
              <VoltageIndicator voltage={voltage ?? 0} />
            </div>

            {/* Индикаторы предупреждений */}
            <WarningIndicators
              overheat={indicators?.overheat ?? false}
              lowFuel={indicators?.lowFuel ?? false}
              lowVoltage={indicators?.lowVoltage ?? false}
            />

            {/* Основное содержимое приборной панели */}
            <div className="dashboard-content">
              <div className="gauge-container gauge-left">
                <Tachometer rpm={rpm} maxRpm={3500} />
              </div>

              <div className="gauge-container gauge-center">
                <Speedometer speed={speed} maxSpeed={120} />
              </div>

              <div className="gauge-container gauge-right">
                <DualGauge
                  temperature={temperature}
                  maxTemperature={130}
                  fuelLevel={fuelLevel}
                  maxFuelLevel={50}
                />
              </div>

              {/* Отображение текущей передачи */}
              <div className={`gear-display ${gear !== "N" ? "gear-shifted" : ""}`}>
                {gear}
              </div>
            </div>

            {/* Отображение одометра */}
            <div className="odometer-position">
              <Odometer mileage={mileage ?? 0} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;