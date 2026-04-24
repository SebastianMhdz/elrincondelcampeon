import { useMemo, useState } from "react";
import { CalendarCheck2, ChevronRight, Headphones, LayoutGrid, MapPinned, Route, ClipboardList, UserCircle, Home, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tab } from "@/components/NavTabs";
import SettingsPanel from "@/components/SettingsPanel";
import type { Locale, Translation } from "@/lib/i18n";
import type { BrandingSettings } from "@/lib/site-settings";
import logoImage from "@/assets/logo-rincon.png";

interface AppSidebarProps {
  active: Tab;
  onChange: (tab: Tab) => void;
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  darkMode: boolean;
  onDarkModeChange: (value: boolean) => void;
  text: Translation;
  branding: BrandingSettings;
  onBrandingChange: (value: BrandingSettings) => void;
}

const AppSidebar = ({ active, onChange, locale, onLocaleChange, darkMode, onDarkModeChange, text, branding, onBrandingChange }: AppSidebarProps) => {
  const [hovered, setHovered] = useState(false);
  const expanded = hovered;
  const items: { id: Tab; label: string; hint: string; icon: typeof LayoutGrid }[] = [
    { id: "inicio", label: "Inicio", hint: "Recepción y novedades", icon: Home },
    { id: "canchas", label: text.courts, hint: text.courtsHint, icon: LayoutGrid },
    { id: "torneos", label: "Torneos", hint: "Eventos programados", icon: Trophy },
    { id: "mapa", label: text.map, hint: text.mapHint, icon: MapPinned },
    { id: "rutas", label: text.routes, hint: text.routesHint, icon: Route },
    { id: "reservar", label: text.reserve, hint: text.reserveHint, icon: CalendarCheck2 },
    { id: "mis-reservas", label: text.myReservations, hint: text.myReservationsHint, icon: ClipboardList },
    { id: "soporte", label: text.support, hint: text.supportHint, icon: Headphones },
    { id: "cuenta", label: text.account, hint: text.accountHint, icon: UserCircle },
  ];

  const activeItem = useMemo(() => items.find((item) => item.id === active), [active, items]);

  return (
    <aside
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "fixed inset-y-0 left-0 z-40 hidden shrink-0 border-r border-sidebar-border bg-[linear-gradient(180deg,hsl(var(--sidebar-primary)),hsl(var(--sidebar-background)))] text-sidebar-foreground transition-[width] duration-300 md:flex md:flex-col",
        expanded ? "w-80" : "w-24"
      )}
    >
      <div className="border-b border-white/10 p-4">
        <button onClick={() => onChange("inicio")} className="flex w-full items-center gap-3 rounded-xl bg-white/5 p-3 text-left backdrop-blur-sm transition hover:bg-white/10">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-lg">
            <img src={logoImage} alt={branding.siteName} className="h-full w-full object-contain p-0.5" />
          </div>
          {expanded && (
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold">{branding.siteName}</p>
              <p className="mt-1 line-clamp-2 text-xs text-white/65">{branding.tagline}</p>
            </div>
          )}
        </button>
      </div>

      <div className="flex-1 space-y-1.5 overflow-y-auto p-3">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={cn(
                "group flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200",
                isActive
                  ? "border-primary/40 bg-primary text-primary-foreground shadow-[0_14px_34px_-20px_hsl(var(--primary)/0.65)]"
                  : "border-transparent bg-white/5 hover:border-white/10 hover:bg-white/10"
              )}
            >
              <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", isActive ? "bg-primary-foreground/20" : "bg-white/10")}>
                <Icon className="h-4 w-4" />
              </div>
              {expanded && (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{item.label}</p>
                  <p className={cn("truncate text-xs", isActive ? "text-primary-foreground/80" : "text-white/65")}>{item.hint}</p>
                </div>
              )}
              {expanded && <ChevronRight className={cn("h-4 w-4 shrink-0 transition-transform", isActive && "translate-x-0.5")} />}
            </button>
          );
        })}
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="space-y-3 rounded-xl bg-white/5 p-3">
          {expanded ? (
            <>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-white/55">{text.activeSection}</p>
                <p className="mt-2 text-sm font-semibold">{activeItem?.label}</p>
                <p className="mt-1 text-xs text-white/65">{activeItem?.hint}</p>
              </div>
              <SettingsPanel
                locale={locale}
                onLocaleChange={onLocaleChange}
                darkMode={darkMode}
                onDarkModeChange={onDarkModeChange}
                text={text}
                branding={branding}
                onBrandingChange={onBrandingChange}
              />
            </>
          ) : (
            <div className="flex justify-center">
              <div className="h-2.5 w-2.5 rounded-full bg-primary" />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
