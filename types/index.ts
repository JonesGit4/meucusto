// ═══════════════════════════════════════
// Meu Custo — Type Definitions v1.7
// ═══════════════════════════════════════

export type TipoProduto = "fisico" | "servico";

export type UnidadeMedida =
  | "m2" | "metros" | "cm2" | "centimetros" | "kg" | "g" | "unidade";

export const UNIDADES_MEDIDA: Record<UnidadeMedida, string> = {
  m2: "m²",
  metros: "metros",
  cm2: "cm²",
  centimetros: "centímetros",
  kg: "kg",
  g: "gramas (g)",
  unidade: "unidade",
};

export const UNIDADES_COM_AREA: UnidadeMedida[] = ["m2", "cm2"];
export const UNIDADES_LINEARES: UnidadeMedida[] = ["metros", "centimetros"];

export interface ValorHora {
  salario: number;
  custoCnpj: number;
  taxasFixas: number;
  horasMes: number;
}

// ═══════════════════════════════════════
// INSUMO — novo modelo
// ═══════════════════════════════════════

export interface Insumo {
  id: string;
  nome: string;
  unidade: UnidadeMedida;
  ordem: number;

  // 💰 Card "Valor da compra"
  valorPago: number;        // quanto pagou na peça/material inteiro

  // Dimensões do que COMPROU
  alturaCompra?: number;    // ex: 100 (cm) — altura da chapa comprada
  larguraCompra?: number;   // ex: 50 (cm) — largura da chapa comprada
  comprimentoCompra?: number; // para linear (cm ou m)
  quantidadeCompra?: number;  // para kg, g, un

  // Dimensões do que USOU no produto
  alturaUso?: number;
  larguraUso?: number;
  comprimentoUso?: number;
  quantidadeUso?: number;
}

export interface TempoTrabalho {
  minutos: number;
}

export interface EquipamentoEletrico {
  id: string;
  nome: string;
  potenciaWatts: number;
  tempoUsoMinutos: number;
  custoKwh: number;
  cidade?: string;
}

export interface Cenario {
  id: string;
  nome: string;
  precoVenda: number;
  insumosOverride: Insumo[];
}

export type IndicadorSugestao = "verde" | "amarelo" | "vermelho";

export interface Produto {
  id: string;
  nome: string;
  tipo: TipoProduto;
  precoVenda: number | null;
  precoSugerido?: number;
  indicadorSugestao?: IndicadorSugestao;
  categoria?: string;
  imagemUrl?: string;
  insumos: Insumo[];
  tempoTrabalho: TempoTrabalho;
  equipamentos: EquipamentoEletrico[];
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
  foco: "🟢", reprecificar: "🟡", revisar: "🟠", evitar: "🔴",
};

export const INDICADOR_LABELS: Record<IndicadorSugestao, string> = {
  verde: "Margem excelente", amarelo: "Margem razoável", vermelho: "Margem baixa — revisar",
};
