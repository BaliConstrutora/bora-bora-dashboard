import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, FileText, Pencil, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getAtestadoById, updateAtestado, updateServico } from "@/lib/atestados-api";
import { PdfViewerDialog } from "@/components/pdf-viewer-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AtestadoStatus, FinalidadeAtestado, TipoContratante } from "@/types";

export const Route = createFileRoute("/_authenticated/atestados/$atestadoId")({
  head: () => ({
    meta: [
      { title: "Detalhe do Atestado — Bora Bora" },
      { name: "description", content: "Visualização e edição do atestado da Construtora Bali." },
    ],
  }),
  component: AtestadoDetailPage,
});

const statusConfig: Record<AtestadoStatus, { label: string; className: string }> = {
  total: { label: "Total", className: "bg-green-600 hover:bg-green-700 text-white" },
  parcial: { label: "Parcial", className: "bg-blue-600 hover:bg-blue-700 text-white" },
};

const FINALIDADES: { value: FinalidadeAtestado; label: string }[] = [
  { value: "infraestrutura", label: "Infraestrutura" },
  { value: "pavimentacao", label: "Pavimentação" },
  { value: "edificacoes", label: "Edificações" },
  { value: "saneamento", label: "Saneamento" },
  { value: "eletrica", label: "Elétrica" },
  { value: "outros", label: "Outros" },
];

const UNIDADES = ["m", "m²", "m³", "t", "kg", "vb", "un", "l", "h", "mês", "km"];

const CATEGORIAS = [
  "Serviços Preliminares", "Fundações", "Estrutura de Concreto",
  "Alvenaria", "Cobertura", "Revestimentos", "Instalações Hidráulicas",
  "Instalações Elétricas", "Pavimentação", "Paisagismo", "Outros",
];

function fmtBRL(v?: number) {
  if (v == null) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}
function fmtDate(d?: string) {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}
function tipoLabel(t?: string) {
  if (t === "publico") return "Público (Governo)";
  if (t === "privado") return "Privado (Empresa)";
  return "—";
}
function finalidadeLabel(f?: string) {
  return FINALIDADES.find((x) => x.value === f)?.label ?? f ?? "—";
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );
}

type EditForm = {
  numeroCat: string;
  contratante: string;
  cnpjContratante: string;
  tipoContratante: TipoContratante;
  numeroContrato: string;
  numeroPregao: string;
  localExecucao: string;
  finalidade: FinalidadeAtestado;
  valorContrato: string;
  dataInicio: string;
  dataFim: string;
  dataEmissao: string;
  respTecnico: string;
  registroCreaRt: string;
  artNumero: string;
  status: AtestadoStatus;
  descricao: string;
  observacoes: string;
};

type EditServico = {
  id: string;
  codigoSugerido: string;
  descricaoSugerida: string;
  quantidadeSugerida: number;
  unidadeSugerida: string;
  categoriaSugerida: string;
};

