import type { Atestado, PlanilhaItem, ServicoExtraido } from "@/types";

export const CATEGORIAS_PADRAO = [
  "Serviços Preliminares",
  "Fundações",
  "Estrutura de Concreto",
  "Alvenaria",
  "Cobertura",
  "Revestimentos",
  "Instalações Hidráulicas",
  "Instalações Elétricas",
  "Pavimentação",
  "Paisagismo",
  "Outros",
];

export const UNIDADES = ["m","m²","m³","t","kg","vb","un","l","h","mês","km","txkm","m³xkm"];

export const mockPlanilhaItens: PlanilhaItem[] = [
  { id: "p1", codigo: "1.1", categoria: "Serviços Preliminares", descricao: "Limpeza e preparo do terreno", quantidade: 18400, unidade: "m²", atestadosCount: 2, createdAt: "2024-01-10", updatedAt: "2024-03-15" },
  { id: "p2", codigo: "1.2", categoria: "Serviços Preliminares", descricao: "Instalação e manutenção de canteiro de obras", quantidade: 3, unidade: "vb", atestadosCount: 3, createdAt: "2024-01-10", updatedAt: "2024-04-20" },
  { id: "p3", codigo: "6.1", categoria: "Instalações Hidráulicas", descricao: "Rede de abastecimento de água (adutora)", quantidade: 6900, unidade: "m", atestadosCount: 2, createdAt: "2024-01-15", updatedAt: "2024-03-20" },
  { id: "p4", codigo: "6.2", categoria: "Instalações Hidráulicas", descricao: "Rede coletora de esgoto", quantidade: 5100, unidade: "m", atestadosCount: 2, createdAt: "2024-01-15", updatedAt: "2024-03-20" },
  { id: "p5", codigo: "6.3", categoria: "Instalações Hidráulicas", descricao: "Estação elevatória de esgoto", quantidade: 2, unidade: "vb", atestadosCount: 1, createdAt: "2024-02-01", updatedAt: "2024-02-01" },
  { id: "p6", codigo: "8.1", categoria: "Pavimentação", descricao: "Sub-base de brita graduada compactada", quantidade: 12000, unidade: "m³", atestadosCount: 1, createdAt: "2024-02-10", updatedAt: "2024-02-10" },
  { id: "p7", codigo: "8.2", categoria: "Pavimentação", descricao: "Revestimento asfáltico CBUQ", quantidade: 3200, unidade: "t", atestadosCount: 1, createdAt: "2024-02-10", updatedAt: "2024-02-10" },
];

