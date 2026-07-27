"use client";

import type { Insumo, UnidadeMedida } from "@/types";
import { UNIDADES_MEDIDA, UNIDADES_COM_AREA } from "@/types";

interface Props {
  insumo: Insumo;
  onChange: (updates: Partial<Insumo>) => void;
  onRemove: () => void;
  canRemove: boolean;
  readonly?: boolean;
}

function formatBRL(v: number) { return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v); }

export function InsumoRow({ insumo, onChange, onRemove, canRemove, readonly }: Props) {
  const mostraArea = UNIDADES_COM_AREA.includes(insumo.unidade);
  const completo = insumo.nome.trim().length > 0 && (insumo.usaPacote ? insumo.quantidadePacote > 0 && insumo.valorPacote > 0 : insumo.custoUnitario > 0);

  const inputClass = `w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] rounded-lg px-2 py-2 text-sm text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-active)] ${readonly ? "opacity-60 cursor-default" : ""}`;

  return (
    <div className={`bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl overflow-hidden ${completo && readonly ? "border-l-[3px] border-l-[var(--color-success)]" : ""}`}>
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={insumo.nome}
            onChange={(e) => !readonly && onChange({ nome: e.target.value })}
            readOnly={readonly}
            placeholder="Nome do material"
            className={`flex-1 bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] rounded-lg px-3 py-2 text-sm text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-active)] ${readonly ? "opacity-60 cursor-default" : ""}`}
          />
          {canRemove && !readonly && (
            <button onClick={onRemove} className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)] p-1 shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
              </svg>
            </button>
          )}
          {completo && readonly && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2" className="shrink-0">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-[10px] text-[var(--color-text-muted)] mb-1">{mostraArea ? "Altura" : "Qtd"}</label>
            <input
              type="text" inputMode="decimal"
              value={mostraArea ? (insumo.altura || "") : (insumo.quantidade || "")}
              onChange={(e) => {
                if (readonly) return;
                const raw = e.target.value.replace(",", ".");
                const v = raw === "" ? "" : raw;
                mostraArea
                  ? onChange({ altura: v ? Number(v) : undefined })
                  : onChange({ quantidade: v ? Number(v) : 0 });
              }}
              readOnly={readonly}
              placeholder={mostraArea ? "50" : "0"}
              className={inputClass}
            />
          </div>

          {mostraArea && (
            <div>
              <label className="block text-[10px] text-[var(--color-text-muted)] mb-1">Largura</label>
              <input
                type="text" inputMode="decimal"
                value={insumo.largura || ""}
                onChange={(e) => {
                  if (readonly) return;
                  const raw = e.target.value.replace(",", ".");
                  onChange({ largura: raw ? Number(raw) : undefined });
                }}
                readOnly={readonly}
                placeholder="30"
                className={inputClass}
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] text-[var(--color-text-muted)] mb-1">Unidade</label>
            <select
              value={insumo.unidade}
              onChange={(e) => !readonly && onChange({ unidade: e.target.value as UnidadeMedida })}
              disabled={readonly}
              className={`w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] rounded-lg px-2 py-2 text-sm text-white focus:outline-none ${readonly ? "opacity-60 cursor-default" : "focus:border-[var(--color-border-active)]"}`}
            >
              {Object.entries(UNIDADES_MEDIDA).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Custo */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <label className="text-[10px] text-[var(--color-text-muted)]">Modo:</label>
            <button onClick={() => !readonly && onChange({ usaPacote: false })}
              className={`text-[11px] px-2 py-0.5 rounded-md ${!insumo.usaPacote ? "bg-[var(--color-accent-start)]/20 text-[var(--color-accent-start)]" : "text-[var(--color-text-muted)]"} ${readonly ? "cursor-default" : ""}`}>
              Custo/un
            </button>
            <button onClick={() => !readonly && onChange({ usaPacote: true })}
              className={`text-[11px] px-2 py-0.5 rounded-md ${insumo.usaPacote ? "bg-[var(--color-accent-start)]/20 text-[var(--color-accent-start)]" : "text-[var(--color-text-muted)]"} ${readonly ? "cursor-default" : ""}`}>
              Pacote
            </button>
          </div>

          {insumo.usaPacote ? (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-[var(--color-text-muted)] mb-1">Qtd no pacote</label>
                <input type="text" inputMode="decimal"
                  value={insumo.quantidadePacote || ""}
                  onChange={(e) => {
                    if (readonly) return;
                    const raw = e.target.value.replace(",", ".");
                    onChange({ quantidadePacote: raw ? Number(raw) : 0 });
                  }}
                  readOnly={readonly}
                  placeholder="Ex: 50" className={inputClass} />
              </div>
              <div>
                <label className="block text-[10px] text-[var(--color-text-muted)] mb-1">Valor pago (R$)</label>
                <input type="text" inputMode="decimal"
                  value={insumo.valorPacote || ""}
                  onChange={(e) => {
                    if (readonly) return;
                    const raw = e.target.value.replace(",", ".");
                    onChange({ valorPacote: raw ? Number(raw) : 0 });
                  }}
                  readOnly={readonly}
                  placeholder="Ex: 45" className={inputClass} />
              </div>
              {insumo.quantidadePacote > 0 && insumo.valorPacote > 0 && (
                <div className="col-span-2">
                  <p className="text-[10px] text-[var(--color-accent-start)]">
                    = {formatBRL(insumo.valorPacote / insumo.quantidadePacote)}/{insumo.unidade}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-[10px] text-[var(--color-text-muted)] mb-1">Custo por unidade (R$)</label>
              <input type="text" inputMode="decimal"
                value={insumo.custoUnitario || ""}
                onChange={(e) => {
                  if (readonly) return;
                  const raw = e.target.value.replace(",", ".");
                  onChange({ custoUnitario: raw ? Number(raw) : 0 });
                }}
                readOnly={readonly}
                placeholder="R$ 80" className={`${inputClass} w-40`} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
