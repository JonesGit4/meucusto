"use client";

import { useState } from "react";
import type { Insumo, UnidadeMedida } from "@/types";
import { UNIDADES_MEDIDA, UNIDADES_COM_AREA } from "@/types";

interface Props {
  insumo: Insumo;
  onChange: (updates: Partial<Insumo>) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export function InsumoRow({ insumo, onChange, onRemove, canRemove }: Props) {
  const mostraArea = UNIDADES_COM_AREA.includes(insumo.unidade);

  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl p-4 space-y-3">
      {/* Nome + Remove */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={insumo.nome}
          onChange={(e) => onChange({ nome: e.target.value })}
          placeholder="Nome do material"
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

      {/* Quantidade + Unidade */}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-[10px] text-[var(--color-text-muted)] mb-1">
            {mostraArea ? "Altura" : "Qtd"}
          </label>
          <input
            type="number" inputMode="decimal"
            value={mostraArea ? (insumo.altura ?? "") : insumo.quantidade}
            onChange={(e) =>
              mostraArea
                ? onChange({ altura: Number(e.target.value) || undefined })
                : onChange({ quantidade: Number(e.target.value) || 1 })
            }
            placeholder={mostraArea ? "50" : "1"}
            className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] rounded-lg px-2 py-2 text-sm text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-active)]"
          />
        </div>

        {mostraArea && (
          <div>
            <label className="block text-[10px] text-[var(--color-text-muted)] mb-1">Largura</label>
            <input
              type="number" inputMode="decimal"
              value={insumo.largura ?? ""}
              onChange={(e) => onChange({ largura: Number(e.target.value) || undefined })}
              placeholder="30"
              className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] rounded-lg px-2 py-2 text-sm text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-active)]"
            />
          </div>
        )}

        <div>
          <label className="block text-[10px] text-[var(--color-text-muted)] mb-1">Unidade</label>
          <select
            value={insumo.unidade}
            onChange={(e) => onChange({ unidade: e.target.value as UnidadeMedida })}
            className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] rounded-lg px-2 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-border-active)]"
          >
            {Object.entries(UNIDADES_MEDIDA).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Custo — modo normal OU pacote fechado */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <label className="text-[10px] text-[var(--color-text-muted)]">Modo de custo:</label>
          <button
            onClick={() => onChange({ usaPacote: false })}
            className={`text-[11px] px-2 py-0.5 rounded-md ${!insumo.usaPacote ? "bg-[var(--color-accent-start)]/20 text-[var(--color-accent-start)]" : "text-[var(--color-text-muted)]"}`}
          >
            Custo por unidade
          </button>
          <button
            onClick={() => onChange({ usaPacote: true })}
            className={`text-[11px] px-2 py-0.5 rounded-md ${insumo.usaPacote ? "bg-[var(--color-accent-start)]/20 text-[var(--color-accent-start)]" : "text-[var(--color-text-muted)]"}`}
          >
            Pacote fechado
          </button>
        </div>

        {insumo.usaPacote ? (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-[var(--color-text-muted)] mb-1">Quantidade no pacote</label>
              <input
                type="number" inputMode="decimal"
                value={insumo.quantidadePacote || ""}
                onChange={(e) => onChange({ quantidadePacote: Number(e.target.value) || 0 })}
                placeholder="Ex: 50"
                className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] rounded-lg px-2 py-2 text-sm text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-active)]"
              />
            </div>
            <div>
              <label className="block text-[10px] text-[var(--color-text-muted)] mb-1">Valor pago (R$)</label>
              <input
                type="number" inputMode="decimal"
                value={insumo.valorPacote || ""}
                onChange={(e) => onChange({ valorPacote: Number(e.target.value) || 0 })}
                placeholder="Ex: 45"
                className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] rounded-lg px-2 py-2 text-sm text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-active)]"
              />
            </div>
            {insumo.quantidadePacote > 0 && insumo.valorPacote > 0 && (
              <div className="col-span-2">
                <p className="text-[10px] text-[var(--color-accent-start)]">
                  Custo unitário calculado: {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(insumo.valorPacote / insumo.quantidadePacote)}/{insumo.unidade}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <label className="block text-[10px] text-[var(--color-text-muted)] mb-1">Custo por unidade (R$)</label>
            <input
              type="number" inputMode="decimal"
              value={insumo.custoUnitario || ""}
              onChange={(e) => onChange({ custoUnitario: Number(e.target.value) || 0 })}
              placeholder="R$ 80"
              className="w-40 bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] rounded-lg px-3 py-2 text-sm text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-active)]"
            />
          </div>
        )}
      </div>
    </div>
  );
}
