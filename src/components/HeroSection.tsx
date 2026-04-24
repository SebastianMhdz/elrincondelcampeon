import { motion } from "framer-motion";
import { MapPinned, ShieldCheck, Trophy } from "lucide-react";
import heroImage from "@/assets/cancha-hero.jpg";
import logoImage from "@/assets/logo-rincon.png";
import type { Translation } from "@/lib/i18n";

interface HeroSectionProps {
  branding: { siteName: string; tagline: string };
  text: Translation;
}

const HeroSection = ({ branding, text }: HeroSectionProps) => {
  return (
    <section className="relative mb-8 overflow-hidden rounded-[22px] border border-border shadow-[0_24px_80px_-32px_hsl(var(--foreground)/0.4)]">
      <div className="absolute inset-0">
        <img src={heroImage} alt="Cancha sintética" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-hero-gradient opacity-90" />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(135deg,hsla(0,0%,0%,0.7)_0%,hsla(0,0%,0%,0.5)_36%,transparent_36%,transparent_100%)]" />
      <div className="relative z-10 grid gap-8 px-6 py-14 md:grid-cols-[1.05fr_0.95fr] md:px-10 md:py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm">
            <Trophy className="h-3.5 w-3.5" /> {text.heroBadge}
          </div>
          <div className="mb-4 flex items-center gap-4">
            <img src={logoImage} alt={branding.siteName} className="h-16 w-16 object-contain drop-shadow-2xl" />
            <h1 className="text-3xl font-extrabold text-white md:text-5xl">{branding.siteName}</h1>
          </div>
          <p className="mt-2 max-w-2xl text-base text-white/85 md:text-lg">{branding.tagline}</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              { icon: MapPinned, title: text.heroLiveMap, desc: text.heroLiveMapText },
              { icon: ShieldCheck, title: text.heroSafe, desc: text.heroSafeText },
              { icon: Trophy, title: text.heroExperience, desc: text.heroExperienceText },
            ].map((item) => (
              <div key={item.title} className="glass-card rounded-lg p-4 text-left">
                <item.icon className="mb-3 h-5 w-5 text-primary" />
                <p className="text-sm font-bold text-foreground">{item.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.1 }} className="hidden items-end justify-end md:flex">
          <div className="w-full max-w-md rounded-[22px] border border-white/15 bg-black/30 p-4 backdrop-blur-md">
            <div className="grid gap-3 rounded-[18px] border border-white/10 bg-white/10 p-4">
              <div className="flex items-center justify-between text-white">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-white/60">{text.matchdayPanel}</p>
                  <p className="mt-2 text-xl font-extrabold">{text.bookYourCourt}</p>
                </div>
                <div className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">{text.live}</div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-white/10 p-4">
                  <p className="text-xs text-white/60">{text.availability}</p>
                  <p className="mt-2 text-2xl font-extrabold text-white">8</p>
                  <p className="text-xs text-white/70">{text.activeToday}</p>
                </div>
                <div className="rounded-xl bg-accent/90 p-4 text-accent-foreground">
                  <p className="text-xs uppercase tracking-wide">{text.reservations}</p>
                  <p className="mt-2 text-2xl font-extrabold">{text.realTime}</p>
                  <p className="text-xs text-accent-foreground/80">{text.autoBlock}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
