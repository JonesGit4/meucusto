"use client";

import Link from "next/link";
import { calcularValorHora } from "@/lib/calculos";
import { formatBRL } from "@/lib/formatters";
import type { ValorHora } from "@/types";

export function ValorHoraCard({ valorHora }: { valorHora: ValorHora | null }) {
  const calculado = valorHora ? calcularValorHora(valorHora) : null;

  return (
    <Link href="/valor-hora" className="block">
      <div className="glass rounded-2xl p-5 card-hover cursor-pointer">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
              Valor Hora
            </p>
            <p className="text-2xl font-bold mt-1">
              {calculado ? (
                <span className="gradient-text">{formatBRL(calculado)}</span>
              ) : (
                <span className="text-[var(--color-text-muted)]">Não configurado</span>
              )}
            </p>
          </div>
          <div className="text-[var(--color-text-muted)]">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        {calculado && (
          <p className="text-xs text-[var(--color-text-muted)] mt-2">
            {valorHora!.horasMes}h/mês · Salário {formatBRL(valorHora!.salario)}
          </p>
        )}
      </div>
    </Link>
  );
}
