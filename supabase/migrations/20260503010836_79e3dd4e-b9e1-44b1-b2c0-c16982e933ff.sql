
-- Create user_infractions table
CREATE TABLE public.user_infractions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  infraction_type text NOT NULL DEFAULT 'profanity',
  description text NOT NULL,
  detected_in text NOT NULL DEFAULT 'unknown',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_infractions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all infractions" ON public.user_infractions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own infractions" ON public.user_infractions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Create user_bans table
CREATE TABLE public.user_bans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  ban_type text NOT NULL DEFAULT 'temporary',
  reason text NOT NULL,
  banned_by uuid,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_bans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all bans" ON public.user_bans
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own bans" ON public.user_bans
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can check bans for validation" ON public.user_bans
  FOR SELECT TO anon, authenticated
  USING (true);
