Ajustar três comportamentos na tela de cadastro de atestado (`src/routes/_authenticated/atestados/novo.tsx`).

### 1. Quando a IA falhar, ir para o passo 3 (não voltar ao passo 1)
No bloco `catch` de `runExtraction` (linhas ~538-542), substituir:

```tsx
} catch (err) {
  console.error(err);
  toast.error("Não foi possível extrair os dados automaticamente. Preencha manualmente.");
  setStep(1);
}
```

Por:

```tsx
} catch (err) {
  console.error(err);
  toast.warning("A IA não conseguiu extrair os dados. Adicione os serviços manualmente.");
  setServicos([]);
  setShowManualForm(true);
  setStep(3);
}
```

Isso leva o usuário direto à validação manual de serviços, com o formulário manual já aberto.

### 2. Remover o botão duplicado "Concluído — ir para confirmação" no passo 3
No rodapé do passo 3 (linhas ~972-982), manter apenas:

```tsx
<div className="flex justify-end gap-3 pt-2">
  <Button variant="outline" onClick={() => setStep(1)}>Voltar</Button>
  <Button onClick={handleSalvar} disabled={saveMut.isPending}>
    {saveMut.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
    {saveMut.isPending ? "Salvando..." : "Salvar Atestado Completo"}
  </Button>
</div>
```

Remover o segundo `<Button onClick={handleSalvar} ...>Concluído — ir para confirmação</Button>`.

### 3. Adicionar botão "Lançar Manualmente" no passo 1
Na barra de ações do passo 1 (linhas ~865-868), entre "Cancelar" e "Processar com IA →", inserir:

```tsx
<Button
  variant="outline"
  type="button"
  onClick={() => {
    setServicos([]);
    setShowManualForm(true);
    setStep(3);
  }}
>
  Lançar Manualmente
</Button>
```

Isso permite pular o processamento de IA e ir direto ao lançamento manual de serviços.

---

**Escopo:** Apenas `src/routes/_authenticated/atestados/novo.tsx`. Sem alterações em API, banco ou tipos. Textos em pt-BR.