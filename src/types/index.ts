export type AtestadoStatus = "ativo" | "vencido" | "em_analise";

export type AditivoTipo = "prazo" | "valor" | "escopo" | "misto";

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
  descricao: string;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServicoExtraido {
  id: string;
  descricao: string;
  unidade: string;
  quantidade: number;
  valorUnitario?: number;
  valorTotal?: number;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Aditivo {
  id: string;
  numero: string;
  contratoId: string;
  tipo: AditivoTipo;
  dataAssinatura: string;
  valor?: number;
  prazo?: number;
  escopo?: string;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Atestado {
  id: string;
  numero: string;
  contratoId: string;
  periodoInicio: string;
  periodoFim: string;
  status: AtestadoStatus;
  responsavel: string;
  observacoes?: string;
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
