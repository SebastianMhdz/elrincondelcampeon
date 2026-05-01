import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { ClipboardList, MapPin, Calendar, Clock, User as UserIcon, Trash2 } from "lucide-react";
import emailjs from "emailjs-com";
import type { Translation } from "@/lib/i18n";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

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
  cancha_phone?: string;
  cancha_precio?: string;
}

interface Props {
  text: Translation;
  user: User | null;
  onGoAccount: () => void;
}

const MisReservasSection = ({ text, user, onGoAccount }: Props) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState<Reservation | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const loadReservations = () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    supabase
      .from("reservations")
      .select("*, canchas(name, addr, phone, precio)")
      .eq("user_id", user.id)
      .order("reservation_date", { ascending: false })
      .then(({ data }) => {
        if (data) {
          setReservations(data.map((r: any) => ({
            ...r,
            cancha_name: r.canchas?.name,
            cancha_addr: r.canchas?.addr,
            cancha_phone: r.canchas?.phone,
            cancha_precio: r.canchas?.precio,
          })));
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    loadReservations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const hoursUntil = (r: Reservation) => {
    const dt = new Date(`${r.reservation_date}T${r.start_time}`);
    return (dt.getTime() - Date.now()) / 36e5;
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    if (hoursUntil(toDelete) < 24) {
      toast({
        title: text.cancellationLocked,
        description: text.cancellationPolicyDesc,
        variant: "destructive",
      });
      setToDelete(null);
      return;
    }
    setDeleting(true);
    const { error } = await supabase.from("reservations").delete().eq("id", toDelete.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setDeleting(false);
      return;
    }

    const extrasArr = Array.isArray(toDelete.extras) ? (toDelete.extras as string[]) : [];
    const message = `Reserva cancelada en ${toDelete.cancha_name ?? ""}\nFecha: ${toDelete.reservation_date} ${toDelete.start_time}\nDuración: ${toDelete.duration_hours}h`;
    try {
      await emailjs.send("service_nf4p2rr", "template_211lfj5", {
        to_email: toDelete.customer_email,
        to_name: toDelete.customer_name,
        cancha_name: toDelete.cancha_name ?? "",
        cancha_addr: toDelete.cancha_addr ?? "",
        fecha: toDelete.reservation_date,
        hora: toDelete.start_time,
        duracion: `${toDelete.duration_hours}h`,
        jugadores: toDelete.format_label ?? "—",
        extras: extrasArr.join(", ") || "—",
        nota: toDelete.note || "—",
        precio: toDelete.cancha_precio ?? "—",
        phone: toDelete.cancha_phone ?? "—",
        message,
      }, "KPKZLlVPikmlp69eo");
    } catch (e) {
      console.error("EmailJS cancel:", e);
    }

    toast({ title: "✓", description: "Reserva eliminada y email de confirmación enviado." });
    setToDelete(null);
    setDeleting(false);
    loadReservations();
  };

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
        <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
          <strong>{text.cancellationPolicyTitle}:</strong> {text.cancellationPolicyDesc}
        </div>
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
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${statusColor(r.status)}`}>{statusLabel(r.status)}</span>
                  {(() => {
                    const locked = hoursUntil(r) < 24;
                    return (
                      <button
                        onClick={() => setToDelete(r)}
                        disabled={locked}
                        className={`rounded-lg border p-1.5 transition ${locked ? "border-border bg-muted/40 text-muted-foreground/60 cursor-not-allowed" : "border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20"}`}
                        title={locked ? text.cancellationLocked : "Eliminar reserva"}
                        aria-label={locked ? text.cancellationLocked : "Eliminar reserva"}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    );
                  })()}
                </div>
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

      <AlertDialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta reserva?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se enviará un email de confirmación a{" "}
              <strong>{toDelete?.customer_email}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleDelete(); }}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MisReservasSection;
