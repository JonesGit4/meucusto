// ═══════════════════════════════════════
// Meu Custo — Type Definitions
// ═══════════════════════════════════════

export type TipoProduto = "fisico" | "servico";

export type UnidadeMedida =
  | "m2"
  | "m_linear"
  | "cm2"
  | "cm_linear"
  | "kg"
  | "g"
  | "unidade";

export const UNIDADES_MEDIDA: Record<UnidadeMedida, string> = {
  m2: "m²",
  m_linear: "m linear",
  cm2: "cm²",
  cm_linear: "cm linear",
  kg: "kg",
  g: "g",
  unidade: "unidade",
};

export const UNIDADES_COM_AREA: UnidadeMedida[] = [
  "m2",
  "cm2",
];

export interface ValorHora {
  salario: number;
  custoCnpj: number;
  taxasFixas: number;
  horasMes: number;
}

export interface Insumo {
  id: string;
  nome: string;
  quantidade: number;
  unidade: UnidadeMedida;
  custoUnitario: number;
  altura?: number;
  largura?: number;
  tempoHoras: number; // decimal (ex: 1.5 = 1h30min)
  ordem: number;
}

export interface Cenario {
  id: string;
  nome: string;
  precoVenda: number;
  insumosOverride: Insumo[];
}

export interface Produto {
  id: string;
  nome: string;
  tipo: TipoProduto;
  precoVenda: number;
  categoria?: string;
  imagemUrl?: string;
  insumos: Insumo[];
  cenarios: Cenario[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface LocalDB {
  versao: number;
  valorHora: ValorHora | null;
  produtos: Produto[];
}

export type Classificacao = "foco" | "reprecificar" | "revisar" | "evitar";

export const CLASSIFICACAO_LABELS: Record<Classificacao, string> = {
  foco: "FOCO — Priorizar venda",
  reprecificar: "REPRECIFICAR — Subir preço",
  revisar: "REVISAR — Otimizar processo",
  evitar: "EVITAR — Descontinuar",
};

export const CLASSIFICACAO_EMOJI: Record<Classificacao, string> = {
  foco: "🟢",
  reprecificar: "🟡",
  revisar: "🟠",
  evitar: "🔴",
};
