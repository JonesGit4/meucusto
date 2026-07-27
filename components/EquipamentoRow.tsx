"use client";

import type { EquipamentoEletrico } from "@/types";

interface Props {
  eq: EquipamentoEletrico;
  onChange: (updates: Partial<EquipamentoEletrico>) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export function EquipamentoRow({ eq, onChange, onRemove, canRemove }: Props) {
  // Cálculo do custo estimado
  const custoEstimado =
    eq.potenciaWatts > 0 && eq.tempoUsoMinutos > 0 && eq.custoKwh > 0
      ? ((eq.potenciaWatts / 1000) * (eq.tempoUsoMinutos / 60) * eq.custoKwh)
      : 0;

  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--color-warning)]">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <input
          type="text"
          value={eq.nome}
          onChange={(e) => onChange({ nome: e.target.value })}
          placeholder="Nome do equipamento (ex: Laser de Corte)"
          className="flex-1 bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] rounded-lg px-3 py-2 text-sm text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-active)]"
        />
        {canRemove && (
          <button onClick={onRemove} className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)] p-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] text-[var(--color-text-muted)] mb-1">Potência (Watts)</label>
          <input
            type="number" inputMode="decimal"
            value={eq.potenciaWatts || ""}
            onChange={(e) => onChange({ potenciaWatts: Number(e.target.value) || 0 })}
            placeholder="Ex: 500"
            className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] rounded-lg px-2 py-2 text-sm text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-active)]"
          />
        </div>
        <div>
          <label className="block text-[10px] text-[var(--color-text-muted)] mb-1">Tempo de uso (min)</label>
          <input
            type="number" inputMode="numeric"
            value={eq.tempoUsoMinutos || ""}
            onChange={(e) => onChange({ tempoUsoMinutos: Number(e.target.value) || 0 })}
            placeholder="Ex: 45"
            className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] rounded-lg px-2 py-2 text-sm text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-active)]"
          />
        </div>
        <div>
          <label className="block text-[10px] text-[var(--color-text-muted)] mb-1">Custo kWh (R$)</label>
          <input
            type="number" inputMode="decimal"
            value={eq.custoKwh || ""}
            onChange={(e) => onChange({ custoKwh: Number(e.target.value) || 0 })}
            placeholder="Ex: 0,85"
            className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] rounded-lg px-2 py-2 text-sm text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-active)]"
          />
        </div>
        <div>
          <label className="block text-[10px] text-[var(--color-text-muted)] mb-1">Cidade (opcional)</label>
          <input
            type="text"
            value={eq.cidade || ""}
            onChange={(e) => onChange({ cidade: e.target.value })}
            placeholder="São Paulo"
            className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] rounded-lg px-2 py-2 text-sm text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-active)]"
          />
        </div>
      </div>

      {custoEstimado > 0 && (
        <p className="text-[10px] text-[var(--color-warning)]">
          ⚡ Custo estimado: {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(custoEstimado)}
        </p>
      )}
    </div>
  );
}
