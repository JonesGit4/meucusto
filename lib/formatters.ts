// ═══════════════════════════════════════
// Meu Custo — Formatters (BRL, %, tempo)
// ═══════════════════════════════════════

import Decimal from "decimal.js";

/** Formata valor decimal como moeda BRL */
export function formatBRL(value: Decimal | number): string {
  const num = value instanceof Decimal ? value.toNumber() : value;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(num);
}

/** Formata percentual */
export function formatPercent(value: Decimal | number, decimals = 1): string {
  const num = value instanceof Decimal ? value.toNumber() : value;
  return `${num.toFixed(decimals)}%`;
}

/** Formata horas decimais para "Xh Ymin" */
export function formatTempo(horas: Decimal | number): string {
  const h = horas instanceof Decimal ? horas.toNumber() : horas;
  const horasInt = Math.floor(h);
  const minutos = Math.round((h - horasInt) * 60);

  if (horasInt === 0 && minutos === 0) return "0min";
  if (horasInt === 0) return `${minutos}min`;
  if (minutos === 0) return `${horasInt}h`;
  return `${horasInt}h${minutos}min`;
}

/** Formata número simples com 2 casas */
export function formatDecimal(value: Decimal | number, decimals = 2): string {
  const num = value instanceof Decimal ? value.toNumber() : value;
  return num.toFixed(decimals);
}
