// src/spec/parameters.ts
// Спецификация параметров приборной панели по ТЗ (таблица А.5) + общие требования мерцания.
//
// Примечания:
// - Для tОЖ есть 2 режима порогов: "water" (вода) и "antifreeze" (антифриз).
// - Для РСМ.ГМТ нижний порог зависит от режима: "parked" (*) и "moving" (**).
// - Для топлива аварийный порог в ТЗ помечен "***" (не задан). Принято допущение:
//   авария при <= 1/8 бака. Если нужно — поменяй FUEL_CRITICAL_FRACTION.

export type ParamId =
  | "speed"
  | "rpm"
  | "fuel"
  | "coolantTemp"
  | "engineOilTemp"
  | "hydroOilTemp"
  | "engineOilPressure"
  | "hydroSystemPressure"
  | "hydroControlPressure"
  | "voltage";

export type Severity = "normal" | "warn" | "alarm";
export type ZoneKind = "red" | "green" | "yellow" | "alarm";

export type BlinkType = 0 | 1 | 2 | 3; // 0-нет, 1-сливание, 2-инверсия, 3-прозрачность до 0
export type BlinkHz = 0.5 | 1 | 2 | 4;

export type CoolantMode = "water" | "antifreeze";
export type MotionMode = "parked" | "moving";

export type EnvContext = {
  coolantMode: CoolantMode;
  motionMode: MotionMode;
};

export type Range = {
  /** inclusive */
  from: number;
  /** inclusive */
  to: number;
};

export type ZoneSpec = {
  kind: ZoneKind;
  ranges: Range[];
  /** Для аварийных зон можно включить мерцание (по ТЗ частоты и типы задаются общими требованиями) */
  severity?: Severity;
};

export type ParameterSpec = {
  id: ParamId;
  label: string;
  unit: string;
  /** шаг (ед. младшего разряда) */
  step: number;
  /** период обновления по ТЗ ~1 сек */
  periodMs: number;
  /** диапазон шкалы (для отрисовки) */
  scale: Range;
  /** зоны по секторам */
  zones: ZoneSpec[];
  /** источник (датчик) из ТЗ, если указан */
  sensor?: string;
  /** дополнительные пояснения/примечания */
  note?: string;
  /** функция выбора зон при разных режимах (если есть зависимость от контекста) */
  resolveZones?: (ctx: EnvContext) => ZoneSpec[];
};

export const DASHBOARD_DEFAULTS = {
  periodMs: 1000,
  // Общие требования мерцания по ТЗ
  blink: {
    allowedHz: [0.5, 1, 2, 4] as const,
    allowedTypes: [0, 1, 2, 3] as const,
    defaultAlarm: { type: 3 as BlinkType, hz: 1 as BlinkHz }, // разумный дефолт
  },
};

// --- Утилиты ---
const r = (from: number, to: number): Range => ({ from, to });

const z = (kind: ZoneKind, ranges: Range[], severity?: Severity): ZoneSpec => ({
  kind,
  ranges,
  severity,
});

const clampScale = (scale: Range, ranges: Range[]): Range[] => {
  const out: Range[] = [];
  for (const x of ranges) {
    const a = Math.max(scale.from, x.from);
    const b = Math.min(scale.to, x.to);
    if (a <= b) out.push({ from: a, to: b });
  }
  return out;
};

// --- Топливо: допущение по аварийному порогу ---
export const FUEL_CRITICAL_FRACTION = 1 / 8; // <= 12.5% бака (можно изменить)
export const FUEL_WARN_FRACTION = 1 / 4; // <= 25% бака (жёлтый по ТЗ)

