import { useState, useEffect } from "react";

// Хук управления логикой панели приборов и WebSocket
export const useDashboardLogic = () => {
  const [engineStarted, setEngineStarted] = useState(false); // Состояние двигателя
  const [speed, setSpeed] = useState(0);                     // Скорость
  const [rpm, setRpm] = useState(800);                       // Обороты двигателя
  const [gear, setGear] = useState("N");                     // Текущая передача
  const [clutchPressed, setClutchPressed] = useState(false); // Сцепление

  const [fuelLevel, setFuelLevel] = useState(39);            // Уровень топлива
  const [temperature, setTemperature] = useState(90);        // Температура двигателя
  const [voltage, setVoltage] = useState(14.2);              // Напряжение сети
  const [mileage, setMileage] = useState(0.0);               // Пробег

  let socket: WebSocket | null = null;

  // Установка WebSocket-соединения и обработка событий
  useEffect(() => {
    socket = new WebSocket("ws://localhost:8080");

    socket.onopen = () => {
      console.log("[WebSocket] Подключено к серверу.");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setSpeed(data.speed);
      setRpm(data.rpm);
      setGear(data.gear);
      setClutchPressed(data.clutch);

      if (!engineStarted && data.speed > 0) {
        setEngineStarted(true);
      }
    };

    socket.onerror = (error) => {
      console.error("[WebSocket] Ошибка соединения:", error);
    };

    socket.onclose = () => {
      console.log("[WebSocket] Соединение закрыто.");
    };

    return () => {
      socket?.close();
      console.log("[WebSocket] Соединение закрыто (при размонтировании).");
    };
  }, []);

  // Отправка команды на сервер
  const sendCommand = (command: string) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ action: command }));
    } else {
      console.warn("[WebSocket] Попытка отправки при закрытом соединении:", command);
    }
  };

  // Обработка запуска/остановки двигателя
  const handleStartStopEngine = () => {
    setEngineStarted((prev) => !prev);
    sendCommand("toggle_engine");

    if (!engineStarted) {
      setFuelLevel(39);
      setTemperature(90);
      setVoltage(14.2);
    } else {
      setFuelLevel(0);
      setTemperature(0);
      setVoltage(0);
    }
  };

  // Обработка нажатия педали газа
  const handleAccelerate = () => sendCommand("accelerate");

  // Обработка торможения
  const handleBrake = () => sendCommand("brake");

  // Обработка переключения передачи
  const handleShiftGear = (newGear: string) => {
    if (clutchPressed) {
      setGear(newGear);
      sendCommand(`gear_${newGear}`);
    }
  };

  // Обработка нажатия/отпускания сцепления
  const handlePressClutch = () => {
    setClutchPressed((prev) => !prev);
    sendCommand("toggle_clutch");
  };

  return {
    engineStarted,
    speed,
    rpm,
    gear,
    clutchPressed,
    fuelLevel,
    temperature,
    voltage,
    mileage,
    handleStartStopEngine,
    handleAccelerate,
    handleBrake,
    handleShiftGear,
    handlePressClutch,
  };
};
