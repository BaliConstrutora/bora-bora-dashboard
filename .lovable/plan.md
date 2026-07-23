## Objetivo
Ao excluir um atestado, reverter seu impacto na Planilha de Quantidades de forma atômica: subtrair quantidades, decrementar contadores e remover itens que ficarem zerados.

## Abordagem
Como o cliente Supabase não suporta transações no browser, criar uma função Postgres (`SECURITY DEFINER`) que faz tudo em uma única transação, e chamá-la via RPC no `deleteAtestado`.

## Alterações

### 1. Migração — nova função `public.delete_atestado_with_reversal(atestado_id uuid)`
Em uma transação (função plpgsql):
1. Selecionar todos os `servicos_extraidos` do atestado com `status = 'confirmado'` e `planilha_item_id IS NOT NULL`.
2. Para cada serviço:
   - `UPDATE planilha_items SET quantidade = quantidade - s.quantidade_sugerida, atestados_count = GREATEST(atestados_count - 1, 0) WHERE id = s.planilha_item_id`.
3. `DELETE FROM planilha_items WHERE id IN (...impactados...) AND quantidade <= 0` (recalcula `valor_total` implicitamente se necessário — manter simples: apenas quantidade).
4. `DELETE FROM atestados WHERE id = atestado_id` (cascata remove `servicos_extraidos` e `aditivos`).
5. Verificação de autorização: checar `auth.uid()` contra `atestados.user_id` para evitar exclusão indevida via SECURITY DEFINER.
6. `GRANT EXECUTE ... TO authenticated`.

Observação: itens `Xa`/`Xb` gerados por Fresagem são tratados normalmente — cada um tem seu próprio `planilha_item_id` no serviço correspondente (o par é criado via `sendServicoToPlanilha`, que só vincula um deles ao serviço). Somente o item vinculado será revertido; o par órfão permanecerá. Isso já é o comportamento atual do sistema e está fora do escopo desta correção.

### 2. `src/lib/atestados-api.ts` — `deleteAtestado`
Substituir o `.from("atestados").delete()` por:
```ts
const { error } = await supabase.rpc("delete_atestado_with_reversal", { atestado_id: id });
if (error) throw error;
```

### 3. Invalidação de cache
Nenhuma mudança necessária nos consumidores — os locais que chamam `deleteAtestado` já invalidam `["atestados"]`. Adicionar invalidação de `["planilha"]` na mutation de exclusão em `src/routes/_authenticated/atestados/index.tsx` para refletir as quantidades revertidas imediatamente.

## Resultado
Excluir um atestado devolve corretamente as quantidades à planilha, decrementa o contador de atestados por item e remove itens que ficaram zerados — tudo atomicamente no banco.