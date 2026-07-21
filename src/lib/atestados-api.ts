import { supabase } from "@/integrations/supabase/client";
import type { Atestado, Aditivo, ServicoExtraido, PlanilhaItem, AtestadoStatus, AditivoTipo, TipoContratante, FinalidadeAtestado } from "@/types";

type AtestadoRow = {
  id: string; numero: string; contratante: string; descricao: string;
  valor_contrato: number | string; data_inicio: string; data_fim: string;
  data_emissao: string | null; resp_tecnico: string; art_numero: string | null;
  status: AtestadoStatus; documento_url: string | null; observacoes: string | null;
  numero_cat: string | null; cnpj_contratante: string | null;
  tipo_contratante: TipoContratante | null; numero_contrato: string | null;
  numero_pregao: string | null; local_execucao: string | null;
  registro_crea_rt: string | null; finalidade: FinalidadeAtestado | null;
  created_at: string; updated_at: string;
};

type AditivoRow = {
  id: string; atestado_id: string; numero: number; tipo: AditivoTipo;
  data_assinatura: string; nova_data_fim: string | null;
  valor: number | string | null; valor_adicional: number | string | null;
  prazo: number | null; escopo: string | null; descricao: string;
  observacoes: string | null; created_at: string; updated_at: string;
};

type ServicoRow = {
  id: string; atestado_id: string; planilha_item_id: string | null;
  descricao_original: string; quantidade_original: string | null;
  codigo_sugerido: string | null; categoria_sugerida: string | null;
  descricao_sugerida: string | null; unidade_sugerida: string | null;
  quantidade_sugerida: number | string | null; valor_unitario: number | string | null;
  valor_total: number | string | null; status: "pendente" | "confirmado" | "rejeitado" | "ignorado";
  observacoes: string | null; created_at: string; updated_at: string;
};

type PlanilhaRow = {
  id: string; codigo: string; categoria: string; descricao: string; unidade: string;
  quantidade: number | string; valor_unitario: number | string | null;
  valor_total: number | string | null; observacoes: string | null;
  atestados_count: number | null;
  created_at: string; updated_at: string;
};

const num = (v: number | string | null | undefined) => (v == null ? 0 : typeof v === "string" ? Number(v) : v);

export type AtestadoDoPlanilhaItem = {
  id: string;
  numero: string;
  contratante: string;
  quantidade: number;
  unidade: string;
};

export async function getAtestadosByPlanilhaItem(planilhaItemId: string): Promise<AtestadoDoPlanilhaItem[]> {
  const { data, error } = await supabase
    .from("servicos_extraidos")
    .select("quantidade_sugerida, unidade_sugerida, atestados!inner(id, numero, contratante, created_at)")
    .eq("planilha_item_id", planilhaItemId)
    .eq("status", "confirmado");
  if (error) throw error;
  type Row = { quantidade_sugerida: number | string | null; unidade_sugerida: string | null; atestados: { id: string; numero: string; contratante: string; created_at: string } };
  const rows = (data ?? []) as unknown as Row[];
  return rows
    .slice()
    .sort((a, b) => a.atestados.created_at.localeCompare(b.atestados.created_at))
    .map((r) => ({
      id: r.atestados.id,
      numero: r.atestados.numero,
      contratante: r.atestados.contratante,
      quantidade: num(r.quantidade_sugerida),
      unidade: r.unidade_sugerida ?? "",
    }));
}

