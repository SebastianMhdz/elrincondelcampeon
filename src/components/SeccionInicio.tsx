import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Trophy, MapPin, ArrowRight, Sparkles, CalendarRange, TrendingUp } from "lucide-react";
import type { Cancha } from "@/data/canchas";
import type { Translation } from "@/lib/i18n";
import { getCanchas, subscribeToCanchasChanges } from "@/lib/canchas-bd";
import { listTournaments, type Tournament } from "@/lib/torneos";
import type { Tab } from "@/components/NavTabs";

interface Props {
  text: Translation;
  branding: { siteName: string; tagline: string };
  onNavigate: (tab: Tab) => void;
  onSelectCancha: (c: Cancha) => void;
  onSelectTournament: (id: string) => void;
}

const HomeSection = ({ text, branding, onNavigate, onSelectCancha, onSelectTournament }: Props) => {
  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = () => Promise.all([getCanchas(), listTournaments({ upcoming: true, limit: 4 })])
      .then(([c, t]) => { setCanchas(c); setTournaments(t); })
      .finally(() => setLoading(false));
    load();
    const unsubscribe = subscribeToCanchasChanges(() => getCanchas().then((rows) => { if (active) setCanchas(rows); }));
    return () => { active = false; unsubscribe(); };
  }, []);

  const topRated = [...canchas].sort((a, b) => b.rating - a.rating).slice(0, 3);
  const cheapest = [...canchas].sort((a, b) => a.precioMin - b.precioMin).slice(0, 3);

  const stats = [
    { label: text.statCourts, value: canchas.length, icon: MapPin, color: "text-primary" },
    { label: text.statUpcomingTournaments, value: tournaments.length, icon: Trophy, color: "text-accent" },
    { label: text.statNextPlay, value: "🔥", icon: Sparkles, color: "text-primary" },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[22px] border border-border bg-gradient-to-br from-primary via-primary to-accent p-6 text-primary-foreground shadow-lg md:p-10"
      >
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="relative">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> {text.welcomeTo} {branding.siteName}
          </div>
          <h1 className="text-2xl font-extrabold leading-tight md:text-4xl">
            {text.fastestWayToPlay}<br /><span className="text-white/85">{text.yourNextMatch}</span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-white/85 md:text-base">{branding.tagline}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={() => onNavigate("canchas")} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-primary shadow-sm transition hover:scale-105">
              {text.viewCourts} <ArrowRight className="h-4 w-4" />
            </button>
            <button onClick={() => onNavigate("torneos")} className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20">
              <Trophy className="h-4 w-4" /> {text.tournaments}
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="section-sport-panel rounded-2xl p-4 text-center">
            <s.icon className={`mx-auto mb-1 h-5 w-5 ${s.color}`} />
            <p className="text-2xl font-extrabold text-foreground">{s.value}</p>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <section className="section-sport-panel rounded-[22px] p-5 md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <CalendarRange className="h-5 w-5 text-accent" /> {text.upcomingTournaments}
          </h2>
          <button onClick={() => onNavigate("torneos")} className="text-xs font-semibold text-primary hover:underline">{text.viewAll}</button>
        </div>
        {loading ? (
          <p className="text-xs text-muted-foreground">{text.loadingShort}</p>
        ) : tournaments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center">
            <Trophy className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground">{text.noTournamentsScheduled}</p>
            <p className="mt-1 text-xs text-muted-foreground">{text.newEventsSoon}</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {tournaments.map((t) => (
              <button key={t.id} onClick={() => onSelectTournament(t.id)} className="group rounded-xl border border-border bg-card p-4 text-left transition hover:border-primary hover:shadow-md">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="line-clamp-2 text-sm font-bold text-foreground">{t.name}</h3>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${t.signups_open ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"}`}>
                    {t.signups_open ? text.signupsOpenBadge : text.comingSoonBadge}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{new Date(t.start_date).toLocaleDateString()} → {new Date(t.end_date).toLocaleDateString()}</p>
                <p className="mt-1 text-xs font-semibold text-primary">{t.format} · {text.capacityTeams.replace("{n}", String(t.max_teams))}</p>
                {t.prize && <p className="mt-2 truncate text-xs text-muted-foreground">🏆 {t.prize}</p>}
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="section-sport-panel rounded-[22px] p-5 md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Star className="h-5 w-5 fill-primary text-primary" /> {text.topRated}
          </h2>
          <button onClick={() => onNavigate("canchas")} className="text-xs font-semibold text-primary hover:underline">{text.viewAll}</button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {topRated.map((c) => (
            <button key={c.id} onClick={() => { onSelectCancha(c); }} className="group overflow-hidden rounded-xl border border-border bg-card text-left transition hover:border-primary hover:shadow-md">
              <div className="relative h-28 overflow-hidden">
                <img src={c.image} alt={c.name} className="h-full w-full object-cover transition group-hover:scale-105" loading="lazy" />
                <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-foreground/70 px-2 py-0.5 text-[10px] font-bold text-background backdrop-blur">
                  <Star className="h-3 w-3 fill-primary text-primary" /> {c.rating}
                </div>
              </div>
              <div className="p-3">
                <p className="line-clamp-1 text-sm font-bold text-foreground">{c.name}</p>
                <p className="line-clamp-1 text-xs text-muted-foreground">{c.addr}</p>
                <p className="mt-1 text-xs font-bold text-primary">{c.precio.split("–")[0].trim()}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="section-sport-panel rounded-[22px] p-5 md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <TrendingUp className="h-5 w-5 text-accent" /> {text.bestPrices}
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {cheapest.map((c) => (
            <button key={c.id} onClick={() => onSelectCancha(c)} className="rounded-xl border border-border bg-card p-3 text-left transition hover:border-accent hover:shadow-md">
              <p className="text-xs text-muted-foreground">{text.fromLabel}</p>
              <p className="text-xl font-extrabold text-accent">${c.precioMin.toLocaleString()}</p>
              <p className="mt-1 line-clamp-1 text-sm font-semibold text-foreground">{c.name}</p>
              <p className="line-clamp-1 text-[11px] text-muted-foreground">{c.tipo}</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomeSection;
