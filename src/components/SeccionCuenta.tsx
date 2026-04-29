import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { UserCircle, LogIn, UserPlus, LogOut, Pencil, MapPin, Eye, EyeOff } from "lucide-react";
import type { Translation } from "@/lib/i18n";
import ProfileEditor from "@/components/EditorPerfil";
import UserAvatar from "@/components/AvatarUsuario";
import { displayNameOf, getProfile, type UserProfile } from "@/lib/perfil";

interface Props {
  text: Translation;
  user: User | null;
}

const AccountSection = ({ text, user }: Props) => {
  const { toast } = useToast();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!user) { setProfile(null); return; }
    getProfile(user.id).then(setProfile);
  }, [user]);

  const handleSignUp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { display_name: name }, emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    if (error) {
      toast({ title: text.authError, description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: text.signupSuccess, description: text.signupSuccessDesc });
    setMode("signin");
  };

  const handleSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: text.authError, description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: text.loginSuccess, description: email });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({ title: text.signOutBtn, description: "✓" });
  };

  const inputClass = "w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30";

  if (user) {
    const displayName = displayNameOf(profile, (user.user_metadata?.display_name as string) || user.email || text.anonymousUser);
    return (
      <div className="section-sport-panel rounded-[22px] p-6 md:p-8">
        <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <div className="mb-6 flex items-center gap-4">
              <UserAvatar avatarId={profile?.avatar_url} name={displayName} size="xl" />
              <div className="min-w-0">
                <h2 className="truncate text-xl font-bold text-foreground">{displayName}</h2>
                <p className="truncate text-sm text-muted-foreground">{text.signedInAs}: {user.email}</p>
                {profile?.country && <p className="mt-1 flex items-center gap-1 text-xs font-medium text-muted-foreground"><MapPin className="h-3 w-3 text-primary" /> {profile.country}</p>}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setProfileOpen(true)} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
                <Pencil className="h-4 w-4" /> Personalizar perfil
              </button>
              <button onClick={handleSignOut} className="flex items-center gap-2 rounded-lg bg-destructive px-4 py-2.5 text-sm font-semibold text-destructive-foreground hover:opacity-90">
                <LogOut className="h-4 w-4" /> {text.signOutBtn}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="mb-3 text-sm font-bold text-foreground">Vista previa pública</p>
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <div className="mb-3 flex items-center gap-3">
                <UserAvatar avatarId={profile?.avatar_url} name={displayName} size="lg" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-foreground">{displayName}</p>
                  <p className="truncate text-xs text-muted-foreground">{profile?.country || "País sin definir"}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{profile?.bio || "Tu bio aparecerá aquí cuando la agregues."}</p>
              <div className="mt-3 flex items-center gap-1 text-primary">
                {[1,2,3,4,5].map((n) => <span key={n}>★</span>)}
                <span className="ml-2 text-xs font-medium text-muted-foreground">Así se verá en reseñas</span>
              </div>
            </div>
          </div>
        </div>
        <ProfileEditor open={profileOpen} onOpenChange={setProfileOpen} user={user} onSaved={setProfile} />
      </div>
    );
  }

  return (
    <div className="section-sport-panel rounded-[22px] p-6 md:p-8">
      <h2 className="mb-1 flex items-center gap-2 text-xl font-bold text-foreground"><UserCircle className="h-6 w-6 text-primary" /> {text.accountTitle}</h2>
      <p className="mb-5 text-sm text-muted-foreground">{text.accountDescription}</p>

      <div className="mb-5 flex gap-1 rounded-lg border border-border bg-muted/40 p-1">
        <button onClick={() => setMode("signin")} className={`flex-1 rounded-md py-2 text-sm font-semibold transition ${mode === "signin" ? "bg-card text-primary shadow-sm" : "text-muted-foreground"}`}>
          <LogIn className="mr-1.5 inline h-4 w-4" /> {text.signInTab}
        </button>
        <button onClick={() => setMode("signup")} className={`flex-1 rounded-md py-2 text-sm font-semibold transition ${mode === "signup" ? "bg-card text-primary shadow-sm" : "text-muted-foreground"}`}>
          <UserPlus className="mr-1.5 inline h-4 w-4" /> {text.signUpTab}
        </button>
      </div>

      <div className="space-y-3">
        {mode === "signup" && (
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{text.fullName}</label>
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder={text.yourName} />
          </div>
        )}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{text.email}</label>
          <input type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} placeholder={text.emailPlaceholder} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{text.password}</label>
          <input type="password" className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        <button
          onClick={mode === "signin" ? handleSignIn : handleSignUp}
          disabled={loading}
          className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "..." : mode === "signin" ? text.signIn : text.createAccount}
        </button>
        <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="w-full text-center text-xs text-muted-foreground hover:text-primary">
          {mode === "signin" ? text.needAccount : text.alreadyHaveAccount}
        </button>
      </div>
    </div>
  );
};

export default AccountSection;
