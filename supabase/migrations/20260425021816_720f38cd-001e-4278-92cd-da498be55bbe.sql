ALTER TABLE public.canchas
ADD COLUMN IF NOT EXISTS benefits jsonb NOT NULL DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS social_links jsonb NOT NULL DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS gallery_urls jsonb NOT NULL DEFAULT '[]'::jsonb;

CREATE OR REPLACE FUNCTION public.refresh_cancha_review_stats(_cancha_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.canchas
  SET
    rating = COALESCE((SELECT round(avg(rating)::numeric, 1) FROM public.cancha_reviews WHERE cancha_id = _cancha_id), rating),
    reviews_count = COALESCE((SELECT count(*)::integer FROM public.cancha_reviews WHERE cancha_id = _cancha_id), 0),
    updated_at = now()
  WHERE id = _cancha_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_cancha_review_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.refresh_cancha_review_stats(OLD.cancha_id);
    RETURN OLD;
  END IF;

  PERFORM public.refresh_cancha_review_stats(NEW.cancha_id);
  IF TG_OP = 'UPDATE' AND OLD.cancha_id IS DISTINCT FROM NEW.cancha_id THEN
    PERFORM public.refresh_cancha_review_stats(OLD.cancha_id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS cancha_reviews_refresh_stats ON public.cancha_reviews;
CREATE TRIGGER cancha_reviews_refresh_stats
AFTER INSERT OR UPDATE OR DELETE ON public.cancha_reviews
FOR EACH ROW
EXECUTE FUNCTION public.handle_cancha_review_stats();

CREATE UNIQUE INDEX IF NOT EXISTS reservations_unique_confirmed_slot
ON public.reservations (cancha_id, reservation_date, start_time)
WHERE status = 'confirmed';

CREATE UNIQUE INDEX IF NOT EXISTS profiles_user_id_unique
ON public.profiles (user_id);

DROP POLICY IF EXISTS "Public can view profile display data" ON public.profiles;
CREATE POLICY "Public can view profile display data"
ON public.profiles
FOR SELECT
USING (true);