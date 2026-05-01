// Parser para el campo `hours` libre de cada cancha.
// Devuelve, para un día de la semana (0=Dom..6=Sáb), una lista de rangos en minutos [start, end).
// end > 1440 indica que el rango cruza medianoche y termina al día siguiente.

export type Rango = [number, number];

const DIAS: Record<string, number> = {
  dom: 0, sun: 0,
  lun: 1, mon: 1,
  mar: 2, tue: 2,
  mie: 3, mié: 3, wed: 3,
  jue: 4, thu: 4,
  vie: 5, fri: 5,
  sab: 6, sáb: 6, sat: 6,
};

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const parseDayToken = (token: string): number | null => {
  const t = norm(token).slice(0, 3);
  return DIAS[t] ?? null;
};

// Devuelve set de días aplicables a partir de una expresión como
// "Lun-Dom", "Lun–Dom", "Mar-Dom", "Lun"
const parseDayRange = (raw: string): Set<number> => {
  const out = new Set<number>();
  if (!raw) return out;
  const piece = raw.replace(/\s+/g, "").replace(/[–—]/g, "-");
  const parts = piece.split("-");
  if (parts.length === 1) {
    const d = parseDayToken(parts[0]);
    if (d != null) out.add(d);
    return out;
  }
  const a = parseDayToken(parts[0]);
  const b = parseDayToken(parts[1]);
  if (a == null || b == null) return out;
  let i = a;
  for (let safety = 0; safety < 8; safety++) {
    out.add(i);
    if (i === b) break;
    i = (i + 1) % 7;
  }
  return out;
};

const parseTime = (raw: string): number | null => {
  const m = raw.replace(/\s+/g, "").toUpperCase().match(/^(\d{1,2})(?::(\d{2}))?(AM|PM)?$/);
  if (!m) return null;
  let hh = Number(m[1]);
  const mm = Number(m[2] ?? 0);
  const ap = m[3];
  if (ap === "AM") {
    if (hh === 12) hh = 0;
  } else if (ap === "PM") {
    if (hh !== 12) hh += 12;
  }
  return hh * 60 + mm;
};

// Devuelve el rango horario para un segmento como "6AM-12AM" o "24h"
// Si el end es menor o igual al start, asumimos cruce de medianoche => end += 1440
const parseTimeRange = (raw: string): Rango | null => {
  const t = raw.replace(/\s+/g, "").replace(/[–—]/g, "-").toUpperCase();
  if (/^(24H|24HORAS|ABIERTO24|24)$/.test(t)) return [0, 1440];
  const m = t.match(/^(\d{1,2}(?::\d{2})?(?:AM|PM)?)-(\d{1,2}(?::\d{2})?(?:AM|PM)?)$/);
  if (!m) return null;
  const s = parseTime(m[1]);
  let e = parseTime(m[2]);
  if (s == null || e == null) return null;
  if (e <= s) e += 1440;
  return [s, e];
};

// Devuelve, para cada día (0..6), la lista de rangos horarios disponibles en minutos.
// Cualquier rango que cruce medianoche se "envuelve" agregando un sub-rango al día siguiente.
export const parseHours = (hoursText: string | null | undefined): Map<number, Rango[]> => {
  const map = new Map<number, Rango[]>();
  if (!hoursText) {
    // Default: abierto 24h todos los días
    for (let d = 0; d < 7; d++) map.set(d, [[0, 1440]]);
    return map;
  }
  const text = norm(hoursText);
  // "abierto 24 horas" o "24h"
  if (/24\s*h(oras)?/.test(text) && !/lun|mar|mie|jue|vie|sab|dom/.test(text.replace(/24h/g, ""))) {
    for (let d = 0; d < 7; d++) map.set(d, [[0, 1440]]);
    return map;
  }
  // separar por "/" o "," en segmentos
  const segments = hoursText.split(/[/,;]+/).map((s) => s.trim()).filter(Boolean);
  for (const seg of segments) {
    // formato: <dias> <rango>  ej: "Lun–Dom 6AM – 12AM"  o  "Lun 7AM-10PM"
    // Extraer la parte de dias (todo lo no-numerico inicial) y la parte horaria (lo que tenga digitos)
    const m = seg.match(/^([A-Za-zÁÉÍÓÚáéíóúüÜ\-–—\s]+?)\s+(.+)$/);
    if (!m) continue;
    const daysPart = m[1].trim();
    const timePart = m[2].trim();
    const days = parseDayRange(daysPart);
    if (days.size === 0) continue;
    let range: Rango | null = null;
    if (/24\s*h/i.test(timePart)) range = [0, 1440];
    else range = parseTimeRange(timePart);
    if (!range) continue;
    for (const d of days) {
      const arr = map.get(d) ?? [];
      if (range[1] > 1440) {
        // cruce de medianoche: rango original recortado al día + sobrante al día siguiente
        arr.push([range[0], 1440]);
        const nextDay = (d + 1) % 7;
        const overflow = map.get(nextDay) ?? [];
        overflow.push([0, range[1] - 1440]);
        map.set(nextDay, overflow);
      } else {
        arr.push(range);
      }
      map.set(d, arr);
    }
  }
  if (map.size === 0) {
    // No pudimos parsear: por seguridad devolver 24h
    for (let d = 0; d < 7; d++) map.set(d, [[0, 1440]]);
  }
  return map;
};

// Para un día específico (date) y una hora exacta en minutos, ¿está abierta la cancha?
export const isOpenAt = (
  schedule: Map<number, Rango[]>,
  date: Date,
  minutes: number,
): boolean => {
  const ranges = schedule.get(date.getDay()) ?? [];
  return ranges.some(([s, e]) => minutes >= s && minutes < e);
};

// ¿Está abierto al menos algún momento en este día?
export const isDayOpen = (schedule: Map<number, Rango[]>, date: Date): boolean => {
  return (schedule.get(date.getDay()) ?? []).length > 0;
};

// Devuelve un texto humano del día (índice 0..6) -> "Lun", "Mar", etc.
export const DAY_LABELS_ES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

// Derivar lista de modalidades a partir del campo `tipo` (ej: "Fútbol 5 y 6", "Fútbol 8 (8×8)")
export const parseModalidades = (tipo: string | null | undefined): string[] => {
  if (!tipo) return ["Fútbol 5 (10 jug.)"];
  const t = tipo.toLowerCase();
  // Buscar todos los números de modalidad
  const nums = Array.from(t.matchAll(/(\d+)/g)).map((m) => Number(m[1]));
  const uniq = Array.from(new Set(nums)).filter((n) => n >= 3 && n <= 11);
  if (uniq.length === 0) return [tipo];
  return uniq.map((n) => `Fútbol ${n} (${n * 2} jug.)`);
};
