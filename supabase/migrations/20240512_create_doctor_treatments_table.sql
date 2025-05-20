CREATE TABLE IF NOT EXISTS csm_doctor_treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  bullet_points TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

INSERT INTO csm_doctor_treatments (title, description, bullet_points) VALUES
(
  'In Vitro Fertilization (IVF)',
  'IVF is an advanced fertility treatment that helps couples achieve pregnancy when other methods have been unsuccessful. Our state-of-the-art facility provides comprehensive IVF care with high success rates.',
  ARRAY[
    '• Controlled Ovarian Stimulation',
    '• Egg Retrieval',
    '• Sperm Processing',
    '• Embryo Culture and Transfer',
    '• Blastocyst Culture',
    '• Embryo Freezing',
    '• Genetic Testing Options'
  ]
),
(
  'Intrauterine Insemination (IUI)',
  'IUI is a fertility treatment where prepared sperm is directly placed into the uterus during ovulation. Its a less invasive and more cost-effective option compared to IVF for suitable candidates.',
  ARRAY[
    '• Unexplained Infertility',
    '• Mild Male Factor Infertility',
    '• Cervical Factor Infertility',
    '• Ovulatory Disorders',
    '• Single Women or Same-Sex Couples'
  ]
),
(
  'Hysteroscopy',
  'Hysteroscopy is a minimally invasive procedure that allows direct visualization of the uterine cavity. Its both diagnostic and therapeutic, enabling us to identify and treat various uterine conditions.',
  ARRAY[
    '• Uterine Polyps',
    '• Submucous Fibroids',
    '• Uterine Septum',
    '• Adhesions (Ashermans Syndrome)',
    '• Abnormal Uterine Bleeding',
    '• Recurrent Pregnancy Loss'
  ]
),
(
  'Laparoscopic Procedures',
  'We offer advanced laparoscopic surgeries that provide minimal invasiveness, faster recovery, and excellent outcomes. These procedures use small incisions and specialized instruments for various gynecological conditions.',
  ARRAY[
    '• Ovarian Cyst Removal',
    '• Myomectomy (Fibroid Removal)',
    '• Endometriosis Treatment',
    '• Hysterectomy',
    '• Tubal Reconstruction',
    '• Adhesiolysis'
  ]
),
(
  'High Risk Pregnancy Management',
  'Our specialized care for high-risk pregnancies ensures the best possible outcomes for both mother and baby. We provide comprehensive monitoring and personalized treatment plans throughout your pregnancy journey.',
  ARRAY[
    '• Multiple Pregnancies',
    '• Gestational Diabetes',
    '• Pregnancy-Induced Hypertension',
    '• Previous Pregnancy Complications',
    '• Advanced Maternal Age',
    '• Pre-existing Medical Conditions'
  ]
); 