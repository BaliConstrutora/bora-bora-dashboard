export type AtestadoStatus = "total" | "parcial";

export type AditivoTipo = "prazo" | "valor" | "escopo" | "misto";

export type TipoContratante = "publico" | "privado";

export type FinalidadeAtestado =
  | "infraestrutura"
  | "pavimentacao"
  | "edificacoes"
  | "saneamento"
  | "eletrica"
  | "outros";

export type LicitacaoModalidade =
  | "pregao_eletronico"
  | "pregao_presencial"
  | "concorrencia"
  | "tomada_de_precos"
  | "convite"
  | "rdc";

export type LicitacaoStatus =
  | "em_analise"
  | "habilitada"
  | "participando"
  | "ganha"
  | "perdida"
  | "cancelada";

export type ConcorrenciaStatus =
  | "em_analise"
  | "habilitada"
  | "participando"
  | "ganha"
  | "perdida"
  | "cancelada";

export interface PlanilhaItem {
  id: string;
  codigo: string;
  categoria: string;
  descricao: string;
  unidade: string;
  quantidade: number;
  valorUnitario?: number;
  valorTotal?: number;
  atestadosCount?: number;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServicoExtraido {
  id: string;
  descricaoOriginal: string;
  quantidadeOriginal: string;
  codigoSugerido?: string;
  categoriaSugerida?: string;
  descricaoSugerida?: string;
  unidadeSugerida?: string;
  quantidadeSugerida?: number;
  valorUnitario?: number;
  valorTotal?: number;
  planilhaItemId?: string;
  status?: "pendente" | "confirmado" | "rejeitado" | "ignorado";
  observacoes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Aditivo {
  id: string;
  numero: number;
  tipo: AditivoTipo;
  dataAssinatura: string;
  novaDataFim?: string;
  valor?: number;
  valorAdicional?: number;
  prazo?: number;
  escopo?: string;
  descricao: string;
  observacoes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Atestado {
  id: string;
  numero: string;
  contratante: string;
  descricao: string;
  valorContrato: number;
  dataInicio: string;
  dataFim: string;
  dataEmissao?: string;
  respTecnico: string;
  artNumero?: string;
  status: AtestadoStatus;
  documentoUrl?: string;
  aditivos: Aditivo[];
  servicos: ServicoExtraido[];
  observacoes?: string;
  numeroCat?: string;
  cnpjContratante?: string;
  tipoContratante?: TipoContratante;
  numeroContrato?: string;
  numeroPregao?: string;
  localExecucao?: string;
  registroCreaRt?: string;
  finalidade?: FinalidadeAtestado;
  ordem?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Licitacao {
  id: string;
  numero: string;
  contratante: string;
  objeto: string;
  modalidade: LicitacaoModalidade;
  dataRecebimento: string;
  dataEntrega: string;
  valorEstimado: number;
  valorProposto?: number;
  status: LicitacaoStatus;
  resultado?: string;
  responsavel: string;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Concorrencia {
  id: string;
  numero: string;
  contratante: string;
  objeto: string;
  dataRecebimento: string;
  dataEntrega: string;
  valorEstimado: number;
  valorProposto?: number;
  status: ConcorrenciaStatus;
  resultado?: string;
  responsavel: string;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}
