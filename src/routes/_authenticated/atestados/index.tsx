import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search, FileCheck, MoreHorizontal, Trash2, Loader2, FileText } from "lucide-react";
import type { AtestadoStatus } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listAtestados, deleteAtestado, updateAtestadoOrdem } from "@/lib/atestados-api";
import { PdfViewerDialog } from "@/components/pdf-viewer-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useEffect, useRef } from "react";

function OrdemBadge({ id, ordem }: { id: string; ordem: number }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(ordem));
  const inputRef = useRef<HTMLInputElement>(null);
  const savedRef = useRef(false);

  useEffect(() => {
    if (!editing) setValue(String(ordem));
  }, [ordem, editing]);

  const mut = useMutation({
    mutationFn: (novo: number) => updateAtestadoOrdem(id, novo),
    onSuccess: () => {
      toast.success("Sequência atualizada!");
      queryClient.invalidateQueries({ queryKey: ["atestados"] });
      setEditing(false);
    },
    onError: () => {
      toast.error("Não foi possível atualizar a sequência.");
      setValue(String(ordem));
    },
  });

  function commit() {
    if (savedRef.current) return;
    savedRef.current = true;
    const n = parseInt(value, 10);
    if (!Number.isFinite(n) || n <= 0 || n === ordem) {
      setValue(String(ordem));
      setEditing(false);
      return;
    }
    mut.mutate(n);
  }

  function cancel() {
    savedRef.current = true;
    setValue(String(ordem));
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="inline-flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <Input
          ref={inputRef}
          type="number"
          min={1}
          autoFocus
          disabled={mut.isPending}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); commit(); }
            if (e.key === "Escape") { e.preventDefault(); cancel(); }
          }}
          className="h-7 w-16 px-2 text-xs"
        />
        {mut.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
      </div>
    );
  }

  return (
    <Badge
      variant="outline"
      className="cursor-pointer hover:bg-muted inline-flex items-center gap-1"
      onClick={(e) => {
        e.stopPropagation();
        savedRef.current = false;
        setEditing(true);
      }}
    >
      {mut.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : `AT-${String(ordem).padStart(2, "0")}`}
    </Badge>
  );
}

export const Route = createFileRoute("/_authenticated/atestados/")({
  head: () => ({
    meta: [
      { title: "Lista de Atestados — Bora Bora" },
      { name: "description", content: "Gestão de atestados da Construtora Bali." },
    ],
  }),
  component: AtestadosListPage,
});

const statusConfig: Record<AtestadoStatus, { label: string; variant: "default" | "destructive" | "secondary"; className?: string }> = {
  total: { label: "Total", variant: "default", className: "bg-green-600 hover:bg-green-700" },
  parcial: { label: "Parcial", variant: "default", className: "bg-blue-600 hover:bg-blue-700" },
};

function fmtBRL(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(v);
}
function fmtDate(d?: string) {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

function AtestadosListPage() {
  const queryClient = useQueryClient();
  const { data: atestados = [], isLoading } = useQuery({ queryKey: ["atestados"], queryFn: listAtestados });
  const deleteMut = useMutation({
    mutationFn: deleteAtestado,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["atestados"] });
      queryClient.invalidateQueries({ queryKey: ["planilha"] });
      toast.success("Atestado excluído com sucesso.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pdfAtestado, setPdfAtestado] = useState<{ id: string; numero: string; path: string } | null>(null);

  const sorted = [...atestados].sort((a, b) => {
    const oa = a.ordem ?? Number.MAX_SAFE_INTEGER;
    const ob = b.ordem ?? Number.MAX_SAFE_INTEGER;
    if (oa !== ob) return oa - ob;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
  const seqMap = new Map<string, string>();
  atestados.forEach((a) => {
    const seq = a.ordem ?? 0;
    seqMap.set(a.id, seq > 0 ? `AT-${String(seq).padStart(2, "0")}` : "AT-—");
  });

  const filtered = sorted.filter((a) => {
    const s = search.toLowerCase();
    const matchSearch =
      !search ||
      (a.numeroCat ?? a.numero).toLowerCase().includes(s) ||
      a.contratante.toLowerCase().includes(s);
    const matchStatus = statusFilter === "todos" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const total = atestados.length;
  const totais = atestados.filter((a) => a.status === "total").length;
  const parciais = atestados.filter((a) => a.status === "parcial").length;

  function handleDelete() {
    if (!deleteId) return;
    deleteMut.mutate(deleteId);
    setDeleteId(null);
  }
  const toDelete = atestados.find((a) => a.id === deleteId);

  function handleVerPdf(a: { id: string; numero: string; documentoUrl?: string | null }) {
    if (!a.documentoUrl) {
      toast.info("Este atestado não possui PDF anexado.");
      return;
    }
    setPdfAtestado({ id: a.id, numero: (a as { numeroCat?: string | null }).numeroCat ?? a.numero, path: a.documentoUrl });
  }

  const statItems = [
    { label: "Total de Atestados", value: total, color: "text-primary" },
    { label: "Atestados Totais", value: totais, color: "text-green-600" },
    { label: "Atestados Parciais", value: parciais, color: "text-blue-600" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statItems.map((it) => (
          <Card key={it.label}>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{it.label}</p>
                <p className="text-3xl font-bold mt-1">{it.value}</p>
              </div>
              <FileCheck className={`h-8 w-8 ${it.color}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por número ou contratante..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="total">Total</SelectItem>
              <SelectItem value="parcial">Parcial</SelectItem>
            </SelectContent>
          </Select>
          <Button asChild>
            <Link to="/atestados/novo"><Plus className="h-4 w-4 mr-2" />Novo Atestado</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-24rem)]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Seq.</TableHead>
                  <TableHead>Nº CAT (CREA)</TableHead>
                  <TableHead>Contratante</TableHead>
                  <TableHead>Valor do Contrato</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aditivos</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {isLoading ? (<span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Carregando...</span>) : "Nenhum atestado encontrado."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((a) => {
                    const sc = statusConfig[a.status];
                    const displayNumero = a.numeroCat ?? a.numero;
                    const seq = a.ordem ?? fallbackSeq.get(a.id) ?? 0;
                    return (
                      <TableRow key={a.id}>
                        <TableCell>
                          <OrdemBadge id={a.id} ordem={seq} />
                        </TableCell>
                        <TableCell>
                          <Link
                            to="/atestados/$atestadoId"
                            params={{ atestadoId: a.id }}
                            className="text-primary font-medium hover:underline cursor-pointer"
                          >
                            {displayNumero}
                          </Link>
                        </TableCell>
                        <TableCell>{a.contratante}</TableCell>
                        <TableCell>{fmtBRL(a.valorContrato)}</TableCell>
                        <TableCell>{fmtDate(a.dataInicio)} – {fmtDate(a.dataFim)}</TableCell>
                        <TableCell><Badge variant={sc.variant} className={sc.className}>{sc.label}</Badge></TableCell>
                        <TableCell>{a.aditivos.length > 0 ? `${a.aditivos.length} aditivo(s)` : "—"}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleVerPdf(a)}
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                Ver PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteId(a.id)}>
                                <Trash2 className="h-4 w-4 mr-2" />Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Atestado</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o atestado {toDelete?.numeroCat ?? toDelete?.numero}? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteId(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PdfViewerDialog
        open={!!pdfAtestado}
        onOpenChange={(o) => { if (!o) setPdfAtestado(null); }}
        storagePath={pdfAtestado?.path ?? null}
        title={`Visualizar Atestado — ${pdfAtestado?.numero ?? ""}`}
      />
    </div>
  );
}
