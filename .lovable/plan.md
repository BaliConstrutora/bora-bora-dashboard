## Alterações no módulo de Atestados

### 1. Migração de banco (Supabase)
- Converter `atestados.status` de enum `atestado_status` para `text` com CHECK constraint `('total','parcial')`.
- Passos SQL:
  1. `ALTER TABLE public.atestados ALTER COLUMN status DROP DEFAULT;`
  2. `ALTER TABLE public.atestados ALTER COLUMN status TYPE text USING status::text;`
  3. `UPDATE public.atestados SET status='total' WHERE status IN ('ativo','finalizado');`
  4. `UPDATE public.atestados SET status='parcial' WHERE status='em_analise';`
  5. `ALTER TABLE public.atestados ADD CONSTRAINT atestados_status_check CHECK (status IN ('total','parcial'));`
  6. `ALTER TABLE public.atestados ALTER COLUMN status SET DEFAULT 'parcial';`
  7. `DROP TYPE IF EXISTS public.atestado_status;` (o enum antigo fica órfão após o cast).

### 2. `src/types/index.ts`
- `export type AtestadoStatus = "total" | "parcial";`

### 3. `src/routes/_authenticated/atestados/novo.tsx`
- `status` no zod schema: `z.enum(["total","parcial"])`, default `"parcial"`.
- Select de status: apenas duas opções — `Total` e `Parcial`.
- Remover o campo "Número do Atestado" (`numero`) do formulário e do schema.
- No payload de save: `numero: data.numeroCat` (usa numeroCat como número).
- Ajustar quaisquer defaults/resets que referenciem `numero` ou o status antigo.

### 4. Ajustes derivados (impacto obrigatório)
- `src/routes/_authenticated/atestados/index.tsx`: atualizar `statusConfig` (chaves `total`/`parcial`), rótulos dos cards de estatística e filtros de status para refletir os novos valores. Manter todos os textos em pt-BR.
- `src/data/mock.ts`: substituir quaisquer `status: "ativo" | "finalizado" | "em_analise"` por `"total"` ou `"parcial"` para não quebrar o typecheck.
- Verificar `atestados-ai.functions.ts` e `$atestadoId.tsx` para trocar rótulos exibidos, se referenciarem os status antigos.

Todos os textos em português brasileiro.