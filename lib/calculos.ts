// ═══════════════════════════════════════
// Meu Custo — Cálculos v1.2 (Decimal.js)
// ═══════════════════════════════════════

import Decimal from "decimal.js";
import type {
  Insumo,
  ValorHora,
  EquipamentoEletrico,
  TempoTrabalho,
  IndicadorSugestao,
  Classificacao,
} from "@/types";
import { UNIDADES_COM_AREA } from "@/types";

Decimal.set({ precision: 10, rounding: Decimal.ROUND_HALF_UP });

// ═══════════════════════════════════════
// VALOR HORA
// ═══════════════════════════════════════

export function calcularValorHora(vh: ValorHora): Decimal {
  if (vh.horasMes <= 0) return new Decimal(0);
  return new Decimal(vh.salario)
    .plus(vh.custoCnpj)
    .plus(vh.taxasFixas)
    .div(vh.horasMes);
}

export function valorHoraPorMinuto(vh: ValorHora): Decimal {
  return calcularValorHora(vh).div(60);
}

// ═══════════════════════════════════════
// CUSTO INSUMO (material) — com pacote fechado
// ═══════════════════════════════════════

export function custoInsumo(insumo: Insumo): Decimal {
  let custoUnitario = new Decimal(insumo.custoUnitario);

  if (insumo.usaPacote && insumo.quantidadePacote > 0) {
    custoUnitario = new Decimal(insumo.valorPacote).div(insumo.quantidadePacote);
  }

  // Cálculo por área (m², cm²): custoUnitario é o custo TOTAL da peça
  if (UNIDADES_COM_AREA.includes(insumo.unidade) && insumo.altura && insumo.largura && insumo.altura > 0 && insumo.largura > 0) {
    // A área é altura × largura
    const area = new Decimal(insumo.altura).times(insumo.largura);
    // Se o usuário informou custo total da peça (ex: 50×35cm por R$35),
    // o custo já é o total. Se for pacote, já dividiu.
    // Se NÃO for pacote, o custoUnitario é o custo total da peça inteira
    if (!insumo.usaPacote && insumo.custoUnitario > 0) {
      return new Decimal(insumo.custoUnitario);
    }
    // Se for pacote, o custoUnitario já está por unidade de área
    return area.times(custoUnitario);
  }

  return new Decimal(insumo.quantidade).times(custoUnitario);
}

// ═══════════════════════════════════════
// CUSTO MÃO DE OBRA (tempo)
// ═══════════════════════════════════════

export function custoMaoDeObra(tempo: TempoTrabalho, valorHora?: ValorHora | null): Decimal {
  if (!valorHora || tempo.minutos <= 0) return new Decimal(0);
  return valorHoraPorMinuto(valorHora).times(tempo.minutos);
}

// ═══════════════════════════════════════
// CUSTO EQUIPAMENTO ELÉTRICO
// ═══════════════════════════════════════

/** Custo de operação de um equipamento elétrico */
export function custoEquipamento(eq: EquipamentoEletrico): Decimal {
  if (eq.potenciaWatts <= 0 || eq.tempoUsoMinutos <= 0) return new Decimal(0);
  // Fórmula: (potenciaWatts / 1000) × (tempoMinutos / 60) × custoKwh
  const kw = new Decimal(eq.potenciaWatts).div(1000);
  const horas = new Decimal(eq.tempoUsoMinutos).div(60);
  return kw.times(horas).times(eq.custoKwh);
}

/** Custo total de todos os equipamentos */
export function custoTotalEquipamentos(equipamentos: EquipamentoEletrico[]): Decimal {
  return equipamentos.reduce((acc, eq) => acc.plus(custoEquipamento(eq)), new Decimal(0));
}

// ═══════════════════════════════════════
// CUSTO TOTAL
// ═══════════════════════════════════════

export function custoTotalDireto(
  insumos: Insumo[],
  valorHora?: ValorHora | null,
  tempo?: TempoTrabalho,
  equipamentos?: EquipamentoEletrico[]
): Decimal {
  let total = insumos.reduce((acc, i) => acc.plus(custoInsumo(i)), new Decimal(0));

  if (tempo && valorHora) {
    total = total.plus(custoMaoDeObra(tempo, valorHora));
  }

  if (equipamentos && equipamentos.length > 0) {
    total = total.plus(custoTotalEquipamentos(equipamentos));
  }

  return total;
}

// ═══════════════════════════════════════
// MARGENS
// ═══════════════════════════════════════

export function margemBruta(
  precoVenda: number,
  custoTotal: Decimal
): Decimal {
  const preco = new Decimal(precoVenda);
  if (preco.isZero()) return new Decimal(0);
  return preco.minus(custoTotal).div(preco).times(100);
}

export function margemLiquida(
  precoVenda: number,
  custoTotal: Decimal,
  rateioPorProduto?: number
): { margem: Decimal; temRateio: boolean } {
  const preco = new Decimal(precoVenda);
  const custo = rateioPorProduto ? custoTotal.plus(rateioPorProduto) : custoTotal;
  if (preco.isZero()) return { margem: new Decimal(0), temRateio: false };
  return {
    margem: preco.minus(custo).div(preco).times(100),
    temRateio: !!rateioPorProduto,
  };
}

// ═══════════════════════════════════════
// PREÇO SUGERIDO (quando usuário não define)
// ═══════════════════════════════════════

const MARKUP_PADRAO = 1.5; // 50% de margem sugerida

export function calcularPrecoSugerido(custoTotal: Decimal): number {
  return custoTotal.times(MARKUP_PADRAO).toDecimalPlaces(2).toNumber();
}

export function indicadorSugestao(custoTotal: Decimal, precoSugerido: number): IndicadorSugestao {
  if (custoTotal.isZero()) return "vermelho";
  const margem = new Decimal(precoSugerido).minus(custoTotal).div(precoSugerido).times(100);
  const m = margem.toNumber();
  if (m >= 40) return "verde";
  if (m >= 20) return "amarelo";
  return "vermelho";
}

// ═══════════════════════════════════════
// CLASSIFICAÇÃO
// ═══════════════════════════════════════

export function classificarProduto(
  margemLiquidaValor: Decimal,
  tempoTotalMinutos: number
): Classificacao {
  const margem = margemLiquidaValor.toNumber();
  const horas = tempoTotalMinutos / 60;

  if (margem >= 40 && horas < 2) return "foco";
  if (margem < 20 && horas < 2) return "reprecificar";
  if (margem >= 40 && horas >= 2) return "revisar";
  return "evitar";
}

// ═══════════════════════════════════════
// TEMPO TOTAL (minutos)
// ═══════════════════════════════════════

export function tempoTotalMinutos(
  tempo: TempoTrabalho,
  equipamentos: EquipamentoEletrico[]
): number {
  let total = tempo.minutos;
  for (const eq of equipamentos) {
    total += eq.tempoUsoMinutos;
  }
  return total;
}

// ═══════════════════════════════════════
// LUCRO
// ═══════════════════════════════════════

export function lucroBruto(precoVenda: number, custoTotal: Decimal): Decimal {
  return new Decimal(precoVenda).minus(custoTotal);
}
