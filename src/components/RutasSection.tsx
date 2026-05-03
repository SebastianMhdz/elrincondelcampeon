import { useState, useEffect } from "react";
import { canchas as fallbackCanchas } from "@/data/canchas";
import type { Cancha } from "@/data/canchas";
import { Bus, Train, Car, Clock, ExternalLink, MapPin, Navigation, ArrowDown } from "lucide-react";
import { motion } from "framer-motion";
import type { Translation } from "@/lib/i18n";
import { getCanchas, subscribeToCanchasChanges } from "@/lib/canchas-bd";

interface Props { initialCancha?: Cancha | null; text: Translation; }

const RutasSection = ({ initialCancha, text }: Props) => {
  const [selectedId, setSelectedId] = useState<number | "">(initialCancha?.id ?? "");
  const [canchas, setCanchas] = useState<Cancha[]>(fallbackCanchas);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [selectedRouteType, setSelectedRouteType] = useState<"urbano" | "troncal" | "uber" | null>(null);
  const selected = selectedId !== "" ? canchas.find((c) => c.id === selectedId) : null;

  useEffect(() => { if (initialCancha) setSelectedId(initialCancha.id); }, [initialCancha]);
  useEffect(() => {
    let active = true;
    const load = () => getCanchas().then((rows) => { if (active) setCanchas(rows); });
    load();
    const unsubscribe = subscribeToCanchasChanges(load);
    return () => { active = false; unsubscribe(); };
  }, []);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => { setUserLat(pos.coords.latitude); setUserLng(pos.coords.longitude); },
      () => {},
      { enableHighAccuracy: true }
    );
  }, []);

  const cfg = {
    urbano: { icon: <Bus className="h-4 w-4" />, label: text.urban, className: "bg-transit-light text-transit", color: "border-blue-500/40 bg-blue-500/5" },
    troncal: { icon: <Train className="h-4 w-4" />, label: text.trunk, className: "bg-accent/15 text-accent", color: "border-orange-500/40 bg-orange-500/5" },
    uber: { icon: <Car className="h-4 w-4" />, label: text.rideshare, className: "bg-foreground/10 text-foreground", color: "border-emerald-500/40 bg-emerald-500/5" },
  };

  return (
    <div className="section-sport-panel rounded-[22px] p-5 md:p-6">
      <h2 className="mb-4 text-lg font-semibold text-foreground">{text.transportRoutes}</h2>
      <select value={selectedId} onChange={(e) => { setSelectedId(e.target.value === "" ? "" : Number(e.target.value)); setSelectedRouteType(null); }} className="mb-4 w-full rounded-lg border border-border bg-card p-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30">
        <option value="">{text.selectCourt}</option>
        {canchas.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      {selected && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {/* Route type selector */}
          <div className="flex flex-wrap gap-2">
            {(["urbano", "troncal", "uber"] as const).map((tipo) => {
              const hasRoutes = selected.rutas.some(r => r.tipo === tipo);
              if (!hasRoutes) return null;
              const c = cfg[tipo];
              return (
                <button key={tipo} onClick={() => setSelectedRouteType(tipo)}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${selectedRouteType === tipo ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:bg-accent"}`}
                >
                  {c.icon} {c.label}
                </button>
              );
            })}
          </div>

          {/* Route steps - point by point */}
          {(["urbano", "troncal", "uber"] as const).map((tipo) => {
            const list = selected.rutas.filter((r) => r.tipo === tipo);
            if (!list.length) return null;
            if (selectedRouteType && selectedRouteType !== tipo) return null;
            const c = cfg[tipo];
            return (
              <div key={tipo} className={`rounded-xl border p-4 ${c.color}`}>
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">{c.icon} {c.label}</h3>
                {/* Start point - user location */}
                <div className="relative">
                  <div className="flex items-start gap-3">
                    <div className="relative flex flex-col items-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-md">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div className="h-8 w-0.5 bg-primary/30" />
                    </div>
                    <div className="pt-1">
                      <p className="text-xs font-semibold text-foreground">{text.yourLocation}</p>
                      <p className="text-[11px] text-muted-foreground">{userLat ? `${userLat.toFixed(4)}, ${userLng?.toFixed(4)}` : text.notSharedYet}</p>
                    </div>
                  </div>

                  {/* Route stops */}
                  {list.map((r, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="relative flex flex-col items-center">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-card text-xs font-bold text-primary shadow-sm">
                          {i + 1}
                        </div>
                        {i < list.length - 1 && <div className="h-8 w-0.5 bg-primary/20" />}
                        {i === list.length - 1 && <div className="h-8 w-0.5 bg-accent/30" />}
                      </div>
                      <div className="flex-1 pt-1 pb-3">
                        <div className="flex items-center gap-2">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${c.className}`}>{r.linea}</span>
                        </div>
                        <p className="mt-1 text-sm font-medium text-foreground">{r.parada}</p>
                        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Navigation className="h-3 w-3 text-primary" /> {r.distancia}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-primary" /> ~{r.duracion}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* End point - destination */}
                  <div className="flex items-start gap-3">
                    <div className="relative flex flex-col items-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground shadow-md">
                        ⚽
                      </div>
                    </div>
                    <div className="pt-1">
                      <p className="text-xs font-semibold text-foreground">{selected.name}</p>
                      <p className="text-[11px] text-muted-foreground">{selected.addr}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* External apps */}
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
