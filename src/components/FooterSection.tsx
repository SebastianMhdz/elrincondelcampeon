import { Phone, MapPin, Users, Trophy, Mail, Instagram, Facebook, Github } from "lucide-react";
import logoImage from "@/assets/logo-rincon.png";
import type { Translation } from "@/lib/i18n";
import type { Tab } from "@/components/NavTabs";
import type { BrandingSettings } from "@/lib/site-settings";

interface FooterProps {
  branding: BrandingSettings;
  text: Translation;
  onNavigate: (tab: Tab) => void;
}

const FooterSection = ({ branding, text, onNavigate }: FooterProps) => {
  const year = new Date().getFullYear();
  const navItems: { tab: Tab; label: string }[] = [
    { tab: "canchas", label: text.courts },
    { tab: "mapa", label: text.map },
    { tab: "rutas", label: text.routes },
    { tab: "reservar", label: text.reserve },
    { tab: "soporte", label: text.support },
  ];

  return (
    <footer className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mt-16 bg-[hsl(220_55%_8%)] text-white">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent via-primary to-accent" />
      <div className="mx-auto max-w-7xl px-6 py-14 md:px-10">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/5 p-2 ring-1 ring-white/10">
                <img src={logoImage} alt={branding.siteName} className="h-14 w-14 object-contain" />
              </div>
              <div>
                <p className="text-lg font-extrabold leading-tight">{branding.siteName}</p>
                <p className="text-[10px] uppercase tracking-widest text-primary">Reservación de Fútbol</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/65">{text.footerMissionText}</p>
            <div className="mt-5 flex gap-2">
              <a href="#" className="rounded-full border border-white/15 p-2 text-white/75 transition hover:bg-white/10 hover:text-white"><Instagram className="h-4 w-4" /></a>
              <a href="#" className="rounded-full border border-white/15 p-2 text-white/75 transition hover:bg-white/10 hover:text-white"><Facebook className="h-4 w-4" /></a>
              <a href={`mailto:contacto@rincondelcampeon.com`} className="rounded-full border border-white/15 p-2 text-white/75 transition hover:bg-white/10 hover:text-white"><Mail className="h-4 w-4" /></a>
            </div>
          </div>

          <div>
            <h4 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary"><Trophy className="h-4 w-4" />{text.footerNavigate}</h4>
            <ul className="space-y-2.5 text-sm text-white/75">
              {navItems.map((item) => (
                <li key={item.tab}>
                  <button onClick={() => onNavigate(item.tab)} className="transition hover:text-primary">{item.label}</button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary"><Phone className="h-4 w-4" />{text.footerContact}</h4>
            <ul className="space-y-3 text-sm text-white/75">
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/45">{text.footerPhone}</p>
                  <a href={`tel:${branding.phone}`} className="font-semibold text-white hover:text-primary">{branding.phone}</a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/45">{text.footerAddress}</p>
                  <p className="font-semibold text-white">{branding.address}</p>
                </div>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary"><Users className="h-4 w-4" />{text.footerAuthors}</h4>
            <ul className="space-y-2 text-sm text-white/75">
              {branding.authors.map((author) => (
                <li key={author} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>{author}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 rounded-lg border border-white/10 bg-white/5 p-3 text-[11px] leading-relaxed text-white/60">
              {branding.footerNote}
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/55 md:flex-row">
          <p>© {year} {branding.siteName}. {text.footerRights}.</p>
          <p className="flex items-center gap-2"><Github className="h-3.5 w-3.5" /> CUC · Corporación Universidad de la Costa</p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
