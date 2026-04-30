import { MapPin, Route, CalendarCheck, Headphones, LayoutGrid, ClipboardList, Home, Trophy, UserCircle } from "lucide-react";

type Tab = "inicio" | "canchas" | "torneos" | "mapa" | "rutas" | "reservar" | "soporte" | "mis-reservas" | "cuenta";

interface NavTabsProps {
  active: Tab;
  onChange: (tab: Tab) => void;
  labels?: Partial<Record<Tab, string>>;
}

const tabs: { id: Tab; defaultLabel: string; icon: React.ReactNode }[] = [
  { id: "inicio", defaultLabel: "Inicio", icon: <Home className="w-4 h-4" /> },
  { id: "canchas", defaultLabel: "Canchas", icon: <LayoutGrid className="w-4 h-4" /> },
  { id: "torneos", defaultLabel: "Torneos", icon: <Trophy className="w-4 h-4" /> },
  { id: "mapa", defaultLabel: "Mapa", icon: <MapPin className="w-4 h-4" /> },
  { id: "rutas", defaultLabel: "Rutas", icon: <Route className="w-4 h-4" /> },
  { id: "reservar", defaultLabel: "Reservar", icon: <CalendarCheck className="w-4 h-4" /> },
  { id: "mis-reservas", defaultLabel: "Mis Reservas", icon: <ClipboardList className="w-4 h-4" /> },
  { id: "soporte", defaultLabel: "Soporte", icon: <Headphones className="w-4 h-4" /> },
  { id: "cuenta", defaultLabel: "Mi Cuenta", icon: <UserCircle className="w-4 h-4" /> },
];

const NavTabs = ({ active, onChange, labels }: NavTabsProps) => {
  return (
    <nav className="mb-6 flex gap-1.5 overflow-x-auto rounded-xl border border-border bg-card p-1.5 shadow-sm md:hidden">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex min-w-[100px] items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
            active === tab.id
              ? "border border-primary/30 bg-primary/10 text-primary shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {tab.icon}
          <span>{labels?.[tab.id] ?? tab.defaultLabel}</span>
        </button>
      ))}
    </nav>
  );
};

export default NavTabs;
export type { Tab };
