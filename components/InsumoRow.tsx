"use client";

import { useState, useEffect } from "react";
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

/** Evita o bug `0 || "" = ""` retornando string vazia apenas para null/undefined */
function numStr(v: number | undefined | null): string {
  if (v === null || v === undefined) return "";
  return String(v);
}

export function InsumoRow({ insumo, onChange, onRemove, canRemove, readonly }: Props) {
  const mostraArea = UNIDADES_COM_AREA.includes(insumo.unidade);
  const completo = insumo.nome.trim().length > 0 && (insumo.usaPacote ? insumo.quantidadePacote > 0 && insumo.valorPacote > 0 : insumo.custoUnitario > 0);

  // Estados locais de string para evitar que 0 seja tratado como falsy
  const [qtdStr, setQtdStr] = useState(numStr(insumo.quantidade));
  const [alturaStr, setAlturaStr] = useState(numStr(insumo.altura));
  const [larguraStr, setLarguraStr] = useState(numStr(insumo.largura));
  const [custoStr, setCustoStr] = useState(numStr(insumo.custoUnitario));
  const [qtdPacoteStr, setQtdPacoteStr] = useState(numStr(insumo.quantidadePacote));
  const [valorPacoteStr, setValorPacoteStr] = useState(numStr(insumo.valorPacote));

  // Sincronizar quando insumo mudar externamente
  useEffect(() => {
    setQtdStr(numStr(insumo.quantidade));
    setAlturaStr(numStr(insumo.altura));
    setLarguraStr(numStr(insumo.largura));
    setCustoStr(numStr(insumo.custoUnitario));
    setQtdPacoteStr(numStr(insumo.quantidadePacote));
    setValorPacoteStr(numStr(insumo.valorPacote));
  }, [insumo.quantidade, insumo.altura, insumo.largura, insumo.custoUnitario, insumo.quantidadePacote, insumo.valorPacote]);

  const toNum = (raw: string): number => {
    const cleaned = raw.replace(",", ".").trim();
    if (cleaned === "" || cleaned === ".") return 0;
    return Number(cleaned) || 0;
  };

  const inputClass = `w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] rounded-lg px-2 py-2 text-sm text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-active)] ${readonly ? "opacity-60 cursor-default" : ""}`;

  return (
    <div className={`bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl overflow-hidden ${completo && readonly ? "border-l-[3px] border-l-[var(--color-success)]" : ""}`}>
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <input type="text" value={insumo.nome}
            onChange={(e) => !readonly && onChange({ nome: e.target.value })}
            readOnly={readonly}
            placeholder="Nome do material"
            className={`flex-1 bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] rounded-lg px-3 py-2 text-sm text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-active)] ${readonly ? "opacity-60 cursor-default" : ""}`} />
          {canRemove && !readonly && (
            <button onClick={onRemove} className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)] p-1 shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/></svg>
            </button>
          )}
          {completo && readonly && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2" className="shrink-0"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-[10px] text-[var(--color-text-muted)] mb-1">{mostraArea ? "Altura" : "Qtd"}</label>
            <input type="text" inputMode="decimal"
              value={mostraArea ? alturaStr : qtdStr}
              onChange={(e) => {
                if (readonly) return;
                const v = e.target.value;
                if (mostraArea) {
                  setAlturaStr(v);
                  onChange({ altura: toNum(v) || undefined });
                } else {
                  setQtdStr(v);
                  onChange({ quantidade: toNum(v) });
                }
              }}
              readOnly={readonly}
              placeholder="0"
              className={inputClass} />
          </div>

          {mostraArea && (
            <div>
              <label className="block text-[10px] text-[var(--color-text-muted)] mb-1">Largura</label>
              <input type="text" inputMode="decimal"
                value={larguraStr}
                onChange={(e) => {
                  if (readonly) return;
                  setLarguraStr(e.target.value);
                  onChange({ largura: toNum(e.target.value) || undefined });
                }}
                readOnly={readonly}
                placeholder="0"
                className={inputClass} />
            </div>
          )}

          <div>
            <label className="block text-[10px] text-[var(--color-text-muted)] mb-1">Unidade</label>
            <select value={insumo.unidade}
              onChange={(e) => !readonly && onChange({ unidade: e.target.value as UnidadeMedida })}
              disabled={readonly}
              className={`w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] rounded-lg px-2 py-2 text-sm text-white focus:outline-none ${readonly ? "opacity-60 cursor-default" : "focus:border-[var(--color-border-active)]"}`}>
              {Object.entries(UNIDADES_MEDIDA).map(([k, v]) => (<option key={k} value={k}>{v}</option>))}
            </select>
          </div>
        </div>

        {/* Custo */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <label className="text-[10px] text-[var(--color-text-muted)]">Modo:</label>
            <button onClick={() => !readonly && onChange({ usaPacote: false })}
              className={`text-[11px] px-2 py-0.5 rounded-md ${!insumo.usaPacote ? "bg-[var(--color-accent-start)]/20 text-[var(--color-accent-start)]" : "text-[var(--color-text-muted)]"} ${readonly ? "cursor-default" : ""}`}>Custo/un</button>
            <button onClick={() => !readonly && onChange({ usaPacote: true })}
              className={`text-[11px] px-2 py-0.5 rounded-md ${insumo.usaPacote ? "bg-[var(--color-accent-start)]/20 text-[var(--color-accent-start)]" : "text-[var(--color-text-muted)]"} ${readonly ? "cursor-default" : ""}`}>Pacote</button>
          </div>

          {insumo.usaPacote ? (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-[var(--color-text-muted)] mb-1">Qtd no pacote</label>
                <input type="text" inputMode="decimal" value={qtdPacoteStr}
                  onChange={(e) => { if (readonly) return; setQtdPacoteStr(e.target.value); onChange({ quantidadePacote: toNum(e.target.value) }); }}
                  readOnly={readonly} placeholder="50" className={inputClass} />
              </div>
              <div>
                <label className="block text-[10px] text-[var(--color-text-muted)] mb-1">Valor pago (R$)</label>
                <input type="text" inputMode="decimal" value={valorPacoteStr}
                  onChange={(e) => { if (readonly) return; setValorPacoteStr(e.target.value); onChange({ valorPacote: toNum(e.target.value) }); }}
                  readOnly={readonly} placeholder="45" className={inputClass} />
              </div>
              {insumo.quantidadePacote > 0 && insumo.valorPacote > 0 && (
                <div className="col-span-2"><p className="text-[10px] text-[var(--color-accent-start)]">= {formatBRL(insumo.valorPacote / insumo.quantidadePacote)}/{insumo.unidade}</p></div>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-[10px] text-[var(--color-text-muted)] mb-1">Custo por unidade (R$)</label>
              <input type="text" inputMode="decimal" value={custoStr}
                onChange={(e) => { if (readonly) return; setCustoStr(e.target.value); onChange({ custoUnitario: toNum(e.target.value) }); }}
                readOnly={readonly} placeholder="0,80"
                className={`${inputClass} w-40`} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
