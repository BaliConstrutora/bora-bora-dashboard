## Objetivo
Corrigir e padronizar a abertura do PDF anexado do atestado nas telas de lista (`/atestados`) e detalhe (`/atestados/$atestadoId`), garantindo geração de link assinado do Supabase Storage, estado de carregamento e mensagens em português brasileiro.

## Estado atual confirmado
- Ambos os arquivos já importam o cliente correto: `import { supabase } from "@/integrations/supabase/client";`.
- `index.tsx` já possui `handleVerPdf(documentoUrl: string | undefined)` chamado no dropdown, mas sem estado de carregamento e com TTL de 60s.
- `$atestadoId.tsx` já possui `handleVerPdf()` sem parâmetros, lendo de `atestado.documentoUrl`, também sem estado de carregamento e com TTL de 60s.

## Alterações planejadas

### 1. `src/routes/_authenticated/atestados/index.tsx`
- Manter a função `handleVerPdf` recebendo `documentoUrl: string | null | undefined`.
- Aumentar o TTL do link assinado de 60s para 120s (`createSignedUrl(documentoUrl, 120)`).
- Adicionar estado de carregamento por linha (`pdfLoadingId: string | null`) para exibir spinner no item de dropdown clicado.
- Garantir mensagens de erro/info em português brasileiro.

### 2. `src/routes/_authenticated/atestados/$atestadoId.tsx`
- Manter a função `handleVerPdf` sem parâmetros, lendo `atestado.documentoUrl`.
- Aumentar o TTL do link assinado de 60s para 120s.
- Adicionar estado de carregamento local (`pdfLoading: boolean`) no botão "Ver PDF", exibindo spinner (`Loader2`) enquanto gera o link.
- Garantir mensagens de erro/info em português brasileiro.

### 3. Validação
- Executar typecheck (`tsgo` ou `bunx tsc --noEmit`) para confirmar que as alterações não quebram tipos.
- Verificar visualmente no preview se o botão exibe spinner ao clicar e abre o PDF corretamente.

## Critérios de aceitação
- "Ver PDF" na lista gera link assinado de 120s e abre em nova aba.
- "Ver PDF" no detalhe gera link assinado de 120s e abre em nova aba.
- Botão mostra estado de carregamento (spinner) durante a geração do link.
- Mensagens de erro/info permanecem em português brasileiro.
- Build/typecheck passa sem erros.