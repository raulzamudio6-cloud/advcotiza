-- Create storage bucket for agency logos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('agency-logos', 'agency-logos', true);

-- Enable RLS on storage
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can upload logos to their own folder
CREATE POLICY "Users can upload own logos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'agency-logos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Users can view their own logos
CREATE POLICY "Users can view own logos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'agency-logos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Public can view logos (for PDF generation)
CREATE POLICY "Public can view logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'agency-logos');

-- Policy: Users can delete their own logos
CREATE POLICY "Users can delete own logos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'agency-logos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
