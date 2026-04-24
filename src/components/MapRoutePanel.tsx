import { Navigation, LocateFixed, Route, MapPin } from "lucide-react";
import type { Cancha } from "@/data/canchas";
import type { Translation } from "@/lib/i18n";

interface Props {
  cancha: Cancha | null;
  userPosition: { lat: number; lng: number } | null;
  distanceLabel: string | null;
  etaLabel: string | null;
  onLocate: () => void;
  locating: boolean;
  text: Translation;
}

const MapRoutePanel = ({ cancha, userPosition, distanceLabel, etaLabel, onLocate, locating, text }: Props) => (
  <div className="grid gap-3 md:grid-cols-3">
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground"><MapPin className="h-4 w-4 text-primary" /> {text.destination}</div>
      <p className="text-sm font-semibold text-foreground">{cancha?.name ?? text.selectCourt}</p>
      <p className="mt-1 text-xs text-muted-foreground">{cancha?.addr ?? text.selectCourtFirst}</p>
    </div>
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground"><Route className="h-4 w-4 text-accent" /> {text.route}</div>
      <p className="text-sm font-semibold text-foreground">{distanceLabel ?? text.calculatingOnLocate}</p>
      <p className="mt-1 text-xs text-muted-foreground">{etaLabel ? `${text.estimatedTime}: ${etaLabel}` : text.enableLocation}</p>
    </div>
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground"><LocateFixed className="h-4 w-4 text-transit" /> {text.yourLocation}</div>
      <p className="text-sm text-foreground">{userPosition ? `${userPosition.lat.toFixed(4)}, ${userPosition.lng.toFixed(4)}` : text.notSharedYet}</p>
      <button onClick={onLocate} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-xs font-semibold text-secondary-foreground hover:bg-secondary/80">
        <Navigation className="h-3.5 w-3.5" /> {locating ? text.locating : userPosition ? text.updateLocation : text.useMyLocation}
      </button>
    </div>
  </div>
);

export default MapRoutePanel;
