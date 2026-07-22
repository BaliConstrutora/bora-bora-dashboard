import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const inputSchema = z.object({ pdfPath: z.string().min(1) });

const servicoSchema = z.object({
  codigo_sugerido: z.string().nullable().optional(),
  descricao_sugerida: z.string().nullable().optional(),
  unidade_sugerida: z.string().nullable().optional(),
  quantidade_sugerida: z.number().nullable().optional(),
  categoria_sugerida: z.string().nullable().optional(),
});

const extractedSchema = z.object({
  numero_cat: z.string().nullable().optional(),
  contratante: z.string().nullable().optional(),
  cnpj_contratante: z.string().nullable().optional(),
  tipo_contratante: z.enum(["publico", "privado"]).nullable().optional(),
  numero_contrato: z.string().nullable().optional(),
  numero_pregao: z.string().nullable().optional(),
  local_execucao: z.string().nullable().optional(),
  finalidade: z.enum(["infraestrutura","pavimentacao","edificacoes","saneamento","eletrica","outros"]).nullable().optional(),
  valor_contrato: z.string().nullable().optional(),
  data_inicio: z.string().nullable().optional(),
  data_fim: z.string().nullable().optional(),
  resp_tecnico: z.string().nullable().optional(),
  registro_crea_rt: z.string().nullable().optional(),
  art_numero: z.string().nullable().optional(),
  descricao: z.string().nullable().optional(),
  servicos: z.array(servicoSchema).nullable().optional(),
});

export type ExtractedAtestado = z.infer<typeof extractedSchema>;

export type ExtractResult =
  | { ok: true; data: ExtractedAtestado }
  | { ok: false; error: string };

const SYSTEM_PROMPT =
  `You are a specialist in Brazilian construction company documents (CAT - Certidão de Acervo Técnico from CREA-MG). Extract all data from the uploaded PDF and return ONLY a valid JSON object with no markdown, no explanation, just the raw JSON.

This PDF may contain services repeated per street, neighborhood, or location (e.g., Section 2.1 Rua X, Section 2.2 Rua Y with the same 4 services each).
When this pattern is detected:
1. DO NOT list each street separately as individual services.
2. SUM all quantities of the same service across all streets/locations.
3. Return ONE consolidated entry per unique service type.
4. The codigo_sugerido should be the base code without street suffix (e.g., '2.1' not '2.1.1').
5. The descricao_sugerida should be the service description without the street name.
6. The quantidade_sugerida should be the TOTAL sum across ALL streets.

Example: if 'Pintura de Ligação' appears in 17 streets with quantities 2032, 873, 1680... → return ONE entry with total quantity = sum of all.

Also identify section headers (lines with no quantity or quantity=0) and mark them with codigo ending in '.00' or descricao in ALL CAPS so they can be filtered as titles.`;

const USER_PROMPT = `Extract the CAT data and return ONLY this JSON shape (use null when unknown):
{
  "numero_cat": string|null,
  "contratante": string|null,
  "cnpj_contratante": "00.000.000/0000-00"|null,
  "tipo_contratante": "publico"|"privado"|null,
  "numero_contrato": string|null,
  "numero_pregao": string|null,
  "local_execucao": "Cidade/UF"|null,
  "finalidade": "infraestrutura"|"pavimentacao"|"edificacoes"|"saneamento"|"eletrica"|"outros"|null,
  "valor_contrato": "0,00"|null,
  "data_inicio": "YYYY-MM-DD"|null,
  "data_fim": "YYYY-MM-DD"|null,
  "resp_tecnico": string|null,
  "registro_crea_rt": string|null,
  "art_numero": string|null,
  "descricao": string|null,
  "servicos": [ { "codigo_sugerido": string|null, "descricao_sugerida": string|null, "unidade_sugerida": "m"|"m2"|"m3"|"t"|"kg"|"vb"|"un"|null, "quantidade_sugerida": number|null, "categoria_sugerida": "Serviços Preliminares"|"Fundações"|"Estrutura de Concreto"|"Alvenaria"|"Cobertura"|"Revestimentos"|"Instalações Hidráulicas"|"Instalações Elétricas"|"Pavimentação"|"Paisagismo"|"Outros" } ]
}`;

function bufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function stripFences(text: string): string {
  const t = text.trim();
  const m = t.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (m) return m[1].trim();
  const first = t.indexOf("{");
  const last = t.lastIndexOf("}");
  if (first >= 0 && last > first) return t.slice(first, last + 1);
  return t;
}

export const extractAtestadoFromPdf = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data, context }): Promise<ExtractResult> => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return { ok: false, error: "ANTHROPIC_API_KEY não configurada." };

    const dl = await context.supabase.storage.from("atestados-pdfs").download(data.pdfPath);
    if (dl.error || !dl.data) return { ok: false, error: `Falha ao ler PDF: ${dl.error?.message ?? "sem dados"}` };

    const arrayBuf = await dl.data.arrayBuffer();
    const base64 = bufferToBase64(arrayBuf);

    let resp: Response;
    try {
      resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-5",
          max_tokens: 4096,
          system: SYSTEM_PROMPT,
          messages: [
            {
              role: "user",
              content: [
                { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } },
                { type: "text", text: USER_PROMPT },
              ],
            },
          ],
        }),
      });
    } catch (e) {
      return { ok: false, error: `Erro de rede: ${(e as Error).message}` };
    }

    if (!resp.ok) {
      const body = await resp.text().catch(() => "");
      console.error("[anthropic] non-ok", resp.status, body.slice(0, 500));
      return { ok: false, error: `Anthropic ${resp.status}` };
    }

    const payload = (await resp.json()) as { content?: Array<{ type: string; text?: string }> };
    const text = (payload.content ?? []).filter((c) => c.type === "text").map((c) => c.text ?? "").join("").trim();
    if (!text) return { ok: false, error: "Resposta vazia da IA." };

    let parsed: unknown;
    try {
      parsed = JSON.parse(stripFences(text));
    } catch {
      return { ok: false, error: "JSON inválido retornado pela IA." };
    }
    const val = extractedSchema.safeParse(parsed);
    if (!val.success) return { ok: false, error: "Estrutura inesperada retornada pela IA." };
    return { ok: true, data: val.data };
  });