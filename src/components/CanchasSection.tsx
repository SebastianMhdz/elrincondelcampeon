import { useEffect, useState } from "react";
import { canchas as fallbackCanchas } from "@/data/canchas";
import type { Cancha } from "@/data/canchas";
import CanchaCard from "./CanchaCard";
import CanchaDetail from "./CanchaDetail";
import { getCanchas } from "@/lib/canchas-db";
import type { Translation } from "@/lib/i18n";
import type { User } from "@supabase/supabase-js";

interface Props {
  onMapSelect: (c: Cancha) => void;
  onReserveSelect: (c: Cancha) => void;
  text: Translation;
  user: User | null;
  onGoAccount: () => void;
}

const CanchasSection = ({ onMapSelect, onReserveSelect, text, user, onGoAccount }: Props) => {
  const [selected, setSelected] = useState<Cancha | null>(null);
  const [items, setItems] = useState<Cancha[]>(fallbackCanchas);

  useEffect(() => { getCanchas().then(setItems); }, []);

  if (selected) {
    return <CanchaDetail cancha={selected} onBack={() => setSelected(null)} onMap={onMapSelect} onReserve={onReserveSelect} text={text} user={user} onGoAccount={onGoAccount} />;
  }

  return (
    <div className="section-sport-panel rounded-[22px] p-5 md:p-6">
      <h2 className="mb-4 text-lg font-semibold text-foreground">
        {text.availableCourts} <span className="text-sm font-normal text-muted-foreground">({items.length})</span>
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((c, i) => <CanchaCard key={c.id} cancha={c} index={i} onSelect={setSelected} text={text} />)}
      </div>
    </div>
  );
};

export default CanchasSection;
