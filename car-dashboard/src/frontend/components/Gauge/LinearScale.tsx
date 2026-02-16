import React from "react";
import { quantize } from "spec/parameters";
import { clamp, normalize, pointOnLine } from "./scaleMath";
import type { AlarmBlink, Label, LinearScaleLayout, LinearScaleSpec, Tick, Zone } from "./types";

export type LinearScaleProps = {
  spec: LinearScaleSpec;
  value: number;
  layout: LinearScaleLayout;
  className?: string;
  style?: React.CSSProperties;
  alarmBlink?: AlarmBlink;
  formatter?: (value: number, units?: string) => string;
};

const zoneStroke: Record<Zone["kind"], string> = {
  red: "#ef4444",
  green: "#10b981",
  yellow: "#f59e0b",
  alarm: "#dc2626",
};

const getDefaultTickStep = (spec: LinearScaleSpec): number => {
  const span = spec.max - spec.min;
  if (span <= 0) return 1;

  const baseStep = spec.step > 0 ? spec.step : 1;
  const rawTicks = span / baseStep;
  if (rawTicks <= 12) return baseStep;

  const targetTicks = 10;
  const base = span / targetTicks;
  const magnitude = Math.pow(10, Math.floor(Math.log10(base)));
  const candidates = [1, 2, 5, 10].map((factor) => factor * magnitude);
  return candidates.find((candidate) => candidate >= base) ?? candidates[candidates.length - 1];
};

const buildTicks = (spec: LinearScaleSpec): Tick[] => {
  if (spec.ticks && spec.ticks.length > 0) {
    return spec.ticks;
  }

  const tickStep = getDefaultTickStep(spec);
  const start = Math.ceil(spec.min / tickStep) * tickStep;
  const out: Tick[] = [];

  for (let current = start; current <= spec.max + tickStep * 0.001; current += tickStep) {
    const value = Number(current.toFixed(6));
    out.push({ value, label: `${value}` });
  }

  if (out.length === 0 || out[0].value !== spec.min) {
    out.unshift({ value: spec.min, label: `${spec.min}` });
  }

  if (out[out.length - 1].value !== spec.max) {
    out.push({ value: spec.max, label: `${spec.max}` });
  }

  return out;
};

const toLabels = (spec: LinearScaleSpec, ticks: Tick[]): Label[] => {
  if (spec.labels && spec.labels.length > 0) {
    return spec.labels;
  }

  return ticks
    .filter((_, index) => index % 2 === 0)
    .map((tick) => ({
      value: tick.value,
      text: tick.label ?? `${tick.value}`,
    }));
};

const makeValueText = (
  rawValue: number,
  spec: LinearScaleSpec,
  formatter?: (value: number, units?: string) => string
): string => {
  if (formatter) {
    return formatter(rawValue, spec.units);
  }

  return spec.units ? `${rawValue} ${spec.units}` : `${rawValue}`;
};

const getNormalVector = (layout: LinearScaleLayout): { nx: number; ny: number } => {
  const dx = layout.x2 - layout.x1;
  const dy = layout.y2 - layout.y1;
  const length = Math.hypot(dx, dy);

  if (length === 0) {
    return layout.orientation === "vertical" ? { nx: -1, ny: 0 } : { nx: 0, ny: 1 };
  }

  return { nx: -dy / length, ny: dx / length };
};

export const LinearScale: React.FC<LinearScaleProps> = ({
  spec,
  value,
  layout,
  className,
  style,
  alarmBlink,
  formatter,
}) => {
  const clampedValue = clamp(value, spec.min, spec.max);
  const quantizedValue = quantize(clampedValue, spec.step);

  const markerT = normalize(quantizedValue, spec.min, spec.max);
  const marker = pointOnLine(layout.x1, layout.y1, layout.x2, layout.y2, markerT);

  const ticks = buildTicks(spec);
  const labels = toLabels(spec, ticks);
  const tickSize = layout.tickSize ?? 8;
  const labelOffset = layout.labelOffset ?? 16;
  const markerRadius = Math.max(3, layout.thickness * 0.75);
  const valueText = makeValueText(quantizedValue, spec, formatter);

  const { nx, ny } = getNormalVector(layout);

  return (
    <g
      className={className}
      style={style}
      data-alarm-enabled={alarmBlink?.enabled ? "true" : "false"}
      data-alarm-hz={alarmBlink?.hz}
      data-alarm-type={alarmBlink?.type}
    >
      <line
        x1={layout.x1}
        y1={layout.y1}
        x2={layout.x2}
        y2={layout.y2}
        stroke="#334155"
        strokeWidth={layout.thickness}
        strokeLinecap="round"
      />

      {spec.zones.map((zone, index) => {
        const from = clamp(zone.from, spec.min, spec.max);
        const to = clamp(zone.to, spec.min, spec.max);
        if (to < from) return null;

        const fromPoint = pointOnLine(
          layout.x1,
          layout.y1,
          layout.x2,
          layout.y2,
          normalize(from, spec.min, spec.max)
        );
        const toPoint = pointOnLine(
          layout.x1,
          layout.y1,
          layout.x2,
          layout.y2,
          normalize(to, spec.min, spec.max)
        );

        return (
          <line
            key={`${zone.kind}-${zone.from}-${zone.to}-${index}`}
            x1={fromPoint.x}
            y1={fromPoint.y}
            x2={toPoint.x}
            y2={toPoint.y}
            stroke={zoneStroke[zone.kind]}
            strokeWidth={layout.thickness}
            strokeLinecap="butt"
          />
        );
      })}

      {ticks.map((tick, index) => {
        const clampedTick = clamp(tick.value, spec.min, spec.max);
        const t = normalize(clampedTick, spec.min, spec.max);
        const origin = pointOnLine(layout.x1, layout.y1, layout.x2, layout.y2, t);

        return (
          <line
            key={`tick-${tick.value}-${index}`}
            x1={origin.x}
            y1={origin.y}
            x2={origin.x + nx * tickSize}
            y2={origin.y + ny * tickSize}
            stroke="#cbd5e1"
            strokeWidth={1}
          />
        );
      })}

      {labels.map((label, index) => {
        const clampedLabel = clamp(label.value, spec.min, spec.max);
        const t = normalize(clampedLabel, spec.min, spec.max);
        const anchor = pointOnLine(layout.x1, layout.y1, layout.x2, layout.y2, t);

        return (
          <text
            key={`label-${label.value}-${label.text}-${index}`}
            x={anchor.x + nx * (tickSize + labelOffset)}
            y={anchor.y + ny * (tickSize + labelOffset) + 4}
            fill="#e2e8f0"
            fontSize={12}
            textAnchor={layout.orientation === "vertical" ? "end" : "middle"}
          >
            {label.text}
          </text>
        );
      })}

      <circle cx={marker.x} cy={marker.y} r={markerRadius} fill="#f8fafc" stroke="#0f172a" strokeWidth={1.5} />

      <text
        x={marker.x + nx * (markerRadius + 10)}
        y={marker.y + ny * (markerRadius + 10)}
        fill="#f8fafc"
        fontSize={12}
        textAnchor={layout.orientation === "vertical" ? "start" : "middle"}
      >
        {valueText}
      </text>
    </g>
  );
};

export default LinearScale;