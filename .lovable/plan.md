## Objetivo
Fazer com que o número sequencial exibido (AT-01, AT-02…) reflita o campo `ordem` definido manualmente, e não a ordem de criação do atestado.

## Alterações

### 1. `src/routes/_authenticated/atestados/planilha.tsx`
Substituir a construção do `seqMap` que ordena por `createdAt` e usa o índice do array:

```ts
const seqMap = new Map<string, string>();
[...atestadosList]
  .sort((a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? ""))
  .forEach((a, i) => seqMap.set(a.id, `AT-${String(i + 1).padStart(2, "0")}`));
```

Por:

```ts
const seqMap = new Map<string, string>();
atestadosList.forEach((a) => {
  const seq = a.ordem ?? 0;
  seqMap.set(a.id, seq > 0 ? `AT-${String(seq).padStart(2, "0")}` : "AT-—");
});
```

O tipo `Atestado` já possui `ordem?: number | null`, então o cast sugerido não é necessário.

### 2. `src/routes/_authenticated/atestados/index.tsx`
- Remover o `fallbackSeq` baseado no índice do array ordenado por `createdAt`.
- Criar `seqMap` a partir do campo `ordem`, com o mesmo tratamento de "AT-—" quando não houver ordem.
- Atualizar a exibição da coluna "Seq." para usar `seqMap.get(a.id)`.
- Ajustar o componente `OrdemBadge` para renderizar `"AT-—"` quando `ordem <= 0`, mantendo consistência com o popover da planilha.

## Resultado
Tanto na lista de atestados quanto no popover da Planilha de Quantidades, o número sequencial será o valor manual definido no campo `ordem`. Itens sem `ordem` aparecerão como `AT-—` em vez de um índice baseado na data de criação.