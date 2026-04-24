import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { adminName, accessCode } = await req.json();
    const expected = Deno.env.get("ADMIN_ACCESS_CODE");

    if (!adminName || typeof adminName !== "string" || adminName.trim().length < 2) {
      return new Response(JSON.stringify({ success: false, error: "Nombre inválido" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!expected || accessCode !== expected) {
      return new Response(JSON.stringify({ success: false, error: "Código inválido" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const ipInfo = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? null;

    const { error: logError } = await supabase.from("admin_logs").insert({
      admin_name: adminName.trim(),
      ip_info: ipInfo,
    });

    if (logError) {
      console.error("Log insert error:", logError);
    }

    return new Response(JSON.stringify({ success: true, name: adminName.trim() }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
