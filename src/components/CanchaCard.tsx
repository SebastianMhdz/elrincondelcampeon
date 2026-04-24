import { motion } from "framer-motion";
import { Star, MapPin, Clock, DollarSign } from "lucide-react";
import type { Cancha } from "@/data/canchas";
import type { Translation } from "@/lib/i18n";

interface Props { cancha: Cancha; index: number; onSelect: (c: Cancha) => void; text: Translation; }

const CanchaCard = ({ cancha, index, onSelect, text }: Props) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.06 }}
    className="field-card-hover group cursor-pointer overflow-hidden rounded-xl border border-border bg-card shadow-sm"
    onClick={() => onSelect(cancha)}
  >
    <div className="relative h-44 overflow-hidden">
      <img src={cancha.image} alt={cancha.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
      <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-card/95 px-2.5 py-1 text-xs font-semibold text-primary backdrop-blur-sm">
        <Star className="h-3.5 w-3.5 fill-primary text-primary" /> {cancha.rating}
        <span className="font-normal text-muted-foreground">({cancha.reviews_count})</span>
      </div>
      <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 backdrop-blur-sm">
        <span className="text-2xl">{cancha.icon}</span>
        <span className="text-[11px] font-semibold text-white">{cancha.tipo}</span>
      </div>
    </div>
    <div className="p-4">
      <h3 className="mb-1 truncate text-base font-semibold text-foreground">{cancha.name}</h3>
      <p className="mb-3 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> {cancha.addr}</p>
      <div className="mb-4 flex flex-wrap gap-1.5">
        <span className="flex items-center gap-1 rounded-full bg-transit-light px-2 py-0.5 text-[11px] font-medium text-transit"><DollarSign className="h-3 w-3" />{cancha.precio.split("–")[0].trim()}</span>
        <span className="flex items-center gap-1 rounded-full bg-time-light px-2 py-0.5 text-[11px] font-medium text-time"><Clock className="h-3 w-3" />{cancha.hours.length > 20 ? cancha.hours.slice(0, 20) + "…" : cancha.hours}</span>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onSelect(cancha); }} className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
        {text.viewDetails}
      </button>
    </div>
  </motion.div>
);

export default CanchaCard;
