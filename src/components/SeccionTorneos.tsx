import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Trophy, Plus, Calendar, Users, Award, ArrowRight } from "lucide-react";
import { listTournaments, listSignups, type Tournament } from "@/lib/torneos";
import { getCanchas } from "@/lib/canchas-bd";
import type { Cancha } from "@/data/canchas";
import TournamentForm from "./FormularioTorneo";
import { Button } from "@/components/ui/button";

interface Props {
  user: User | null;
  onSelectTournament: (id: string) => void;
  onGoAccount: () => void;
}

const TorneosSection = ({ user, onSelectTournament, onGoAccount }: Props) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "open" | "mine">("all");

  const load = async () => {
    setLoading(true);
    const [t, c] = await Promise.all([listTournaments(), getCanchas()]);
    setTournaments(t); setCanchas(c);
    // signup counts
    const entries = await Promise.all(t.map(async tour => [tour.id, (await listSignups(tour.id)).length] as const));
    setCounts(Object.fromEntries(entries));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const canchaName = (id: string) => canchas.find(c => `cancha-uuid-${c.id}` === id)?.name; // not used; we lookup by uuid below

  const filtered = tournaments.filter(t => {
    if (filter === "open") return t.signups_open;
    if (filter === "mine") return user && t.organizer_id === user.id;
    return true;
  });

  return (
    <div className="space-y-5">
      <div className="section-sport-panel rounded-[22px] p-5 md:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground"><Trophy className="h-5 w-5 text-accent" /> Torneos</h2>
            <p className="text-xs text-muted-foreground">Eventos programados en las canchas. Inscríbete o crea tu propio torneo.</p>
          </div>
          {user ? (
            <Button onClick={() => setCreating(true)} className="gap-1.5"><Plus className="h-4 w-4" /> Crear torneo</Button>
          ) : (
            <Button variant="outline" onClick={onGoAccount}>Inicia sesión para crear</Button>
          )}
        </div>

        <div className="mb-4 flex gap-1 rounded-lg border border-border bg-muted/40 p-1">
          {([
            { id: "all", label: "Todos" },
            { id: "open", label: "Inscripciones abiertas" },
            { id: "mine", label: "Mis torneos" },
          ] as const).map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition ${filter === f.id ? "bg-card text-primary shadow-sm" : "text-muted-foreground"}`}
            >{f.label}</button>
          ))}
        </div>

        {loading ? (
          <p className="text-xs text-muted-foreground">Cargando…</p>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
            <Trophy className="mx-auto mb-2 h-10 w-10 text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground">No hay torneos para mostrar</p>
            <p className="mt-1 text-xs text-muted-foreground">{user ? "¡Crea el primero!" : "Inicia sesión para crear uno."}</p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {filtered.map(t => {
              const count = counts[t.id] ?? 0;
              const slotsLeft = t.max_teams - count;
              const cancha = canchas.find((c) => null); // placeholder; we don't reverse-lookup by uuid here
              return (
                <button key={t.id} onClick={() => onSelectTournament(t.id)} className="group rounded-xl border border-border bg-card p-4 text-left transition hover:border-primary hover:shadow-md">
                  {t.banner_url && (
                    <div className="mb-3 -mx-4 -mt-4 h-28 overflow-hidden rounded-t-xl">
                      <img src={t.banner_url} alt={t.name} className="h-full w-full object-cover" loading="lazy" />
                    </div>
                  )}
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="text-base font-bold text-foreground">{t.name}</h3>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${t.signups_open ? "bg-accent/15 text-accent" : t.status === "ongoing" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {t.status === "ongoing" ? "En curso" : t.signups_open ? "Abierto" : t.status === "finished" ? "Finalizado" : "Próximo"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <p className="flex items-center gap-1 text-muted-foreground"><Calendar className="h-3 w-3" /> {new Date(t.start_date).toLocaleDateString()} → {new Date(t.end_date).toLocaleDateString()}</p>
                    <p className="flex items-center gap-1 text-muted-foreground"><Users className="h-3 w-3" /> {count}/{t.max_teams} equipos</p>
                  </div>
                  {t.prize && <p className="mt-2 flex items-center gap-1 text-xs text-foreground"><Award className="h-3 w-3 text-accent" /> {t.prize}</p>}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-primary">{t.format}</span>
                    {t.signups_open && slotsLeft > 0 && (
                      <span className="text-[10px] font-bold text-accent">{slotsLeft} cupos libres →</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {creating && user && (
        <TournamentForm
          user={user}
          canchas={canchas}
          onClose={() => setCreating(false)}
          onCreated={() => { setCreating(false); load(); }}
        />
      )}
    </div>
  );
};

export default TorneosSection;
