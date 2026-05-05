import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Trophy, MapPin, ArrowRight, Sparkles, CalendarRange, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [carouselIdx, setCarouselIdx] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let active = true;
    const load = () => Promise.all([getCanchas(), listTournaments({ upcoming: true, limit: 4 })])
      .then(([c, t]) => { setCanchas(c); setTournaments(t); })
      .finally(() => setLoading(false));
    load();
    const unsubscribe = subscribeToCanchasChanges(() => getCanchas().then((rows) => { if (active) setCanchas(rows); }));
    return () => { active = false; unsubscribe(); };
  }, []);

  // Auto-rotate carousel
  useEffect(() => {
    if (canchas.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setCarouselIdx(prev => (prev + 1) % canchas.length);
    }, 4000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [canchas.length]);

  const goCarousel = (dir: number) => {
    setCarouselIdx(prev => ((prev + dir) % canchas.length + canchas.length) % canchas.length);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => setCarouselIdx(prev => (prev + 1) % canchas.length), 4000);
  };

  const topRated = [...canchas].sort((a, b) => b.rating - a.rating).slice(0, 3);
  const cheapest = [...canchas].sort((a, b) => a.precioMin - b.precioMin).slice(0, 3);
  const currentCancha = canchas[carouselIdx];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[22px] border border-border bg-gradient-to-br from-primary via-primary to-accent p-6 text-primary-foreground shadow-lg md:p-10"
      >
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        {/* Football animation */}
        <motion.div
          className="absolute right-8 top-8 text-4xl opacity-20 pointer-events-none hidden md:block"
          animate={{ rotate: 360, y: [0, -10, 0] }}
          transition={{ rotate: { duration: 8, repeat: Infinity, ease: "linear" }, y: { duration: 2, repeat: Infinity } }}
        >
          ⚽
        </motion.div>
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

      {/* Court Carousel */}
      {canchas.length > 0 && (
        <div className="relative overflow-hidden rounded-[22px] border border-border bg-card shadow-md">
          <div className="relative h-56 sm:h-64 md:h-72">
            <AnimatePresence mode="wait">
              {currentCancha && (
                <motion.div
                  key={currentCancha.id}
                  initial={{ opacity: 0, x: 60 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -60 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 cursor-pointer"
                  onClick={() => onSelectCancha(currentCancha)}
                >
                  <img src={currentCancha.image} alt={currentCancha.name} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold text-primary-foreground">{currentCancha.tipo?.split(",")[0]?.trim()}</span>
                      <span className="flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /> {currentCancha.rating}
                      </span>
                    </div>
                    <h3 className="text-xl font-extrabold text-white md:text-2xl">{currentCancha.name}</h3>
                    <p className="mt-1 flex items-center gap-1 text-sm text-white/80"><MapPin className="h-3.5 w-3.5" /> {currentCancha.addr}</p>
                    <p className="mt-1 text-sm font-bold text-accent">{currentCancha.precio}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Nav arrows */}
            <button onClick={() => goCarousel(-1)} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur transition hover:bg-black/60">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={() => goCarousel(1)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur transition hover:bg-black/60">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Dot indicators */}
          <div className="flex items-center justify-center gap-1.5 py-3 bg-card">
            {canchas.map((_, i) => (
              <button
                key={i}
                onClick={() => { setCarouselIdx(i); goCarousel(0); }}
                className={`h-2 rounded-full transition-all ${i === carouselIdx ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Football bouncing animation decoration */}
      <div className="relative">
        <motion.div
          className="absolute -top-3 right-6 text-2xl pointer-events-none"
          animate={{ y: [0, -15, 0], rotate: [0, 180, 360] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          ⚽
        </motion.div>
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
            <motion.button
              key={c.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => onSelectCancha(c)}
              className="group overflow-hidden rounded-xl border border-border bg-card text-left transition hover:border-primary hover:shadow-md"
            >
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
            </motion.button>
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
            <motion.button
              key={c.id}
              whileHover={{ scale: 1.03 }}
              onClick={() => onSelectCancha(c)}
              className="rounded-xl border border-border bg-card p-3 text-left transition hover:border-accent hover:shadow-md"
            >
              <p className="text-xs text-muted-foreground">{text.fromLabel}</p>
              <p className="text-xl font-extrabold text-accent">${c.precioMin.toLocaleString()}</p>
              <p className="mt-1 line-clamp-1 text-sm font-semibold text-foreground">{c.name}</p>
              <p className="line-clamp-1 text-[11px] text-muted-foreground">{c.tipo}</p>
            </motion.button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomeSection;
