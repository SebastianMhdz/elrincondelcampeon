import { useState, useEffect, useMemo } from "react";
import { canchas } from "@/data/canchas";
import type { Cancha } from "@/data/canchas";
import { MapPin, Navigation, Crosshair } from "lucide-react";
import MapRoutePanel from "@/components/MapRoutePanel";
import { useToast } from "@/hooks/use-toast";
import type { Translation } from "@/lib/i18n";

interface Props { initialCancha?: Cancha | null; text: Translation; }

const MapSection = ({ initialCancha, text }: Props) => {
  const { toast } = useToast();
  const [selectedId, setSelectedId] = useState<number | "">(initialCancha?.id ?? "");
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const selected = selectedId !== "" ? canchas.find((c) => c.id === selectedId) : null;

  useEffect(() => { if (initialCancha) setSelectedId(initialCancha.id); }, [initialCancha]);

  const locateUser = () => {
    if (!navigator.geolocation) { toast({ title: text.errorTitle, description: "geolocation", variant: "destructive" }); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { setUserPosition({ lat: coords.latitude, lng: coords.longitude }); setLocating(false); },
      () => { toast({ title: text.errorTitle, variant: "destructive" }); setLocating(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const routeEmbedUrl = useMemo(() => {
    if (!selected) return "";
    if (!userPosition) return `https://maps.google.com/maps?q=${selected.lat},${selected.lng}&z=16&output=embed`;
    return `https://www.google.com/maps?q=${userPosition.lat},${userPosition.lng}&saddr=${userPosition.lat},${userPosition.lng}&daddr=${selected.lat},${selected.lng}&z=14&output=embed`;
  }, [selected, userPosition]);

  const routeInfo = useMemo(() => {
    if (!selected || !userPosition) return { distanceLabel: null, etaLabel: null };
    const toRad = (v: number) => (v * Math.PI) / 180;
    const dLat = toRad(selected.lat - userPosition.lat);
    const dLng = toRad(selected.lng - userPosition.lng);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(userPosition.lat)) * Math.cos(toRad(selected.lat)) * Math.sin(dLng / 2) ** 2;
    const distance = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const eta = Math.max(6, Math.round((distance / 28) * 60));
    return { distanceLabel: `${distance.toFixed(1)} km`, etaLabel: `${eta} min` };
  }, [selected, userPosition]);

  return (
    <div className="section-sport-panel rounded-[22px] p-5 md:p-6">
      <h2 className="mb-4 text-lg font-semibold text-foreground">{text.mapLocation}</h2>
      <select value={selectedId} onChange={(e) => setSelectedId(e.target.value === "" ? "" : Number(e.target.value))} className="mb-4 w-full rounded-lg border border-border bg-card p-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30">
        <option value="">{text.selectCourt}</option>
        {canchas.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <MapRoutePanel cancha={selected} userPosition={userPosition} distanceLabel={routeInfo.distanceLabel} etaLabel={routeInfo.etaLabel} onLocate={locateUser} locating={locating} text={text} />
      <div className="mb-4 mt-4 h-[420px] overflow-hidden rounded-xl border border-border bg-muted shadow-sm">
        {selected ? (
          <iframe src={routeEmbedUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" title={selected.name} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground"><MapPin className="h-10 w-10" /><p className="text-sm">{text.selectCourtToSeeLocation}</p></div>
        )}
      </div>
      {selected && (
        <div className="space-y-2">
          <button onClick={locateUser} className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
            <Navigation className="h-4 w-4" /> {userPosition ? text.updateRouteFromMyLocation : text.showRouteFromMyLocation}
          </button>
          <div className="flex items-start gap-2 rounded-lg border border-border bg-card p-3 text-sm text-muted-foreground">
            <Crosshair className="mt-0.5 h-4 w-4 text-accent" /> {text.routeShownInline}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapSection;
