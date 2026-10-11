-- ==============================================================================
-- SCHEMA SUPABASE: Mildred Restrepo Cosmetóloga
-- Copia y pega este script en el "SQL Editor" de tu proyecto en Supabase
-- ==============================================================================

-- 1. Crear tabla de citas
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    client_name TEXT NOT NULL,
    client_id TEXT NOT NULL, -- Cédula de ciudadanía / Documento de identidad
    client_phone TEXT NOT NULL,
    service TEXT NOT NULL DEFAULT 'Limpieza Facial Profunda',
    appointment_date DATE NOT NULL,
    appointment_time TEXT NOT NULL, -- Ej: '09:00 AM', '10:30 AM', '02:00 PM'
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'completed', 'cancelled')),
    notes TEXT,
    created_by_ip TEXT
);

-- 2. Índice único para evitar doble cita en la misma fecha y hora (sólo para citas activas)
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_appointment
ON public.appointments (appointment_date, appointment_time)
WHERE status != 'cancelled';

-- 3. Índices para búsqueda rápida por fecha y por cédula
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments (appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON public.appointments (client_id);

-- 4. Habilitar Row Level Security (RLS)
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de seguridad RLS:
-- Permitir a usuarios anónimos (visitantes) consultar disponibilidad y sus citas
CREATE POLICY "Permitir lectura publica de citas para verificar disponibilidad"
ON public.appointments
FOR SELECT
TO anon, authenticated
USING (true);

-- Permitir a cualquier cliente insertar una nueva cita
CREATE POLICY "Permitir agendar nueva cita"
ON public.appointments
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Permitir a usuarios anónimos cancelar o actualizar su propia cita si conocen el id o cédula
CREATE POLICY "Permitir actualizar citas"
ON public.appointments
FOR UPDATE
TO anon, authenticated
USING (true);

-- 6. Insertar algunas citas de ejemplo para pruebas de disponibilidad (opcional)
INSERT INTO public.appointments (client_name, client_id, client_phone, service, appointment_date, appointment_time, notes)
VALUES 
  ('Camila Restrepo', '1020456789', '3104567890', 'Limpieza Facial Profunda', CURRENT_DATE, '10:00 AM', 'Piel sensible'),
  ('Valentina Gómez', '1035987654', '3129876543', 'Hidratación con Ácido Hialurónico', CURRENT_DATE, '03:00 PM', 'Tratamiento previo')
ON CONFLICT DO NOTHING;
