DROP POLICY IF EXISTS "Anyone can insert chat logs" ON public.chat_logs;
CREATE POLICY "Anyone can create valid chat logs"
ON public.chat_logs
FOR INSERT
TO anon, authenticated
WITH CHECK (
  role IN ('user', 'assistant')
  AND length(btrim(content)) BETWEEN 1 AND 4000
  AND (user_id IS NULL OR auth.uid() = user_id)
);

DROP POLICY IF EXISTS "Anyone can create support reports" ON public.support_reports;
CREATE POLICY "Anyone can create valid support reports"
ON public.support_reports
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(btrim(name)) BETWEEN 2 AND 120
  AND email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  AND length(btrim(subject)) BETWEEN 2 AND 160
  AND length(btrim(message)) BETWEEN 5 AND 2000
  AND (user_id IS NULL OR auth.uid() = user_id)
);