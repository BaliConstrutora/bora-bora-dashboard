## Plano — Normalização dos dados extraídos da IA

Adicionar um passo de saneamento entre a resposta da IA e o `form.reset(...)`, para que valores mal-formatados não quebrem o formulário nem o salvamento. Toda a lógica fica em `src/routes/_authenticated/atestados/novo.tsx` (sem tocar no server function nem no schema do banco).

### Novo helper `normalizeExtracted(ext)`

Recebe `ExtractedAtestado` (snake_case, campos possivelmente `null`/`undefined`/strings brutas) e retorna um objeto pronto para o `form.reset`, aplicando por campo:

- **`data_inicio` / `data_fim`** → `parseDate()`:
  - aceita `YYYY-MM-DD`, `DD/MM/YYYY`, `DD-MM-YYYY`, `DD.MM.YYYY` e ISO com hora;
  - valida via `new Date(...)` e checa componentes (mês 1-12, dia 1-31, ano 1900-2100);
  - devolve `YYYY-MM-DD` ou `""` se inválido. Datas inválidas viram `""` (usuário preenche).
- **`cnpj_contratante`** → `normalizeCnpj()`:
  - extrai só dígitos; se resultar em 14 dígitos, aplica `formatCnpj`; caso contrário, `""`.
- **`tipo_contratante`** → `normalizeTipoContratante()`:
  - lowercase + remove acentos; mapeia `publico|público|governo|estatal|federal|municipal|estadual` → `"publico"`, `privado|empresa|particular` → `"privado"`; fora disso `undefined`.
- **`finalidade`** → `normalizeFinalidade()`:
  - lowercase + sem acento; mapeia para o enum (`infraestrutura`, `pavimentacao`, `edificacoes`|`edificação`|`edifício`, `saneamento`, `eletrica`|`elétrica`|`energia`, `outros`); fora do conjunto → `undefined` (não força "outros" para não mascarar erro).
- **`valor_contrato`** → `normalizeValor()`:
  - remove `R$` e espaços; se tiver `.` e `,`, `.` é milhar e `,` é decimal → remove `.`, troca `,` por `.`; se só `,`, troca por `.`; se só `.` e a última ocorrência tiver 1-2 dígitos após, trata como decimal; converte para `Number`, valida `> 0` e finito; devolve string no formato `pt-BR` (`1234567.89` → `"1.234.567,89"`) para casar com o input existente. Inválido → `""`.
- **`registro_crea_rt`** → `trim()` + colapsa espaços múltiplos.
- **Strings genéricas** (`numero_cat`, `contratante`, `numero_contrato`, `numero_pregao`, `local_execucao`, `resp_tecnico`, `art_numero`, `descricao`) → `trim()`; string vazia após trim vira `undefined` (mantém valor atual).
- **`numero_pregao`**: só é aplicado quando o `tipo_contratante` final for `"publico"`; caso contrário, `""`.

### Aplicação no `runExtraction`

Substituir o `form.reset({...})` atual por:

```ts
const n = normalizeExtracted(ext);
const cur = form.getValues();
form.reset({
  ...cur,
  numero: cur.numero || (n.numeroCat ?? ""),
  numeroCat: n.numeroCat ?? cur.numeroCat ?? "",
  contratante: n.contratante ?? cur.contratante,
  cnpjContratante: n.cnpjContratante ?? cur.cnpjContratante ?? "",
  tipoContratante: n.tipoContratante ?? cur.tipoContratante,
  numeroContrato: n.numeroContrato ?? cur.numeroContrato ?? "",
  numeroPregao: (n.tipoContratante ?? cur.tipoContratante) === "publico"
    ? (n.numeroPregao ?? cur.numeroPregao ?? "") : "",
  localExecucao: n.localExecucao ?? cur.localExecucao ?? "",
  finalidade: n.finalidade ?? cur.finalidade,
  valorContrato: n.valorContrato ?? cur.valorContrato,
  dataInicio: n.dataInicio ?? cur.dataInicio,
  dataFim: n.dataFim ?? cur.dataFim,
  respTecnico: n.respTecnico ?? cur.respTecnico,
  registroCreaRt: n.registroCreaRt ?? cur.registroCreaRt ?? "",
  artNumero: n.artNumero ?? cur.artNumero ?? "",
  descricao: n.descricao ?? cur.descricao,
});
```

### Feedback ao usuário

- Contar campos que a IA retornou mas foram descartados por inválidos (data, CNPJ, tipo, finalidade, valor). Se `> 0`, além do toast de sucesso emitir um `toast.warning("N campo(s) precisam de revisão manual: ...")` listando os nomes.
- Datas: se `data_inicio > data_fim` após normalização, mantém ambas mas avisa via warning.

### Também: services

Os campos `unidade_sugerida` e `categoria_sugerida` já são livres. Adicionar normalização leve:
- `unidade_sugerida`: lowercase, `m2`→`m²`, `m3`→`m³`; se não estiver em `UNIDADES`, deixa `undefined`.
- `categoria_sugerida`: se não bater exatamente com `CATEGORIAS_PADRAO` (case-insensitive/sem acento), cai em `"Outros"`.
- `quantidade_sugerida`: se não for número finito ≥ 0, vira `undefined`.

### Fora de escopo

- Não altero o prompt nem o server function (a IA continua sendo instruída a devolver o formato correto; a normalização é defesa em profundidade).
- Não mexo em outros formulários.

### Verificação

- Typecheck (`tsgo --noEmit`).
- Testes manuais no preview com um PDF real: conferir CNPJ formatado, datas em `DD/MM/YYYY` convertidas, valor como `1234567.89` virando `"1.234.567,89"`, e um `tipo_contratante: "Governo"` mapeando para `"publico"`.