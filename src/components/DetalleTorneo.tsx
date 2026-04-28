import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { ArrowLeft, Calendar, Users, Award, Phone, Megaphone, Trash2, MapPin, Loader2, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  getTournament, listSignups, listAnnouncements, createSignup, deleteSignup,
  createAnnouncement, deleteAnnouncement, updateTournament, deleteTournament,
  type Tournament, type TournamentSignup, type TournamentAnnouncement,
} from "@/lib/torneos";
import { getProfilesMap, displayNameOf } from "@/lib/perfil";
import UserAvatar from "./AvatarUsuario";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface Props {
  tournamentId: string;
  user: User | null;
  text: import("@/lib/i18n").Translation;
  onBack: () => void;
  onGoAccount: () => void;
}

interface SignupView extends TournamentSignup { _name?: string; _avatar?: string | null; }
interface AnnView extends TournamentAnnouncement { _name?: string; _avatar?: string | null; }

const TournamentDetail = ({ tournamentId, user, text, onBack, onGoAccount }: Props) => {
  const { toast } = useToast();
  const [t, setT] = useState<Tournament | null>(null);
  const [canchaName, setCanchaName] = useState<string>("");
  const [signups, setSignups] = useState<SignupView[]>([]);
  const [announcements, setAnnouncements] = useState<AnnView[]>([]);
  const [loading, setLoading] = useState(true);

  // Signup form
  const [teamName, setTeamName] = useState("");
  const [phone, setPhone] = useState("");
  const [signing, setSigning] = useState(false);

  // Announcement form (organizer)
  const [annTitle, setAnnTitle] = useState("");
  const [annBody, setAnnBody] = useState("");
  const [posting, setPosting] = useState(false);

  const isOrganizer = !!user && t?.organizer_id === user.id;

  const load = async () => {
    setLoading(true);
    const tour = await getTournament(tournamentId);
    setT(tour);
    if (tour) {
      const { data: c } = await supabase.from("canchas").select("name").eq("id", tour.cancha_id).maybeSingle();
      setCanchaName(c?.name ?? "");
      const [s, a] = await Promise.all([listSignups(tournamentId), listAnnouncements(tournamentId)]);
      const ids = Array.from(new Set([...s.map(x => x.user_id), ...a.map(x => x.author_id)]));
      const map = await getProfilesMap(ids);
      setSignups(s.map(x => { const p = map.get(x.user_id); return { ...x, _name: displayNameOf(p, x.team_name), _avatar: p?.avatar_url ?? null }; }));
      setAnnouncements(a.map(x => { const p = map.get(x.author_id); return { ...x, _name: displayNameOf(p, text.organizer), _avatar: p?.avatar_url ?? null }; }));
    }
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tournamentId]);

  const userSignup = user ? signups.find(s => s.user_id === user.id) : null;
  const slotsLeft = t ? t.max_teams - signups.length : 0;

  const handleSignup = async () => {
    if (!user || !t) return;
    if (!teamName.trim()) { toast({ title: text.missingTeamName, description: text.writeTeamName, variant: "destructive" }); return; }
    setSigning(true);
    try {
      await createSignup({ tournament_id: t.id, user_id: user.id, team_name: teamName.trim(), contact_phone: phone.trim() || null, notes: null });
      toast({ title: text.registered, description: text.teamRegistered });
      setTeamName(""); setPhone("");
      load();
    } catch (e: any) {
      toast({ title: text.cannotRegister, description: e.message ?? text.checkSlots, variant: "destructive" });
    } finally { setSigning(false); }
  };

  const handleCancelSignup = async () => {
    if (!userSignup) return;
    await deleteSignup(userSignup.id);
    toast({ title: text.signupCancelled });
    load();
  };

  const handlePostAnnouncement = async () => {
    if (!user || !t) return;
    if (!annTitle.trim() || !annBody.trim()) { toast({ title: text.missingData, variant: "destructive" }); return; }
    setPosting(true);
    try {
      await createAnnouncement({ tournament_id: t.id, author_id: user.id, title: annTitle.trim(), body: annBody.trim() });
      setAnnTitle(""); setAnnBody("");
      toast({ title: text.announcementPosted });
      load();
    } catch (e: any) {
      toast({ title: text.errorTitle, description: e.message, variant: "destructive" });
    } finally { setPosting(false); }
  };

  const toggleSignups = async () => {
    if (!t) return;
    await updateTournament(t.id, { signups_open: !t.signups_open });
    load();
  };

  const handleDeleteTournament = async () => {
    if (!t) return;
    if (!confirm(text.confirmDeleteTournament)) return;
    await deleteTournament(t.id);
    toast({ title: text.tournamentDeleted });
    onBack();
  };

  if (loading) return <div className="section-sport-panel rounded-[22px] p-10 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" /></div>;
  if (!t) return (
    <div className="section-sport-panel rounded-[22px] p-8 text-center">
      <p className="text-sm text-muted-foreground">{text.tournamentNotFound}</p>
      <Button onClick={onBack} variant="outline" className="mt-3">{text.goBack}</Button>
    </div>
  );

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" /> {text.backToTournaments}
      </button>

      <div className="overflow-hidden rounded-[22px] border border-border bg-card shadow-md">
        <div className="relative bg-gradient-to-br from-primary to-accent p-6 text-primary-foreground md:p-8">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${t.status === "ongoing" ? "bg-white/25" : "bg-white/15"}`}>
              {t.status === "ongoing" ? text.inProgress : t.status === "finished" ? text.finished : text.scheduled}
            </span>
            {t.signups_open && <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-primary">{text.signupsOpenLong}</span>}
          </div>
          <h1 className="text-2xl font-extrabold md:text-3xl">{t.name}</h1>
          <p className="mt-1 flex items-center gap-1 text-sm text-white/90"><MapPin className="h-4 w-4" /> {canchaName}</p>
          {t.description && <p className="mt-3 max-w-2xl text-sm text-white/90">{t.description}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3 p-5 md:grid-cols-4">
          <div className="rounded-lg bg-muted p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{text.datesLabel}</p>
            <p className="mt-1 flex items-center gap-1 text-sm font-bold text-foreground"><Calendar className="h-3 w-3" />{new Date(t.start_date).toLocaleDateString()}</p>
            <p className="text-xs text-muted-foreground">→ {new Date(t.end_date).toLocaleDateString()}</p>
          </div>
          <div className="rounded-lg bg-muted p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{text.slotsLabel}</p>
            <p className="mt-1 flex items-center gap-1 text-sm font-bold text-foreground"><Users className="h-3 w-3" />{signups.length}/{t.max_teams}</p>
            <p className="text-xs text-muted-foreground">{slotsLeft > 0 ? text.slotsFree.replace("{n}", String(slotsLeft)) : text.slotsFull}</p>
          </div>
          <div className="rounded-lg bg-muted p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{text.formatLabel}</p>
            <p className="mt-1 text-sm font-bold text-foreground">{t.format}</p>
            {t.entry_fee && <p className="text-xs text-muted-foreground">{t.entry_fee}</p>}
          </div>
          <div className="rounded-lg bg-muted p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{text.prizeLabel}</p>
            <p className="mt-1 flex items-center gap-1 text-sm font-bold text-accent"><Award className="h-3 w-3" />{t.prize ?? "—"}</p>
            {t.contact_phone && <p className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="h-3 w-3" />{t.contact_phone}</p>}
          </div>
        </div>
      </div>

      <div className="section-sport-panel rounded-[22px] p-5">
        <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-foreground"><Users className="h-4 w-4 text-primary" /> {text.signupsTitle} ({signups.length}/{t.max_teams})</h2>

        {!t.signups_open ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-center">
            <p className="text-sm font-semibold text-foreground">{text.signupsClosed}</p>
            <p className="text-xs text-muted-foreground">{text.signupsClosedDesc}</p>
          </div>
        ) : !user ? (
          <button onClick={onGoAccount} className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 px-3 py-3 text-sm text-muted-foreground hover:bg-muted">
            <LogIn className="h-4 w-4" /> {text.signInToRegister}
          </button>
        ) : userSignup ? (
          <div className="flex items-center justify-between rounded-lg border border-accent/30 bg-accent/10 p-3">
            <div>
              <p className="text-sm font-bold text-foreground">✓ {text.registeredAs} "{userSignup.team_name}"</p>
              <p className="text-xs text-muted-foreground">{text.willNotifyAnnouncements}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleCancelSignup}>{text.cancelSignup}</Button>
          </div>
        ) : slotsLeft <= 0 ? (
          <p className="rounded-lg bg-muted p-3 text-center text-sm text-muted-foreground">{text.slotsExhausted}</p>
        ) : (
          <div className="space-y-2 rounded-lg border border-border bg-muted/40 p-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <div><Label className="text-xs">{text.teamNameLabel}</Label><Input value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder={text.teamNamePlaceholder} maxLength={50} /></div>
              <div><Label className="text-xs">{text.phoneShort}</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={text.phonePlaceholder57} maxLength={30} /></div>
            </div>
            <Button onClick={handleSignup} disabled={signing} className="w-full">{signing ? "..." : text.registerTeam}</Button>
          </div>
        )}

        {signups.length > 0 && (
          <ul className="mt-4 space-y-1.5">
            {signups.map(s => (
              <li key={s.id} className="flex items-center gap-2 rounded-md border border-border bg-background/50 p-2 text-xs">
                <UserAvatar avatarId={s._avatar} name={s._name} size="xs" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-foreground">{s.team_name}</p>
                  <p className="truncate text-[10px] text-muted-foreground">{s._name}</p>
                </div>
                <span className="text-[10px] text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="section-sport-panel rounded-[22px] p-5">
        <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-foreground"><Megaphone className="h-4 w-4 text-accent" /> {text.tournamentAnnouncements}</h2>

        {isOrganizer && (
          <div className="mb-4 space-y-2 rounded-lg border border-border bg-muted/40 p-3">
            <Input value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} placeholder={text.announcementTitle} maxLength={100} />
            <Textarea value={annBody} onChange={(e) => setAnnBody(e.target.value)} placeholder={text.announcementBody} rows={2} maxLength={500} />
            <Button onClick={handlePostAnnouncement} disabled={posting} size="sm">{posting ? "..." : text.publishAnnouncement}</Button>
          </div>
        )}

        {announcements.length === 0 ? (
          <p className="text-xs italic text-muted-foreground">{text.noAnnouncementsYet}</p>
        ) : (
          <ul className="space-y-2">
            {announcements.map(a => (
              <li key={a.id} className="rounded-lg border border-border bg-background/50 p-3">
                <div className="mb-1 flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <UserAvatar avatarId={a._avatar} name={a._name} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-foreground">{a.title}</p>
                      <p className="truncate text-[10px] text-muted-foreground">{a._name} · {new Date(a.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  {isOrganizer && (
                    <button onClick={() => deleteAnnouncement(a.id).then(load)} className="text-destructive hover:opacity-70" aria-label="delete"><Trash2 className="h-3 w-3" /></button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground whitespace-pre-wrap">{a.body}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {isOrganizer && (
        <div className="rounded-[22px] border border-primary/30 bg-primary/5 p-5">
          <h3 className="mb-3 text-sm font-bold text-foreground">{text.organizerPanel}</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
              <div>
                <p className="text-sm font-semibold text-foreground">{text.signupsOpenSwitchLabel}</p>
                <p className="text-xs text-muted-foreground">{text.signupsOpenSwitchDesc}</p>
              </div>
              <Switch checked={t.signups_open} onCheckedChange={toggleSignups} />
            </div>
            <Button variant="destructive" size="sm" onClick={handleDeleteTournament} className="gap-1.5"><Trash2 className="h-3.5 w-3.5" /> {text.deleteTournament}</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentDetail;
