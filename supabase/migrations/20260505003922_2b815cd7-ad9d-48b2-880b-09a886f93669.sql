
-- Fix: Remove tournament blocking from slot availability check.
-- Tournaments will block slots via their own reservations, not by blanket-blocking all dates.
CREATE OR REPLACE FUNCTION public.is_reservation_slot_available(
  _cancha_id uuid,
  _reservation_date date,
  _start_time time without time zone
)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT NOT EXISTS (
    SELECT 1
    FROM public.reservations
    WHERE cancha_id = _cancha_id
      AND reservation_date = _reservation_date
      AND start_time = _start_time
      AND status = 'confirmed'
  );
$$;
