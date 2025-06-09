import React, { useEffect, useState } from "react";
import DualGauge from "./DualGauge/DualGauge";
import Speedometer from "./Speedometer/Speedometer";
import Tachometer from "./Tachometer/Tachometer";
import VoltageIndicator from "./VoltageIndicator";
import Odometer from "./Odometer";
import WarningIndicators from "./WarningIndicators";

const App: React.FC = () => {
  // Основное состояние данных, приходящих с WebSocket
  const [data, setData] = useState({
    speed: 0,
    rpm: 0,
    fuelLevel: 0,
    temperature: 0,
    voltage: 0,
    mileage: 0,
    engineStarted: false,
    fuelConsumption: 0,
    isIdle: true,
    throttle: 0,
    gear: "N",
  });

  // Состояние индикаторов предупреждений
  const [indicators, setIndicators] = useState({
    overheat: false,
    lowFuel: false,
    lowVoltage: false,
  });

  // Подключение WebSocket и получение данных
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");

    socket.onmessage = (event) => {
      const receivedData = JSON.parse(event.data);
      console.log("[WebSocket] Получены данные:", receivedData);

      // Обновление состояния с валидацией входящих данных
      setData((prevData) => ({
        ...prevData,
        speed: Math.max(0, receivedData.speed),
        rpm: isFinite(receivedData.rpm) ? receivedData.rpm : 0,
        gear: receivedData.gear || "N",
        throttle: receivedData.throttle ?? prevData.throttle,
        fuelLevel: isFinite(receivedData.fuelLevel) ? receivedData.fuelLevel : prevData.fuelLevel,
        temperature: isFinite(receivedData.temperature) ? receivedData.temperature : prevData.temperature,
        voltage: isFinite(receivedData.voltage) ? receivedData.voltage : prevData.voltage,
        mileage: isFinite(receivedData.mileage) ? receivedData.mileage : prevData.mileage,
        engineStarted:
          typeof receivedData.engineRunning === "boolean"
            ? receivedData.engineRunning
            : prevData.engineStarted,
      }));

      // Обновление состояния предупреждающих индикаторов
      setIndicators({
        overheat: receivedData.temperature >= 109,
        lowFuel: receivedData.fuelLevel <= 13,
        lowVoltage: receivedData.voltage <= 11.5,
      });

      console.log(
        `[State] Обновлены данные: Temp=${receivedData.temperature}, Fuel=${receivedData.fuelLevel}`
      );
    };

    socket.onclose = () => {
      console.log("[WebSocket] Соединение закрыто");
    };

    return () => {
      socket.close();
    };
  }, []);

  return (
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
          <VoltageIndicator voltage={data.voltage ?? 0} />
        </div>

        {/* Индикаторы предупреждений */}
        <WarningIndicators
          overheat={indicators.overheat}
          lowFuel={indicators.lowFuel}
          lowVoltage={indicators.lowVoltage}
        />

        {/* Основное содержимое приборной панели */}
        <div className="dashboard-content">
          <div className="gauge-container gauge-left">
            <Tachometer rpm={data.rpm} maxRpm={8000} />
          </div>

          <div className="gauge-container gauge-center">
            <Speedometer speed={data.speed} maxSpeed={200} />
          </div>

          <div className="gauge-container gauge-right">
            <DualGauge
              temperature={data.temperature}
              maxTemperature={130}
              fuelLevel={data.fuelLevel}
              maxFuelLevel={50}
            />
          </div>

          {/* Отображение текущей передачи */}
          <div className={`gear-display ${data.gear !== "N" ? "gear-shifted" : ""}`}>
            {data.gear}
          </div>
        </div>

        {/* Отображение одометра */}
        <div className="odometer-position">
          <Odometer mileage={data.mileage ?? 0} />
        </div>
      </div>
    </div>
  );
};

export default App;
