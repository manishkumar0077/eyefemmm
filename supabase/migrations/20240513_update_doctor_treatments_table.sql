-- Add button_text column to existing table if using the same table
ALTER TABLE IF EXISTS csm_doctor_treatments
ADD COLUMN IF NOT EXISTS button_text TEXT;

-- Rename table to csm_doctor_treatments_1 if needed
ALTER TABLE IF EXISTS csm_doctor_treatments 
RENAME TO csm_doctor_treatments_1;

-- Update existing records with button texts
UPDATE csm_doctor_treatments_1
SET button_text = 'Schedule IVF Consultation'
WHERE title LIKE '%IVF%' AND (button_text IS NULL OR button_text = '');

UPDATE csm_doctor_treatments_1
SET button_text = 'Learn More About IUI'
WHERE title LIKE '%IUI%' AND (button_text IS NULL OR button_text = '');

UPDATE csm_doctor_treatments_1
SET button_text = 'Schedule Consultation'
WHERE title LIKE '%Hysteroscopy%' AND (button_text IS NULL OR button_text = '');

UPDATE csm_doctor_treatments_1
SET button_text = 'Discuss Treatment Options'
WHERE title LIKE '%Laparoscopic%' AND (button_text IS NULL OR button_text = '');

UPDATE csm_doctor_treatments_1
SET button_text = 'Book Pregnancy Consultation'
WHERE (title LIKE '%High Risk%' OR title LIKE '%Pregnancy%') AND (button_text IS NULL OR button_text = ''); 