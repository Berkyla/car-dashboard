// src/frontend/hooks/useDashboardLogic.ts
import { useEffect, useMemo, useRef, useState } from "react";
import { WS_URL } from "../../config/ws";
import {
  evaluateZones,
  getParameterSpec,
  quantize,
  type CoolantMode,
  type MotionMode,
  type EnvContext,
} from "spec/parameters";

type Indicators = {
  overheat: boolean;
  lowFuel: boolean;
  lowVoltage: boolean;
};

type DashboardMessage = {
  speed?: number;
  rpm?: number;
  gear?: string;
  clutch?: boolean;

  fuelLevel?: number;     // ВАЖНО: ожидаем долю 0..1 (по ТЗ)
  temperature?: number;   // tОЖ
  voltage?: number;
  mileage?: number;

  engineRunning?: boolean;
};

export const useDashboardLogic = () => {
  const [engineStarted, setEngineStarted] = useState(false);

  const [speed, setSpeed] = useState(0);
  const [rpm, setRpm] = useState(800);
  const [gear, setGear] = useState("N");
  const [clutchPressed, setClutchPressed] = useState(false);

  // По умолчанию оставляем твои значения как “стартовые”
  // (в дальнейшем их будет задавать ControlBlock)
  const [fuelLevel, setFuelLevel] = useState(39);     // ⚠️ см. примечание ниже
  const [temperature, setTemperature] = useState(90);
  const [voltage, setVoltage] = useState(14.2);
  const [mileage, setMileage] = useState(0.0);

  // Контекст ТЗ
  const [coolantMode, setCoolantMode] = useState<CoolantMode>("water");
  const [motionMode, setMotionMode] = useState<MotionMode>("parked");

  const ctx: EnvContext = useMemo(
    () => ({ coolantMode, motionMode }),
    [coolantMode, motionMode]
  );

  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    console.log("[WS] WS_URL =", WS_URL);

    const ws = new WebSocket(WS_URL);
    socketRef.current = ws;

    ws.onopen = () => console.log("[WebSocket] Подключено к серверу:", WS_URL);

    ws.onmessage = (event) => {
      let data: DashboardMessage;
      try {
        data = JSON.parse(event.data);
      } catch {
        console.warn("[WebSocket] Некорректный JSON:", event.data);
        return;
      }

      // --- speed (и автоматический motionMode) ---
      if (typeof data.speed === "number" && isFinite(data.speed)) {
        const spec = getParameterSpec("speed", ctx);
        const s = quantize(Math.max(0, data.speed), spec.step);
        setSpeed(s);
        setMotionMode(s > 0 ? "moving" : "parked");
      }

      // --- rpm ---
      if (typeof data.rpm === "number" && isFinite(data.rpm)) {
        const spec = getParameterSpec("rpm", ctx);
        setRpm(quantize(data.rpm, spec.step));
      }

      // --- gear/clutch ---
      if (typeof data.gear === "string") setGear(data.gear || "N");
      if (typeof data.clutch === "boolean") setClutchPressed(data.clutch);

      // --- fuel ---
      // По ТЗ fuel = доля 0..1.
      // Если твой ControlBlock пока шлёт "литры" или "0..50", нужно будет конвертировать.
      // Пока применяем квантизацию по спекам и слегка ограничим диапазон 0..1.
      if (typeof data.fuelLevel === "number" && isFinite(data.fuelLevel)) {
        const raw = Math.max(0, data.fuelLevel);
        // если вдруг сервер пришлёт долю 0..1 — переведём в 0..50
        const liters = raw <= 1.5 ? raw * 50 : raw;
        setFuelLevel(liters);
      }

      // --- coolant temperature (tОЖ) ---
      if (typeof data.temperature === "number" && isFinite(data.temperature)) {
        const spec = getParameterSpec("coolantTemp", ctx);
        setTemperature(quantize(data.temperature, spec.step));
      }

      // --- voltage ---
      if (typeof data.voltage === "number" && isFinite(data.voltage)) {
        const spec = getParameterSpec("voltage", ctx);
        setVoltage(quantize(data.voltage, spec.step));
      }

      // --- mileage ---
      if (typeof data.mileage === "number" && isFinite(data.mileage)) {
        setMileage(data.mileage);
      }

      // --- engine state ---
      if (typeof data.engineRunning === "boolean") {
        setEngineStarted(data.engineRunning);
      } else if (typeof data.speed === "number" && isFinite(data.speed)) {
        const sp = data.speed;
        setEngineStarted((prev) => prev || sp > 0);
      }

    };

    ws.onerror = (error) => console.error("[WebSocket] Ошибка соединения:", error);
    ws.onclose = () => console.log("[WebSocket] Соединение закрыто.");

    return () => {
      ws.close();
      socketRef.current = null;
      console.log("[WebSocket] Соединение закрыто (при размонтировании).");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // один раз

  const sendCommand = (command: string) => {
    const ws = socketRef.current;
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ action: command }));
    } else {
      console.warn("[WebSocket] Попытка отправки при закрытом соединении:", command);
    }
  };

  const handleStartStopEngine = () => sendCommand("toggle_engine");
  const handleAccelerate = () => sendCommand("accelerate");
  const handleBrake = () => sendCommand("brake");

  const handleShiftGear = (newGear: string) => {
    if (clutchPressed) {
      setGear(newGear);
      sendCommand(`gear_${newGear}`);
    }
  };

  const handlePressClutch = () => {
    setClutchPressed((prev) => !prev);
    sendCommand("toggle_clutch");
  };

  // --- Indicators по ТЗ через спеки ---
  const indicators: Indicators = useMemo(() => {
    const coolantStatus = evaluateZones(getParameterSpec("coolantTemp", ctx), temperature);
    const fuelFraction = Math.max(0, Math.min(1, fuelLevel / 50));
    const fuelStatus = evaluateZones(getParameterSpec("fuel", ctx), fuelFraction);
    const voltageStatus = evaluateZones(getParameterSpec("voltage", ctx), voltage);

    return {
      // перегрев = аварийная зона по tОЖ
      overheat: coolantStatus.severity === "alarm",
      // топливо: warn или alarm
      lowFuel: fuelStatus.severity !== "normal",
      // напряжение: warn или alarm
      lowVoltage: voltageStatus.severity !== "normal",
    };
  }, [ctx, temperature, fuelLevel, voltage]);

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

    // режимы (пока не используются UI, но пригодятся)
    coolantMode,
    motionMode,
    setCoolantMode, // можно потом привязать к настройке
    setMotionMode,  // можно не отдавать наружу, но оставляю для отладки

    indicators,

    handleStartStopEngine,
    handleAccelerate,
    handleBrake,
    handleShiftGear,
    handlePressClutch,
  };
};