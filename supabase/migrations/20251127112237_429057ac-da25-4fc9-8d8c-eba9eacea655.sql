-- ============================================
-- SIA - Database Schema
-- Security Industrial Assistant
-- ============================================

-- Tabela de dispositivos (SIA Boxes)
CREATE TABLE public.devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  location TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de leituras de sensores
CREATE TABLE public.sensor_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL REFERENCES public.devices(device_id) ON DELETE CASCADE,
  temperatura DECIMAL(5,2),
  gas INTEGER,
  chama INTEGER CHECK (chama IN (0, 1)),
  movimento INTEGER CHECK (movimento IN (0, 1)),
  vibracao INTEGER,
  distancia INTEGER,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índice para consultas rápidas por dispositivo e tempo
CREATE INDEX idx_readings_device_timestamp ON public.sensor_readings(device_id, created_at DESC);

-- Tabela de alertas
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL REFERENCES public.devices(device_id) ON DELETE CASCADE,
  level TEXT NOT NULL CHECK (level IN ('NORMAL', 'ATENÇÃO', 'ALTO', 'CRÍTICO', 'PREVISÃO')),
  message TEXT NOT NULL,
  cause TEXT,
  action TEXT,
  confidence INTEGER,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índice para consultas de alertas não lidos
CREATE INDEX idx_alerts_device_read ON public.alerts(device_id, read, created_at DESC);

-- Tabela de configurações de limites por dispositivo
CREATE TABLE public.device_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT UNIQUE NOT NULL REFERENCES public.devices(device_id) ON DELETE CASCADE,
  temp_low DECIMAL(5,2) DEFAULT 20,
  temp_medium DECIMAL(5,2) DEFAULT 30,
  temp_high DECIMAL(5,2) DEFAULT 40,
  temp_critical DECIMAL(5,2) DEFAULT 50,
  gas_low INTEGER DEFAULT 150,
  gas_medium INTEGER DEFAULT 250,
  gas_high INTEGER DEFAULT 350,
  gas_critical INTEGER DEFAULT 500,
  vib_low INTEGER DEFAULT 20,
  vib_medium INTEGER DEFAULT 40,
  vib_high INTEGER DEFAULT 60,
  z_threshold DECIMAL(3,2) DEFAULT 2.8,
  window_size INTEGER DEFAULT 10,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_devices_updated_at
  BEFORE UPDATE ON public.devices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_device_config_updated_at
  BEFORE UPDATE ON public.device_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir dispositivo padrão
INSERT INTO public.devices (device_id, name, location, status)
VALUES ('sia-box-01', 'SIA Box Principal', 'Setor B - Produção', 'active')
ON CONFLICT (device_id) DO NOTHING;

-- Inserir configuração padrão
INSERT INTO public.device_config (device_id)
VALUES ('sia-box-01')
ON CONFLICT (device_id) DO NOTHING;

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_config ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - permitir leitura pública para demo
CREATE POLICY "Permitir leitura pública de devices" ON public.devices
  FOR SELECT USING (true);

CREATE POLICY "Permitir leitura pública de sensor_readings" ON public.sensor_readings
  FOR SELECT USING (true);

CREATE POLICY "Permitir leitura pública de alerts" ON public.alerts
  FOR SELECT USING (true);

CREATE POLICY "Permitir leitura pública de device_config" ON public.device_config
  FOR SELECT USING (true);

-- Políticas para inserção (API key protegido no backend)
CREATE POLICY "Permitir inserção de sensor_readings via backend" ON public.sensor_readings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir inserção de alerts via backend" ON public.alerts
  FOR INSERT WITH CHECK (true);

-- Habilitar Realtime para atualizações em tempo real
ALTER PUBLICATION supabase_realtime ADD TABLE public.sensor_readings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;