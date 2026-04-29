import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { AVATAR_CATALOG, DEFAULT_AVATAR_ID } from "@/lib/avatares";
import { getProfile, upsertProfile, type UserProfile } from "@/lib/perfil";
import UserAvatar from "./AvatarUsuario";
import { Check, Loader2, Upload, X } from "lucide-react";
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

  // Compress + read uploaded image to data URL (max 256px, JPEG q=0.8) to keep DB row small
  const handleUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Archivo inválido", description: "Selecciona una imagen", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Imagen muy grande", description: "Máximo 5MB", variant: "destructive" });
      return;
    }
    try {
      const dataUrl: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const img = new Image();
      img.src = dataUrl;
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });
      const max = 256;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas no disponible");
      ctx.drawImage(img, 0, 0, w, h);
      const compressed = canvas.toDataURL("image/jpeg", 0.82);
      setAvatarId(compressed);
      toast({ title: "Foto cargada", description: "Recuerda guardar los cambios" });
    } catch (e: any) {
      toast({ title: "Error", description: e?.message ?? "No se pudo procesar la imagen", variant: "destructive" });
    }
  };

  const isCustomPhoto = avatarId.startsWith("data:") || avatarId.startsWith("http");

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
              <Label className="mb-2 block">Foto personalizada</Label>
              <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 p-3">
                <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90">
                  <Upload className="h-3.5 w-3.5" />
                  Subir mi foto
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleUpload(f);
                      e.target.value = "";
                    }}
                  />
                </label>
                {isCustomPhoto && (
                  <button
                    type="button"
                    onClick={() => setAvatarId(DEFAULT_AVATAR_ID)}
                    className="flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" /> Quitar foto
                  </button>
                )}
                <p className="text-[11px] text-muted-foreground">JPG/PNG · máx. 5MB · se redimensiona automáticamente</p>
              </div>
              <Label className="mb-2 block">O elige un avatar predefinido</Label>
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
