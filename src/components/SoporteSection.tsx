import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { canchas } from "@/data/canchas";
import { Phone, MessageCircle, Send, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Translation } from "@/lib/i18n";

const SoporteSection = ({ text }: { text: Translation }) => {
  const { toast } = useToast();
  const [asunto, setAsunto] = useState(text.reservationProblem);
  const [nombre, setNombre] = useState("");
  const [contacto, setContacto] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [sent, setSent] = useState(false);
  const [telCancha, setTelCancha] = useState("");
  const [waCancha, setWaCancha] = useState("");

  const llamar = () => {
    if (!telCancha) { toast({ title: text.selectCourtShort, variant: "destructive" }); return; }
    window.open(`tel:${canchas[Number(telCancha)].phone}`);
  };
  const abrirWA = () => {
    if (!waCancha) { toast({ title: text.selectCourtShort, variant: "destructive" }); return; }
    const c = canchas[Number(waCancha)];
    window.open(`https://wa.me/${c.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola! Info sobre ${c.name}.`)}`, "_blank");
  };
  const enviar = async () => {
    if (!nombre || !mensaje) { toast({ title: text.completeNameMessage, variant: "destructive" }); return; }
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("support_reports").insert({
      user_id: user?.id ?? null,
      name: nombre,
      email: contacto || (user?.email ?? "no-email"),
      subject: asunto,
      message: mensaje,
      category: "general",
    });
    if (error) { toast({ title: text.errorTitle, description: error.message, variant: "destructive" }); return; }
    setSent(true);
  };

  const inputClass = "w-full rounded-lg border border-border bg-card p-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30";
  const labelClass = "mb-1.5 block text-sm font-medium text-muted-foreground";

  return (
    <div className="section-sport-panel rounded-[22px] p-5 md:p-6">
      <h2 className="mb-4 text-lg font-semibold text-foreground">{text.supportContact}</h2>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 text-center">
          <Phone className="mx-auto mb-2 h-8 w-8 text-primary" />
          <h3 className="mb-1 text-sm font-semibold text-foreground">{text.directCall}</h3>
          <p className="mb-3 text-xs text-muted-foreground">{text.callAdmin}</p>
          <select value={telCancha} onChange={(e) => setTelCancha(e.target.value)} className={`${inputClass} mb-2 text-xs`}>
            <option value="">{text.selectCourtShort}</option>
            {canchas.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button onClick={llamar} className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">{text.callNow}</button>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 text-center">
          <MessageCircle className="mx-auto mb-2 h-8 w-8 text-primary" />
          <h3 className="mb-1 text-sm font-semibold text-foreground">{text.whatsappCard}</h3>
          <p className="mb-3 text-xs text-muted-foreground">{text.writeBusiness}</p>
          <select value={waCancha} onChange={(e) => setWaCancha(e.target.value)} className={`${inputClass} mb-2 text-xs`}>
            <option value="">{text.selectCourtShort}</option>
            {canchas.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button onClick={abrirWA} className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90">{text.openWhatsapp}</button>
        </div>
      </div>
      {sent ? (
        <div className="rounded-xl border border-accent/30 bg-accent/10 p-8 text-center">
          <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-accent" />
          <h3 className="mb-1 text-lg font-bold text-foreground">{text.messageSent}</h3>
          <p className="text-sm text-muted-foreground">{text.willReplySoon}</p>
        </div>
      ) : (
        <div className="space-y-4 rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground">{text.supportForm}</h3>
          <div>
            <label className={labelClass}>{text.subject}</label>
            <select value={asunto} onChange={(e) => setAsunto(e.target.value)} className={inputClass}>
              <option>{text.reservationProblem}</option><option>{text.serviceComplaint}</option><option>{text.priceQuery}</option><option>{text.requestInfo}</option><option>{text.other}</option>
            </select>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><label className={labelClass}>{text.name}</label><input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder={text.yourName} className={inputClass} /></div>
            <div><label className={labelClass}>{text.contactInfo}</label><input value={contacto} onChange={(e) => setContacto(e.target.value)} className={inputClass} /></div>
          </div>
          <div>
            <label className={labelClass}>{text.message}</label>
            <textarea value={mensaje} onChange={(e) => setMensaje(e.target.value)} placeholder={text.describeQuery} className={`${inputClass} min-h-[80px] resize-y`} />
          </div>
          <button onClick={enviar} className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">
            <Send className="h-4 w-4" /> {text.sendMessage}
          </button>
        </div>
      )}
    </div>
  );
};

export default SoporteSection;