function mapAditivo(r: AditivoRow): Aditivo {
  return {
    id: r.id, numero: r.numero, tipo: r.tipo, dataAssinatura: r.data_assinatura,
    novaDataFim: r.nova_data_fim ?? undefined, valor: r.valor != null ? num(r.valor) : undefined,
    valorAdicional: r.valor_adicional != null ? num(r.valor_adicional) : undefined,
    prazo: r.prazo ?? undefined, escopo: r.escopo ?? undefined,
    descricao: r.descricao, observacoes: r.observacoes ?? undefined,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

function mapServico(r: ServicoRow): ServicoExtraido {
  return {
    id: r.id, descricaoOriginal: r.descricao_original,
    quantidadeOriginal: r.quantidade_original ?? "",
    codigoSugerido: r.codigo_sugerido ?? undefined,
    categoriaSugerida: r.categoria_sugerida ?? undefined,
    descricaoSugerida: r.descricao_sugerida ?? undefined,
    unidadeSugerida: r.unidade_sugerida ?? undefined,
    quantidadeSugerida: r.quantidade_sugerida != null ? num(r.quantidade_sugerida) : undefined,
    valorUnitario: r.valor_unitario != null ? num(r.valor_unitario) : undefined,
    valorTotal: r.valor_total != null ? num(r.valor_total) : undefined,
    planilhaItemId: r.planilha_item_id ?? undefined,
    status: r.status, observacoes: r.observacoes ?? undefined,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

function mapAtestado(r: AtestadoRow, aditivos: Aditivo[] = [], servicos: ServicoExtraido[] = []): Atestado {
  return {
    id: r.id, numero: r.numero, contratante: r.contratante, descricao: r.descricao,
    valorContrato: num(r.valor_contrato), dataInicio: r.data_inicio, dataFim: r.data_fim,
    dataEmissao: r.data_emissao ?? undefined, respTecnico: r.resp_tecnico,
    artNumero: r.art_numero ?? undefined, status: r.status,
    documentoUrl: r.documento_url ?? undefined, observacoes: r.observacoes ?? undefined,
    numeroCat: r.numero_cat ?? undefined,
    cnpjContratante: r.cnpj_contratante ?? undefined,
    tipoContratante: r.tipo_contratante ?? undefined,
    numeroContrato: r.numero_contrato ?? undefined,
    numeroPregao: r.numero_pregao ?? undefined,
    localExecucao: r.local_execucao ?? undefined,
    registroCreaRt: r.registro_crea_rt ?? undefined,
    finalidade: r.finalidade ?? undefined,
    aditivos, servicos,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

export function mapPlanilhaItem(r: PlanilhaRow): PlanilhaItem {
  return {
    id: r.id, codigo: r.codigo, categoria: r.categoria, descricao: r.descricao,
    unidade: r.unidade, quantidade: num(r.quantidade),
    valorUnitario: r.valor_unitario != null ? num(r.valor_unitario) : undefined,
    valorTotal: r.valor_total != null ? num(r.valor_total) : undefined,
    atestadosCount: r.atestados_count ?? 0,
    observacoes: r.observacoes ?? undefined,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

export async function listAtestados(): Promise<Atestado[]> {
  const { data, error } = await supabase
    .from("atestados")
    .select("*, aditivos(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as unknown as (AtestadoRow & { aditivos: AditivoRow[] })[]).map((r) =>
    mapAtestado(r, (r.aditivos ?? []).map(mapAditivo)),
  );
}

export async function getAtestadoById(id: string): Promise<Atestado | null> {
  const { data, error } = await supabase
    .from("atestados")
    .select("*, aditivos(*), servicos_extraidos(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const row = data as unknown as AtestadoRow & { aditivos: AditivoRow[]; servicos_extraidos: ServicoRow[] };
  const aditivos = (row.aditivos ?? []).map(mapAditivo).sort((a, b) => a.numero - b.numero);
  const servicos = (row.servicos_extraidos ?? []).map(mapServico);
  return mapAtestado(row, aditivos, servicos);
}

export async function deleteAtestado(id: string) {
  const { error } = await supabase.from("atestados").delete().eq("id", id);
  if (error) throw error;
}

export interface UpdateAtestadoPatch {
  numeroCat?: string;
  contratante?: string;
  cnpjContratante?: string;
  tipoContratante?: TipoContratante;
  numeroContrato?: string;
  numeroPregao?: string;
  localExecucao?: string;
  finalidade?: FinalidadeAtestado;
  valorContrato?: number;
  dataInicio?: string;
  dataFim?: string;
  dataEmissao?: string;
  respTecnico?: string;
  registroCreaRt?: string;
  artNumero?: string;
  status?: AtestadoStatus;
  descricao?: string;
  observacoes?: string;
}

export async function updateAtestado(id: string, patch: UpdateAtestadoPatch): Promise<void> {
  const row: Record<string, unknown> = {};
  if (patch.numeroCat !== undefined) {
    row.numero_cat = patch.numeroCat || null;
    row.numero = patch.numeroCat;
  }
  if (patch.contratante !== undefined) row.contratante = patch.contratante;
  if (patch.cnpjContratante !== undefined) row.cnpj_contratante = patch.cnpjContratante || null;
  if (patch.tipoContratante !== undefined) row.tipo_contratante = patch.tipoContratante;
  if (patch.numeroContrato !== undefined) row.numero_contrato = patch.numeroContrato || null;
  if (patch.numeroPregao !== undefined) row.numero_pregao = patch.numeroPregao || null;
  if (patch.localExecucao !== undefined) row.local_execucao = patch.localExecucao || null;
  if (patch.finalidade !== undefined) row.finalidade = patch.finalidade;
  if (patch.valorContrato !== undefined) row.valor_contrato = patch.valorContrato;
  if (patch.dataInicio !== undefined) row.data_inicio = patch.dataInicio;
  if (patch.dataFim !== undefined) row.data_fim = patch.dataFim;
  if (patch.dataEmissao !== undefined) row.data_emissao = patch.dataEmissao || null;
  if (patch.respTecnico !== undefined) row.resp_tecnico = patch.respTecnico;
  if (patch.registroCreaRt !== undefined) row.registro_crea_rt = patch.registroCreaRt || null;
  if (patch.artNumero !== undefined) row.art_numero = patch.artNumero || null;
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.descricao !== undefined) row.descricao = patch.descricao;
  if (patch.observacoes !== undefined) row.observacoes = patch.observacoes || null;
  const { error } = await supabase.from("atestados").update(row).eq("id", id);
  if (error) throw error;
}

export interface UpdateServicoPatch {
  codigoSugerido?: string;
  descricaoSugerida?: string;
  quantidadeSugerida?: number;
  unidadeSugerida?: string;
  categoriaSugerida?: string;
}

export async function updateServico(id: string, patch: UpdateServicoPatch): Promise<void> {
  const row: Record<string, unknown> = {};
  if (patch.codigoSugerido !== undefined) row.codigo_sugerido = patch.codigoSugerido || null;
  if (patch.descricaoSugerida !== undefined) row.descricao_sugerida = patch.descricaoSugerida || null;
  if (patch.quantidadeSugerida !== undefined) row.quantidade_sugerida = patch.quantidadeSugerida;
  if (patch.unidadeSugerida !== undefined) row.unidade_sugerida = patch.unidadeSugerida || null;
  if (patch.categoriaSugerida !== undefined) row.categoria_sugerida = patch.categoriaSugerida || null;
  const { error } = await supabase.from("servicos_extraidos").update(row).eq("id", id);
  if (error) throw error;
}

export interface NewAtestadoPayload {
  atestado: {
    user_id: string; numero: string; contratante: string; descricao: string;
    valor_contrato: number; data_inicio: string; data_fim: string;
    data_emissao: string | null; resp_tecnico: string; art_numero: string | null;
    status: AtestadoStatus; documento_url: string | null; observacoes: string | null;
    numero_cat: string | null; cnpj_contratante: string | null;
    tipo_contratante: TipoContratante | null; numero_contrato: string | null;
    numero_pregao: string | null; local_execucao: string | null;
    registro_crea_rt: string | null; finalidade: FinalidadeAtestado | null;
  };
  aditivos: Array<{
    user_id: string; numero: number; tipo: AditivoTipo;
    data_assinatura: string; nova_data_fim: string | null;
    valor: number | null; valor_adicional: number | null;
    prazo: number | null; escopo: string | null; descricao: string;
    observacoes: string | null;
  }>;
  servicos: Array<{
    user_id: string; planilha_item_id: string | null;
    descricao_original: string; quantidade_original: string | null;
    codigo_sugerido: string | null; categoria_sugerida: string | null;
    descricao_sugerida: string | null; unidade_sugerida: string | null;
    quantidade_sugerida: number | null; valor_unitario: number | null;
    valor_total: number | null; status: "pendente" | "confirmado" | "rejeitado" | "ignorado";
    observacoes: string | null;
  }>;
}

export async function createAtestadoFull(payload: NewAtestadoPayload): Promise<string> {
  const { data: at, error } = await supabase
    .from("atestados").insert(payload.atestado).select("id").single();
  if (error) throw error;
  const atestadoId = (at as { id: string }).id;
  if (payload.aditivos.length) {
    const { error: e2 } = await supabase.from("aditivos").insert(
      payload.aditivos.map((a) => ({ ...a, atestado_id: atestadoId })),
    );
    if (e2) throw e2;
  }
  if (payload.servicos.length) {
    const { error: e3 } = await supabase.from("servicos_extraidos").insert(
      payload.servicos.map((s) => ({ ...s, atestado_id: atestadoId })),
    );
    if (e3) throw e3;
  }
  return atestadoId;
}

export async function listPlanilhaItems(): Promise<PlanilhaItem[]> {
  const { data, error } = await supabase
    .from("planilha_items").select("*").order("categoria").order("codigo");
  if (error) throw error;
  return (data as unknown as PlanilhaRow[]).map(mapPlanilhaItem);
}

export async function savePlanilhaItem(userId: string, item: Partial<PlanilhaItem> & { id?: string }): Promise<PlanilhaItem> {
  const row = {
    user_id: userId,
    codigo: item.codigo!, categoria: item.categoria!, descricao: item.descricao!,
    unidade: item.unidade!, quantidade: item.quantidade ?? 0,
    valor_unitario: item.valorUnitario ?? null,
    valor_total: item.valorTotal ?? null,
    observacoes: item.observacoes ?? null,
  };
  if (item.id) {
    const { data, error } = await supabase.from("planilha_items").update(row).eq("id", item.id).select("*").single();
    if (error) throw error;
    return mapPlanilhaItem(data as unknown as PlanilhaRow);
  }
  const { data, error } = await supabase.from("planilha_items").insert(row).select("*").single();
  if (error) throw error;
  return mapPlanilhaItem(data as unknown as PlanilhaRow);
}

export interface UpsertServicoInput {
  codigo?: string;
  categoria?: string;
  descricao?: string;
  unidade?: string;
  quantidade?: number;
}

export async function upsertPlanilhaItem(userId: string, servico: UpsertServicoInput): Promise<string> {
  const codigo = servico.codigo?.trim();
  const descricao = servico.descricao?.trim();
  const unidade = servico.unidade?.trim();
  const categoria = servico.categoria?.trim();
  const quantidade = servico.quantidade;
  if (!codigo || !descricao || !unidade || !categoria || quantidade == null || !Number.isFinite(quantidade)) {
    throw new Error("Preencha código, descrição, unidade, categoria e quantidade antes de criar na Planilha.");
  }
  const { data: existing, error: findErr } = await supabase
    .from("planilha_items")
    .select("id, quantidade, atestados_count")
    .eq("user_id", userId)
    .eq("codigo", codigo)
    .maybeSingle();
  if (findErr) throw findErr;
  if (existing) {
    const row = existing as unknown as { id: string; quantidade: number | string; atestados_count: number | null };
    const novaQtd = num(row.quantidade) + quantidade;
    const novoCount = (row.atestados_count ?? 0) + 1;
    const { error: updErr } = await supabase
      .from("planilha_items")
      .update({ quantidade: novaQtd, atestados_count: novoCount })
      .eq("id", row.id);
    if (updErr) throw updErr;
    return row.id;
  }
  const { data: inserted, error: insErr } = await supabase
    .from("planilha_items")
    .insert({
      user_id: userId,
      codigo, categoria, descricao, unidade,
      quantidade,
      atestados_count: 1,
    })
    .select("id")
    .single();
  if (insErr) throw insErr;
  return (inserted as { id: string }).id;
}

export async function deletePlanilhaItem(id: string) {
  const { error } = await supabase.from("planilha_items").delete().eq("id", id);
  if (error) throw error;
}

export async function listCategoriasPersonalizadas(): Promise<string[]> {
  const { data, error } = await supabase
    .from("categorias_personalizadas").select("nome").order("nome");
  if (error) throw error;
  return (data as { nome: string }[]).map((c) => c.nome);
}

export async function createCategoriaPersonalizada(userId: string, nome: string) {
  const { error } = await supabase
    .from("categorias_personalizadas")
    .insert({ user_id: userId, nome })
    .select("id");
  if (error && !`${error.message}`.includes("duplicate")) throw error;
}

export async function getCurrentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Não autenticado");
  return data.user.id;
}

const BUCKET = "atestados-pdfs";

export async function uploadAtestadoPdf(userId: string, file: File): Promise<string> {
  if (file.type !== "application/pdf") throw new Error("Apenas arquivos PDF são aceitos.");
  if (file.size > 20 * 1024 * 1024) throw new Error("O PDF deve ter no máximo 20 MB.");
  const path = `${userId}/${crypto.randomUUID()}.pdf`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: "application/pdf",
    upsert: false,
  });
  if (error) throw error;
  return path;
}

export async function getAtestadoPdfSignedUrl(path: string, expiresInSeconds = 60 * 10): Promise<string> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, expiresInSeconds);
  if (error) throw error;
  return data.signedUrl;
}

export async function deleteAtestadoPdf(path: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw error;
}