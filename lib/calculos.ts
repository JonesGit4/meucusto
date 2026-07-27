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
import { UNIDADES_COM_AREA, UNIDADES_LINEARES, FATORES_CONVERSAO } from "@/types";

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
// CUSTO INSUMO — modelo "valor da compra"
// ═══════════════════════════════════════

/**
 * Calcula o custo proporcional do insumo usado no produto.
 * Suporta unidades de compra e uso diferentes (ex: comprou metros, usa centímetros).
 */
export function custoInsumo(insumo: Insumo): Decimal {
  const vp = new Decimal(insumo.valorPago);
  if (vp.isZero()) return new Decimal(0);

  const unidadeCompra = insumo.unidade;
  const unidadeUso = insumo.unidadeUso || insumo.unidade;

  // Fator de conversão se unidades forem diferentes
  let fatorConversao = 1;
  if (unidadeUso !== unidadeCompra) {
    const mapa = FATORES_CONVERSAO[unidadeUso];
    fatorConversao = mapa?.[unidadeCompra] || 1;
  }

  const fc = new Decimal(fatorConversao);

  // Área
  if (
    UNIDADES_COM_AREA.includes(unidadeCompra) &&
    insumo.alturaCompra && insumo.larguraCompra &&
    insumo.alturaUso && insumo.larguraUso &&
    insumo.alturaCompra > 0 && insumo.larguraCompra > 0
  ) {
    const areaCompra = new Decimal(insumo.alturaCompra).times(insumo.larguraCompra);
    const areaUso = new Decimal(insumo.alturaUso).times(insumo.larguraUso);
    if (areaCompra.isZero()) return new Decimal(0);
    return areaUso.div(areaCompra.times(fc)).times(vp);
  }

  // Linear
  if (
    UNIDADES_LINEARES.includes(unidadeCompra) &&
    insumo.comprimentoCompra && insumo.comprimentoUso &&
    insumo.comprimentoCompra > 0
  ) {
    const compUso = new Decimal(insumo.comprimentoUso);
    const compCompra = new Decimal(insumo.comprimentoCompra).times(fc);
    if (compCompra.isZero()) return new Decimal(0);
    return compUso.div(compCompra).times(vp);
  }

  // Peso / unidade
  if (insumo.quantidadeCompra && insumo.quantidadeUso && insumo.quantidadeCompra > 0) {
    return new Decimal(insumo.quantidadeUso).div(new Decimal(insumo.quantidadeCompra).times(fc)).times(vp);
  }

  return vp;
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

const MARKUP_PADRAO = 1.0; // Sem markup — mostrar custo real

export function calcularPrecoSugerido(custoTotal: Decimal): number {
  return custoTotal.toDecimalPlaces(2).toNumber();
}

export function indicadorSugestao(custoTotal: Decimal, precoVenda: number): IndicadorSugestao {
  if (custoTotal.isZero() || precoVenda <= 0) return "amarelo";
  const margem = new Decimal(precoVenda).minus(custoTotal).div(precoVenda).times(100);
  if (margem.gte(35)) return "verde";
  return "amarelo";
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
): number {
  return tempo.minutos;
}

// ═══════════════════════════════════════
// LUCRO
// ═══════════════════════════════════════

export function lucroBruto(precoVenda: number, custoTotal: Decimal): Decimal {
  return new Decimal(precoVenda).minus(custoTotal);
}
