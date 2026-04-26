import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { AVATAR_CATALOG, DEFAULT_AVATAR_ID } from "@/lib/avatars";
import { getProfile, upsertProfile, type UserProfile } from "@/lib/profile";
import UserAvatar from "./UserAvatar";
import { Check, Loader2 } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { cleanVisibleText, cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  user: User;
  onSaved?: (profile: UserProfile) => void;
}

const ProfileEditor = ({ open, onOpenChange, user, onSaved }: Props) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [customName, setCustomName] = useState("");
  const [country, setCountry] = useState("");
  const [bio, setBio] = useState("");
  const [avatarId, setAvatarId] = useState<string>(DEFAULT_AVATAR_ID);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getProfile(user.id).then(p => {
      setCustomName(p?.custom_name ?? p?.display_name ?? (user.user_metadata?.display_name as string) ?? "");
      setCountry(p?.country ?? "");
      setBio(p?.bio ?? "");
      setAvatarId(p?.avatar_url ?? DEFAULT_AVATAR_ID);
    }).finally(() => setLoading(false));
  }, [open, user.id, user.user_metadata]);

  const handleSave = async () => {
    const safeName = cleanVisibleText(customName, true);
    const safeCountry = cleanVisibleText(country, true);
    const safeBio = cleanVisibleText(bio, true);

    if (safeName.length > 60) {
      toast({ title: "Nombre muy largo", description: "Máximo 60 caracteres", variant: "destructive" });
      return;
    }
    if (safeBio.length > 280) {
      toast({ title: "Bio muy larga", description: "Máximo 280 caracteres", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const saved = await upsertProfile(user.id, {
        custom_name: safeName || null,
        country: safeCountry || null,
        bio: safeBio || null,
        avatar_url: avatarId,
        display_name: (user.user_metadata?.display_name as string) ?? null,
      });
      toast({ title: "Perfil actualizado", description: "Los cambios se guardaron correctamente" });
      if (saved) onSaved?.(saved);
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: "Error al guardar", description: e.message ?? "Inténtalo de nuevo", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Personalizar perfil</DialogTitle>
          <DialogDescription>
            Tu nombre y avatar se mostrarán en reseñas, reportes y comentarios.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center gap-4 rounded-xl border border-border bg-muted/40 p-4">
              <UserAvatar avatarId={avatarId} name={customName} size="xl" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-foreground">{cleanVisibleText(customName) || "Sin nombre"}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                {country && <p className="text-xs text-muted-foreground">📍 {cleanVisibleText(country)}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="custom-name">Nombre público</Label>
              <Input id="custom-name" value={customName} onChange={(e) => setCustomName(cleanVisibleText(e.target.value))} placeholder="Ej. Juan Futbolista" maxLength={60} />
            </div>

            <div>
              <Label htmlFor="country">País</Label>
              <Input id="country" value={country} onChange={(e) => setCountry(cleanVisibleText(e.target.value))} placeholder="Ej. Colombia" maxLength={50} />
            </div>

            <div>
              <Label htmlFor="bio">Bio (opcional)</Label>
              <Textarea id="bio" value={bio} onChange={(e) => setBio(cleanVisibleText(e.target.value))} placeholder="Cuéntanos algo sobre ti..." maxLength={280} rows={3} />
              <p className="mt-1 text-right text-[10px] text-muted-foreground">{bio.length}/280</p>
            </div>

            <div>
              <Label className="mb-2 block">Elige un avatar</Label>
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
                {AVATAR_CATALOG.map(a => {
                  const selected = a.id === avatarId;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setAvatarId(a.id)}
                      className={cn(
                        "group relative aspect-square overflow-hidden rounded-xl border-2 transition",
                        selected ? "border-primary ring-2 ring-primary/40" : "border-border hover:border-primary/50"
                      )}
                      title={a.label}
                    >
                      <img src={a.src} alt={a.label} className="h-full w-full object-cover" loading="lazy" />
                      {selected && (
                        <div className="absolute right-1 top-1 rounded-full bg-primary p-0.5 text-primary-foreground shadow">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditor;
