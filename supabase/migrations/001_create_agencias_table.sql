-- Create agencias table
CREATE TABLE agencias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre_comercial TEXT NOT NULL,
  logo_url TEXT,
  whatsapp TEXT,
  email_contacto TEXT,
  instagram TEXT,
  facebook TEXT,
  terminos_condiciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_agencias_user_id ON agencias(user_id);

-- Enable Row Level Security
ALTER TABLE agencias ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agencias
-- Users can only read their own agency config
CREATE POLICY "Users can view own agency"
  ON agencias FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own agency config (only one per user)
CREATE POLICY "Users can insert own agency"
  ON agencias FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    NOT EXISTS (
      SELECT 1 FROM agencias WHERE user_id = auth.uid()
    )
  );

-- Users can update their own agency config
CREATE POLICY "Users can update own agency"
  ON agencias FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own agency config
CREATE POLICY "Users can delete own agency"
  ON agencias FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at automatically
CREATE TRIGGER update_agencias_updated_at
  BEFORE UPDATE ON agencias
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
