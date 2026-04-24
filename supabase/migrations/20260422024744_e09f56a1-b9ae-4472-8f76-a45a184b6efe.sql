
DROP POLICY "Anyone can insert admin logs" ON public.admin_logs;
-- No INSERT policy means only service_role (which bypasses RLS) can insert via the edge function.
