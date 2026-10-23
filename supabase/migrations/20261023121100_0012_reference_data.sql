-- =============================================================================
-- 0012 — Date de referință (nu sunt date personale)
-- =============================================================================
set search_path = public, extensions;

insert into public.platform_settings (key, value, description, is_public)
values
  ('min_notice_hours', '2'::jsonb, 'Numărul minim de ore între momentul rezervării și începutul ședinței.', true),
  ('max_advance_days', '180'::jsonb, 'Cu câte zile înainte poate fi făcută o programare.', true),
  ('cancellation_window_hours', '24'::jsonb, 'Sub acest prag, clientul nu mai poate anula sau reprograma singur.', true),
  ('platform_status', '"beta"'::jsonb, 'Starea publică a platformei.', true)
on conflict (key) do nothing;

insert into public.specialties (slug, name, description, sort_order)
values
  ('psihologie-clinica', 'Psihologie clinică',
   'Evaluare și intervenție psihologică pentru dificultăți emoționale și comportamentale.', 10),
  ('psihoterapie-cognitiv-comportamentala', 'Psihoterapie cognitiv-comportamentală',
   'Intervenții structurate care lucrează cu gânduri, emoții și comportamente.', 20),
  ('psihoterapie-sistemica', 'Psihoterapie sistemică',
   'Terapie care ia în considerare relațiile, familia și contextul social.', 30),
  ('psihoterapie-psihodinamica', 'Psihoterapie psihodinamică',
   'Explorare a tiparelor relaționale și a experiențelor din trecut care influențează prezentul.', 40),
  ('psihologie-copil-adolescent', 'Psihologie pentru copii și adolescenți',
   'Lucru cu copii, adolescenți și familiile lor, adaptat vârstei și nevoilor.', 50),
  ('consiliere-cuplu', 'Consiliere pentru cuplu',
   'Sprijin pentru comunicare, conflicte și decizii în relația de cuplu.', 60),
  ('evaluare-psihologica', 'Evaluare psihologică',
   'Evaluări realizate cu instrumente adecvate, în limitele competențelor profesionale.', 70),
  ('anxietate', 'Intervenții pentru anxietate',
   'Sprijin pentru anxietate, atacuri de panică și fobii.', 80),
  ('depresie', 'Intervenții pentru depresie',
   'Sprijin pentru stare depresivă, lipsă de motivație și epuizare emoțională.', 90),
  ('psihotraumatologie', 'Psihotraumatologie',
   'Lucru cu experiențe traumatice, în ritm sigur și cu metode validate.', 100),
  ('adictii', 'Consiliere pentru adicții',
   'Sprijin pentru comportamente adictive și pentru prevenirea recăderilor.', 110),
  ('dezvoltare-personala', 'Dezvoltare personală',
   'Clarificarea obiectivelor, stima de sine și gestionarea stresului.', 120)
on conflict (slug) do nothing;
