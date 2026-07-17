
-- Enums
CREATE TYPE public.atestado_status AS ENUM ('ativo','vencido','em_analise');
CREATE TYPE public.aditivo_tipo AS ENUM ('prazo','valor','escopo','misto');
CREATE TYPE public.servico_status AS ENUM ('pendente','confirmado','rejeitado','ignorado');

-- Updated_at helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

-- Atestados
CREATE TABLE public.atestados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  numero TEXT NOT NULL,
  contratante TEXT NOT NULL,
  descricao TEXT NOT NULL DEFAULT '',
  valor_contrato NUMERIC NOT NULL DEFAULT 0,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  data_emissao DATE,
  resp_tecnico TEXT NOT NULL DEFAULT '',
  art_numero TEXT,
  status public.atestado_status NOT NULL DEFAULT 'em_analise',
  documento_url TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.atestados TO authenticated;
GRANT ALL ON public.atestados TO service_role;
ALTER TABLE public.atestados ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own atestados" ON public.atestados FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_atestados_updated BEFORE UPDATE ON public.atestados
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_atestados_user ON public.atestados(user_id);

-- Aditivos
CREATE TABLE public.aditivos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  atestado_id UUID NOT NULL REFERENCES public.atestados(id) ON DELETE CASCADE,
  numero INT NOT NULL,
  tipo public.aditivo_tipo NOT NULL,
  data_assinatura DATE NOT NULL,
  nova_data_fim DATE,
  valor NUMERIC,
  valor_adicional NUMERIC,
  prazo INT,
  escopo TEXT,
  descricao TEXT NOT NULL DEFAULT '',
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.aditivos TO authenticated;
GRANT ALL ON public.aditivos TO service_role;
ALTER TABLE public.aditivos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own aditivos" ON public.aditivos FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_aditivos_updated BEFORE UPDATE ON public.aditivos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_aditivos_atestado ON public.aditivos(atestado_id);

-- Planilha
CREATE TABLE public.planilha_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  codigo TEXT NOT NULL,
  categoria TEXT NOT NULL,
  descricao TEXT NOT NULL,
  unidade TEXT NOT NULL,
  quantidade NUMERIC NOT NULL DEFAULT 0,
  valor_unitario NUMERIC,
  valor_total NUMERIC,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.planilha_items TO authenticated;
GRANT ALL ON public.planilha_items TO service_role;
ALTER TABLE public.planilha_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own planilha" ON public.planilha_items FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_planilha_updated BEFORE UPDATE ON public.planilha_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_planilha_user ON public.planilha_items(user_id);

-- Serviços extraídos
CREATE TABLE public.servicos_extraidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  atestado_id UUID NOT NULL REFERENCES public.atestados(id) ON DELETE CASCADE,
  planilha_item_id UUID REFERENCES public.planilha_items(id) ON DELETE SET NULL,
  descricao_original TEXT NOT NULL,
  quantidade_original TEXT,
  codigo_sugerido TEXT,
  categoria_sugerida TEXT,
  descricao_sugerida TEXT,
  unidade_sugerida TEXT,
  quantidade_sugerida NUMERIC,
  valor_unitario NUMERIC,
  valor_total NUMERIC,
  status public.servico_status NOT NULL DEFAULT 'pendente',
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.servicos_extraidos TO authenticated;
GRANT ALL ON public.servicos_extraidos TO service_role;
ALTER TABLE public.servicos_extraidos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own servicos" ON public.servicos_extraidos FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_servicos_updated BEFORE UPDATE ON public.servicos_extraidos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_servicos_atestado ON public.servicos_extraidos(atestado_id);

-- Categorias personalizadas
CREATE TABLE public.categorias_personalizadas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, nome)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categorias_personalizadas TO authenticated;
GRANT ALL ON public.categorias_personalizadas TO service_role;
ALTER TABLE public.categorias_personalizadas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own categorias" ON public.categorias_personalizadas FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
