export function sanitizeNumber(n: any, def: number, min?: number, max?: number) {
  let v = Number(n);
  if (!Number.isFinite(v)) v = def;
  if (typeof min === "number") v = Math.max(min, v);
  if (typeof max === "number") v = Math.min(max, v);
  return v;
}

export function sanitizeArrayStrings(a: any, max = 50) {
  if (!Array.isArray(a)) return [];
  return a
    .slice(0, max)
    .map((s) => String(s).trim())
    .filter((s) => s.length > 0);
}