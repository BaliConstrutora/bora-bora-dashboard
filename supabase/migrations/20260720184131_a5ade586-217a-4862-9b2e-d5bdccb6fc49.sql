ALTER TABLE public.atestados ALTER COLUMN status DROP DEFAULT;
ALTER TABLE public.atestados ALTER COLUMN status TYPE text USING status::text;
UPDATE public.atestados SET status='total' WHERE status IN ('ativo','finalizado');
UPDATE public.atestados SET status='parcial' WHERE status='em_analise';
ALTER TABLE public.atestados ADD CONSTRAINT atestados_status_check CHECK (status IN ('total','parcial'));
ALTER TABLE public.atestados ALTER COLUMN status SET DEFAULT 'parcial';
DROP TYPE IF EXISTS public.atestado_status;