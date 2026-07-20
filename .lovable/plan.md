## Plano — Extração de CAT com Anthropic Claude

### Ajustes vs. o pedido original
- **Onde roda a chamada à Anthropic:** no stack atual (TanStack Start + Lovable Cloud) não criamos Supabase Edge Functions novas. A chamada vai em um **TanStack server function** (`createServerFn`) em `src/lib/atestados-ai.functions.ts`, que é o equivalente moderno: mesma segurança (chave só no servidor), sem CORS, tipado ponta-a-ponta.
- **Modelo:** `claude-sonnet-4-6` não existe. Usarei `claude-sonnet-4-5` (mais recente do 4.x, suporta PDF nativo via `document` blocks). Confirme se quiser outro.
- **Segredo:** vou solicitar `ANTHROPIC_API_KEY` via formulário seguro (não precisa colar no chat).

### Backend
1. `add_secret` para `ANTHROPIC_API_KEY`.
2. Criar `src/lib/atestados-ai.functions.ts`:
   - `extractAtestadoFromPdf` — `createServerFn({ method: "POST" })` + `.middleware([requireSupabaseAuth])` + `.inputValidator` (Zod: `{ pdfPath: string }`).
   - Handler:
     - Baixa o PDF do bucket `atestados-pdfs` via `context.supabase.storage.from(...).download(path)` (RLS já garante que o usuário só lê o próprio).
     - Converte para base64.
     - `fetch("https://api.anthropic.com/v1/messages")` com headers `x-api-key`, `anthropic-version: 2023-06-01`, body contendo `model: "claude-sonnet-4-5"`, `max_tokens: 4096`, `system` (prompt exato do pedido) e `messages` com um `content` do tipo `document` (`source.type: "base64"`, `media_type: "application/pdf"`) + um `text` pedindo o JSON.
     - Extrai o texto da resposta, faz `JSON.parse` tolerante (remove eventuais cercas ```json).
     - Valida o shape com Zod (todos os campos opcionais/nullable, `servicos` array). Retorna `{ ok: true, data }` ou `{ ok: false, error }` — nunca joga stack pro cliente.

### Frontend — `src/routes/_authenticated/atestados/novo.tsx`
3. Fluxo do botão "Processar com IA":
   - Se houver PDF selecionado: primeiro faz `uploadAtestadoPdf` (já existe) → guarda `pdfPath` em estado (para reusar no submit final e evitar upload duplicado).
   - Chama `useServerFn(extractAtestadoFromPdf)({ data: { pdfPath } })`.
   - Sem PDF: toast de erro pedindo upload.
4. Estado de loading (step 2) com **indicador de progresso** em 4 etapas (checklist com ícones Lucide `CheckCircle2` / `Loader2` / `Circle`):
   - "Lendo o PDF..." (done após upload)
   - "Extraindo dados com IA..." (in progress durante o fetch)
   - "Identificando serviços executados..." (marca done quando o JSON chega)
   - "Correlacionando com a Planilha de Quantidades..." (roda um matching local simples por `codigo_sugerido`/`descricao_sugerida` contra `listPlanilhaItems`, setando `planilhaItemId` quando bater)
   - Mensagem principal: "A IA está lendo o PDF e extraindo os dados...".
5. Ao receber sucesso:
   - `form.reset({...valoresAtuais, ...camposExtraídos})` mapeando snake_case → camelCase (numeroCat, cnpjContratante, tipoContratante, numeroContrato, numeroPregao, localExecucao, finalidade, valorContrato — parseando "0,00" → number, dataInicio, dataFim, respTecnico, registroCreaRt, artNumero, contratante, descricao).
   - Converte `servicos` para `ServicoExtraido[]` com `status: "pendente"`, `quantidadeOriginal` = `${quantidade} ${unidade}`, aplicando o matching da etapa acima.
   - Toast: "Dados extraídos com sucesso pelo IA!"
   - Avança para step 3.
6. Em erro (falha de rede, JSON inválido, Zod fail, `ok:false`):
   - Toast: "Não foi possível extrair os dados automaticamente. Preencha manualmente."
   - Volta para step 1, mantém o PDF selecionado.
7. Ajuste no submit final: se `pdfPath` já foi obtido no step 2, reusar em vez de subir de novo.

### Fora de escopo
- Não altero schema do banco (todos os campos já existem).
- Sem mudanças em outras telas.

Confirma para eu implementar?