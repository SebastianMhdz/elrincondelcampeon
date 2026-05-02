import { useState, useEffect } from "react";
import { canchas as fallbackCanchas } from "@/data/canchas";
import type { Cancha } from "@/data/canchas";
import { Bus, Train, Car, Clock, ExternalLink, MapPin, Navigation } from "lucide-react";
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
    urbano: { icon: <Bus className="h-4 w-4" />, label: text.urban, className: "bg-transit-light text-transit", travelMode: "transit" },
    troncal: { icon: <Train className="h-4 w-4" />, label: text.trunk, className: "bg-accent/15 text-accent", travelMode: "transit" },
    uber: { icon: <Car className="h-4 w-4" />, label: text.rideshare, className: "bg-foreground/10 text-foreground", travelMode: "driving" },
  };

  const getMapUrl = () => {
    if (!selected) return "";
    const origin = userLat && userLng ? `${userLat},${userLng}` : "";
    const dest = `${selected.lat},${selected.lng}`;
    const mode = selectedRouteType ? cfg[selectedRouteType].travelMode : "transit";
    if (origin) {
      return `https://www.google.com/maps/embed/v1/directions?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&origin=${origin}&destination=${dest}&mode=${mode}`;
    }
    return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${dest}&zoom=15`;
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
          {/* Route map */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Navigation className="h-4 w-4 text-primary" /> {text.routeMapTitle}
            </h3>
            <p className="mb-3 text-xs text-muted-foreground">{text.routeMapDesc}</p>
            <div className="mb-3 flex flex-wrap gap-2">
              {(["urbano", "troncal", "uber"] as const).map((tipo) => {
                const hasRoutes = selected.rutas.some(r => r.tipo === tipo);
                if (!hasRoutes) return null;
                const c = cfg[tipo];
                return (
                  <button
                    key={tipo}
                    onClick={() => setSelectedRouteType(tipo)}
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${selectedRouteType === tipo ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:bg-accent"}`}
                  >
                    {c.icon} {c.label}
                  </button>
                );
              })}
            </div>
            <div className="aspect-video w-full overflow-hidden rounded-lg border border-border">
              <iframe
                src={getMapUrl()}
                className="h-full w-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={text.routeMapTitle}
              />
            </div>
            {!userLat && (
              <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
                <MapPin className="h-3 w-3" /> {text.enableLocation}
              </p>
            )}
          </div>

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
