import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { messages, locale = "es" } = await req.json();
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages must be an array" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Build a general platform context from courts only.
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: canchas } = await supabase
      .from("canchas")
      .select("name, addr, hours, precio, precio_min, tipo, rating, reviews_count, servicios, benefits, social_links, phone")
      .order("rating", { ascending: false });

    const canchasContext = (canchas ?? []).map((c, i) => `${i + 1}. ${c.name} — ${c.tipo ?? "Cancha"} en ${c.addr}. Precio: ${c.precio ?? "N/D"} (desde ${c.precio_min ?? 0}). Horario: ${c.hours ?? "N/D"}. Rating general: ${c.rating ?? "N/D"} (${c.reviews_count ?? 0} reseñas registradas). Tel: ${c.phone ?? "N/D"}. Servicios: ${Array.isArray(c.servicios) ? c.servicios.join(", ") : ""}. Beneficios: ${Array.isArray(c.benefits) ? c.benefits.join(", ") : ""}`).join("\n");

    const langName = { es: "español", en: "English", pt: "português", de: "Deutsch" }[locale as string] ?? "español";

    const systemPrompt = `IMPORTANTE: Debes responder ÚNICAMENTE en ${langName} (código de idioma: ${locale}). Sin importar en qué idioma escriba el usuario, tu respuesta SIEMPRE debe estar en ${langName}. No mezcles idiomas.

Eres Ricky Bot, asistente oficial de "El Rincón Del Campeón", plataforma para reservar canchas de fútbol en Barranquilla.

Personalidad: amable, deportivo, conciso. Usa emojis con moderación (⚽🏆📅).

REGLA CLAVE DE RESPUESTA:
1. Por defecto da respuestas BREVES y GENERALES (1-3 frases). No abrumes con datos.
2. SOLO menciona detalles específicos como precio exacto, dirección, distancia, duración de transporte, rating numérico o lista completa de servicios cuando el usuario los pida explícitamente o cuando la pregunta no se pueda responder sin ellos.
3. Si preguntan "qué canchas hay", responde con los nombres y una idea general — sin volcar precios ni rutas.
4. Si preguntan "la más barata", "cerca de X", "con parqueadero", etc., entonces sí filtra usando los datos.
5. Para preguntas frecuentes (cómo reservar, horarios generales, contacto) responde de forma directa sin enumerar todas las canchas.

Si el usuario no está autenticado y quiere reservar, recuérdale que en "Cuenta" puede iniciar sesión (no obligatorio para chatear).

DATOS DE CANCHAS (úsalos solo cuando aplique según la regla anterior):
${canchasContext || "(sin datos)"}

Fuera de este dominio: respuesta breve y redirige a canchas.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit. Intenta en unos segundos." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "Sin créditos de IA. Contacta al administrador." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const errText = await response.text();
      console.error("AI gateway error", response.status, errText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(response.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
  } catch (e) {
    console.error("chat-ricky error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});