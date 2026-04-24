import type { Cancha, Ruta } from "@/data/canchas";
import { canchas as fallbackCanchas } from "@/data/canchas";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type CanchaRow = Tables<"canchas">;

const parseStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
};

const parseRutas = (value: unknown): Ruta[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is Ruta => {
    if (!item || typeof item !== "object") return false;
    const ruta = item as Record<string, unknown>;
    return ["tipo", "linea", "parada", "distancia", "duracion"].every((key) => typeof ruta[key] === "string");
  }) as Ruta[];
};

export const mapCanchaRow = (row: CanchaRow, fallbackImage?: string): Cancha => ({
  id: row.legacy_id ?? 0,
  name: row.name,
  addr: row.addr,
  lat: row.lat,
  lng: row.lng,
  rating: Number(row.rating ?? 0),
  reviews_count: row.reviews_count ?? 0,
  phone: row.phone ?? "",
  hours: row.hours ?? "Horario no disponible",
  precio: row.precio ?? "Consultar precio",
  precioMin: row.precio_min ?? 0,
  servicios: parseStringArray(row.servicios),
  rutas: parseRutas(row.rutas),
  reviews: parseStringArray(row.reviews),
  icon: row.icon ?? "⚽",
  tipo: row.tipo ?? "Cancha sintética",
  image: row.image_url || fallbackImage || fallbackCanchas[row.legacy_id ?? 0]?.image || fallbackCanchas[0].image,
});

export const getCanchas = async (): Promise<Cancha[]> => {
  const { data, error } = await supabase.from("canchas").select("*").order("legacy_id", { ascending: true });

  if (error || !data?.length) {
    return fallbackCanchas;
  }

  return data.map((row) => mapCanchaRow(row, fallbackCanchas[row.legacy_id ?? 0]?.image));
};