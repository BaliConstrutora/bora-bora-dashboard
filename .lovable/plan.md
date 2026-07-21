````text
PROBLEM
-------
In src/routes/_authenticated/atestados/$atestadoId.tsx, the saveMut mutation currently loops through every edited service and always passes codigoSugerido to updateServico. Because updateServico clears planilha_item_id and resets status to "pendente" whenever codigoSugerido changes, this causes ALL services to be unlinked from planilha_itens on every save — even when the user did not change the code.

FIX
---
Replace the service update loop inside saveMut so it compares each service's current codigoSugerido with the original service loaded from the database. Only include codigoSugerido in the update payload when the code actually changed. All other fields (descricaoSugerida, quantidadeSugerida, unidadeSugerida, categoriaSugerida) continue to be sent every time.

Code change:
for (const s of editServicos) {
  const original = atestado?.servicos.find((os) => os.id === s.id);
  const codigoChanged = s.codigoSugerido !== (original?.codigoSugerido ?? "");
  await updateServico(s.id, {
    ...(codigoChanged ? { codigoSugerido: s.codigoSugerido } : {}),
    descricaoSugerida: s.descricaoSugerida,
    quantidadeSugerida: s.quantidadeSugerida,
    unidadeSugerida: s.unidadeSugerida,
    categoriaSugerida: s.categoriaSugerida,
  });
}

VALIDATION
----------
After the change, run a TypeScript typecheck to ensure the file still compiles and the EditServico / ServicoExtraido types remain compatible.
````