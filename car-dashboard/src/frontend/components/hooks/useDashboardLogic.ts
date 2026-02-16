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

  fuelLevel?: number;
  fuellevel?: number;
  temperature?: number;
  voltage?: number;
  mileage?: number;

  p_md?: number;
  p_sm_gmt?: number;
  p_upr_gmt?: number;

  pMd?: number;
  pSmGmt?: number;
  pUprGmt?: number;

  engineRunning?: boolean;
};


export const useDashboardLogic = () => {
  const [engineStarted, setEngineStarted] = useState(false);

  const [speed, setSpeed] = useState(0);
  const [rpm, setRpm] = useState(800);
  const [gear, setGear] = useState("N");
  const [clutchPressed, setClutchPressed] = useState(false);

  const [fuelLevel, setFuelLevel] = useState(39);
  const [temperature, setTemperature] = useState(90);
  const [voltage, setVoltage] = useState(14.2);
  const [mileage, setMileage] = useState(0.0);

  const [pMd, setPMd] = useState(0);
  const [pSmGmt, setPSmGmt] = useState(0);
  const [pUprGmt, setPUprGmt] = useState(0);


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
        data = JSON.parse(event.data) as DashboardMessage;
      } catch {
        console.warn("[WebSocket] Некорректный JSON:", event.data);
        return;
      }

      if (typeof data.speed === "number" && isFinite(data.speed)) {
        const spec = getParameterSpec("speed", ctx);
        const s = quantize(Math.max(0, data.speed), spec.step);
        setSpeed(s);
        setMotionMode(s > 0 ? "moving" : "parked");
      }

      if (typeof data.rpm === "number" && isFinite(data.rpm)) {
        const spec = getParameterSpec("rpm", ctx);
        setRpm(quantize(data.rpm, spec.step));
      }

      if (typeof data.gear === "string") setGear(data.gear || "N");
      if (typeof data.clutch === "boolean") setClutchPressed(data.clutch);

      const incomingFuel = typeof data.fuelLevel === "number" ? data.fuelLevel : data.fuellevel;
      if (typeof incomingFuel === "number" && isFinite(incomingFuel)) {
        const raw = Math.max(0, incomingFuel);
        const liters = raw <= 1.5 ? raw * 50 : raw;
        setFuelLevel(liters);
      }

      if (typeof data.temperature === "number" && isFinite(data.temperature)) {
        const spec = getParameterSpec("coolantTemp", ctx);
        setTemperature(quantize(data.temperature, spec.step));
      }

      if (typeof data.voltage === "number" && isFinite(data.voltage)) {
        const spec = getParameterSpec("voltage", ctx);
        setVoltage(quantize(data.voltage, spec.step));
      }

      if (typeof data.mileage === "number" && isFinite(data.mileage)) {
        setMileage(data.mileage);
      }

      const incomingPMd = typeof data.p_md === "number" ? data.p_md : data.pMd;
      if (typeof incomingPMd === "number" && isFinite(incomingPMd)) {
        const spec = getParameterSpec("engineOilPressure", ctx);
        const clamped = Math.max(spec.scale.from, Math.min(spec.scale.to, incomingPMd));
        const quantized = quantize(clamped, spec.step);
        setPMd(quantized);
      }

      const incomingPSmGmt = typeof data.p_sm_gmt === "number" ? data.p_sm_gmt : data.pSmGmt;
      if (typeof incomingPSmGmt === "number" && isFinite(incomingPSmGmt)) {
        const spec = getParameterSpec("hydroSystemPressure", ctx);
        const clamped = Math.max(spec.scale.from, Math.min(spec.scale.to, incomingPSmGmt));
        const quantized = quantize(clamped, spec.step);
        setPSmGmt(quantized);
      }

      const incomingPUprGmt = typeof data.p_upr_gmt === "number" ? data.p_upr_gmt : data.pUprGmt;
      if (typeof incomingPUprGmt === "number" && isFinite(incomingPUprGmt)) {
        const spec = getParameterSpec("hydroControlPressure", ctx);
        const clamped = Math.max(spec.scale.from, Math.min(spec.scale.to, incomingPUprGmt));
        const quantized = quantize(clamped, spec.step);
        setPUprGmt(quantized);
      }
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
  }, []);


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

  const indicators: Indicators = useMemo(() => {
    const coolantStatus = evaluateZones(getParameterSpec("coolantTemp", ctx), temperature);
    const fuelFraction = Math.max(0, Math.min(1, fuelLevel / 50));
    const fuelStatus = evaluateZones(getParameterSpec("fuel", ctx), fuelFraction);
    const voltageStatus = evaluateZones(getParameterSpec("voltage", ctx), voltage);

    return {
      overheat: coolantStatus.severity === "alarm",
      lowFuel: fuelStatus.severity !== "normal",
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

    pMd,
    pSmGmt,
    pUprGmt,

    coolantMode,
    motionMode,
    setCoolantMode,
    setMotionMode,

    indicators,

    handleStartStopEngine,
    handleAccelerate,
    handleBrake,
    handleShiftGear,
    handlePressClutch,
  };
};