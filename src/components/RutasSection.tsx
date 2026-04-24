import { useState, useEffect } from "react";
import { canchas } from "@/data/canchas";
import type { Cancha } from "@/data/canchas";
import { Bus, Train, Car, Clock, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import type { Translation } from "@/lib/i18n";

interface Props { initialCancha?: Cancha | null; text: Translation; }

const RutasSection = ({ initialCancha, text }: Props) => {
  const [selectedId, setSelectedId] = useState<number | "">(initialCancha?.id ?? "");
  const selected = selectedId !== "" ? canchas.find((c) => c.id === selectedId) : null;
  useEffect(() => { if (initialCancha) setSelectedId(initialCancha.id); }, [initialCancha]);

  const cfg = {
    urbano: { icon: <Bus className="h-4 w-4" />, label: text.urban, className: "bg-transit-light text-transit" },
    troncal: { icon: <Train className="h-4 w-4" />, label: text.trunk, className: "bg-accent/15 text-accent" },
    uber: { icon: <Car className="h-4 w-4" />, label: text.rideshare, className: "bg-foreground/10 text-foreground" },
  };

  return (
    <div className="section-sport-panel rounded-[22px] p-5 md:p-6">
      <h2 className="mb-4 text-lg font-semibold text-foreground">{text.transportRoutes}</h2>
      <select value={selectedId} onChange={(e) => setSelectedId(e.target.value === "" ? "" : Number(e.target.value))} className="mb-4 w-full rounded-lg border border-border bg-card p-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30">
        <option value="">{text.selectCourt}</option>
        {canchas.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      {selected && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {(["urbano", "troncal", "uber"] as const).map((tipo) => {
            const list = selected.rutas.filter((r) => r.tipo === tipo);
            if (!list.length) return null;
            const c = cfg[tipo];
            return (
              <div key={tipo} className="rounded-xl border border-border bg-card p-4">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">{c.icon} {c.label}</h3>
                {list.map((r, i) => (
                  <div key={i} className="mb-3 flex items-start gap-3 last:mb-0">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{i + 1}</div>
                    <div className="flex-1">
                      <span className={`mb-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${c.className}`}>{r.linea}</span>
                      <p className="text-sm text-muted-foreground">{r.parada}</p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{r.distancia}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-time" /> ~{r.duracion}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">📱 {text.planWithApps}</h3>
            <div className="space-y-2">
              <a href="https://moovitapp.com/index/es/transporte_p%C3%BAblico-Barranquilla-2248" target="_blank" rel="noreferrer" className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">{text.openMoovit} <ExternalLink className="h-3.5 w-3.5" /></a>
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${selected.lat},${selected.lng}&travelmode=transit`} target="_blank" rel="noreferrer" className="flex w-full items-center justify-center gap-2 rounded-lg border border-primary bg-secondary py-2.5 text-sm font-semibold text-secondary-foreground hover:bg-secondary/80">{text.openGoogleMaps} <ExternalLink className="h-3.5 w-3.5" /></a>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default RutasSection;
