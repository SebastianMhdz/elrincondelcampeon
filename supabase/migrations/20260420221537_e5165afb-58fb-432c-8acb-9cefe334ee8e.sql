CREATE TABLE public.canchas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id INTEGER UNIQUE,
  name TEXT NOT NULL,
  addr TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  rating NUMERIC(2,1),
  reviews_count INTEGER DEFAULT 0,
  phone TEXT,
  hours TEXT,
  precio TEXT,
  precio_min INTEGER,
  icon TEXT,
  tipo TEXT,
  image_url TEXT,
  servicios JSONB NOT NULL DEFAULT '[]'::jsonb,
  rutas JSONB NOT NULL DEFAULT '[]'::jsonb,
  reviews JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cancha_id UUID NOT NULL REFERENCES public.canchas(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  reservation_date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration_hours INTEGER NOT NULL DEFAULT 1 CHECK (duration_hours BETWEEN 1 AND 3),
  format_label TEXT,
  extras JSONB NOT NULL DEFAULT '[]'::jsonb,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_reservation_slot UNIQUE (cancha_id, reservation_date, start_time)
);

CREATE INDEX idx_canchas_legacy_id ON public.canchas(legacy_id);
CREATE INDEX idx_reservations_slot_lookup ON public.reservations(cancha_id, reservation_date, start_time);
CREATE INDEX idx_reservations_email ON public.reservations(customer_email);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_reservation_slot_available(_cancha_id uuid, _reservation_date date, _start_time time)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
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

CREATE TRIGGER update_canchas_updated_at
BEFORE UPDATE ON public.canchas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at
BEFORE UPDATE ON public.reservations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.canchas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view canchas"
ON public.canchas
FOR SELECT
USING (true);

CREATE POLICY "Anyone can create available reservations"
ON public.reservations
FOR INSERT
TO anon, authenticated
WITH CHECK (
  public.is_reservation_slot_available(cancha_id, reservation_date, start_time)
);

CREATE POLICY "Service role can manage reservations"
ON public.reservations
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);