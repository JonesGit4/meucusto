// ═══════════════════════════════════════
// Meu Custo — Type Definitions v1.2
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

export const UNIDADES_COM_AREA: UnidadeMedida[] = ["m2", "cm2"];

export interface ValorHora {
  salario: number;
  custoCnpj: number;
  taxasFixas: number;
  horasMes: number;
}

// ═══════════════════════════════════════
// INSUMO (material apenas)
// ═══════════════════════════════════════

export interface Insumo {
  id: string;
  nome: string;
  quantidade: number;
  unidade: UnidadeMedida;
  custoUnitario: number;
  altura?: number;
  largura?: number;
  // Novo: pacote fechado
  usaPacote: boolean; // true = calcula custo unitário do pacote
  quantidadePacote: number; // ex: 50 (cm)
  valorPacote: number; // ex: 45 (reais)
  ordem: number;
}

// ═══════════════════════════════════════
// TEMPO DE TRABALHO (card separado)
// ═══════════════════════════════════════

export interface TempoTrabalho {
  minutos: number; // sempre em minutos (ex: 35, 190)
}

// ═══════════════════════════════════════
// EQUIPAMENTO ELÉTRICO (card separado)
// ═══════════════════════════════════════

export interface EquipamentoEletrico {
  id: string;
  nome: string; // ex: "Máquina de Corte a Laser"
  potenciaWatts: number; // ex: 500 (W)
  tempoUsoMinutos: number; // ex: 45 (min)
  custoKwh: number; // ex: 0.85 (R$/kWh) — pode ser automático ou manual
  cidade?: string; // para busca automática do custo de energia
}

// ═══════════════════════════════════════
// CENÁRIO
// ═══════════════════════════════════════

export interface Cenario {
  id: string;
  nome: string;
  precoVenda: number;
  insumosOverride: Insumo[];
}

// ═══════════════════════════════════════
// PRODUTO
// ═══════════════════════════════════════

export type IndicadorSugestao = "verde" | "amarelo" | "vermelho";

export interface Produto {
  id: string;
  nome: string;
  tipo: TipoProduto;
  precoVenda: number | null; // AGORA OPCIONAL — null = não definido
  precoSugerido?: number; // calculado quando precoVenda é null
  indicadorSugestao?: IndicadorSugestao; // verde/amarelo/vermelho
  categoria?: string;
  imagemUrl?: string;
  insumos: Insumo[];
  tempoTrabalho: TempoTrabalho; // card separado
  equipamentos: EquipamentoEletrico[]; // card separado
  cenarios: Cenario[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

// ═══════════════════════════════════════
// LOCAL DB
// ═══════════════════════════════════════

export interface LocalDB {
  versao: number;
  valorHora: ValorHora | null;
  produtos: Produto[];
}

// ═══════════════════════════════════════
// CLASSIFICAÇÃO
// ═══════════════════════════════════════

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

export const INDICADOR_LABELS: Record<IndicadorSugestao, string> = {
  verde: "Margem excelente",
  amarelo: "Margem razoável",
  vermelho: "Margem baixa — revisar",
};
