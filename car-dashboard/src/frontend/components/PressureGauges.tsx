import React, { useEffect, useMemo, useRef, useState } from "react";
import { evaluateZones, getParameterSpec, quantize } from "spec/parameters";

type PressureGaugesProps = {
  pMd: number;
  pSmGmt: number;
  pUprGmt: number;
};

type PressureParamId = "engineOilPressure" | "hydroSystemPressure" | "hydroControlPressure";

type GaugeConfig = {
  id: PressureParamId;
  title: string;
  value: number;
};

type ZoneSegment = {
  color: string;
  from: number;
  to: number;
};

const ctx = { coolantMode: "water", motionMode: "parked" } as const;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

const arcPath = (cx: number, cy: number, radius: number, startDeg: number, endDeg: number): string => {
  const start = toRadians(startDeg);
  const end = toRadians(endDeg);

  const x1 = cx + radius * Math.cos(start);
  const y1 = cy + radius * Math.sin(start);
  const x2 = cx + radius * Math.cos(end);
  const y2 = cy + radius * Math.sin(end);

  const delta = Math.abs(endDeg - startDeg);
  const largeArcFlag = delta > 180 ? 1 : 0;
  const sweepFlag = endDeg >= startDeg ? 1 : 0;

  return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${x2} ${y2}`;
};

const zoneColor = (kind: "red" | "green" | "yellow" | "alarm"): string => {
  if (kind === "green") return "#00d084";
  if (kind === "yellow") return "#facc15";
  return "#ff3b30";
};

const PRESSURE_NEEDLE_EASING = 0.12;
const PRESSURE_NEEDLE_EPSILON = 0.005;

const smoothApproach = (prev: number, next: number): number => {
  const delta = next - prev;
  return Math.abs(delta) < PRESSURE_NEEDLE_EPSILON ? next : prev + delta * PRESSURE_NEEDLE_EASING;
};

const PressureMiniDial: React.FC<{ title: string; id: PressureParamId; value: number }> = ({ title, id, value }) => {
  const spec = getParameterSpec(id, ctx);
  const targetQuantized = quantize(clamp(value, spec.scale.from, spec.scale.to), spec.step);

  const [smoothValue, setSmoothValue] = useState(targetQuantized);
  const targetValueRef = useRef(targetQuantized);

  useEffect(() => {
    targetValueRef.current = targetQuantized;
  }, [targetQuantized]);

  useEffect(() => {
    let raf = 0;

    const frame = () => {
      setSmoothValue((prev) => smoothApproach(prev, targetValueRef.current));
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  const smoothClamped = clamp(smoothValue, spec.scale.from, spec.scale.to);
  const displayValue = targetQuantized;
  const severity = evaluateZones(spec, displayValue).severity;

  const startDeg = 150;
  const endDeg = 390;
  const span = endDeg - startDeg;

  const valueToAngle = (v: number): number => {
    const t = (clamp(v, spec.scale.from, spec.scale.to) - spec.scale.from) / (spec.scale.to - spec.scale.from || 1);
    return startDeg + t * span;
  };

  const zoneSegments: ZoneSegment[] = useMemo(() => {
    const out: ZoneSegment[] = [];
    for (const zone of spec.zones) {
      for (const range of zone.ranges) {
        out.push({
          color: zoneColor(zone.kind),
          from: clamp(range.from, spec.scale.from, spec.scale.to),
          to: clamp(range.to, spec.scale.from, spec.scale.to),
        });
      }
    }
    return out.filter((x) => x.to >= x.from);
  }, [spec]);

  const cx = 47;
  const cy = 47;
  const r = 34;
  const needleAngle = toRadians(valueToAngle(smoothClamped));
  const nx = cx + (r - 8) * Math.cos(needleAngle);
  const ny = cy + (r - 8) * Math.sin(needleAngle);

  const decimals = String(spec.step).split(".")[1]?.length ?? 0;

  return (
    <div className={`pressureDial pressureDial--${severity}`}>
      <svg width={97} height={94} viewBox="0 0 94 94" className="pressureDial__svg">
        <circle cx={cx} cy={cy} r={39} fill="rgba(5, 10, 18, 0.8)" stroke="#1f2937" strokeWidth={2} />

        <path d={arcPath(cx, cy, r, startDeg, endDeg)} stroke="#334155" strokeWidth={7} fill="none" />

        {zoneSegments.map((seg, idx) => (
          <path
            key={`${idx}-${seg.from}-${seg.to}`}
            d={arcPath(cx, cy, r, valueToAngle(seg.from), valueToAngle(seg.to))}
            stroke={seg.color}
            strokeWidth={7}
            fill="none"
            strokeLinecap="butt"
          />
        ))}

        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#e5e7eb" strokeWidth={2} />
        <circle cx={cx} cy={cy} r={3.5} fill="#f8fafc" stroke="#0f172a" strokeWidth={1} />

        <text x={cx} y={72} textAnchor="middle" className="pressureDial__title">{title}</text>
      </svg>
      <div className="pressureDial__value">{displayValue.toFixed(decimals)} {spec.unit}</div>
    </div>
  );
};

const PressureGauges: React.FC<PressureGaugesProps> = ({ pMd, pSmGmt, pUprGmt }) => {
  const gauges: GaugeConfig[] = [
    { id: "engineOilPressure", title: "РМ.ДВ", value: pMd },
    { id: "hydroSystemPressure", title: "РСМ.ГМТ", value: pSmGmt },
    { id: "hydroControlPressure", title: "РУПР.ГМТ", value: pUprGmt },
  ];

  return (
    <div className="pressureBlock">
      {gauges.map((gauge) => (
        <PressureMiniDial key={gauge.id} id={gauge.id} title={gauge.title} value={gauge.value} />
      ))}
    </div>
  );
};

export default PressureGauges;