import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const validarAdmin = (adminName: unknown, accessCode: unknown) => {
  const expected = Deno.env.get("ADMIN_ACCESS_CODE");
  return typeof adminName === "string" && adminName.trim().length >= 2 && typeof accessCode === "string" && !!expected && accessCode === expected;
};

const limpiarLista = (value: unknown) => {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0).map((item) => item.trim());
};

const limpiarSociales = (value: unknown) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const obj = value as Record<string, unknown>;
  return {
    instagram: typeof obj.instagram === "string" && obj.instagram.trim() ? obj.instagram.trim() : undefined,
    facebook: typeof obj.facebook === "string" && obj.facebook.trim() ? obj.facebook.trim() : undefined,
    website: typeof obj.website === "string" && obj.website.trim() ? obj.website.trim() : undefined,
  };
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { action, adminName, accessCode } = body;

    if (!validarAdmin(adminName, accessCode)) {
      return new Response(JSON.stringify({ success: false, error: "Acceso administrativo inválido" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    if (action === "reply_report") {
      const notes = typeof body.admin_notes === "string" ? body.admin_notes.trim() : "";
      const status = typeof body.status === "string" ? body.status : notes ? "resolved" : "in_progress";
      const { error } = await supabase
        .from("support_reports")
        .update({ admin_notes: notes || null, status, updated_at: new Date().toISOString() })
        .eq("id", body.id);

      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "update_cancha") {
      const cancha = body.cancha ?? {};
      const precioMin = Number(cancha.precio_min);
      const limpiarHourly = (value: unknown) => {
        if (!Array.isArray(value)) return [];
        return value
          .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
          .map((item) => ({
            hour: typeof item.hour === "string" ? item.hour.trim() : "",
            price: typeof item.price === "string" ? item.price.trim() : String(item.price ?? "").trim(),
          }))
          .filter((item) => item.hour && item.price);
      };
      const { error } = await supabase
        .from("canchas")
        .update({
          name: String(cancha.name ?? "").trim(),
          addr: String(cancha.addr ?? "").trim(),
          phone: cancha.phone ? String(cancha.phone).trim() : null,
          hours: cancha.hours ? String(cancha.hours).trim() : null,
          precio: cancha.precio ? String(cancha.precio).trim() : null,
          precio_min: Number.isFinite(precioMin) ? precioMin : null,
          tipo: cancha.tipo ? String(cancha.tipo).trim() : null,
          image_url: cancha.image_url ? String(cancha.image_url).trim() : null,
          servicios: limpiarLista(cancha.servicios),
          benefits: limpiarLista(cancha.benefits),
          gallery_urls: limpiarLista(cancha.gallery_urls),
          social_links: limpiarSociales(cancha.social_links),
          peak_hours: limpiarLista(cancha.peak_hours),
          low_hours: limpiarLista(cancha.low_hours),
          promotions: limpiarLista(cancha.promotions),
          entry_policies: limpiarLista(cancha.entry_policies),
          hourly_pricing: limpiarHourly(cancha.hourly_pricing),
          updated_at: new Date().toISOString(),
        })
        .eq("id", cancha.id);

      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ success: false, error: "Acción no soportada" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
