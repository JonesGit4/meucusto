// ═══════════════════════════════════════
// Meu Custo — Cálculos Financeiros (Decimal.js)
// ═══════════════════════════════════════

import Decimal from "decimal.js";
import type { Insumo, ValorHora, Classificacao } from "@/types";
import { UNIDADES_COM_AREA } from "@/types";

// Configuração global de precisão
Decimal.set({ precision: 10, rounding: Decimal.ROUND_HALF_UP });

/** Custo de um insumo individual */
export function custoInsumo(insumo: Insumo, valorHora?: ValorHora | null): Decimal {
  let custo = new Decimal(0);

  // Custo material
  if (UNIDADES_COM_AREA.includes(insumo.unidade) && insumo.altura && insumo.largura) {
    // Cálculo por área: altura × largura × custo_unitario
    const area = new Decimal(insumo.altura).times(insumo.largura);
    custo = custo.plus(area.times(insumo.custoUnitario));
  } else {
    // Cálculo por quantidade
    custo = custo.plus(new Decimal(insumo.quantidade).times(insumo.custoUnitario));
  }

  // Custo mão de obra
  if (insumo.tempoHoras > 0 && valorHora) {
    const valorHoraDecimal = new Decimal(valorHora.salario)
      .plus(valorHora.custoCnpj)
      .plus(valorHora.taxasFixas)
      .div(valorHora.horasMes || 1);
    custo = custo.plus(new Decimal(insumo.tempoHoras).times(valorHoraDecimal));
  }

  return custo;
}

/** Custo total direto (todos os insumos) */
export function custoTotalDireto(insumos: Insumo[], valorHora?: ValorHora | null): Decimal {
  return insumos.reduce(
    (acc, i) => acc.plus(custoInsumo(i, valorHora)),
    new Decimal(0)
  );
}

/** Margem bruta em percentual */
export function margemBruta(precoVenda: number, insumos: Insumo[], valorHora?: ValorHora | null): Decimal {
  const preco = new Decimal(precoVenda);
  const custo = custoTotalDireto(insumos, valorHora);

  if (preco.isZero()) return new Decimal(0);

  return preco.minus(custo).div(preco).times(100);
}

/** Margem líquida em percentual (descontando rateios fixos) */
export function margemLiquida(
  precoVenda: number,
  insumos: Insumo[],
  valorHora?: ValorHora | null,
  rateioPorProduto?: number
): { margem: Decimal; temRateio: boolean } {
  const preco = new Decimal(precoVenda);
  const custo = custoTotalDireto(insumos, valorHora);

  if (preco.isZero()) return { margem: new Decimal(0), temRateio: false };

  const custoComRateio = rateioPorProduto
    ? custo.plus(rateioPorProduto)
    : custo;

  return {
    margem: preco.minus(custoComRateio).div(preco).times(100),
    temRateio: !!rateioPorProduto,
  };
}

/** Valor Hora calculado */
export function calcularValorHora(vh: ValorHora): Decimal {
  if (vh.horasMes <= 0) return new Decimal(0);
  return new Decimal(vh.salario)
    .plus(vh.custoCnpj)
    .plus(vh.taxasFixas)
    .div(vh.horasMes);
}

/** Tempo total de trabalho (soma dos tempos dos insumos) */
export function tempoTotal(insumos: Insumo[]): Decimal {
  return insumos.reduce(
    (acc, i) => acc.plus(i.tempoHoras),
    new Decimal(0)
  );
}

/** Lucro bruto em reais */
export function lucroBruto(precoVenda: number, insumos: Insumo[], valorHora?: ValorHora | null): Decimal {
  return new Decimal(precoVenda).minus(custoTotalDireto(insumos, valorHora));
}

/** Classificação margem × esforço */
export function classificarProduto(
  margemLiquidaValor: Decimal,
  tempoTotalHoras: Decimal
): Classificacao {
  const margem = margemLiquidaValor.toNumber();
  const tempo = tempoTotalHoras.toNumber();

  if (margem >= 40 && tempo < 2) return "foco";
  if (margem < 20 && tempo < 2) return "reprecificar";
  if (margem >= 40 && tempo >= 2) return "revisar";
  return "evitar";
}
