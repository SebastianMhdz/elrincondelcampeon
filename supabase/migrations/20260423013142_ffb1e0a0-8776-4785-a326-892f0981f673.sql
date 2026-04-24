
-- Extend profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS custom_name text;

-- Reviews table
CREATE TABLE IF NOT EXISTS public.cancha_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cancha_id uuid NOT NULL REFERENCES public.canchas(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cancha_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews" ON public.cancha_reviews FOR SELECT USING (true);
CREATE POLICY "Users can create their own reviews" ON public.cancha_reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reviews" ON public.cancha_reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reviews" ON public.cancha_reviews FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all reviews" ON public.cancha_reviews FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_cancha_reviews_updated_at BEFORE UPDATE ON public.cancha_reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Support reports
CREATE TABLE IF NOT EXISTS public.support_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  category text DEFAULT 'general',
  status text NOT NULL DEFAULT 'open',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.support_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create support reports" ON public.support_reports FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Users can view their own reports" ON public.support_reports FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all reports" ON public.support_reports FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update reports" ON public.support_reports FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete reports" ON public.support_reports FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_support_reports_updated_at BEFORE UPDATE ON public.support_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Chat logs (optional persistence)
CREATE TABLE IF NOT EXISTS public.chat_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  role text NOT NULL CHECK (role IN ('user','assistant')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert chat logs" ON public.chat_logs FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Users can view their own chat logs" ON public.chat_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all chat logs" ON public.chat_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to manage canchas
CREATE POLICY "Admins can insert canchas" ON public.canchas FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update canchas" ON public.canchas FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete canchas" ON public.canchas FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
