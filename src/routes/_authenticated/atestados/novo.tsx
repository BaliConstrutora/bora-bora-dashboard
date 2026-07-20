import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Upload, X, Check, Loader2, Trash2, CheckCircle2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { mockServicosExtraidos, CATEGORIAS_PADRAO, UNIDADES } from "@/data/mock";
import type { Aditivo, AditivoTipo, ServicoExtraido } from "@/types";
import { createAtestadoFull, getCurrentUserId, uploadAtestadoPdf } from "@/lib/atestados-api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/atestados/novo")({
  head: () => ({ meta: [{ title: "Cadastro de Atestado — Bora Bora" }] }),
  component: NovoAtestadoPage,
});

const atestadoSchema = z.object({
  numero: z.string().min(1, "Obrigatório"),
  contratante: z.string().min(1, "Obrigatório"),
  descricao: z.string().min(1, "Obrigatório"),
  valorContrato: z.string().min(1, "Obrigatório"),
  dataInicio: z.string().min(1, "Obrigatório"),
  dataFim: z.string().min(1, "Obrigatório"),
  dataEmissao: z.string().optional(),
  respTecnico: z.string().min(1, "Obrigatório"),
  artNumero: z.string().optional(),
  status: z.enum(["ativo", "vencido", "em_analise"]),
  observacoes: z.string().optional(),
  numeroCat: z.string().optional(),
  cnpjContratante: z.string().optional(),
  tipoContratante: z.enum(["publico", "privado"]).optional(),
  numeroContrato: z.string().optional(),
  numeroPregao: z.string().optional(),
  localExecucao: z.string().optional(),
  registroCreaRt: z.string().optional(),
  finalidade: z.enum(["infraestrutura","pavimentacao","edificacoes","saneamento","eletrica","outros"]).optional(),
});

const aditivoSchema = z.object({
  tipo: z.enum(["prazo", "valor", "escopo", "misto"]),
  dataAssinatura: z.string().min(1, "Obrigatório"),
  valorAdicional: z.string().optional(),
  novaDataFim: z.string().optional(),
  descricao: z.string().min(1, "Obrigatório"),
});

type AtestadoForm = z.infer<typeof atestadoSchema>;
type AditivoForm = z.infer<typeof aditivoSchema>;

const ADITIVO_LABELS: Record<AditivoTipo, string> = {
  prazo: "Prazo", valor: "Valor", escopo: "Escopo", misto: "Misto",
};

const ADITIVO_BADGE_CLASS: Record<AditivoTipo, string> = {
  prazo: "bg-blue-100 text-blue-700 border-blue-200",
  valor: "bg-green-100 text-green-700 border-green-200",
  escopo: "bg-purple-100 text-purple-700 border-purple-200",
  misto: "bg-amber-100 text-amber-700 border-amber-200",
};

function StepIndicator({ step }: { step: number }) {
  const steps = ["Dados do Atestado", "Processamento IA", "Validar Serviços", "Concluído"];
  return (
    <div className="flex items-center gap-2 mb-6">
      {steps.map((label, i) => {
        const num = i + 1;
        const done = step > num;
        const active = step === num;
        return (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-2 min-w-0">
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 border",
                done && "bg-green-600 text-white border-green-600",
                active && "bg-primary text-primary-foreground border-primary",
                !done && !active && "bg-muted text-muted-foreground border-border"
              )}>
                {done ? <Check className="h-3.5 w-3.5" /> : num}
              </div>
              <span className={cn(
                "text-xs truncate",
                active ? "font-semibold text-foreground" : "text-muted-foreground"
              )}>{label}</span>
            </div>
            {i < steps.length - 1 && <div className="flex-1 h-px bg-border" />}
          </div>
        );
      })}
    </div>
  );
}

