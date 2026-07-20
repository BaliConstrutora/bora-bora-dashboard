import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, FileText, Pencil } from "lucide-react";
import { toast } from "sonner";
import { getAtestadoById } from "@/lib/atestados-api";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AtestadoStatus } from "@/types";

export const Route = createFileRoute("/_authenticated/atestados/$atestadoId")({
  head: () => ({
    meta: [
      { title: "Detalhe do Atestado — Bora Bora" },
      { name: "description", content: "Visualização detalhada do atestado da Construtora Bali." },
    ],
  }),
  component: AtestadoDetailPage,
});

const statusConfig: Record<AtestadoStatus, { label: string; variant: "default" | "destructive" | "secondary"; className?: string }> = {
  ativo: { label: "Ativo", variant: "default", className: "bg-green-600 hover:bg-green-700" },
  finalizado: { label: "Finalizado", variant: "secondary" },
  em_analise: { label: "Em Análise", variant: "secondary" },
};

function fmtBRL(v?: number) {
  if (v == null) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}
function fmtDate(d?: string) {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

function tipoContratanteLabel(t?: string) {
  if (t === "publico") return "Público (Governo)";
  if (t === "privado") return "Privado (Empresa)";
  return "—";
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <div className="text-sm text-foreground">{value ?? "—"}</div>
    </div>
  );
}

function AtestadoDetailPage() {
  const { atestadoId } = Route.useParams();
  const { data: atestado, isLoading, error } = useQuery({
    queryKey: ["atestado", atestadoId],
    queryFn: () => getAtestadoById(atestadoId),
  });

  async function handleVerPdf() {
    if (!atestado?.documentoUrl) {
      toast.info("Este atestado não possui PDF anexado.");
      return;
    }
    try {
      const { data, error } = await supabase.storage
        .from("atestados-pdfs")
        .createSignedUrl(atestado.documentoUrl, 60);
      if (error || !data?.signedUrl) throw error ?? new Error("Não foi possível gerar o link do PDF.");
      window.open(data.signedUrl, "_blank", "noopener");
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" asChild>
          <Link to="/atestados">
            <ArrowLeft className="h-4 w-4 mr-2" />Voltar para Lista
          </Link>
        </Button>
        <Button disabled>
          <Pencil className="h-4 w-4 mr-2" />Editar
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : error || !atestado ? (
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <p className="text-lg font-medium">Atestado não encontrado</p>
            <p className="text-sm text-muted-foreground">
              {error ? (error as Error).message : "O atestado solicitado não existe ou foi removido."}
            </p>
            <Button asChild variant="outline" className="mt-2">
              <Link to="/atestados">Voltar para Lista</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Dados do Atestado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Field label="Número" value={atestado.numero} />
                <Field label="Número do CAT (CREA)" value={atestado.numeroCat} />
                <Field label="Tipo de Contratante" value={tipoContratanteLabel(atestado.tipoContratante)} />
                <Field label="Contratante" value={atestado.contratante} />
                <Field label="CNPJ do Contratante" value={atestado.cnpjContratante} />
                <Field label="Número do Contrato" value={atestado.numeroContrato} />
                {atestado.tipoContratante === "publico" && (
                  <Field label="Número do Pregão/Licitação" value={atestado.numeroPregao} />
                )}
                <Field label="Local de Execução" value={atestado.localExecucao} />
                <Field label="Finalidade" value={atestado.finalidade} />
                <Field label="Valor do Contrato" value={fmtBRL(atestado.valorContrato)} />
                <Field label="Data de Início" value={fmtDate(atestado.dataInicio)} />
                <Field label="Data de Fim" value={fmtDate(atestado.dataFim)} />
                <Field label="Data de Emissão" value={fmtDate(atestado.dataEmissao)} />
                <Field label="Responsável Técnico" value={atestado.respTecnico} />
                <Field label="Registro CREA do RT" value={atestado.registroCreaRt} />
                <Field label="Número da ART" value={atestado.artNumero} />
                <Field
                  label="Status"
                  value={
                    <Badge variant={statusConfig[atestado.status].variant} className={statusConfig[atestado.status].className}>
                      {statusConfig[atestado.status].label}
                    </Badge>
                  }
                />
              </div>
              <Separator />
              <div className="grid grid-cols-1 gap-4">
                <Field label="Descrição" value={<p className="whitespace-pre-wrap">{atestado.descricao || "—"}</p>} />
                <Field label="Observações" value={<p className="whitespace-pre-wrap">{atestado.observacoes || "—"}</p>} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Aditivos</CardTitle>
            </CardHeader>
            <CardContent>
              {atestado.aditivos.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum aditivo cadastrado.</p>
              ) : (
                <div className="space-y-4">
                  {atestado.aditivos.map((ad) => (
                    <div key={ad.id} className="border rounded-md p-4 space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Aditivo Nº {ad.numero}</span>
                          <Badge variant="outline">{ad.tipo}</Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">{fmtDate(ad.dataAssinatura)}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <div><span className="text-muted-foreground">Valor Adicional: </span>{fmtBRL(ad.valorAdicional)}</div>
                        {ad.novaDataFim && (
                          <div><span className="text-muted-foreground">Nova Data Fim: </span>{fmtDate(ad.novaDataFim)}</div>
                        )}
                      </div>
                      {ad.descricao && <p className="text-sm whitespace-pre-wrap">{ad.descricao}</p>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Serviços Executados</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {atestado.servicos.length === 0 ? (
                <p className="p-6 text-sm text-muted-foreground">Nenhum serviço registrado.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Unidade</TableHead>
                      <TableHead>Categoria</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {atestado.servicos.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.codigoSugerido ?? "—"}</TableCell>
                        <TableCell>{s.descricaoSugerida ?? s.descricaoOriginal}</TableCell>
                        <TableCell>{s.quantidadeSugerida ?? "—"}</TableCell>
                        <TableCell>{s.unidadeSugerida ?? "—"}</TableCell>
                        <TableCell>{s.categoriaSugerida ?? "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Documento</CardTitle>
            </CardHeader>
            <CardContent>
              {atestado.documentoUrl ? (
                <Button onClick={handleVerPdf}>
                  <FileText className="h-4 w-4 mr-2" />Ver PDF
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum PDF anexado.</p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}