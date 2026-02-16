export const clamp = (value: number, min: number, max: number): number => {
  if (min > max) return value;
  return Math.min(max, Math.max(min, value));
};

export const normalize = (value: number, min: number, max: number): number => {
  if (max === min) return 0;
  return (value - min) / (max - min);
};

export const lerp = (start: number, end: number, t: number): number => {
  return start + (end - start) * t;
};

export const pointOnLine = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  t: number
): { x: number; y: number } => ({
  x: lerp(x1, x2, t),
  y: lerp(y1, y2, t),
});