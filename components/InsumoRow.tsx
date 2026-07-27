"use client";

import { useState, useEffect, useCallback } from "react";
import type { Insumo, UnidadeMedida } from "@/types";
import { UNIDADES_MEDIDA, UNIDADES_COM_AREA, UNIDADES_LINEARES } from "@/types";
import { custoInsumo } from "@/lib/calculos";

interface Props {
  insumo: Insumo;
  onChange: (updates: Partial<Insumo>) => void;
  onRemove: () => void;
  canRemove: boolean;
  readonly?: boolean;
}

const bmo = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
const ns = (v: number | undefined | null): string => (v === null || v === undefined || v === 0 ? "" : String(v));
const tn = (r: string) => { const c = r.replace(",", ".").trim(); return c === "" || c === "." ? 0 : Number(c) || 0; };

export function InsumoRow({ insumo, onChange, onRemove, canRemove, readonly }: Props) {
  const ehArea = UNIDADES_COM_AREA.includes(insumo.unidade);
  const ehLinear = UNIDADES_LINEARES.includes(insumo.unidade);
  const unidadeUso = insumo.unidadeUso || insumo.unidade;

  const [valorPagoStr, setValorPagoStr] = useState(ns(insumo.valorPago));
  const [altCompraStr, setAltCompraStr] = useState(ns(insumo.alturaCompra));
  const [larCompraStr, setLarCompraStr] = useState(ns(insumo.larguraCompra));
  const [compCompraStr, setCompCompraStr] = useState(ns(insumo.comprimentoCompra));
  const [qtdCompraStr, setQtdCompraStr] = useState(ns(insumo.quantidadeCompra));
  const [altUsoStr, setAltUsoStr] = useState(ns(insumo.alturaUso));
  const [larUsoStr, setLarUsoStr] = useState(ns(insumo.larguraUso));
  const [compUsoStr, setCompUsoStr] = useState(ns(insumo.comprimentoUso));
  const [qtdUsoStr, setQtdUsoStr] = useState(ns(insumo.quantidadeUso));

  useEffect(() => {
    setValorPagoStr(ns(insumo.valorPago));
    setAltCompraStr(ns(insumo.alturaCompra)); setLarCompraStr(ns(insumo.larguraCompra));
    setCompCompraStr(ns(insumo.comprimentoCompra)); setQtdCompraStr(ns(insumo.quantidadeCompra));
    setAltUsoStr(ns(insumo.alturaUso)); setLarUsoStr(ns(insumo.larguraUso));
    setCompUsoStr(ns(insumo.comprimentoUso)); setQtdUsoStr(ns(insumo.quantidadeUso));
  }, [insumo]);

  // Formatar valor pago com 2 casas decimais ao sair
  const handleValorBlur = useCallback(() => {
    const v = tn(valorPagoStr);
    if (v > 0) {
      const formatted = v.toFixed(2);
      setValorPagoStr(formatted.replace(".", ","));
      onChange({ valorPago: v });
    }
  }, [valorPagoStr, onChange]);

  const custo = custoInsumo(insumo);
  const completo = insumo.nome.trim() && insumo.valorPago > 0;
  const iCls = `w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] rounded-lg px-2 py-1.5 text-sm text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-active)] ${readonly ? "opacity-60 cursor-default" : ""}`;

  // Mostrar conversão se unidades diferem
  const mostraConversao = insumo.unidadeUso && insumo.unidadeUso !== insumo.unidade;

  return (
    <div className={`bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl overflow-hidden ${completo ? "border-l-[3px] border-l-[var(--color-success)]" : ""}`}>
      {completo && !readonly && (
        <div className="bg-[var(--color-success)]/10 border-b border-[var(--color-success)]/20 px-4 py-1 flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2.5"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span className="text-[10px] text-[var(--color-success)] font-medium">Preenchido</span>
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* Nome */}
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
        </div>

        {/* 💰 Card Valor da Compra */}
        <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">💰</span>
            <span className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Valor da compra</span>
          </div>

          {/* Valor pago com auto-formatação */}
          <div>
            <label className="block text-[10px] text-[var(--color-text-muted)] mb-1">Valor que paguei (R$)</label>
            <input type="text" inputMode="decimal" value={valorPagoStr}
              onChange={(e) => { if (readonly) return; setValorPagoStr(e.target.value); onChange({ valorPago: tn(e.target.value) }); }}
              onBlur={handleValorBlur}
              readOnly={readonly} placeholder="Exemplo 37,50"
              className={`${iCls} w-44`} />
            <p className="text-[9px] text-[var(--color-text-muted)] mt-0.5">Ao sair do campo, formata automático: 50 → 50,00</p>
          </div>

          {/* Unidade de COMPRA */}
          <div>
            <label className="block text-[10px] text-[var(--color-text-muted)] mb-1">Unidade de compra</label>
            <select value={insumo.unidade}
              onChange={(e) => !readonly && onChange({ unidade: e.target.value as UnidadeMedida })}
              disabled={readonly}
              className={`w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none ${readonly ? "opacity-60 cursor-default" : "focus:border-[var(--color-border-active)]"}`}>
              {Object.entries(UNIDADES_MEDIDA).map(([k, v]) => (<option key={k} value={k}>{v}</option>))}
            </select>
          </div>

          {/* Dimensões da COMPRA */}
          <div className="border-t border-[var(--color-border-subtle)] pt-3">
            <p className="text-[10px] text-[var(--color-text-muted)] mb-2 font-medium">📦 Dimensões do que COMPREI</p>

            {ehArea ? (
              <div className="grid grid-cols-2 gap-2">
                <div><label className="block text-[10px] text-[var(--color-text-muted)] mb-1">Altura</label><input type="text" inputMode="decimal" value={altCompraStr}
                  onChange={(e) => { if (readonly) return; setAltCompraStr(e.target.value); onChange({ alturaCompra: tn(e.target.value) || undefined }); }}
                  readOnly={readonly} placeholder="Exemplo 100" className={iCls} /></div>
                <div><label className="block text-[10px] text-[var(--color-text-muted)] mb-1">Largura</label><input type="text" inputMode="decimal" value={larCompraStr}
                  onChange={(e) => { if (readonly) return; setLarCompraStr(e.target.value); onChange({ larguraCompra: tn(e.target.value) || undefined }); }}
                  readOnly={readonly} placeholder="Exemplo 50" className={iCls} /></div>
              </div>
            ) : ehLinear ? (
              <div><label className="block text-[10px] text-[var(--color-text-muted)] mb-1">Comprimento</label><input type="text" inputMode="decimal" value={compCompraStr}
                onChange={(e) => { if (readonly) return; setCompCompraStr(e.target.value); onChange({ comprimentoCompra: tn(e.target.value) || undefined }); }}
                readOnly={readonly} placeholder="Exemplo 100" className={iCls} /></div>
            ) : (
              <div><label className="block text-[10px] text-[var(--color-text-muted)] mb-1">Quantidade</label><input type="text" inputMode="decimal" value={qtdCompraStr}
                onChange={(e) => { if (readonly) return; setQtdCompraStr(e.target.value); onChange({ quantidadeCompra: tn(e.target.value) || undefined }); }}
                readOnly={readonly} placeholder="Exemplo 1" className={iCls} /></div>
            )}
          </div>

          {/* Unidade de USO + Dimensões */}
          <div className="border-t border-[var(--color-border-subtle)] pt-3">
            <p className="text-[10px] text-[var(--color-text-muted)] mb-2 font-medium">✂️ Quanto USEI no produto</p>

            {/* Select de unidade de uso (apenas para linear e peso) */}
            {(ehLinear || (!ehArea && !ehLinear)) && (
              <div className="mb-2">
                <label className="block text-[10px] text-[var(--color-text-muted)] mb-1">Unidade de uso</label>
                <select value={unidadeUso}
                  onChange={(e) => !readonly && onChange({ unidadeUso: e.target.value as UnidadeMedida })}
                  disabled={readonly}
                  className={`w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none ${readonly ? "opacity-60 cursor-default" : "focus:border-[var(--color-border-active)]"}`}>
                  {Object.entries(UNIDADES_MEDIDA)
                    .filter(([k]) => ehLinear ? UNIDADES_LINEARES.includes(k as UnidadeMedida) : !UNIDADES_COM_AREA.includes(k as UnidadeMedida) && !UNIDADES_LINEARES.includes(k as UnidadeMedida))
                    .map(([k, v]) => (<option key={k} value={k}>{v}</option>))}
                </select>
                {mostraConversao && (
                  <p className="text-[9px] text-[var(--color-warning)] mt-0.5">
                    Convertendo de {UNIDADES_MEDIDA[unidadeUso]} para {UNIDADES_MEDIDA[insumo.unidade]}
                  </p>
                )}
              </div>
            )}

            {ehArea ? (
              <div className="grid grid-cols-2 gap-2">
                <div><label className="block text-[10px] text-[var(--color-text-muted)] mb-1">Altura</label><input type="text" inputMode="decimal" value={altUsoStr}
                  onChange={(e) => { if (readonly) return; setAltUsoStr(e.target.value); onChange({ alturaUso: tn(e.target.value) || undefined }); }}
                  readOnly={readonly} placeholder="Exemplo 50" className={iCls} /></div>
                <div><label className="block text-[10px] text-[var(--color-text-muted)] mb-1">Largura</label><input type="text" inputMode="decimal" value={larUsoStr}
                  onChange={(e) => { if (readonly) return; setLarUsoStr(e.target.value); onChange({ larguraUso: tn(e.target.value) || undefined }); }}
                  readOnly={readonly} placeholder="Exemplo 35" className={iCls} /></div>
              </div>
            ) : ehLinear ? (
              <div><label className="block text-[10px] text-[var(--color-text-muted)] mb-1">Comprimento</label><input type="text" inputMode="decimal" value={compUsoStr}
                onChange={(e) => { if (readonly) return; setCompUsoStr(e.target.value); onChange({ comprimentoUso: tn(e.target.value) || undefined }); }}
                readOnly={readonly} placeholder="Exemplo 10" className={iCls} /></div>
            ) : (
              <div><label className="block text-[10px] text-[var(--color-text-muted)] mb-1">Quantidade</label><input type="text" inputMode="decimal" value={qtdUsoStr}
                onChange={(e) => { if (readonly) return; setQtdUsoStr(e.target.value); onChange({ quantidadeUso: tn(e.target.value) || undefined }); }}
                readOnly={readonly} placeholder="Exemplo 3" className={iCls} /></div>
            )}
          </div>

          {/* Resultado */}
          {custo.gt(0) && (
            <div className="border-t border-[var(--color-border-subtle)] pt-3 flex justify-between items-center">
              <span className="text-[10px] text-[var(--color-text-muted)]">Custo proporcional</span>
              <span className="text-sm font-bold text-[var(--color-success)]">{bmo(custo.toNumber())}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
