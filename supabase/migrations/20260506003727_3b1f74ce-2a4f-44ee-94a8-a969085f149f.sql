CREATE OR REPLACE FUNCTION public.is_reservation_slot_available(
  _cancha_id uuid,
  _reservation_date date,
  _start_time time without time zone,
  _duration_hours integer
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT NOT EXISTS (
    SELECT 1
    FROM public.reservations r
    WHERE r.cancha_id = _cancha_id
      AND r.reservation_date = _reservation_date
      AND r.status = 'confirmed'
      AND tsrange(
        (_reservation_date::timestamp + r.start_time),
        (_reservation_date::timestamp + r.start_time + make_interval(hours => greatest(r.duration_hours, 1))),
        '[)'
      ) && tsrange(
        (_reservation_date::timestamp + _start_time),
        (_reservation_date::timestamp + _start_time + make_interval(hours => greatest(_duration_hours, 1))),
        '[)'
      )
  );
$$;

DROP POLICY IF EXISTS "Anyone can create available reservations" ON public.reservations;

CREATE POLICY "Authenticated users can create their own available reservations"
ON public.reservations
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND public.is_reservation_slot_available(cancha_id, reservation_date, start_time, duration_hours)
);

DROP INDEX IF EXISTS public.reservations_unique_confirmed_slot;
CREATE INDEX IF NOT EXISTS idx_reservations_confirmed_slot_range
ON public.reservations (cancha_id, reservation_date, status, start_time);