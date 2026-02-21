-- 1. Temporarily disable Row Level Security on the hospitals table
-- This allows the app's anon key (unauthenticated users) to query the hospitals table
ALTER TABLE public.hospitals DISABLE ROW LEVEL SECURITY;

-- 2. Grant permissions to anon and authenticated roles
GRANT ALL ON public.hospitals TO anon;
GRANT ALL ON public.hospitals TO authenticated;

-- 3. Seed the table with mock hospital data
INSERT INTO public.hospitals (name, city, latitude, longitude, phone, type, emergency_24hr)
VALUES
  ('Mandalay General Hospital (မန္တလေး အထွေထွေရောဂါကုဆေးရုံကြီး)', 'Mandalay', 21.9750, 96.0836, '02-123456', 'public', true),
  ('City Hospital Mandalay (စီးတီး ဆေးရုံ မန္တလေး)', 'Mandalay', 21.9800, 96.0900, '02-765432', 'private', true),
  ('Yangon General Hospital (ရန်ကုန် အထွေထွေရောဂါကုဆေးရုံကြီး)', 'Yangon', 16.7808, 96.1497, '01-256112', 'public', true),
  ('Pun Hlaing Hospital (ပန်းလှိုင် ဆေးရုံ)', 'Yangon', 16.8409, 96.0954, '01-3684323', 'private', true),
  ('Victoria Hospital (ဗစ်တိုးရီးယား ဆေးရုံ)', 'Yangon', 16.8286, 96.1481, '01-9666141', 'private', true),
  ('Naypyidaw 1000-Beded General Hospital (နေပြည်တော် ခုတင် ၁၀၀၀ ဆေးရုံကြီး)', 'Naypyidaw', 19.7450, 96.1297, '067-3420002', 'public', true)
ON CONFLICT DO NOTHING;