export const mockAtestados: Atestado[] = [
  {
    id: "a1", numero: "AT-2024-001", contratante: "SAAE Uberlândia",
    descricao: "Execução de redes de abastecimento de água e coleta de esgoto sanitário",
    valorContrato: 3200000, dataInicio: "2023-02-01", dataFim: "2024-01-31",
    dataEmissao: "2024-02-10", respTecnico: "Eng. Carlos Mendes", artNumero: "20230012345",
    status: "total", documentoUrl: "/docs/at-2024-001.pdf",
    aditivos: [{ id: "ad1", numero: 1, tipo: "prazo", dataAssinatura: "2023-09-15", novaDataFim: "2024-01-31", descricao: "Prorrogação de prazo em 3 meses devido a chuvas intensas", createdAt: "2023-09-15" }],
    servicos: [
      { id: "s1", descricaoOriginal: "Redes de abastecimento de água – adutora", quantidadeOriginal: "4.800 m", codigoSugerido: "6.1", categoriaSugerida: "Instalações Hidráulicas", descricaoSugerida: "Rede de abastecimento de água (adutora)", unidadeSugerida: "m", quantidadeSugerida: 4800, planilhaItemId: "p3", status: "confirmado" },
      { id: "s2", descricaoOriginal: "Rede coletora de esgoto sanitário", quantidadeOriginal: "3.200 m", codigoSugerido: "6.2", categoriaSugerida: "Instalações Hidráulicas", descricaoSugerida: "Rede coletora de esgoto", unidadeSugerida: "m", quantidadeSugerida: 3200, planilhaItemId: "p4", status: "confirmado" },
    ],
    createdAt: "2024-02-10", updatedAt: "2024-02-10",
  },
  { id: "a2", numero: "AT-2024-002", contratante: "Prefeitura de Belo Horizonte", descricao: "Construção de escola municipal com 12 salas de aula", valorContrato: 5850000, dataInicio: "2022-06-01", dataFim: "2023-11-30", dataEmissao: "2023-12-05", respTecnico: "Eng. Ana Lima", status: "total", aditivos: [], servicos: [], createdAt: "2023-12-05", updatedAt: "2023-12-05" },
  { id: "a3", numero: "AT-2023-008", contratante: "DNIT – MG", descricao: "Pavimentação e recuperação de rodovia estadual – 42 km", valorContrato: 12400000, dataInicio: "2021-03-15", dataFim: "2023-03-14", respTecnico: "Eng. Ricardo Souza", status: "total", aditivos: [], servicos: [], createdAt: "2023-04-01", updatedAt: "2023-04-01" },
  { id: "a4", numero: "AT-2024-003", contratante: "CEMIG Distribuição S.A.", descricao: "Obras civis para subestação elétrica de 138kV", valorContrato: 4750000, dataInicio: "2023-09-01", dataFim: "2024-08-31", respTecnico: "Eng. Patrícia Vieira", status: "parcial", aditivos: [], servicos: [], createdAt: "2024-01-10", updatedAt: "2024-01-10" },
  { id: "a5", numero: "AT-2024-004", contratante: "Vale S.A.", descricao: "Construção de galpão industrial e infraestrutura de pátio", valorContrato: 11500000, dataInicio: "2024-03-01", dataFim: "2025-02-28", respTecnico: "Eng. Marcos Ferreira", status: "total", aditivos: [], servicos: [], createdAt: "2024-03-05", updatedAt: "2024-03-05" },
];

export const mockServicosExtraidos: Omit<ServicoExtraido, "planilhaItemId" | "status">[] = [
  { id: "se1", descricaoOriginal: "Execução de redes de abastecimento de água – adutora principal", quantidadeOriginal: "4.800 m", codigoSugerido: "6.1", categoriaSugerida: "Instalações Hidráulicas", descricaoSugerida: "Rede de abastecimento de água (adutora)", unidadeSugerida: "m", quantidadeSugerida: 4800 },
  { id: "se2", descricaoOriginal: "Execução de rede coletora de esgoto sanitário", quantidadeOriginal: "3.200 m", codigoSugerido: "6.2", categoriaSugerida: "Instalações Hidráulicas", descricaoSugerida: "Rede coletora de esgoto", unidadeSugerida: "m", quantidadeSugerida: 3200 },
  { id: "se3", descricaoOriginal: "Instalação e manutenção de canteiro de obras", quantidadeOriginal: "1 vb", codigoSugerido: "1.2", categoriaSugerida: "Serviços Preliminares", descricaoSugerida: "Instalação e manutenção de canteiro de obras", unidadeSugerida: "vb", quantidadeSugerida: 1 },
  { id: "se4", descricaoOriginal: "Limpeza, destocamento e preparo da área", quantidadeOriginal: "18.400 m²", codigoSugerido: "1.1", categoriaSugerida: "Serviços Preliminares", descricaoSugerida: "Limpeza e preparo do terreno", unidadeSugerida: "m²", quantidadeSugerida: 18400 },
  { id: "se5", descricaoOriginal: "Execução de estação elevatória de esgoto", quantidadeOriginal: "1 vb", codigoSugerido: "6.3", categoriaSugerida: "Instalações Hidráulicas", descricaoSugerida: "Estação elevatória de esgoto", unidadeSugerida: "vb", quantidadeSugerida: 1 },
];
