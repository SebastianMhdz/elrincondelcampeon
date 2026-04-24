-- =============== TOURNAMENTS ===============
CREATE TABLE public.tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cancha_id UUID NOT NULL REFERENCES public.canchas(id) ON DELETE CASCADE,
  organizer_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  format TEXT NOT NULL DEFAULT 'Fútbol 5',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  prize TEXT,
  max_teams INTEGER NOT NULL DEFAULT 8,
  signups_open BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'scheduled',
  banner_url TEXT,
  contact_phone TEXT,
  entry_fee TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tournaments_cancha ON public.tournaments(cancha_id);
CREATE INDEX idx_tournaments_dates ON public.tournaments(start_date, end_date);

ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tournaments"
  ON public.tournaments FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create tournaments"
  ON public.tournaments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers and admins can update tournaments"
  ON public.tournaments FOR UPDATE TO authenticated
  USING (auth.uid() = organizer_id OR has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = organizer_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Organizers and admins can delete tournaments"
  ON public.tournaments FOR DELETE TO authenticated
  USING (auth.uid() = organizer_id OR has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_tournaments_updated_at
  BEFORE UPDATE ON public.tournaments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============== SIGNUPS ===============
CREATE TABLE public.tournament_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  team_name TEXT NOT NULL,
  contact_phone TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tournament_id, user_id)
);

CREATE INDEX idx_signups_tournament ON public.tournament_signups(tournament_id);

ALTER TABLE public.tournament_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view signups"
  ON public.tournament_signups FOR SELECT USING (true);

CREATE POLICY "Authenticated users can sign up themselves"
  ON public.tournament_signups FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.tournaments t
      WHERE t.id = tournament_id
        AND t.signups_open = true
        AND (SELECT COUNT(*) FROM public.tournament_signups s WHERE s.tournament_id = t.id) < t.max_teams
    )
  );

CREATE POLICY "Users can cancel their own signup"
  ON public.tournament_signups FOR DELETE TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.tournaments t WHERE t.id = tournament_id AND t.organizer_id = auth.uid())
    OR has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Organizers and admins can update signups"
  ON public.tournament_signups FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.tournaments t WHERE t.id = tournament_id AND t.organizer_id = auth.uid())
    OR has_role(auth.uid(), 'admin')
  );

-- =============== ANNOUNCEMENTS ===============
CREATE TABLE public.tournament_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_announcements_tournament ON public.tournament_announcements(tournament_id);

ALTER TABLE public.tournament_announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view announcements"
  ON public.tournament_announcements FOR SELECT USING (true);

CREATE POLICY "Organizers and admins can create announcements"
  ON public.tournament_announcements FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = author_id
    AND (
      EXISTS (SELECT 1 FROM public.tournaments t WHERE t.id = tournament_id AND t.organizer_id = auth.uid())
      OR has_role(auth.uid(), 'admin')
    )
  );

CREATE POLICY "Organizers and admins can delete announcements"
  ON public.tournament_announcements FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.tournaments t WHERE t.id = tournament_id AND t.organizer_id = auth.uid())
    OR has_role(auth.uid(), 'admin')
  );

-- =============== UPDATE SLOT AVAILABILITY ===============
CREATE OR REPLACE FUNCTION public.is_reservation_slot_available(
  _cancha_id uuid,
  _reservation_date date,
  _start_time time without time zone
) RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT
    NOT EXISTS (
      SELECT 1
      FROM public.reservations
      WHERE cancha_id = _cancha_id
        AND reservation_date = _reservation_date
        AND start_time = _start_time
        AND status = 'confirmed'
    )
    AND NOT EXISTS (
      SELECT 1
      FROM public.tournaments t
      WHERE t.cancha_id = _cancha_id
        AND t.status IN ('scheduled', 'ongoing')
        AND _reservation_date BETWEEN t.start_date AND t.end_date
    );
$function$;