import { useEffect, useMemo, useState } from "react";
import HeroSection from "@/components/HeroSection";
import AppSidebar from "@/components/AppSidebar";
import NavTabs from "@/components/NavTabs";
import type { Tab } from "@/components/NavTabs";
import CanchasSection from "@/components/CanchasSection";
import MapSection from "@/components/MapSection";
import RutasSection from "@/components/RutasSection";
import ReservaSection from "@/components/ReservaSection";
import SoporteSection from "@/components/SoporteSection";
import MisReservasSection from "@/components/MisReservasSection";
import AccountSection from "@/components/AccountSection";
import FooterSection from "@/components/FooterSection";
import RickyBot from "@/components/RickyBot";
import UserMenu from "@/components/UserMenu";
import type { Cancha } from "@/data/canchas";
import { applyTheme, type ThemeMode } from "@/lib/theme";
import { defaultBranding, getBrandingSettings, type BrandingSettings } from "@/lib/site-settings";
import { translations, type Locale } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

const Index = () => {
  const [tab, setTab] = useState<Tab>("canchas");
  const [mapCancha, setMapCancha] = useState<Cancha | null>(null);
  const [reservaCancha, setReservaCancha] = useState<Cancha | null>(null);
  const [locale, setLocale] = useState<Locale>(() => (localStorage.getItem("app-locale") as Locale) || "es");
  const [theme, setTheme] = useState<ThemeMode>(() => (localStorage.getItem("app-theme") as ThemeMode) || "light");
  const [branding, setBranding] = useState<BrandingSettings>(defaultBranding);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => { applyTheme(theme); localStorage.setItem("app-theme", theme); }, [theme]);
  useEffect(() => { localStorage.setItem("app-locale", locale); }, [locale]);
  useEffect(() => { getBrandingSettings().then(setBranding); }, []);
  useEffect(() => { document.title = branding.siteName; }, [branding.siteName]);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    return () => listener.subscription.unsubscribe();
  }, []);

  const text = useMemo(() => translations[locale], [locale]);

  const handleMapSelect = (c: Cancha) => { setMapCancha(c); setTab("mapa"); };
  const handleReserveSelect = (c: Cancha) => { setReservaCancha(c); setTab("reservar"); };

  const isMain = tab === "canchas";

  return (
    <div className="min-h-screen bg-stadium-surface">
      <div className="flex min-h-screen w-full flex-col">
        <AppSidebar
          active={tab} onChange={setTab}
          locale={locale} onLocaleChange={setLocale}
          darkMode={theme === "dark"} onDarkModeChange={(v) => setTheme(v ? "dark" : "light")}
          text={text} branding={branding} onBrandingChange={setBranding}
        />
        <main className="min-w-0 flex-1 md:ml-24 md:pl-2">
          <header className="sticky top-0 z-20 border-b border-border bg-background/85 px-4 py-3 backdrop-blur-md md:px-8">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-foreground">{branding.siteName}</p>
                <p className="truncate text-xs text-muted-foreground">{branding.tagline}</p>
              </div>
              <UserMenu user={user} onGoAccount={() => setTab("cuenta")} />
            </div>
          </header>

          <div className="mx-auto max-w-6xl px-4 py-6 md:px-8">
            {isMain && <HeroSection branding={branding} text={text} />}
            <NavTabs active={tab} onChange={setTab} labels={{ canchas: text.courts, mapa: text.map, rutas: text.routes, reservar: text.reserve, soporte: text.support, "mis-reservas": text.myReservations, cuenta: text.account }} />

            {tab === "canchas" && <CanchasSection onMapSelect={handleMapSelect} onReserveSelect={handleReserveSelect} text={text} user={user} onGoAccount={() => setTab("cuenta")} />}
            {tab === "mapa" && <MapSection initialCancha={mapCancha} text={text} />}
            {tab === "rutas" && <RutasSection initialCancha={mapCancha} text={text} />}
            {tab === "reservar" && <ReservaSection initialCancha={reservaCancha} text={text} user={user} onGoAccount={() => setTab("cuenta")} />}
            {tab === "mis-reservas" && <MisReservasSection text={text} user={user} onGoAccount={() => setTab("cuenta")} />}
            {tab === "soporte" && <SoporteSection text={text} />}
            {tab === "cuenta" && <AccountSection text={text} user={user} />}
          </div>

          <FooterSection branding={branding} text={text} onNavigate={setTab} />
        </main>
      </div>
      <RickyBot text={text} locale={locale} />
    </div>
  );
};

export default Index;
