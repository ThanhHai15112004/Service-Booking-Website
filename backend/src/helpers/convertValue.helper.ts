export const toInt = (v: any, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : d;
};

export const toFloat = (v: any, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

export const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export const parseStringArr = (v: any): string[] =>
  Array.isArray(v) ? v.map((x) => String(x).trim()).filter(Boolean) :
  typeof v === "string" && v.length ? v.split(",").map(s => s.trim()).filter(Boolean) : [];

export const parseChildAges = (v: any): number[] => {
  const arr = Array.isArray(v) ? v : typeof v === "string" ? v.split(",") : [];
  return arr
    .map((x) => Number(x))
    .filter((n) => Number.isFinite(n) && n >= 0 && n <= 17)
    .slice(0, 16); // giới hạn cho an toàn
};