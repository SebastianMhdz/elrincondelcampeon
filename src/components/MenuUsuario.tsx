import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, UserCog, UserCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getProfile, type UserProfile } from "@/lib/perfil";
import UserAvatar from "./AvatarUsuario";
import ProfileEditor from "./EditorPerfil";
import { useToast } from "@/hooks/use-toast";

interface Props {
  user: User | null;
  onGoAccount: () => void;
}

const UserMenu = ({ user, onGoAccount }: Props) => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  const loadProfile = async () => {
    if (!user) { setProfile(null); return; }
    const p = await getProfile(user.id);
    setProfile(p);
  };

  useEffect(() => { loadProfile(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [user?.id]);

  if (!user) {
    return (
      <Button size="sm" variant="default" onClick={onGoAccount} className="gap-1.5">
        <LogIn className="h-4 w-4" />
        <span className="hidden sm:inline">Iniciar sesión</span>
      </Button>
    );
  }

  const displayName = profile?.custom_name || profile?.display_name || (user.user_metadata?.display_name as string) || user.email?.split("@")[0] || "Tú";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-full border border-border bg-card px-1.5 py-1 pr-3 text-left transition hover:border-primary hover:shadow-sm">
            <UserAvatar avatarId={profile?.avatar_url} name={displayName} size="sm" />
            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-xs font-semibold leading-tight text-foreground">{displayName}</p>
              {profile?.country && <p className="truncate text-[10px] leading-tight text-muted-foreground">{profile.country}</p>}
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>
            <div className="flex items-center gap-3">
              <UserAvatar avatarId={profile?.avatar_url} name={displayName} size="md" />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-foreground">{displayName}</p>
                <p className="truncate text-[11px] font-normal text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setEditorOpen(true)}>
            <UserCog className="mr-2 h-4 w-4" /> Personalizar perfil
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onGoAccount}>
            <UserCircle className="mr-2 h-4 w-4" /> Mi cuenta
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={async () => {
              await supabase.auth.signOut();
              toast({ title: "Sesión cerrada", description: "Hasta pronto 👋" });
            }}
            className="text-destructive focus:text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" /> Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProfileEditor open={editorOpen} onOpenChange={setEditorOpen} user={user} onSaved={(p) => setProfile(p)} />
    </>
  );
};

export default UserMenu;
