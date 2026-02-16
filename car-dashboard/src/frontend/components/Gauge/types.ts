import type { ZoneKind } from "spec/parameters";

export type ScaleRange = {
  min: number;
  max: number;
};

export type Zone = {
  kind: ZoneKind;
  from: number;
  to: number;
};

export type Tick = {
  value: number;
  label?: string;
};

export type Label = {
  value: number;
  text: string;
};

// spec описывает числовой диапазон и визуальные зоны шкалы.
export type LinearScaleSpec = ScaleRange & {
  step: number;
  units?: string;
  zones: Zone[];
  ticks?: Tick[];
  labels?: Label[];
};

// layout описывает геометрию линии шкалы внутри SVG.
export type LinearScaleLayout = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  thickness: number;
  tickSize?: number;
  labelOffset?: number;
  orientation: "horizontal" | "vertical";
};

export type AlarmBlink = {
  enabled: boolean;
  hz: 0.5 | 1 | 2 | 4;
  type: 1 | 2 | 3;
};