import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { UserCircle, LogIn, UserPlus, LogOut } from "lucide-react";
import type { Translation } from "@/lib/i18n";

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
    return (
      <div className="section-sport-panel rounded-[22px] p-6 md:p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserCircle className="h-9 w-9" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{user.user_metadata?.display_name ?? user.email}</h2>
            <p className="text-sm text-muted-foreground">{text.signedInAs}: {user.email}</p>
          </div>
        </div>
        <button onClick={handleSignOut} className="flex items-center gap-2 rounded-lg bg-destructive px-4 py-2.5 text-sm font-semibold text-destructive-foreground hover:opacity-90">
          <LogOut className="h-4 w-4" /> {text.signOutBtn}
        </button>
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
