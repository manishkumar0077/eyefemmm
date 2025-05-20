CREATE TABLE IF NOT EXISTS csm_clinic_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  src TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

INSERT INTO csm_clinic_images (src, title, description, order_index) VALUES
('/lovable-uploads/a08d0445-8225-402a-b810-89ee25b6c797.png', 'Reception Area', 'Comfortable waiting 