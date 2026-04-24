import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { messages, locale = "es" } = await req.json();
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages must be an array" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Build context from canchas + reviews
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: canchas } = await supabase.from("canchas").select("name, addr, hours, precio, precio_min, tipo, rating, reviews_count, servicios, phone").order("rating", { ascending: false });
    const { data: topReviews } = await supabase.from("cancha_reviews").select("rating, comment, canchas(name)").order("rating", { ascending: false }).limit(10);

    const canchasContext = (canchas ?? []).map((c, i) => `${i + 1}. ${c.name} — ${c.tipo ?? "Cancha"} en ${c.addr}. Precio: ${c.precio ?? "N/D"} (desde ${c.precio_min ?? 0}). Horario: ${c.hours ?? "N/D"}. Rating: ${c.rating ?? "N/D"} (${c.reviews_count ?? 0} reseñas). Tel: ${c.phone ?? "N/D"}. Servicios: ${Array.isArray(c.servicios) ? c.servicios.join(", ") : ""}`).join("\n");

    const reviewsContext = (topReviews ?? []).map((r: any) => `• ${r.canchas?.name ?? "?"} (${r.rating}★): "${r.comment}"`).join("\n");

    const langName = { es: "español", en: "English", pt: "português", de: "Deutsch" }[locale as string] ?? "español";

    const systemPrompt = `Eres Ricky Bot, asistente oficial de "El Rincón Del Campeón", una plataforma para reservar canchas de fútbol en Barranquilla, Colombia. Responde SIEMPRE en ${langName}.

Tu personalidad: amable, deportivo, experto, conciso. Usa emojis con moderación (⚽🏆📅).

Capacidades:
- Recomendar canchas según preferencias (precio, ubicación, servicios, rating).
- Calcular costos (precio_por_hora × horas + extras).
- Explicar horarios y disponibilidad.
- Mostrar canchas mejor calificadas.
- Guiar al usuario sobre cómo reservar, registrarse o iniciar sesión.
- Responder preguntas frecuentes.

Si el usuario no está autenticado y necesita reservar, recuérdale amablemente que puede iniciar sesión en la sección "Cuenta" para guardar su reserva, pero NO es obligatorio para hacerte preguntas.

CANCHAS DISPONIBLES:
${canchasContext || "(sin datos)"}

RESEÑAS DESTACADAS:
${reviewsContext || "(aún sin reseñas)"}

Si te preguntan algo fuera de este dominio, responde brevemente y redirige al tema de canchas.`;

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
    console.error("ricky-chat error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});