import React, { useEffect, useMemo, useRef, useState } from "react";
import { getParameterSpec } from "spec/parameters";
import SpeedometerView from "./SpeedometerView";

interface SpeedometerProps {
  speed: number;
  maxSpeed?: number;
  unit?: string;
}

type ZoneArc = {
  startAngle: number;
  endAngle: number;
  stroke: string;
  strokeWidth?: number;
};

const DEFAULT_MAX_SPEED = 200;
const UI_MIN_SPEED = 0;
const NEEDLE_SMOOTH_TIME_SEC = 0.2;
const NEEDLE_MAX_SPEED_PER_SEC = 260;
const NEEDLE_SETTLE_EPSILON = 0.01;

const ARC_OFFSET = Math.PI / 5;
const ARC_SWEEP = 2 * Math.PI * 0.8;

const clamp = (value: number, min: number, max: number): number => {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
};

const Speedometer: React.FC<SpeedometerProps> = ({ speed, maxSpeed = DEFAULT_MAX_SPEED, unit = "км/ч" }) => {
  const safeMaxSpeed = Math.max(1, clamp(maxSpeed, 1, Number.MAX_SAFE_INTEGER));
  const normalizedInputSpeed = clamp(speed, UI_MIN_SPEED, safeMaxSpeed);

  const [displaySpeed, setDisplaySpeed] = useState(normalizedInputSpeed);

  const animationFrameRef = useRef<number | null>(null);
  const prevFrameTimeRef = useRef<number | null>(null);
  const targetSpeedRef = useRef(normalizedInputSpeed);
  const displaySpeedRef = useRef(normalizedInputSpeed);

  useEffect(() => {
    targetSpeedRef.current = normalizedInputSpeed;
  }, [normalizedInputSpeed]);

  useEffect(() => {
    const clampedDisplay = clamp(displaySpeedRef.current, UI_MIN_SPEED, safeMaxSpeed);
    const clampedTarget = clamp(targetSpeedRef.current, UI_MIN_SPEED, safeMaxSpeed);

    displaySpeedRef.current = clampedDisplay;
    targetSpeedRef.current = clampedTarget;
    setDisplaySpeed(clampedDisplay);
  }, [safeMaxSpeed]);

  useEffect(() => {
    const tick = (timestamp: number) => {
      const previousTimestamp = prevFrameTimeRef.current ?? timestamp;
      const dtSec = Math.max(0, (timestamp - previousTimestamp) / 1000);
      prevFrameTimeRef.current = timestamp;

      const target = targetSpeedRef.current;
      const current = displaySpeedRef.current;

      const alpha = 1 - Math.exp(-dtSec / NEEDLE_SMOOTH_TIME_SEC);
      const easedCandidate = current + (target - current) * alpha;

      const maxStep = NEEDLE_MAX_SPEED_PER_SEC * dtSec;
      const rawDelta = easedCandidate - current;
      const limitedDelta = clamp(rawDelta, -maxStep, maxStep);
      const next = clamp(current + limitedDelta, UI_MIN_SPEED, safeMaxSpeed);

      const settled = Math.abs(target - next) < NEEDLE_SETTLE_EPSILON;
      const nextValue = settled ? target : next;

      displaySpeedRef.current = nextValue;
      setDisplaySpeed(nextValue);

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      prevFrameTimeRef.current = null;
    };
  }, [safeMaxSpeed]);

  const width = 375;
  const height = 375;
  const centerX = width / 2;
  const centerY = height / 2;
  const outerRadius = Math.min(width, height) / 2 - 10;
  const innerRadius = outerRadius * 0.65;

  const gaugeStartAngle = Math.PI / 2 + ARC_OFFSET;
  const gaugeEndAngle = gaugeStartAngle + ARC_SWEEP;

  const valueToAngle = (value: number): number => {
    const safeValue = clamp(value, UI_MIN_SPEED, safeMaxSpeed);
    const t = safeValue / safeMaxSpeed;

    return gaugeStartAngle + t * (gaugeEndAngle - gaugeStartAngle);
  };

  const speedSpec = getParameterSpec("speed", { coolantMode: "water", motionMode: "parked" });

  const zonesArcs = useMemo<ZoneArc[]>(() => {
    const speedScaleMax = Math.max(1, speedSpec.scale.to);
    const fullScaleStart = (speedSpec.scale.from / speedScaleMax) * safeMaxSpeed;
    const fullScaleEnd = (speedSpec.scale.to / speedScaleMax) * safeMaxSpeed;

    return [
      {
        startAngle: valueToAngle(fullScaleStart),
        endAngle: valueToAngle(fullScaleEnd),
        stroke: "#00c853",
        strokeWidth: 9,
      },
    ];
  }, [safeMaxSpeed, speedSpec]);

  const needleAngle = valueToAngle(displaySpeed);

  return (
    <SpeedometerView
      speed={displaySpeed}
      needleAngle={needleAngle}
      outerRadius={outerRadius}
      innerRadius={innerRadius}
      centerX={centerX}
      centerY={centerY}
      totalMarks={Math.max(10, Math.round(safeMaxSpeed / 5))}
      maxSpeed={safeMaxSpeed}
      unit={unit}
      zonesArcs={zonesArcs}
    />
  );
};

export default Speedometer;