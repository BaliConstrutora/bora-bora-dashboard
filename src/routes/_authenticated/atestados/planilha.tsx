import { createFileRoute, Link } from "@tanstack/react-router";
import { Fragment, useState } from "react";
import { Plus, Search, Pencil, Trash2, X, Check, Table2, Layers, FileCheck, Loader2, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { CATEGORIAS_PADRAO, UNIDADES } from "@/data/mock";
import type { PlanilhaItem } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { listPlanilhaItems, savePlanilhaItem, deletePlanilhaItem, listCategoriasPersonalizadas, createCategoriaPersonalizada, getCurrentUserId, listAtestados, getAtestadosByPlanilhaItem } from "@/lib/atestados-api";

export const Route = createFileRoute("/_authenticated/atestados/planilha")({
  head: () => ({ meta: [{ title: "Planilha de Quantidades — Bora Bora" }] }),
  component: PlanilhaPage,
});

const itemSchema = z.object({
  codigo: z.string().min(1, "Obrigatório"),
  categoria: z.string().min(1, "Obrigatório"),
  descricao: z.string().min(1, "Obrigatório"),
  quantidade: z.coerce.number().min(0),
  unidade: z.string().min(1, "Obrigatório"),
});

type ItemForm = z.infer<typeof itemSchema>;

function PlanilhaPage() {
  const queryClient = useQueryClient();
  const { data: itens = [] } = useQuery({ queryKey: ["planilha"], queryFn: listPlanilhaItems });
  const { data: categoriasCustom = [] } = useQuery({ queryKey: ["categorias-custom"], queryFn: listCategoriasPersonalizadas });
  const { data: atestadosList = [] } = useQuery({ queryKey: ["atestados"], queryFn: listAtestados });
  const seqMap = new Map<string, string>();
  [...atestadosList]
    .sort((a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? ""))
    .forEach((a, i) => seqMap.set(a.id, `AT-${String(i + 1).padStart(2, "0")}`));
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<string>("todas");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PlanilhaItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [criandoCategoria, setCriandoCategoria] = useState(false);
  const [novaCategoria, setNovaCategoria] = useState("");

  const upsertMut = useMutation({
    mutationFn: async (item: Partial<PlanilhaItem> & { id?: string }) => {
      const uid = await getCurrentUserId();
      return savePlanilhaItem(uid, item);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["planilha"] }),
    onError: (e: Error) => toast.error(e.message),
  });
  const deleteMut = useMutation({
    mutationFn: deletePlanilhaItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["planilha"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const todasCategorias = [
    ...CATEGORIAS_PADRAO,
    ...categoriasCustom.filter((c) => !CATEGORIAS_PADRAO.includes(c)),
  ];

  const form = useForm<ItemForm>({
    resolver: zodResolver(itemSchema),
    defaultValues: { codigo: "", categoria: "", descricao: "", quantidade: 0, unidade: "m" },
  });

  const filtered = itens.filter((item) => {
    const q = search.toLowerCase();
    const matchSearch = !search || item.codigo.toLowerCase().includes(q) || item.descricao.toLowerCase().includes(q) || item.categoria.toLowerCase().includes(q);
    const matchCat = catFilter === "todas" || item.categoria === catFilter;
    return matchSearch && matchCat;
  });

  const categoriesInFiltered = [...new Set(filtered.map((i) => i.categoria))].sort();
  const totalItens = itens.length;
  const totalCats = new Set(itens.map((i) => i.categoria)).size;
  const vinculados = itens.filter((i) => (i.atestadosCount ?? 0) > 0).length;
  const allCats = [...new Set(itens.map((i) => i.categoria))].sort();

  function openNew() {
    setEditingItem(null);
    form.reset({ codigo: "", categoria: "", descricao: "", quantidade: 0, unidade: "m" });
    setCriandoCategoria(false);
    setNovaCategoria("");
    setSheetOpen(true);
  }

  function openEdit(item: PlanilhaItem) {
    setEditingItem(item);
    form.reset({ codigo: item.codigo, categoria: item.categoria, descricao: item.descricao, quantidade: item.quantidade, unidade: item.unidade });
    setCriandoCategoria(false);
    setNovaCategoria("");
    setSheetOpen(true);
  }

  function handleSave(data: ItemForm) {
    const payload: Partial<PlanilhaItem> & { id?: string } = {
      id: editingItem?.id,
      codigo: data.codigo, categoria: data.categoria, descricao: data.descricao,
      quantidade: data.quantidade, unidade: data.unidade,
    };
    upsertMut.mutate(payload, {
      onSuccess: () => {
        toast.success(editingItem ? "Item atualizado com sucesso." : "Item criado na Planilha.");
        setSheetOpen(false);
        form.reset();
      },
    });
  }

  function handleDelete() {
    if (!deleteId) return;
    deleteMut.mutate(deleteId, { onSuccess: () => toast.success("Item excluído.") });
    setDeleteId(null);
  }

  async function handleCriarCategoria() {
    const cat = novaCategoria.trim();
    if (!cat) return;
    if (!categoriasCustom.includes(cat) && !CATEGORIAS_PADRAO.includes(cat)) {
      try {
        const uid = await getCurrentUserId();
        await createCategoriaPersonalizada(uid, cat);
        queryClient.invalidateQueries({ queryKey: ["categorias-custom"] });
      } catch (e) {
        toast.error((e as Error).message);
      }
    }
    form.setValue("categoria", cat);
    setCriandoCategoria(false);
    setNovaCategoria("");
  }

  const toDelete = itens.find((i) => i.id === deleteId);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Planilha de Quantidades de Serviços</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {totalItens === 0 ? "Nenhum item cadastrado" : `${totalItens} itens · ${totalCats} categorias`}
          </p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />Novo Item</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Table2 className="h-5 w-5 text-primary" /></div>
          <div><p className="text-xs text-muted-foreground">Total de Itens</p><p className="text-2xl font-semibold">{totalItens}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center"><Layers className="h-5 w-5 text-blue-600" /></div>
          <div><p className="text-xs text-muted-foreground">Categorias</p><p className="text-2xl font-semibold">{totalCats}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center"><FileCheck className="h-5 w-5 text-green-600" /></div>
          <div><p className="text-xs text-muted-foreground">Vinculados a Atestados</p><p className="text-2xl font-semibold">{vinculados}</p></div>
        </CardContent></Card>
      </div>

      {itens.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Table2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold">Planilha vazia</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              Os itens aparecem aqui conforme você sobe atestados e confirma os serviços extraídos pela IA, ou crie manualmente clicando em "Novo Item".
            </p>
            <Button className="mt-4" onClick={openNew}><Plus className="h-4 w-4 mr-2" />Criar primeiro item</Button>
          </CardContent>
        </Card>
      )}

      {itens.length > 0 && (
        <>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Buscar por código, descrição ou categoria..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={catFilter} onValueChange={setCatFilter}>
              <SelectTrigger className="sm:w-64"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as categorias</SelectItem>
                {allCats.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Qtd. Total</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead>Atestados</TableHead>
                    <TableHead className="w-24"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhum item encontrado.</TableCell></TableRow>
                  ) : (
                    categoriesInFiltered.map((cat) => (
                      <Fragment key={cat}>
                        <TableRow className="bg-muted/40 hover:bg-muted/40">
                          <TableCell colSpan={7} className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{cat}</TableCell>
                        </TableRow>
                        {filtered.filter((i) => i.categoria === cat).map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-mono text-xs">{item.codigo}</TableCell>
                            <TableCell>{item.descricao}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{item.categoria}</TableCell>
                            <TableCell className="text-right tabular-nums">{item.quantidade.toLocaleString("pt-BR")}</TableCell>
                            <TableCell className="text-xs">{item.unidade}</TableCell>
                            <TableCell>
                              {(item.atestadosCount ?? 0) > 0
                                ? <AtestadosPopover itemId={item.id} count={item.atestadosCount ?? 0} seqMap={seqMap} />
                                : <span className="text-muted-foreground text-xs">—</span>}
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => setDeleteId(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </Fragment>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg flex flex-col">
          <SheetHeader><SheetTitle>{editingItem ? "Editar Item" : "Novo Item"}</SheetTitle></SheetHeader>
          <Form {...form}>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="py-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="codigo" render={({ field }) => (<FormItem><FormLabel>Código *</FormLabel><FormControl><Input placeholder="1.1" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="unidade" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unidade *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>{UNIDADES.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="categoria" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria *</FormLabel>
                    {!criandoCategoria ? (
                      <Select onValueChange={(v) => { if (v === "__new__") { setCriandoCategoria(true); } else { field.onChange(v); } }} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Selecione a categoria" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {todasCategorias.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                          <SelectItem value="__new__" className="text-primary font-medium">+ Criar nova categoria</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex gap-2">
                        <Input value={novaCategoria} placeholder="Nome da nova categoria" onChange={(e) => setNovaCategoria(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleCriarCategoria(); } }} autoFocus />
                        <Button type="button" size="icon" onClick={handleCriarCategoria}><Check className="h-4 w-4" /></Button>
                        <Button type="button" size="icon" variant="outline" onClick={() => { setCriandoCategoria(false); setNovaCategoria(""); }}><X className="h-4 w-4" /></Button>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="descricao" render={({ field }) => (<FormItem><FormLabel>Descrição *</FormLabel><FormControl><Input placeholder="Descrição do serviço" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="quantidade" render={({ field }) => (<FormItem><FormLabel>Quantidade de Referência</FormLabel><FormControl><Input type="number" step="any" {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>
            </ScrollArea>
            <SheetFooter className="pt-4 border-t">
              <Button variant="outline" onClick={() => { setSheetOpen(false); form.reset(); setCriandoCategoria(false); }}>Cancelar</Button>
              <Button onClick={form.handleSubmit(handleSave)}>Salvar Item</Button>
            </SheetFooter>
          </Form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Item</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o item {toDelete?.codigo} — {toDelete?.descricao}? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}