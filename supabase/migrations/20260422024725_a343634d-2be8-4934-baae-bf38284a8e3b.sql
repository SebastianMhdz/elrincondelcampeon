
-- 1) admin_logs table to record admin accesses
CREATE TABLE public.admin_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_name TEXT NOT NULL,
  user_id UUID,
  accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_info TEXT
);

ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view admin logs"
ON public.admin_logs FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert admin logs"
ON public.admin_logs FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can delete admin logs"
ON public.admin_logs FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 2) Add user_id to reservations
ALTER TABLE public.reservations
  ADD COLUMN user_id UUID;

CREATE INDEX idx_reservations_user_id ON public.reservations(user_id);

CREATE POLICY "Users can view their own reservations"
ON public.reservations FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own reservations"
ON public.reservations FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reservations"
ON public.reservations FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all reservations"
ON public.reservations FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
