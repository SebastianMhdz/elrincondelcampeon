import { motion } from "framer-motion";
import { ArrowLeft, Star, MapPin, Clock, Phone, Check, Instagram, Facebook, Globe } from "lucide-react";
import type { Cancha } from "@/data/canchas";
import { canchaSocials } from "@/data/canchaSocials";
import type { Translation } from "@/lib/i18n";
import CanchaReviews from "@/components/CanchaReviews";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

interface Props { cancha: Cancha; onBack: () => void; onMap: (c: Cancha) => void; onReserve: (c: Cancha) => void; text: Translation; user: User | null; onGoAccount: () => void; }

const CanchaDetail = ({ cancha, onBack, onMap, onReserve, text, user, onGoAccount }: Props) => {
  const socials = cancha.socialLinks ?? canchaSocials[cancha.id] ?? {};
  const [dbCanchaId, setDbCanchaId] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("canchas").select("id").eq("legacy_id", cancha.id).maybeSingle().then(({ data }) => {
      if (data?.id) setDbCanchaId(data.id);
    });
  }, [cancha.id]);

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
      <button onClick={onBack} className="mb-4 flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" /> {text.back}
      </button>
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-md">
        <div className="relative h-56 md:h-72">
          <img src={cancha.image} alt={cancha.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute inset-x-4 bottom-4">
            <h2 className="mb-1 text-2xl font-bold text-white">{cancha.name}</h2>
            <p className="flex items-center gap-1 text-sm text-white/85"><MapPin className="h-4 w-4" /> {cancha.addr}</p>
          </div>
        </div>
        <div className="p-5">
          <div className="mb-5 flex items-center gap-2">
            <Star className="h-5 w-5 fill-primary text-primary" />
            <span className="font-semibold text-foreground">{cancha.rating}</span>
            <span className="text-sm text-muted-foreground">({cancha.reviews_count} {text.reviews})</span>
          </div>
          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-muted p-3">
              <p className="mb-1 text-[11px] uppercase tracking-wider text-muted-foreground">{text.pricePerHour}</p>
              <p className="text-xl font-bold text-primary">{cancha.precio.split("–")[0].trim()}</p>
              <p className="text-[11px] text-muted-foreground">{text.upToPeak}</p>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="mb-1 text-[11px] uppercase tracking-wider text-muted-foreground">{text.schedule}</p>
              <p className="flex items-center gap-1 text-sm font-semibold text-foreground"><Clock className="h-4 w-4 text-time" /> {cancha.hours}</p>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="mb-1 text-[11px] uppercase tracking-wider text-muted-foreground">{text.courtType}</p>
              <p className="text-sm font-semibold text-foreground">{cancha.tipo}</p>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="mb-1 text-[11px] uppercase tracking-wider text-muted-foreground">{text.phone}</p>
              <a href={`tel:${cancha.phone}`} className="flex items-center gap-1 text-sm font-semibold text-primary"><Phone className="h-4 w-4" /> {cancha.phone}</a>
            </div>
          </div>
          <div className="mb-5">
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground">{text.services}</h3>
            <div className="grid grid-cols-2 gap-2">
              {cancha.servicios.map((s) => <div key={s} className="flex items-center gap-2 text-sm text-muted-foreground"><Check className="h-4 w-4 shrink-0 text-primary" />{s}</div>)}
            </div>
          </div>
          {!!cancha.benefits?.length && (
            <div className="mb-5">
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Beneficios</h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {cancha.benefits.map((b) => <div key={b} className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm font-medium text-foreground">{b}</div>)}
              </div>
            </div>
          )}
          {!!cancha.galleryUrls?.length && (
            <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {cancha.galleryUrls.map((url) => <img key={url} src={url} alt={cancha.name} className="h-24 w-full rounded-lg object-cover" loading="lazy" />)}
            </div>
          )}
          <div className="mb-5">
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground">{text.socialLinks}</h3>
            <div className="flex flex-wrap gap-2">
              {socials.instagram && <a href={socials.instagram} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary"><Instagram className="h-4 w-4 text-primary" /> Instagram</a>}
              {socials.facebook && <a href={socials.facebook} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary"><Facebook className="h-4 w-4 text-primary" /> Facebook</a>}
              {socials.website && <a href={socials.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary"><Globe className="h-4 w-4 text-primary" /> Web</a>}
              {!socials.instagram && !socials.facebook && !socials.website && <p className="text-sm text-muted-foreground">{text.noLinksYet}</p>}
            </div>
          </div>
          <div className="mb-5">
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground">{text.recentReviews}</h3>
            {cancha.reviews.slice(0, 2).map((r, i) => <div key={i} className="mb-2 rounded-lg bg-muted p-3 text-sm italic text-muted-foreground">"{r}"</div>)}
          </div>
          <div className="space-y-2">
            <button onClick={() => onMap(cancha)} className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">{text.viewOnMap}</button>
            <button onClick={() => onReserve(cancha)} className="w-full rounded-lg border border-primary bg-secondary py-2.5 text-sm font-semibold text-secondary-foreground hover:bg-secondary/80">{text.reserveThisCourt}</button>
          </div>

          {dbCanchaId && <CanchaReviews canchaId={dbCanchaId} user={user} text={text} onGoAccount={onGoAccount} />}
        </div>
      </div>
    </motion.div>
  );
};
export default CanchaDetail;
