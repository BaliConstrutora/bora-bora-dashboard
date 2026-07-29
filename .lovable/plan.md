## Escopo

Duas mudanças no módulo de Atestados:
1. Corrigir o botão "Adicionar" do formulário manual de serviço no passo 3 do cadastro.
2. Adicionar suporte a Consórcio (banco, tipos, formulário, extração, listagens, detalhe).

---

## FIX 1 — Botão "Adicionar" manual (novo.tsx)

No `handleAddManual` do passo 3 de `src/routes/_authenticated/atestados/novo.tsx`:
- Validar `codigo`, `descricao` e `quantidade` (não vazios; quantidade numérica > 0). Se inválido: `toast.error(...)` e não prosseguir.
- Criar `ServicoExtraido` com `id: crypto.randomUUID()`, `status: "pendente"`, campos `descricaoOriginal`, `quantidadeOriginal`, `codigoSugerido`, `descricaoSugerida`, `unidadeSugerida`, `quantidadeSugerida`, `categoriaSugerida`.
- `setServicos(prev => [...prev, novo])`.
- Resetar campos do formulário manual (state local) e fechar o formulário (`setShowManualForm(false)`).
- `toast.success("Serviço adicionado manualmente.")`.

---

## FEATURE 2 — Consórcio

### 2A. Migração
Adicionar em `public.atestados`:
- `is_consorcio boolean not null default false`
- `nome_consorcio text`
- `percentual_participacao numeric`
- `empresas_parceiras text[]`

Sem alterar RLS/policies existentes.

### 2B. Tipos (`src/types/index.ts`)
Adicionar em `Atestado`: `isConsorcio?`, `nomeConsorcio?`, `percentualParticipacao?`, `empresasParceiras?: string[]`.

### 2C. API (`src/lib/atestados-api.ts`)
- Mapear os 4 campos novos em `getAtestadoById`, `listAtestados` e no mapper compartilhado.
- Incluir no payload de `createAtestadoFull` e `updateAtestado` (snake_case ↔ camelCase).

### 2D. Formulário passo 1 (`novo.tsx`)
No card "Dados do Atestado", ao final, seção Consórcio:
- `Switch` "Este atestado é de um Consórcio" ligado ao estado `isConsorcio`.
- Quando ligado (bloco com `transition-all`):
  - Input "Nome do Consórcio *".
  - Input numérico "Participação da Bali (%) *" + helper "Os quantitativos serão multiplicados por este percentual".
  - Lista dinâmica "Empresas Parceiras": input + botão "Adicionar", exibição como badges removíveis; requerer no mínimo 1 empresa ao avançar quando `isConsorcio`.
- Validação do passo 1: se `isConsorcio`, exigir `nomeConsorcio`, `percentualParticipacao > 0 && <= 100`, `empresasParceiras.length >= 1`.
- Passar os 4 campos para `createAtestadoFull`.

### 2E. Passo 3 — validação e ajuste (`novo.tsx`)
- Banner âmbar no topo quando `isConsorcio`:
  `⚠️ Consórcio: {nomeConsorcio} — Participação Bali: {percentualParticipacao}% Os quantitativos foram ajustados proporcionalmente.`
- Ao inicializar `servicos` após extração/IA, guardar `quantidadeOriginal` (string do valor bruto do PDF) e definir `quantidadeSugerida = round(qtdOriginal * pct/100, 2)` quando `isConsorcio`.
- Em `ServiceCard`, quando `isConsorcio`, mostrar linha auxiliar:
  `Quantidade original: X {unid} → Participação Bali ({pct}%): Y {unid}`.
- Serviços adicionados manualmente no passo 3 também recebem o ajuste (aplicar no `handleAddManual` quando `isConsorcio`), preservando `quantidadeOriginal`.

### 2F. Prompt de IA (`src/lib/atestados-ai.functions.ts`)
Anexar ao `SYSTEM_PROMPT`:
"If the document mentions a consortium (consórcio), extract all quantities as the TOTAL values from the PDF. The system will apply the participation percentage automatically. Do not pre-calculate the participation percentage."

### 2G. Lista de atestados (`index.tsx`)
Ao lado do contratante (ou do nº CAT), quando `isConsorcio`:
```
<Badge variant="outline" className="text-xs border-amber-300 text-amber-700 bg-amber-50">
  Consórcio {percentualParticipacao}%
</Badge>
```

### 2H. Planilha (`planilha.tsx`)
Na lista expandida por item, quando o atestado for consórcio, exibir:
`AT-10 · Consórcio {nomeConsorcio} · {pct}% · {quantidade} {unid}`
(usa dados já retornados por `getAtestadosByPlanilhaItem`; incluir os campos de consórcio na seleção dessa função).

### 2I. Detalhe (`$atestadoId.tsx`)
Novo card "Dados do Consórcio" (só quando `isConsorcio`) com:
- Nome do Consórcio
- Participação da Bali (%)
- Empresas Parceiras (badges)
- Nota: "Quantitativos ajustados para {pct}% da participação da Bali"

Modo edição: permitir editar os mesmos campos (Switch + inputs + lista de badges), persistindo via `updateAtestado`.

---

## Observações
- Todos os textos em pt-BR.
- Nenhuma alteração em RLS, storage ou lógica de reconciliação da planilha.
- Os valores gravados em `servicos_extraidos.quantidade_sugerida` já são os proporcionais (participação da Bali); a planilha continua somando esses valores sem lógica extra.
