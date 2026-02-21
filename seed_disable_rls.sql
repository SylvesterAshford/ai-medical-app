ALTER TABLE public.hospitals DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.hospitals TO anon;
GRANT ALL ON public.hospitals TO authenticated;
