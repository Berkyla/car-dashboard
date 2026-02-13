import React, { useEffect, useMemo, useRef, useState } from "react";
import { getParameterSpec, type ZoneKind } from "spec/parameters";
import TachometerView from "./TachometerView";

interface TachometerProps {
  rpm: number;
  maxRpm: number;
}

type ZoneArc = {
  kind: ZoneKind;
  startAngle: number;
  endAngle: number;
  stroke: string;
  strokeWidth?: number;
};

type TickMark = {
  angle: number;
  value: number;
  label?: number;
};

const UI_MIN_RPM = 0;
const UI_MAX_RPM = 3500;
const MAJOR_STEP_RPM = 500;
const MINOR_STEP_RPM = 250;
const LABEL_STEP_RPM = 1000;
const NEEDLE_SMOOTH_TIME_SEC = 0.18;
const NEEDLE_MAX_RPM_PER_SEC = 7000;
const NEEDLE_SETTLE_EPSILON = 0.5;

const zoneColors: Record<ZoneKind, string> = {
  green: "#00c853",
  yellow: "#ffd600",
  red: "#ff1744",
  alarm: "#ff1744",
};

const clamp = (value: number, min: number, max: number): number => {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
};

const Tachometer: React.FC<TachometerProps> = ({ rpm, maxRpm }) => {
  const normalizedInputRpm = clamp(rpm, UI_MIN_RPM, UI_MAX_RPM);

  const [displayRpm, setDisplayRpm] = useState(normalizedInputRpm);

  const animationFrameRef = useRef<number | null>(null);
  const prevFrameTimeRef = useRef<number | null>(null);
  const targetRpmRef = useRef(normalizedInputRpm);
  const displayRpmRef = useRef(normalizedInputRpm);

  void maxRpm;

  useEffect(() => {
    targetRpmRef.current = normalizedInputRpm;
  }, [normalizedInputRpm]);

  useEffect(() => {
    const tick = (timestamp: number) => {
      const previousTimestamp = prevFrameTimeRef.current ?? timestamp;
      const dtSec = Math.max(0, (timestamp - previousTimestamp) / 1000);
      prevFrameTimeRef.current = timestamp;

      const target = targetRpmRef.current;
      const current = displayRpmRef.current;

      const alpha = 1 - Math.exp(-dtSec / NEEDLE_SMOOTH_TIME_SEC);
      const easedCandidate = current + (target - current) * alpha;

      const maxStep = NEEDLE_MAX_RPM_PER_SEC * dtSec;
      const rawDelta = easedCandidate - current;
      const limitedDelta = clamp(rawDelta, -maxStep, maxStep);
      const next = clamp(current + limitedDelta, UI_MIN_RPM, UI_MAX_RPM);

      const settled = Math.abs(target - next) < NEEDLE_SETTLE_EPSILON;
      const nextValue = settled ? target : next;

      displayRpmRef.current = nextValue;
      setDisplayRpm(nextValue);

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
  }, []);

  const width = 200;
  const height = 200;
  const centerX = width / 2;
  const centerY = height / 2;
  const outerRadius = Math.min(width, height) / 2 - 10;
  const innerRadius = outerRadius - 50;

  const segments = UI_MAX_RPM / MAJOR_STEP_RPM;
  const startAngle = Math.PI / 2;
  const endAngle = Math.PI / 2 + (2 * Math.PI * segments) / (segments + 1);

  const valueToAngle = (value: number): number => {
    const safeValue = clamp(value, UI_MIN_RPM, UI_MAX_RPM);
    const denominator = UI_MAX_RPM - UI_MIN_RPM;

    if (denominator <= 0) {
      return startAngle;
    }

    const t = (safeValue - UI_MIN_RPM) / denominator;
    return startAngle + t * (endAngle - startAngle);
  };

  const needleAngle = valueToAngle(displayRpm);

  const rpmSpec = getParameterSpec("rpm", { coolantMode: "water", motionMode: "parked" });

  const zonesArcs = useMemo<ZoneArc[]>(() => {
    const arcs: ZoneArc[] = [];

    for (const zone of rpmSpec.zones) {
      for (const range of zone.ranges) {
        const from = clamp(range.from, UI_MIN_RPM, UI_MAX_RPM);
        const to = clamp(range.to, UI_MIN_RPM, UI_MAX_RPM);

        if (from > to) {
          continue;
        }

        arcs.push({
          kind: zone.kind,
          startAngle: valueToAngle(from),
          endAngle: valueToAngle(to),
          stroke: zoneColors[zone.kind],
          strokeWidth: 6,
        });
      }
    }

    return arcs;
  }, [rpmSpec]);

  const majorTicks = useMemo<TickMark[]>(() => {
    const ticks: TickMark[] = [];

    for (let value = UI_MIN_RPM; value <= UI_MAX_RPM; value += MAJOR_STEP_RPM) {
      const shouldShowLabel = value !== UI_MIN_RPM && value % LABEL_STEP_RPM === 0;

      ticks.push({
        angle: valueToAngle(value),
        value,
        label: shouldShowLabel ? value / LABEL_STEP_RPM : undefined,
      });
    }

    return ticks;
  }, []);

  const minorTicks = useMemo<TickMark[]>(() => {
    const ticks: TickMark[] = [];

    for (let value = UI_MIN_RPM + MINOR_STEP_RPM; value < UI_MAX_RPM; value += MINOR_STEP_RPM) {
      if (value % MAJOR_STEP_RPM === 0) {
        continue;
      }

      ticks.push({ angle: valueToAngle(value), value });
    }

    return ticks;
  }, []);

  return (
    <TachometerView
      needleAngle={needleAngle}
      outerRadius={outerRadius}
      innerRadius={innerRadius}
      centerX={centerX}
      centerY={centerY}
      zonesArcs={zonesArcs}
      majorTicks={majorTicks}
      minorTicks={minorTicks}
    />
  );
};

export default Tachometer;