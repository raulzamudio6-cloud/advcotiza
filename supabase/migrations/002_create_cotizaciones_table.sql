-- Create cotizaciones table
CREATE TABLE cotizaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agencia_id UUID REFERENCES agencias(id) ON DELETE SET NULL,
  
  -- Basic quotation info
  quotation_title TEXT NOT NULL,
  commission_rate NUMERIC(5, 2) DEFAULT 20,
  
  -- Client info (stored as JSONB for flexibility)
  client_info JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Trip duration
  trip_duration JSONB NOT NULL DEFAULT '{"days": 0, "nights": 0}'::jsonb,
  
  -- Passengers (stored as JSONB array)
  passengers JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Flights (stored as JSONB array)
  flights JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Accommodations (stored as JSONB array)
  accommodations JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Additional services (stored as JSONB)
  additional_services JSONB NOT NULL DEFAULT '{"transfers": {"standard": false, "standardPrice": 0, "extraDetail": "", "extraPrice": 0}, "extras": [], "applyCommissionToExtras": true}'::jsonb,
  
  -- Calculations (stored as JSONB for quick access)
  calculations JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX idx_cotizaciones_user_id ON cotizaciones(user_id);
CREATE INDEX idx_cotizaciones_agencia_id ON cotizaciones(agencia_id);
CREATE INDEX idx_cotizaciones_created_at ON cotizaciones(created_at DESC);

-- Enable Row Level Security
ALTER TABLE cotizaciones ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cotizaciones
-- Users can only read their own quotations
CREATE POLICY "Users can view own quotations"
  ON cotizaciones FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert quotations linked to their own agency
CREATE POLICY "Users can insert own quotations"
  ON cotizaciones FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    agencia_id IN (
      SELECT id FROM agencias WHERE user_id = auth.uid()
    )
  );

-- Users can update their own quotations
CREATE POLICY "Users can update own quotations"
  ON cotizaciones FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own quotations
CREATE POLICY "Users can delete own quotations"
  ON cotizaciones FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at automatically
CREATE TRIGGER update_cotizaciones_updated_at
  BEFORE UPDATE ON cotizaciones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
