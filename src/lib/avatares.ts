import a01 from "@/assets/avatars/avatar-01.png";
import a02 from "@/assets/avatars/avatar-02.png";
import a03 from "@/assets/avatars/avatar-03.png";
import a04 from "@/assets/avatars/avatar-04.png";
import a05 from "@/assets/avatars/avatar-05.png";
import a06 from "@/assets/avatars/avatar-06.png";
import a07 from "@/assets/avatars/avatar-07.png";
import a08 from "@/assets/avatars/avatar-08.png";
import a09 from "@/assets/avatars/avatar-09.png";
import a10 from "@/assets/avatars/avatar-10.png";
import a11 from "@/assets/avatars/avatar-11.png";
import a12 from "@/assets/avatars/avatar-12.png";

// Catalog of preset avatars. The `id` is what we store in profiles.avatar_url.
export interface AvatarPreset { id: string; src: string; label: string; }

export const AVATAR_CATALOG: AvatarPreset[] = [
  { id: "preset:01", src: a01, label: "Jugador Rojo" },
  { id: "preset:02", src: a02, label: "Jugadora Azul" },
  { id: "preset:03", src: a03, label: "Arquero" },
  { id: "preset:04", src: a04, label: "Árbitro" },
  { id: "preset:05", src: a05, label: "Capitán" },
  { id: "preset:06", src: a06, label: "Delantera" },
  { id: "preset:07", src: a07, label: "León" },
  { id: "preset:08", src: a08, label: "Águila" },
  { id: "preset:09", src: a09, label: "Escudo Rojo" },
  { id: "preset:10", src: a10, label: "Escudo Azul" },
  { id: "preset:11", src: a11, label: "Balón" },
  { id: "preset:12", src: a12, label: "Trofeo" },
];

export const DEFAULT_AVATAR_ID = "preset:11";

export function resolveAvatar(id: string | null | undefined): string | null {
  if (!id) return null;
  // External URL or data URL (custom uploaded photo)
  if (id.startsWith("http") || id.startsWith("data:")) return id;
  const found = AVATAR_CATALOG.find(a => a.id === id);
  return found?.src ?? null;
}

export function initialsFromName(name: string | null | undefined, fallback = "?"): string {
  if (!name) return fallback;
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map(p => p[0]?.toUpperCase() ?? "").join("") || fallback;
}
