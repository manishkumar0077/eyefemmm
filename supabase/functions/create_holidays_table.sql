
CREATE OR REPLACE FUNCTION public.create_holidays_table()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'holidays') THEN
    CREATE TABLE public.holidays (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      date DATE NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('national', 'manual', 'doctor')),
      doctor TEXT,
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
  ELSE
    -- Check if description column exists, if not add it
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'holidays' 
      AND column_name = 'description'
    ) THEN
      ALTER TABLE public.holidays ADD COLUMN description TEXT;
    END IF;
  END IF;
END;
$function$