function ServiceCard({ servico, onConfirm, onIgnore, onUpdate }: {
  servico: ServicoExtraido;
  onConfirm: (id: string) => void;
  onIgnore: (id: string) => void;
  onUpdate: (id: string, field: keyof ServicoExtraido, value: string | number) => void;
}) {
  const isPendente = servico.status === "pendente";
  const isConfirmado = servico.status === "confirmado";
  const isIgnorado = servico.status === "ignorado";
  return (
    <Card className={cn(isConfirmado && "border-green-300 bg-green-50/40", isIgnorado && "opacity-60")}>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-start">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Extraído do atestado</p>
            <p className="text-sm font-medium">{servico.descricaoOriginal}</p>
            <p className="text-xs text-muted-foreground">Quantidade: {servico.quantidadeOriginal}</p>
          </div>
          <div className="text-muted-foreground text-lg hidden md:block">→</div>
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Sugestão IA — Planilha Bali</p>
            {isPendente && (
              <div className="space-y-2">
                <Badge variant="outline" className="text-[10px]">✦ Novo item para a Planilha</Badge>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-muted-foreground">Código</label>
                    <Input className="h-8 text-xs" value={servico.codigoSugerido} onChange={(e) => onUpdate(servico.id, "codigoSugerido", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground">Unidade</label>
                    <Select value={servico.unidadeSugerida} onValueChange={(v) => onUpdate(servico.id, "unidadeSugerida", v)}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {UNIDADES.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] text-muted-foreground">Descrição</label>
                    <Input className="h-8 text-xs" value={servico.descricaoSugerida} onChange={(e) => onUpdate(servico.id, "descricaoSugerida", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground">Categoria</label>
                    <Select value={servico.categoriaSugerida} onValueChange={(v) => onUpdate(servico.id, "categoriaSugerida", v)}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIAS_PADRAO.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground">Quantidade</label>
                    <Input type="number" className="h-8 text-xs" value={servico.quantidadeSugerida} onChange={(e) => onUpdate(servico.id, "quantidadeSugerida", Number(e.target.value))} />
                  </div>
                </div>
              </div>
            )}
            {isConfirmado && (
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-medium">{servico.codigoSugerido} — {servico.descricaoSugerida}</p>
                  <p className="text-muted-foreground">{(servico.quantidadeSugerida ?? 0).toLocaleString("pt-BR")} {servico.unidadeSugerida} · {servico.categoriaSugerida}</p>
                </div>
              </div>
            )}
            {isIgnorado && <p className="text-xs text-muted-foreground italic">— Ignorado (não adicionado à Planilha)</p>}
          </div>
        </div>
        {isPendente && (
          <>
            <Separator className="my-3" />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => onIgnore(servico.id)}>Ignorar</Button>
              <Button size="sm" onClick={() => onConfirm(servico.id)}>Criar na Planilha</Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function NovoAtestadoPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [aditivos, setAditivos] = useState<Aditivo[]>([]);
  const [aditivoSheetOpen, setAditivoSheetOpen] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [servicos, setServicos] = useState<ServicoExtraido[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<AtestadoForm>({
    resolver: zodResolver(atestadoSchema),
    defaultValues: { status: "em_analise", numero: "", contratante: "", descricao: "", valorContrato: "", dataInicio: "", dataFim: "", respTecnico: "", numeroCat: "", cnpjContratante: "", numeroContrato: "", numeroPregao: "", localExecucao: "", registroCreaRt: "" },
  });

  const aditivoForm = useForm<AditivoForm>({
    resolver: zodResolver(aditivoSchema),
    defaultValues: { tipo: "prazo", dataAssinatura: "", descricao: "" },
  });

  useEffect(() => {
    if (step !== 2) return;
    const timer = setTimeout(() => {
      setServicos(mockServicosExtraidos.map((s) => ({ ...s, planilhaItemId: undefined, status: "pendente" as const })));
      setStep(3);
    }, 2500);
    return () => clearTimeout(timer);
  }, [step]);

  function handleProcessar() { form.handleSubmit(() => { setStep(2); })(); }
  function handleConfirm(id: string) { setServicos((prev) => prev.map((s) => s.id === id ? { ...s, status: "confirmado" as const } : s)); }
  function handleIgnore(id: string) { setServicos((prev) => prev.map((s) => s.id === id ? { ...s, status: "ignorado" as const } : s)); }
  function handleUpdate(id: string, field: keyof ServicoExtraido, value: string | number) { setServicos((prev) => prev.map((s) => s.id === id ? { ...s, [field]: value } : s)); }

  const saveMut = useMutation({
    mutationFn: async () => {
      const uid = await getCurrentUserId();
      const v = form.getValues();
      const valor = parseFloat(v.valorContrato.replace(/\./g, "").replace(",", ".")) || 0;
      let documentoPath: string | null = null;
      if (pdfFile) {
        documentoPath = await uploadAtestadoPdf(uid, pdfFile);
      }
      await createAtestadoFull({
        atestado: {
          user_id: uid, numero: v.numero, contratante: v.contratante, descricao: v.descricao,
          valor_contrato: valor, data_inicio: v.dataInicio, data_fim: v.dataFim,
          data_emissao: v.dataEmissao || null, resp_tecnico: v.respTecnico,
          art_numero: v.artNumero || null, status: v.status,
          documento_url: documentoPath, observacoes: v.observacoes || null,
          numero_cat: v.numeroCat || null,
          cnpj_contratante: v.cnpjContratante || null,
          tipo_contratante: v.tipoContratante ?? null,
          numero_contrato: v.numeroContrato || null,
          numero_pregao: v.tipoContratante === "publico" ? (v.numeroPregao || null) : null,
          local_execucao: v.localExecucao || null,
          registro_crea_rt: v.registroCreaRt || null,
          finalidade: v.finalidade ?? null,
        },
        aditivos: aditivos.map((a) => ({
          user_id: uid, numero: a.numero, tipo: a.tipo,
          data_assinatura: a.dataAssinatura, nova_data_fim: a.novaDataFim ?? null,
          valor: a.valor ?? null, valor_adicional: a.valorAdicional ?? null,
          prazo: a.prazo ?? null, escopo: a.escopo ?? null,
          descricao: a.descricao, observacoes: a.observacoes ?? null,
        })),
        servicos: servicos.map((s) => ({
          user_id: uid, planilha_item_id: s.planilhaItemId ?? null,
          descricao_original: s.descricaoOriginal,
          quantidade_original: s.quantidadeOriginal ?? null,
          codigo_sugerido: s.codigoSugerido ?? null,
          categoria_sugerida: s.categoriaSugerida ?? null,
          descricao_sugerida: s.descricaoSugerida ?? null,
          unidade_sugerida: s.unidadeSugerida ?? null,
          quantidade_sugerida: s.quantidadeSugerida ?? null,
          valor_unitario: s.valorUnitario ?? null,
          valor_total: s.valorTotal ?? null,
          status: s.status ?? "pendente", observacoes: s.observacoes ?? null,
        })),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["atestados"] });
      toast.success("Atestado salvo com sucesso!");
      setStep(4);
    },
    onError: (e: Error) => toast.error(e.message),
  });
  function handleSalvar() { saveMut.mutate(); }
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) { setPdfFile(null); return; }
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      toast.error("Arquivo inválido", { description: "Envie um documento no formato PDF." });
      if (fileInputRef.current) fileInputRef.current.value = "";
      setPdfFile(null);
      return;
    }
    const MAX_BYTES = 20 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      toast.error("Arquivo muito grande", { description: `O PDF deve ter no máximo 20 MB (atual: ${(file.size / 1024 / 1024).toFixed(1)} MB).` });
      if (fileInputRef.current) fileInputRef.current.value = "";
      setPdfFile(null);
      return;
    }
    if (file.size === 0) {
      toast.error("Arquivo vazio", { description: "O PDF selecionado está vazio." });
      if (fileInputRef.current) fileInputRef.current.value = "";
      setPdfFile(null);
      return;
    }
    setPdfFile(file);
  }

  function handleAditivoSave(data: AditivoForm) {
    const newAditivo: Aditivo = {
      id: crypto.randomUUID(),
      numero: aditivos.length + 1,
      tipo: data.tipo,
      dataAssinatura: data.dataAssinatura,
      valorAdicional: data.valorAdicional ? parseFloat(data.valorAdicional.replace(/\./g, "").replace(",", ".")) : undefined,
      novaDataFim: data.novaDataFim || undefined,
      descricao: data.descricao,
      createdAt: new Date().toISOString(),
    };
    setAditivos((prev) => [...prev, newAditivo]);
    aditivoForm.reset({ tipo: "prazo", dataAssinatura: "", descricao: "" });
    setAditivoSheetOpen(false);
    toast.success("Aditivo adicionado.");
  }

  const confirmedCount = servicos.filter((s) => s.status === "confirmado").length;
  const pendingCount = servicos.filter((s) => s.status === "pendente").length;
  const formValues = form.getValues();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <StepIndicator step={step} />
      {step === 1 && (
        <div className="space-y-4">
          <Form {...form}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4" />Dados do Atestado</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="numero" render={({ field }) => (<FormItem><FormLabel>Número do Atestado *</FormLabel><FormControl><Input placeholder="AT-2024-001" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="numeroCat" render={({ field }) => (<FormItem><FormLabel>Número do CAT (CREA)</FormLabel><FormControl><Input placeholder="1420150001437" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="tipoContratante" render={({ field }) => (<FormItem><FormLabel>Tipo de Contratante</FormLabel><Select onValueChange={field.onChange} value={field.value ?? ""}><FormControl><SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger></FormControl><SelectContent><SelectItem value="publico">Público (Governo)</SelectItem><SelectItem value="privado">Privado (Empresa)</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="contratante" render={({ field }) => (<FormItem><FormLabel>Contratante *</FormLabel><FormControl><Input placeholder="Nome da empresa contratante" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="cnpjContratante" render={({ field }) => (<FormItem><FormLabel>CNPJ do Contratante</FormLabel><FormControl><Input placeholder="00.000.000/0000-00" maxLength={18} value={field.value ?? ""} onChange={(e) => field.onChange(formatCnpj(e.target.value))} onBlur={field.onBlur} name={field.name} ref={field.ref} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="numeroContrato" render={({ field }) => (<FormItem><FormLabel>Número do Contrato</FormLabel><FormControl><Input placeholder="014/2014" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  {tipoContratanteWatch === "publico" && (
                    <FormField control={form.control} name="numeroPregao" render={({ field }) => (<FormItem><FormLabel>Número do Pregão/Licitação</FormLabel><FormControl><Input placeholder="Ex: 001/2014" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  )}
                  <FormField control={form.control} name="dataInicio" render={({ field }) => (<FormItem><FormLabel>Data de Início *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="dataFim" render={({ field }) => (<FormItem><FormLabel>Data de Fim *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="localExecucao" render={({ field }) => (<FormItem><FormLabel>Local de Execução</FormLabel><FormControl><Input placeholder="Ex: Belo Horizonte/MG" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="finalidade" render={({ field }) => (<FormItem><FormLabel>Finalidade</FormLabel><Select onValueChange={field.onChange} value={field.value ?? ""}><FormControl><SelectTrigger><SelectValue placeholder="Selecione a finalidade" /></SelectTrigger></FormControl><SelectContent><SelectItem value="infraestrutura">Infraestrutura</SelectItem><SelectItem value="pavimentacao">Pavimentação</SelectItem><SelectItem value="edificacoes">Edificações</SelectItem><SelectItem value="saneamento">Saneamento</SelectItem><SelectItem value="eletrica">Elétrica</SelectItem><SelectItem value="outros">Outros</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="valorContrato" render={({ field }) => (<FormItem><FormLabel>Valor do Contrato (R$) *</FormLabel><FormControl><Input placeholder="0,00" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="respTecnico" render={({ field }) => (<FormItem><FormLabel>Responsável Técnico *</FormLabel><FormControl><Input placeholder="Eng. Nome Sobrenome" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="registroCreaRt" render={({ field }) => (<FormItem><FormLabel>Registro CREA do RT</FormLabel><FormControl><Input placeholder="CREA-MG 94.712/D" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="status" render={({ field }) => (<FormItem><FormLabel>Status *</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione o status" /></SelectTrigger></FormControl><SelectContent><SelectItem value="ativo">Ativo</SelectItem><SelectItem value="em_analise">Em Análise</SelectItem><SelectItem value="vencido">Vencido</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="artNumero" render={({ field }) => (<FormItem><FormLabel>Número da ART</FormLabel><FormControl><Input placeholder="20240012345" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="dataEmissao" render={({ field }) => (<FormItem><FormLabel>Data de Emissão</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <div className="sm:col-span-2"><FormField control={form.control} name="descricao" render={({ field }) => (<FormItem><FormLabel>Descrição Geral *</FormLabel><FormControl><Textarea placeholder="Descreva as atividades executadas..." className="min-h-[80px]" {...field} /></FormControl><FormMessage /></FormItem>)} /></div>
                  <div className="sm:col-span-2"><FormField control={form.control} name="observacoes" render={({ field }) => (<FormItem><FormLabel>Observações</FormLabel><FormControl><Textarea placeholder="Informações adicionais (opcional)..." className="min-h-[60px]" {...field} /></FormControl><FormMessage /></FormItem>)} /></div>
                </div>
              </CardContent>
            </Card>
          </Form>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">Aditivos<Badge variant="secondary" className="text-xs">{aditivos.length}</Badge></CardTitle>
                <Button size="sm" variant="outline" className="h-8 text-xs border-accent text-accent-foreground hover:bg-accent/10" onClick={() => setAditivoSheetOpen(true)}><Plus className="h-3.5 w-3.5 mr-1" />Adicionar Aditivo</Button>
              </div>
            </CardHeader>
            <CardContent>
              {aditivos.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum aditivo cadastrado. Clique em "Adicionar Aditivo" para registrar alterações contratuais.</p>
              ) : (
                <div className="divide-y">
                  {aditivos.map((ad) => (
                    <div key={ad.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                      <div className="w-8 h-8 rounded-full bg-accent/20 text-accent-foreground flex items-center justify-center text-xs font-bold shrink-0">{ad.numero}º</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5"><span className="text-sm font-medium">{ad.numero}º Aditivo</span><Badge variant="outline" className={cn("text-[10px]", ADITIVO_BADGE_CLASS[ad.tipo])}>{ADITIVO_LABELS[ad.tipo]}</Badge></div>
                        <p className="text-xs text-muted-foreground truncate">{ad.dataAssinatura} · {ad.descricao.slice(0, 60)}{ad.descricao.length > 60 ? "..." : ""}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => setAditivos((prev) => prev.filter((a) => a.id !== ad.id))}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Upload className="h-4 w-4" />Documento do Atestado (PDF)</CardTitle></CardHeader>
            <CardContent>
              {!pdfFile ? (
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium">Clique para selecionar o PDF do atestado</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF até 20 MB</p>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-green-50 border-green-200">
                  <div className="w-9 h-9 rounded-md bg-red-100 flex items-center justify-center text-[10px] font-bold text-red-600 shrink-0">PDF</div>
                  <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{pdfFile.name}</p><p className="text-xs text-muted-foreground">{(pdfFile.size / 1024 / 1024).toFixed(1)} MB</p></div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => { setPdfFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}><X className="h-4 w-4" /></Button>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
            </CardContent>
          </Card>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" asChild><Link to="/atestados">Cancelar</Link></Button>
            <Button onClick={handleProcessar} disabled={!pdfFile}>Processar com IA →</Button>
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="flex flex-col items-center justify-center min-h-[420px] space-y-4 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          <div><h2 className="text-lg font-semibold">Analisando o documento...</h2><p className="text-sm text-muted-foreground mt-1">A IA está lendo o PDF e identificando os serviços executados</p></div>
          <div className="w-full max-w-sm space-y-2 mt-4">
            {[{ label: "Lendo o PDF...", done: true },{ label: "Extraindo lista de serviços...", done: false, active: true },{ label: "Correlacionando com a Planilha de Quantidades...", done: false, active: false }].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm px-4 py-2 rounded-lg border bg-card text-left">
                {item.done ? <Check className="h-4 w-4 text-green-600 shrink-0" /> : item.active ? <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" /> : <div className="h-4 w-4 rounded-full border border-border shrink-0" />}
                <span className={cn(item.done && "text-muted-foreground", !item.done && !item.active && "text-muted-foreground/50")}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {step === 3 && (
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div><h2 className="text-base font-semibold">{servicos.length} serviços extraídos — {formValues.numero || "Atestado"} · {formValues.contratante || ""}</h2><p className="text-sm text-muted-foreground mt-0.5">Revise, edite e confirme cada item para a Planilha de Quantidades</p></div>
            <div className="flex gap-2 shrink-0"><Badge className="bg-green-600 hover:bg-green-600">{confirmedCount} confirmados</Badge><Badge variant="secondary">{pendingCount} pendentes</Badge></div>
          </div>
          <div className="space-y-3">
            {servicos.map((servico) => (<ServiceCard key={servico.id} servico={servico} onConfirm={handleConfirm} onIgnore={handleIgnore} onUpdate={handleUpdate} />))}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setStep(1)}>Voltar</Button>
            <Button onClick={handleSalvar} disabled={saveMut.isPending}>
              {saveMut.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
              Salvar Atestado Completo
            </Button>
          </div>
        </div>
      )}
      {step === 4 && (
        <div className="flex flex-col items-center justify-center min-h-[420px] space-y-4 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center"><CheckCircle2 className="h-10 w-10 text-green-600" /></div>
          <div><h2 className="text-xl font-semibold">Atestado salvo com sucesso!</h2><p className="text-sm text-muted-foreground mt-1">{confirmedCount} serviços vinculados à Planilha de Quantidades</p></div>
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <Button variant="outline" onClick={() => navigate({ to: "/atestados" })}>Ver Lista de Atestados</Button>
            <Button onClick={() => navigate({ to: "/atestados/planilha" })}>Ver Planilha de Quantidades</Button>
          </div>
        </div>
      )}
      <Sheet open={aditivoSheetOpen} onOpenChange={setAditivoSheetOpen}>
        <SheetContent className="w-full sm:max-w-md flex flex-col">
          <SheetHeader><SheetTitle>Adicionar Aditivo</SheetTitle></SheetHeader>
          <Form {...aditivoForm}>
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              <FormField control={aditivoForm.control} name="tipo" render={({ field }) => (<FormItem><FormLabel>Tipo de Aditivo *</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger></FormControl><SelectContent><SelectItem value="prazo">Prazo</SelectItem><SelectItem value="valor">Valor</SelectItem><SelectItem value="escopo">Escopo / Serviços</SelectItem><SelectItem value="misto">Misto (Prazo + Valor)</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
              <FormField control={aditivoForm.control} name="dataAssinatura" render={({ field }) => (<FormItem><FormLabel>Data de Assinatura *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={aditivoForm.control} name="valorAdicional" render={({ field }) => (<FormItem><FormLabel>Valor Adicional (R$)</FormLabel><FormControl><Input placeholder="Ex: 480.000,00" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={aditivoForm.control} name="novaDataFim" render={({ field }) => (<FormItem><FormLabel>Nova Data de Fim</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={aditivoForm.control} name="descricao" render={({ field }) => (<FormItem><FormLabel>Descrição das Alterações *</FormLabel><FormControl><Textarea placeholder="Descreva as alterações do aditivo..." className="min-h-[100px]" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <div>
                <FormLabel>Documento do Aditivo (PDF)</FormLabel>
                <div className="mt-1.5 border-2 border-dashed border-border rounded-lg p-5 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all" onClick={() => toast.info("Upload disponível após integração com Supabase.")}>
                  <Upload className="h-5 w-5 text-muted-foreground mx-auto mb-1.5" />
                  <p className="text-xs text-muted-foreground">Clique para selecionar o PDF do aditivo</p>
                </div>
              </div>
            </div>
            <SheetFooter className="pt-4 border-t">
              <Button variant="outline" onClick={() => { setAditivoSheetOpen(false); aditivoForm.reset({ tipo: "prazo", dataAssinatura: "", descricao: "" }); }}>Cancelar</Button>
              <Button onClick={aditivoForm.handleSubmit(handleAditivoSave)}>Salvar Aditivo</Button>
            </SheetFooter>
          </Form>
        </SheetContent>
      </Sheet>
    </div>
  );
}