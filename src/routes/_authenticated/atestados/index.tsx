import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search, CheckCircle2, FileCheck, MoreHorizontal, Trash2, Clock, Loader2, FileText } from "lucide-react";
import type { AtestadoStatus } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listAtestados, deleteAtestado } from "@/lib/atestados-api";
import { supabase } from "@/integrations/supabase/client";
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
  ativo: { label: "Ativo", variant: "default", className: "bg-green-600 hover:bg-green-700" },
  finalizado: { label: "Finalizado", variant: "secondary" },
  em_analise: { label: "Em Análise", variant: "secondary" },
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
      toast.success("Atestado excluído com sucesso.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pdfLoadingId, setPdfLoadingId] = useState<string | null>(null);

  const filtered = atestados.filter((a) => {
    const s = search.toLowerCase();
    const matchSearch = !search || a.numero.toLowerCase().includes(s) || a.contratante.toLowerCase().includes(s);
    const matchStatus = statusFilter === "todos" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const total = atestados.length;
  const ativos = atestados.filter((a) => a.status === "ativo").length;
  const finalizados = atestados.filter((a) => a.status === "finalizado").length;
  const emAnalise = atestados.filter((a) => a.status === "em_analise").length;

  function handleDelete() {
    if (!deleteId) return;
    deleteMut.mutate(deleteId);
    setDeleteId(null);
  }
  const toDelete = atestados.find((a) => a.id === deleteId);

  async function handleVerPdf(atestadoId: string, documentoUrl: string | null | undefined) {
    if (!documentoUrl) {
      toast.info("Este atestado não possui PDF anexado.");
      return;
    }
    setPdfLoadingId(atestadoId);
    try {
      const { data, error } = await supabase.storage
        .from("atestados-pdfs")
        .createSignedUrl(documentoUrl, 120);
      if (error || !data?.signedUrl) {
        toast.error("Não foi possível abrir o PDF.");
        return;
      }
      window.open(data.signedUrl, "_blank", "noopener");
    } catch {
      toast.error("Erro ao abrir o PDF.");
    } finally {
      setPdfLoadingId(null);
    }
  }

  const statItems = [
    { label: "Total", value: total, icon: FileCheck, color: "text-primary" },
    { label: "Ativos", value: ativos, icon: CheckCircle2, color: "text-green-600" },
    { label: "Finalizados", value: finalizados, icon: CheckCircle2, color: "text-muted-foreground" },
    { label: "Em Análise", value: emAnalise, icon: Clock, color: "text-muted-foreground" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((it) => (
          <Card key={it.label}>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{it.label}</p>
                <p className="text-3xl font-bold mt-1">{it.value}</p>
              </div>
              <it.icon className={`h-8 w-8 ${it.color}`} />
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
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="finalizado">Finalizado</SelectItem>
              <SelectItem value="em_analise">Em Análise</SelectItem>
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
                  <TableHead>Número</TableHead>
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
                  filtered.map((a, index) => {
                    const sc = statusConfig[a.status];
                    return (
                      <TableRow key={a.id}>
                        <TableCell>
                          <Badge variant="outline">{`AT-${String(index + 1).padStart(2, "0")}`}</Badge>
                        </TableCell>
                        <TableCell>
                          <Link
                            to="/atestados/$atestadoId"
                            params={{ atestadoId: a.id }}
                            className="text-primary font-medium hover:underline cursor-pointer"
                          >
                            {a.numero}
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
                                disabled={pdfLoadingId === a.id}
                                onClick={() => handleVerPdf(a.id, a.documentoUrl)}
                              >
                                {pdfLoadingId === a.id ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <FileText className="h-4 w-4 mr-2" />
                                )}
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
              Tem certeza que deseja excluir o atestado {toDelete?.numero}? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteId(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