function AtestadoDetailPage() {
  const { atestadoId } = Route.useParams();
  const queryClient = useQueryClient();
  const { data: atestado, isLoading, error } = useQuery({
    queryKey: ["atestado", atestadoId],
    queryFn: () => getAtestadoById(atestadoId),
  });

  const [pdfOpen, setPdfOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [editServicos, setEditServicos] = useState<EditServico[]>([]);

  const saveMut = useMutation({
    mutationFn: async () => {
      if (!editForm || !atestado) return;
      const valorNum = parseFloat(editForm.valorContrato.replace(/\./g, "").replace(",", ".")) || 0;
      await updateAtestado(atestado.id, {
        numeroCat: editForm.numeroCat,
        contratante: editForm.contratante,
        cnpjContratante: editForm.cnpjContratante,
        tipoContratante: editForm.tipoContratante,
        numeroContrato: editForm.numeroContrato,
        numeroPregao: editForm.numeroPregao,
        localExecucao: editForm.localExecucao,
        finalidade: editForm.finalidade,
        valorContrato: valorNum,
        dataInicio: editForm.dataInicio,
        dataFim: editForm.dataFim,
        dataEmissao: editForm.dataEmissao || undefined,
        respTecnico: editForm.respTecnico,
        registroCreaRt: editForm.registroCreaRt,
        artNumero: editForm.artNumero,
        status: editForm.status,
        descricao: editForm.descricao,
        observacoes: editForm.observacoes,
      });
      for (const s of editServicos) {
        await updateServico(s.id, {
          codigoSugerido: s.codigoSugerido,
          descricaoSugerida: s.descricaoSugerida,
          quantidadeSugerida: s.quantidadeSugerida,
          unidadeSugerida: s.unidadeSugerida,
          categoriaSugerida: s.categoriaSugerida,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["atestado", atestadoId] });
      queryClient.invalidateQueries({ queryKey: ["atestados"] });
      toast.success("Atestado atualizado com sucesso!");
      setIsEditing(false);
      setEditForm(null);
      setEditServicos([]);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function handleEditar() {
    if (!atestado) return;
    setEditForm({
      numeroCat: atestado.numeroCat ?? atestado.numero ?? "",
      contratante: atestado.contratante,
      cnpjContratante: atestado.cnpjContratante ?? "",
      tipoContratante: atestado.tipoContratante ?? "privado",
      numeroContrato: atestado.numeroContrato ?? "",
      numeroPregao: atestado.numeroPregao ?? "",
      localExecucao: atestado.localExecucao ?? "",
      finalidade: atestado.finalidade ?? "outros",
      valorContrato: atestado.valorContrato.toString(),
      dataInicio: atestado.dataInicio,
      dataFim: atestado.dataFim,
      dataEmissao: atestado.dataEmissao ?? "",
      respTecnico: atestado.respTecnico,
      registroCreaRt: atestado.registroCreaRt ?? "",
      artNumero: atestado.artNumero ?? "",
      status: atestado.status,
      descricao: atestado.descricao,
      observacoes: atestado.observacoes ?? "",
    });
    setEditServicos(
      atestado.servicos.map((s) => ({
        id: s.id,
        codigoSugerido: s.codigoSugerido ?? "",
        descricaoSugerida: s.descricaoSugerida ?? s.descricaoOriginal,
        quantidadeSugerida: s.quantidadeSugerida ?? 0,
        unidadeSugerida: s.unidadeSugerida ?? "m",
        categoriaSugerida: s.categoriaSugerida ?? "Outros",
      })),
    );
    setIsEditing(true);
  }

  function handleCancelar() {
    setIsEditing(false);
    setEditForm(null);
    setEditServicos([]);
  }

  function setField<K extends keyof EditForm>(key: K, value: EditForm[K]) {
    setEditForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function setServicoField(id: string, key: keyof EditServico, value: string | number) {
    setEditServicos((prev) => prev.map((s) => (s.id === id ? { ...s, [key]: value } : s)));
  }

  function handleVerPdf() {
    if (!atestado?.documentoUrl) {
      toast.info("Este atestado não possui PDF anexado.");
      return;
    }
    setPdfOpen(true);
  }

  const displayNumero = atestado?.numeroCat ?? atestado?.numero ?? "";

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Button variant="ghost" asChild>
          <Link to="/atestados">
            <ArrowLeft className="h-4 w-4 mr-2" />Voltar para Lista
          </Link>
        </Button>
        <div className="flex items-center gap-2 flex-wrap">
          {atestado?.documentoUrl && (
            <Button variant="outline" onClick={handleVerPdf}>
              <FileText className="h-4 w-4 mr-2" />Ver PDF
            </Button>
          )}
          {!isEditing ? (
            <Button onClick={handleEditar} disabled={!atestado}>
              <Pencil className="h-4 w-4 mr-2" />Editar
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancelar} disabled={saveMut.isPending}>
                <X className="h-4 w-4 mr-2" />Cancelar
              </Button>
              <Button onClick={() => saveMut.mutate()} disabled={saveMut.isPending}>
                {saveMut.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                {saveMut.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
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
                <FieldRow label="Número do CAT (CREA)">
                  {isEditing && editForm ? (
                    <Input value={editForm.numeroCat} onChange={(e) => setField("numeroCat", e.target.value)} placeholder="Ex: 1420150001437" />
                  ) : (
                    <p>{displayNumero || "—"}</p>
                  )}
                </FieldRow>

                <FieldRow label="Tipo de Contratante">
                  {isEditing && editForm ? (
                    <Select value={editForm.tipoContratante} onValueChange={(v) => setField("tipoContratante", v as TipoContratante)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="publico">Público (Governo)</SelectItem>
                        <SelectItem value="privado">Privado (Empresa)</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p>{tipoLabel(atestado.tipoContratante)}</p>
                  )}
                </FieldRow>

                <FieldRow label="Contratante">
                  {isEditing && editForm ? (
                    <Input value={editForm.contratante} onChange={(e) => setField("contratante", e.target.value)} />
                  ) : (
                    <p>{atestado.contratante}</p>
                  )}
                </FieldRow>

                <FieldRow label="CNPJ do Contratante">
                  {isEditing && editForm ? (
                    <Input value={editForm.cnpjContratante} onChange={(e) => setField("cnpjContratante", e.target.value)} placeholder="00.000.000/0000-00" />
                  ) : (
                    <p>{atestado.cnpjContratante || "—"}</p>
                  )}
                </FieldRow>

                <FieldRow label="Número do Contrato">
                  {isEditing && editForm ? (
                    <Input value={editForm.numeroContrato} onChange={(e) => setField("numeroContrato", e.target.value)} placeholder="Ex: 014/2024" />
                  ) : (
                    <p>{atestado.numeroContrato || "—"}</p>
                  )}
                </FieldRow>

                {(isEditing ? editForm?.tipoContratante === "publico" : atestado.tipoContratante === "publico") && (
                  <FieldRow label="Número do Pregão/Licitação">
                    {isEditing && editForm ? (
                      <Input value={editForm.numeroPregao} onChange={(e) => setField("numeroPregao", e.target.value)} placeholder="Ex: 003/2024" />
                    ) : (
                      <p>{atestado.numeroPregao || "—"}</p>
                    )}
                  </FieldRow>
                )}

                <FieldRow label="Local de Execução">
                  {isEditing && editForm ? (
                    <Input value={editForm.localExecucao} onChange={(e) => setField("localExecucao", e.target.value)} placeholder="Ex: Belo Horizonte/MG" />
                  ) : (
                    <p>{atestado.localExecucao || "—"}</p>
                  )}
                </FieldRow>

                <FieldRow label="Finalidade">
                  {isEditing && editForm ? (
                    <Select value={editForm.finalidade} onValueChange={(v) => setField("finalidade", v as FinalidadeAtestado)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {FINALIDADES.map((f) => (
                          <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p>{finalidadeLabel(atestado.finalidade)}</p>
                  )}
                </FieldRow>

                <FieldRow label="Valor do Contrato">
                  {isEditing && editForm ? (
                    <Input value={editForm.valorContrato} onChange={(e) => setField("valorContrato", e.target.value)} placeholder="0,00" />
                  ) : (
                    <p>{fmtBRL(atestado.valorContrato)}</p>
                  )}
                </FieldRow>

                <FieldRow label="Data de Início">
                  {isEditing && editForm ? (
                    <Input type="date" value={editForm.dataInicio} onChange={(e) => setField("dataInicio", e.target.value)} />
                  ) : (
                    <p>{fmtDate(atestado.dataInicio)}</p>
                  )}
                </FieldRow>

                <FieldRow label="Data de Fim">
                  {isEditing && editForm ? (
                    <Input type="date" value={editForm.dataFim} onChange={(e) => setField("dataFim", e.target.value)} />
                  ) : (
                    <p>{fmtDate(atestado.dataFim)}</p>
                  )}
                </FieldRow>

                <FieldRow label="Data de Emissão">
                  {isEditing && editForm ? (
                    <Input type="date" value={editForm.dataEmissao} onChange={(e) => setField("dataEmissao", e.target.value)} />
                  ) : (
                    <p>{fmtDate(atestado.dataEmissao)}</p>
                  )}
                </FieldRow>

                <FieldRow label="Responsável Técnico">
                  {isEditing && editForm ? (
                    <Input value={editForm.respTecnico} onChange={(e) => setField("respTecnico", e.target.value)} />
                  ) : (
                    <p>{atestado.respTecnico}</p>
                  )}
                </FieldRow>

                <FieldRow label="Registro CREA do RT">
                  {isEditing && editForm ? (
                    <Input value={editForm.registroCreaRt} onChange={(e) => setField("registroCreaRt", e.target.value)} placeholder="CREA-MG 00.000/D" />
                  ) : (
                    <p>{atestado.registroCreaRt || "—"}</p>
                  )}
                </FieldRow>

                <FieldRow label="Número da ART">
                  {isEditing && editForm ? (
                    <Input value={editForm.artNumero} onChange={(e) => setField("artNumero", e.target.value)} />
                  ) : (
                    <p>{atestado.artNumero || "—"}</p>
                  )}
                </FieldRow>

                <FieldRow label="Status">
                  {isEditing && editForm ? (
                    <Select value={editForm.status} onValueChange={(v) => setField("status", v as AtestadoStatus)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="total">Total</SelectItem>
                        <SelectItem value="parcial">Parcial</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge className={statusConfig[atestado.status].className}>
                      {statusConfig[atestado.status].label}
                    </Badge>
                  )}
                </FieldRow>
              </div>

              <Separator />

              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Descrição</p>
                {isEditing && editForm ? (
                  <Textarea
                    value={editForm.descricao}
                    onChange={(e) => setField("descricao", e.target.value)}
                    className="min-h-[80px]"
                  />
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{atestado.descricao || "—"}</p>
                )}
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Observações</p>
                {isEditing && editForm ? (
                  <Textarea
                    value={editForm.observacoes}
                    onChange={(e) => setField("observacoes", e.target.value)}
                    className="min-h-[60px]"
                    placeholder="Informações adicionais..."
                  />
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{atestado.observacoes || "—"}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Aditivos</CardTitle></CardHeader>
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
            <CardHeader><CardTitle>Serviços Executados</CardTitle></CardHeader>
            <CardContent className="p-0">
              {atestado.servicos.length === 0 ? (
                <p className="p-6 text-sm text-muted-foreground">Nenhum serviço registrado.</p>
              ) : isEditing ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-24">Código</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="w-28">Quantidade</TableHead>
                        <TableHead className="w-24">Unidade</TableHead>
                        <TableHead className="w-44">Categoria</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {editServicos.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell>
                            <Input
                              className="h-8 text-xs"
                              value={s.codigoSugerido}
                              onChange={(e) => setServicoField(s.id, "codigoSugerido", e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              className="h-8 text-xs"
                              value={s.descricaoSugerida}
                              onChange={(e) => setServicoField(s.id, "descricaoSugerida", e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              className="h-8 text-xs"
                              value={s.quantidadeSugerida}
                              onChange={(e) => setServicoField(s.id, "quantidadeSugerida", Number(e.target.value))}
                            />
                          </TableCell>
                          <TableCell>
                            <Select value={s.unidadeSugerida} onValueChange={(v) => setServicoField(s.id, "unidadeSugerida", v)}>
                              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {UNIDADES.map((u) => <SelectItem key={u} value={u} className="text-xs">{u}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Select value={s.categoriaSugerida} onValueChange={(v) => setServicoField(s.id, "categoriaSugerida", v)}>
                              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {CATEGORIAS.map((c) => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
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
                        <TableCell>{s.quantidadeSugerida?.toLocaleString("pt-BR") ?? "—"}</TableCell>
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
            <CardHeader><CardTitle>Documento</CardTitle></CardHeader>
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

      <PdfViewerDialog
        open={pdfOpen}
        onOpenChange={setPdfOpen}
        storagePath={atestado?.documentoUrl ?? null}
        title={`Visualizar Atestado — ${displayNumero}`}
      />
    </div>
  );
}