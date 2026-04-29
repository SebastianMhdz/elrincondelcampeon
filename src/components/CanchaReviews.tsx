import { useEffect, useState } from "react";
import { Star, Trash2, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";
import type { Translation } from "@/lib/i18n";
import { getProfilesMap, displayNameOf } from "@/lib/perfil";
import { cleanVisibleText } from "@/lib/utils";
import UserAvatar from "./AvatarUsuario";

interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  display_name?: string | null;
  avatar_url?: string | null;
}

interface Props { canchaId: string; user: User | null; text: Translation; onGoAccount: () => void; }

const CanchaReviews = ({ canchaId, user, text, onGoAccount }: Props) => {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("cancha_reviews")
      .select("id, user_id, rating, comment, created_at")
      .eq("cancha_id", canchaId)
      .order("created_at", { ascending: false });
    if (data) {
      const userIds = Array.from(new Set(data.map(r => r.user_id)));
      const map = await getProfilesMap(userIds);
      setReviews(data.map(r => {
        // Anonymous reviews are stored with comment prefix "[anon] "
        const isAnon = r.comment?.startsWith("[anon] ");
        const cleanComment = isAnon ? r.comment.slice(7) : r.comment;
        const p = map.get(r.user_id);
        return {
          ...r,
          comment: cleanComment,
          display_name: isAnon ? "Anónimo" : displayNameOf(p, "Anónimo"),
          avatar_url: isAnon ? null : (p?.avatar_url ?? null),
        };
      }));
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [canchaId]);

  const submit = async () => {
    if (!user) { toast({ title: text.loginRequired, description: text.loginToReview, variant: "destructive" }); return; }
    const safeComment = cleanVisibleText(comment, true);
    if (!safeComment) { toast({ title: text.errorTitle, description: text.reviewCommentRequired, variant: "destructive" }); return; }
    setSubmitting(true);
    const finalComment = anonymous ? `[anon] ${safeComment}` : safeComment;
    const { error } = await supabase.from("cancha_reviews").insert({ cancha_id: canchaId, user_id: user.id, rating, comment: finalComment });
    setSubmitting(false);
    if (error) { toast({ title: text.errorTitle, description: error.message, variant: "destructive" }); return; }
    setComment(""); setRating(5); setAnonymous(false);
    toast({ title: text.reviewSubmitted });
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("cancha_reviews").delete().eq("id", id);
    if (error) { toast({ title: text.errorTitle, description: error.message, variant: "destructive" }); return; }
    load();
  };

  return (
    <div className="mt-5 rounded-xl border border-border bg-card p-5">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground"><Star className="h-4 w-4 text-primary" /> {text.userReviews}</h3>

      {user ? (
        <div className="mb-4 space-y-2 rounded-lg border border-border bg-muted/40 p-3">
          <div className="flex items-center gap-1">
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setRating(n)} aria-label={`${n}`}>
                <Star className={`h-5 w-5 ${n <= rating ? "fill-primary text-primary" : "text-muted-foreground"}`} />
              </button>
            ))}
          </div>
          <textarea value={comment} onChange={(e) => setComment(cleanVisibleText(e.target.value))} placeholder={text.reviewPlaceholder} className="w-full rounded-md border border-border bg-background p-2 text-sm text-foreground outline-none focus:border-primary" rows={2} maxLength={500} />
          <button onClick={submit} disabled={submitting} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50">{submitting ? "…" : text.submitReview}</button>
        </div>
      ) : (
        <button onClick={onGoAccount} className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 px-3 py-3 text-xs text-muted-foreground hover:bg-muted">
          <LogIn className="h-4 w-4" /> {text.loginToReview}
        </button>
      )}

      {loading ? <p className="text-xs text-muted-foreground">…</p> : reviews.length === 0 ? (
        <p className="text-xs italic text-muted-foreground">{text.noReviewsYet}</p>
      ) : (
        <ul className="space-y-2">
          {reviews.map(r => (
            <li key={r.id} className="rounded-lg border border-border bg-background/50 p-3">
              <div className="mb-1 flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <UserAvatar avatarId={r.avatar_url} name={r.display_name} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-foreground">{r.display_name || text.anonymousUser}</p>
                    <div className="flex">{Array.from({length: r.rating}).map((_,i) => <Star key={i} className="h-3 w-3 fill-primary text-primary" />)}</div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span>
                  {user && user.id === r.user_id && (
                    <button onClick={() => remove(r.id)} className="text-destructive hover:opacity-70" aria-label="delete"><Trash2 className="h-3 w-3" /></button>
                  )}
                </div>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{cleanVisibleText(r.comment, true)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CanchaReviews;