import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { ClipboardList, MapPin, Calendar, Clock, User as UserIcon } from "lucide-react";
import type { Translation } from "@/lib/i18n";

interface Reservation {
  id: string;
  cancha_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  reservation_date: string;
  start_time: string;
  duration_hours: number;
  format_label: string | null;
  extras: unknown;
  note: string | null;
  status: string;
  cancha_name?: string;
  cancha_addr?: string;
}

interface Props {
  text: Translation;
  user: User | null;
  onGoAccount: () => void;
}

const MisReservasSection = ({ text, user, onGoAccount }: Props) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    supabase
      .from("reservations")
      .select("*, canchas(name, addr)")
      .eq("user_id", user.id)
      .order("reservation_date", { ascending: false })
      .then(({ data }) => {
        if (data) {
          setReservations(data.map((r: any) => ({
            ...r,
            cancha_name: r.canchas?.name,
            cancha_addr: r.canchas?.addr,
          })));
        }
        setLoading(false);
      });
  }, [user]);

  if (!user) {
    return (
      <div className="section-sport-panel rounded-[22px] p-8 text-center">
        <ClipboardList className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
        <h2 className="mb-2 text-xl font-bold text-foreground">{text.loginToReserve}</h2>
        <p className="mb-5 text-sm text-muted-foreground">{text.loginToReserveDesc}</p>
        <button onClick={onGoAccount} className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
          {text.goToAccount}
        </button>
      </div>
    );
  }

  const statusLabel = (s: string) => s === "confirmed" ? text.confirmed : s === "pending" ? text.pending : text.cancelled;
  const statusColor = (s: string) => s === "confirmed" ? "bg-accent/15 text-accent" : s === "pending" ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive";

  return (
    <div className="section-sport-panel rounded-[22px] p-5 md:p-6">
      <div className="mb-5">
        <h2 className="flex items-center gap-2 text-xl font-bold text-foreground"><ClipboardList className="h-5 w-5 text-primary" /> {text.myReservationsTitle}</h2>
        <p className="text-sm text-muted-foreground">{text.myReservationsDesc}</p>
      </div>

      {loading ? (
        <p className="py-12 text-center text-sm text-muted-foreground">...</p>
      ) : reservations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-10 text-center">
          <p className="text-sm text-muted-foreground">{text.noReservationsYet}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reservations.map((r) => (
            <div key={r.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-foreground">{r.cancha_name ?? text.reservationOf}</h3>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" /> {r.cancha_addr}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${statusColor(r.status)}`}>{statusLabel(r.status)}</span>
              </div>
              <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
                <div className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-primary" /> {r.reservation_date}</div>
                <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-primary" /> {r.start_time} · {r.duration_hours}h</div>
                <div className="flex items-center gap-1.5"><UserIcon className="h-3.5 w-3.5 text-primary" /> {r.customer_name}</div>
              </div>
              {r.format_label && <p className="mt-2 text-xs text-foreground"><strong>{text.modality}:</strong> {r.format_label}</p>}
              {Array.isArray(r.extras) && r.extras.length > 0 && (
                <p className="mt-1 text-xs text-muted-foreground"><strong>{text.extraServices}:</strong> {(r.extras as string[]).join(", ")}</p>
              )}
              {r.note && <p className="mt-1 text-xs italic text-muted-foreground">"{r.note}"</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MisReservasSection;
