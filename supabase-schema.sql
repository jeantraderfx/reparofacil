-- ============================================
-- ReparoFácil — Supabase Schema
-- Ejecuta este SQL en Supabase > SQL Editor
-- ============================================

-- 1. Perfiles de clientes
CREATE TABLE IF NOT EXISTS cliente_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  telefono TEXT,
  domicilio TEXT,
  zip_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Perfiles de profesionales
CREATE TABLE IF NOT EXISTS profesional_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  especialidad TEXT NOT NULL,
  telefono TEXT,
  anos_experiencia INT DEFAULT 0,
  situacion_laboral TEXT,
  zip_code TEXT,
  rating NUMERIC(3,2),
  trabajos_completados INT DEFAULT 0,
  certificado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Trabajos / solicitudes
CREATE TABLE IF NOT EXISTS trabajos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  profesional_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tipo_servicio TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  precio NUMERIC(10,2),
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente','aceptado','en_progreso','completado','cancelado')),
  valorado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Valoraciones
CREATE TABLE IF NOT EXISTS valoraciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trabajo_id UUID REFERENCES trabajos(id) ON DELETE CASCADE UNIQUE,
  cliente_id UUID REFERENCES auth.users(id),
  profesional_id UUID REFERENCES auth.users(id),
  puntuacion INT CHECK (puntuacion BETWEEN 1 AND 5),
  comentario TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. RLS (Row Level Security)
ALTER TABLE cliente_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profesional_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trabajos ENABLE ROW LEVEL SECURITY;
ALTER TABLE valoraciones ENABLE ROW LEVEL SECURITY;

-- Políticas cliente_profiles
CREATE POLICY "Usuarios ven su propio perfil" ON cliente_profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuarios crean su propio perfil" ON cliente_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuarios editan su propio perfil" ON cliente_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas profesional_profiles
CREATE POLICY "Cualquiera puede ver perfiles de profesionales" ON profesional_profiles
  FOR SELECT USING (true);
CREATE POLICY "Profesionales crean su perfil" ON profesional_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Profesionales editan su perfil" ON profesional_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas trabajos
CREATE POLICY "Clientes ven sus trabajos" ON trabajos
  FOR SELECT USING (auth.uid() = cliente_id OR auth.uid() = profesional_id);
CREATE POLICY "Profesionales ven trabajos disponibles" ON trabajos
  FOR SELECT USING (estado = 'pendiente' AND profesional_id IS NULL);
CREATE POLICY "Clientes crean trabajos" ON trabajos
  FOR INSERT WITH CHECK (auth.uid() = cliente_id);
CREATE POLICY "Actualizar trabajos propios" ON trabajos
  FOR UPDATE USING (auth.uid() = cliente_id OR auth.uid() = profesional_id);

-- Políticas valoraciones
CREATE POLICY "Valoraciones visibles" ON valoraciones
  FOR SELECT USING (true);
CREATE POLICY "Clientes crean valoraciones" ON valoraciones
  FOR INSERT WITH CHECK (auth.uid() = cliente_id);

-- 6. Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON trabajos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
