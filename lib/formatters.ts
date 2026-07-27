// ═══════════════════════════════════════
// Meu Custo — Formatters v1.2
// ═══════════════════════════════════════

import Decimal from "decimal.js";

export function formatBRL(value: Decimal | number): string {
  const num = value instanceof Decimal ? value.toNumber() : value;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(num);
}

export function formatPercent(value: Decimal | number, decimals = 1): string {
  const num = value instanceof Decimal ? value.toNumber() : value;
  return `${num.toFixed(decimals)}%`;
}

/** Formata minutos para exibição: "35 min" ou "190 min (3h10min)" */
export function formatTempo(minutos: number): string {
  if (minutos <= 0) return "0 min";
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${minutos} min (${h}h${m}min)`;
}

export function formatDecimal(value: Decimal | number, decimals = 2): string {
  const num = value instanceof Decimal ? value.toNumber() : value;
  return num.toFixed(decimals);
}
