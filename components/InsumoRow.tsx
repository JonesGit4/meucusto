"use client";

import type { Insumo, UnidadeMedida } from "@/types";
import { UNIDADES_MEDIDA, UNIDADES_COM_AREA } from "@/types";

interface InsumoRowProps {
  insumo: Insumo;
  onChange: (updates: Partial<Insumo>) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export function InsumoRow({ insumo, onChange, onRemove, canRemove }: InsumoRowProps) {
  const mostraArea = UNIDADES_COM_AREA.includes(insumo.unidade);

  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl p-4 space-y-3">
      {/* Nome + Remove */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={insumo.nome}
          onChange={(e) => onChange({ nome: e.target.value })}
          placeholder="Nome do insumo"
          className="flex-1 bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] rounded-lg px-3 py-2 text-sm text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-active)] transition-colors"
        />
        {canRemove && (
          <button
            onClick={onRemove}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors p-1"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>

      {/* Quantidade + Unidade + Custo */}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-[10px] text-[var(--color-text-muted)] mb-1">
            {mostraArea ? "Altura" : "Qtd"}
          </label>
          <input
            type="number"
            inputMode="decimal"
            value={mostraArea ? (insumo.altura ?? "") : insumo.quantidade}
            onChange={(e) =>
              mostraArea
                ? onChange({ altura: Number(e.target.value) || undefined })
                : onChange({ quantidade: Number(e.target.value) || 1 })
            }
            placeholder={mostraArea ? "50" : "1"}
            className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] rounded-lg px-2 py-2 text-sm text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-active)] transition-colors"
          />
        </div>

        {mostraArea && (
          <div>
            <label className="block text-[10px] text-[var(--color-text-muted)] mb-1">
              Largura
            </label>
            <input
              type="number"
              inputMode="decimal"
              value={insumo.largura ?? ""}
              onChange={(e) =>
                onChange({ largura: Number(e.target.value) || undefined })
              }
              placeholder="30"
              className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] rounded-lg px-2 py-2 text-sm text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-active)] transition-colors"
            />
          </div>
        )}

        <div className={mostraArea ? "" : ""}>
          <label className="block text-[10px] text-[var(--color-text-muted)] mb-1">
            Unidade
          </label>
          <select
            value={insumo.unidade}
            onChange={(e) => onChange({ unidade: e.target.value as UnidadeMedida })}
            className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] rounded-lg px-2 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-border-active)] transition-colors"
          >
            {Object.entries(UNIDADES_MEDIDA).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] text-[var(--color-text-muted)] mb-1">
            Custo/un
          </label>
          <input
            type="number"
            inputMode="decimal"
            value={insumo.custoUnitario || ""}
            onChange={(e) =>
              onChange({ custoUnitario: Number(e.target.value) || 0 })
            }
            placeholder="R$ 80"
            className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] rounded-lg px-2 py-2 text-sm text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-active)] transition-colors"
          />
        </div>
      </div>

      {/* Tempo mão de obra */}
      <div>
        <label className="block text-[10px] text-[var(--color-text-muted)] mb-1">
          Tempo de trabalho (horas)
        </label>
        <input
          type="number"
          inputMode="decimal"
          value={insumo.tempoHoras || ""}
          onChange={(e) =>
            onChange({ tempoHoras: Number(e.target.value) || 0 })
          }
          placeholder="Ex: 1.5 (1h30min)"
          className="w-40 bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] rounded-lg px-3 py-2 text-sm text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-active)] transition-colors"
        />
      </div>
    </div>
  );
}
