
CREATE OR REPLACE FUNCTION public.get_cancha_busy_slots(
  _cancha_id uuid,
  _from date,
  _to date
)
RETURNS TABLE (reservation_date date, start_time time, duration_hours integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.reservation_date, r.start_time, r.duration_hours
  FROM public.reservations r
  WHERE r.cancha_id = _cancha_id
    AND r.status = 'confirmed'
    AND r.reservation_date BETWEEN _from AND _to;
$$;

GRANT EXECUTE ON FUNCTION public.get_cancha_busy_slots(uuid, date, date) TO anon, authenticated;