// --- Спеки ---
export const PARAMETERS: Record<ParamId, ParameterSpec> = {
  // V, км/ч (в ТЗ зелёный весь диапазон)
  speed: {
    id: "speed",
    label: "Скорость",
    unit: "км/ч",
    step: 1,
    periodMs: 1000,
    scale: r(0, 200),
    zones: [z("green", [r(0, 200)], "normal")],
    note: "По ТЗ для скорости задан зелёный сектор на весь диапазон.",
  },

  // nДВ, об/мин
  rpm: {
    id: "rpm",
    label: "Обороты",
    unit: "об/мин",
    step: 50,
    periodMs: 1000,
    scale: r(0, 3200),
    zones: [
      z("red", clampScale(r(0, 3200), [r(0, 899)]), "warn"),
      z("yellow", clampScale(r(0, 3200), [r(900, 1200), r(2600, 2900)]), "warn"),
      z("green", clampScale(r(0, 3200), [r(1200, 2600)]), "normal"),
      z("alarm", clampScale(r(0, 3200), [r(2901, 3200)]), "alarm"),
    ],
  },

  // Объём топлива (доли от бака)
  fuel: {
    id: "fuel",
    label: "Топливо",
    unit: "доля",
    step: 0.01,
    periodMs: 1000,
    scale: r(0, 1),
    zones: [
      z("green", [r(FUEL_WARN_FRACTION + 0.0001, 1)], "normal"),
      z("yellow", [r(FUEL_CRITICAL_FRACTION + 0.0001, FUEL_WARN_FRACTION)], "warn"),
      z("alarm", [r(0, FUEL_CRITICAL_FRACTION)], "alarm"),
    ],
    note:
      "По ТЗ шкала долями бака. Аварийный уровень топлива в таблице помечен *** (не задан); принято <= 1/8.",
  },

  // tОЖ, °C (вода/антифриз)
  coolantTemp: {
    id: "coolantTemp",
    label: "t ОЖ",
    unit: "°C",
    step: 1,
    periodMs: 1000,
    scale: r(-10, 140),
    zones: [],
    sensor: "ДТ3",
    note: "Пороги зависят от типа ОЖ: вода/антифриз.",
    resolveZones: (ctx: EnvContext) => {
      const scale = r(-10, 140);

      if (ctx.coolantMode === "antifreeze") {
        // антифриз: красн <0, жёлт 5..55 и 95..105, зел 55..95, авар >105
        return [
          z("red", clampScale(scale, [r(-10, -1)]), "warn"),
          z("yellow", clampScale(scale, [r(5, 55), r(95, 105)]), "warn"),
          z("green", clampScale(scale, [r(55, 95)]), "normal"),
          z("alarm", clampScale(scale, [r(106, 140)]), "alarm"),
        ];
      }

      // вода: красн <5, жёлт 5..55 и 120..125, зел 55..120, авар >125
      return [
        z("red", clampScale(scale, [r(-10, 4)]), "warn"),
        z("yellow", clampScale(scale, [r(5, 55), r(120, 125)]), "warn"),
        z("green", clampScale(scale, [r(55, 120)]), "normal"),
        z("alarm", clampScale(scale, [r(126, 140)]), "alarm"),
      ];
    },
  },

  // tМ.ДВ, °C (масло двигателя)
  engineOilTemp: {
    id: "engineOilTemp",
    label: "t М.ДВ",
    unit: "°C",
    step: 1,
    periodMs: 1000,
    scale: r(0, 150),
    sensor: "ДТ1",
    zones: [
      z("green", [r(0, 119)], "normal"),
      z("yellow", [r(120, 125)], "warn"),
      z("alarm", [r(126, 150)], "alarm"),
    ],
  },

  // tМ.ГМТ, °C (масло гидромеханической трансмиссии)
  hydroOilTemp: {
    id: "hydroOilTemp",
    label: "t М.ГМТ",
    unit: "°C",
    step: 1,
    periodMs: 1000,
    scale: r(0, 160),
    sensor: "ДТ2",
    zones: [
      z("green", [r(0, 124)], "normal"),
      z("yellow", [r(125, 130)], "warn"),
      z("alarm", [r(131, 160)], "alarm"),
    ],
  },

  // РМ.ДВ, кг/см² (давление масла двигателя)
  engineOilPressure: {
    id: "engineOilPressure",
    label: "Р М.ДВ",
    unit: "кг/см²",
    step: 0.1,
    periodMs: 1000,
    scale: r(0, 16),
    sensor: "ДД1",
    zones: [
      z("red", [r(0, 2.49)], "warn"), // <2.5
      z("green", [r(2.5, 12)], "normal"),
      z("yellow", [r(12, 14)], "warn"),
      z("alarm", [r(14.01, 16)], "alarm"), // >14
    ],
  },

  // РСМ.ГМТ, кг/см² (давление смазки ГМТ)
  hydroSystemPressure: {
    id: "hydroSystemPressure",
    label: "Р СМ.ГМТ",
    unit: "кг/см²",
    step: 0.05,
    periodMs: 1000,
    scale: r(0, 6),
    sensor: "ДД2",
    zones: [],
    note: "Нижний порог зависит от режима: * стоянка, ** движение.",
    resolveZones: (ctx: EnvContext) => {
      const scale = r(0, 6);
      const low = ctx.motionMode === "moving" ? 2 : 0.35;

      return [
        z("red", clampScale(scale, [r(0, low - 0.0001)]), "warn"),
        z("green", clampScale(scale, [r(low, 4)]), "normal"),
        z("alarm", clampScale(scale, [r(4.0001, 6)]), "alarm"),
      ];
    },
  },

  // РУПР.ГМТ, кг/см²
  hydroControlPressure: {
    id: "hydroControlPressure",
    label: "Р УПР.ГМТ",
    unit: "кг/см²",
    step: 0.1,
    periodMs: 1000,
    scale: r(0, 30),
    sensor: "ДД3",
    zones: [
      z("red", [r(0, 11.99)], "warn"),
      z("green", [r(12, 25)], "normal"),
      z("alarm", [r(25.01, 30)], "alarm"),
    ],
  },

  // U, В
  voltage: {
    id: "voltage",
    label: "U",
    unit: "В",
    step: 0.5,
    periodMs: 1000,
    scale: r(0, 32),
    zones: [
      z("red", [r(0, 22.49)], "warn"),
      z("green", [r(22.5, 28.5)], "normal"),
      z("alarm", [r(28.51, 32)], "alarm"),
    ],
  },
};

// Удобный доступ с учетом контекста (режимы ОЖ и движения)
export const getParameterSpec = (id: ParamId, ctx: EnvContext): ParameterSpec => {
  const base = PARAMETERS[id];
  if (!base) throw new Error(`Unknown parameter spec: ${id}`);

  if (base.resolveZones) {
    return {
      ...base,
      zones: base.resolveZones(ctx),
    };
  }

  return base;
};

// Определение зоны/серьёзности по значению
export const evaluateZones = (
  spec: ParameterSpec,
  value: number
): { zone: ZoneKind; severity: Severity } => {
  for (const zone of spec.zones) {
    for (const rr of zone.ranges) {
      if (value >= rr.from && value <= rr.to) {
        return {
          zone: zone.kind,
          severity: zone.severity ?? (zone.kind === "alarm" ? "alarm" : "normal"),
        };
      }
    }
  }
  return { zone: "green", severity: "normal" };
};

// Округление по "шагу младшего разряда"
export const quantize = (value: number, step: number): number => {
  if (!isFinite(value) || step <= 0) return value;
  const k = 1 / step;
  return Math.round(value * k) / k;
};