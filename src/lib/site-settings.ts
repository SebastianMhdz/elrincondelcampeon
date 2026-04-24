import { supabase } from "@/integrations/supabase/client";

export type BrandingSettings = {
  siteName: string;
  tagline: string;
  phone: string;
  address: string;
  authors: string[];
  footerNote: string;
};

export const defaultBranding: BrandingSettings = {
  siteName: "El Rincon Del Campeon",
  tagline: "Encuentra, compara y reserva la mejor cancha para tu partido y diversión en Barranquilla",
  phone: "3014790433",
  address: "Cra 13B 75-17",
  authors: ["Carlos Vargas", "Sebastian Mejia", "Sofia Hernandez", "Carlos Reales"],
  footerNote: "Un Proyecto de los estudiantes de la CUC, Derechos Reservados",
};

export const getBrandingSettings = async (): Promise<BrandingSettings> => {
  const { data } = await supabase
    .from("site_settings")
    .select("setting_value")
    .eq("setting_key", "branding")
    .maybeSingle();

  if (!data?.setting_value || typeof data.setting_value !== "object") return defaultBranding;

  const value = data.setting_value as Partial<BrandingSettings>;
  return {
    siteName: value.siteName ?? defaultBranding.siteName,
    tagline: value.tagline ?? defaultBranding.tagline,
    phone: value.phone ?? defaultBranding.phone,
    address: value.address ?? defaultBranding.address,
    authors: Array.isArray(value.authors) ? value.authors.filter((item): item is string => typeof item === "string") : defaultBranding.authors,
    footerNote: value.footerNote ?? defaultBranding.footerNote,
  };
};