"use client";

import { useMemo } from "react";
import type { EquipamentoEletrico } from "@/types";

interface Props {
  eq: EquipamentoEletrico;
  onChange: (u: Partial<EquipamentoEletrico>) => void;
  onRemove: () => void;
  canRemove: boolean;
  readonly?: boolean;
}

const ICONE_PADRAO = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ICONES: Record<string, React.ReactNode> = {
  costura: (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 21l2-2M5 3l14 14M21 3l-2 2" strokeLinecap="round"/><line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="2" strokeLinecap="round"/><line x1="15" y1="15" x2="15.01" y2="15" strokeWidth="2" strokeLinecap="round"/></svg>),
  laser: (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2v4m0 12v4M2 12h4m12 0h4M5.6 5.6l2.8 2.8m7.2 7.2l2.8 2.8M5.6 18.4l2.8-2.8m7.2-7.2l2.8-2.8" strokeLinecap="round"/><circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.2"/></svg>),
  impressora3d: (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="2" width="16" height="6" rx="1"/><rect x="6" y="8" width="12" height="12" rx="1"/><line x1="9" y1="14" x2="15" y2="14" strokeLinecap="round"/><line x1="12" y1="8" x2="12" y2="8" strokeWidth="2" strokeLinecap="round"/></svg>),
  prensa: (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="6" y="2" width="12" height="4" rx="1"/><rect x="4" y="6" width="16" height="14" rx="1"/><line x1="12" y1="10" x2="12" y2="18" strokeLinecap="round"/><line x1="8" y1="14" x2="16" y2="14" strokeLinecap="round"/></svg>),
};

function detectIcon(nome: string): { icon: React.ReactNode; tipo: string } {
  const n = nome.toLowerCase();
  if (n.includes("costur") || n.includes("singer")) return { icon: ICONES.costura, tipo: "Costura" };
  if (n.includes("laser") || n.includes("corte")) return { icon: ICONES.laser, tipo: "Laser/Corte" };
  if (n.includes("3d") || n.includes("impressora") || n.includes("printer")) return { icon: ICONES.impressora3d, tipo: "3D Printer" };
  if (n.includes("prensa") || n.includes("térmica") || n.includes("termica") || n.includes("heat press")) return { icon: ICONES.prensa, tipo: "Prensa Térmica" };
  return { icon: ICONE_PADRAO, tipo: "Equipamento" };
}

const bmo = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export function EquipamentoRow({ eq, onChange, onRemove, canRemove, readonly }: Props) {
  const { icon, tipo } = useMemo(() => detectIcon(eq.nome), [eq.nome]);
  const custoEstimado = eq.potenciaWatts > 0 && eq.tempoUsoMinutos > 0 && eq.custoKwh > 0
    ? ((eq.potenciaWatts / 1000) * (eq.tempoUsoMinutos / 60) * eq.custoKwh) : 0;
  const completo = eq.nome.trim().length > 0 && eq.potenciaWatts > 0;

  const iCls = `w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] rounded-lg px-2 py-2 text-sm text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-active)] ${readonly ? "opacity-60 cursor-default" : ""}`;

  return (
    <div className={`bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl overflow-hidden ${completo && readonly ? "border-l-[3px] border-l-[var(--color-success)]" : ""}`}>
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[var(--color-warning)]">{icon}</span>
          <div className="flex-1">
            <input type="text" value={eq.nome}
              onChange={(e) => !readonly && onChange({ nome: e.target.value })}
              readOnly={readonly}
              placeholder="Nome do equipamento"
              className={`w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] rounded-lg px-3 py-2 text-sm text-white placeholder-[var(--color-text-muted)] focus:outline-none ${readonly ? "opacity-60 cursor-default" : "focus:border-[var(--color-border-active)]"}`} />
            {eq.nome.trim() && <p className="text-[10px] text-[var(--color-warning)] mt-0.5">{tipo}</p>}
          </div>
          {canRemove && !readonly && (
            <button onClick={onRemove} className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)] p-1 shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/></svg>
            </button>
          )}
          {completo && readonly && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2" className="shrink-0">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div><label className="block text-[10px] text-[var(--color-text-muted)] mb-1">Potência (W)</label>
            <input type="text" inputMode="decimal" value={eq.potenciaWatts || ""}
              onChange={(e) => { if (readonly) return; const r = e.target.value.replace(",", "."); onChange({ potenciaWatts: r ? Number(r) : 0 }); }}
              readOnly={readonly} placeholder="500" className={iCls} /></div>
          <div><label className="block text-[10px] text-[var(--color-text-muted)] mb-1">Uso (min)</label>
            <input type="text" inputMode="numeric" value={eq.tempoUsoMinutos || ""}
              onChange={(e) => { if (readonly) return; const v = e.target.value.replace(/\D/g, ""); onChange({ tempoUsoMinutos: v ? Number(v) : 0 }); }}
              readOnly={readonly} placeholder="45" className={iCls} /></div>
          <div><label className="block text-[10px] text-[var(--color-text-muted)] mb-1">Custo kWh (R$)</label>
            <input type="text" inputMode="decimal" value={eq.custoKwh || ""}
              onChange={(e) => { if (readonly) return; const r = e.target.value.replace(",", "."); onChange({ custoKwh: r ? Number(r) : 0 }); }}
              readOnly={readonly} placeholder="0,85" className={iCls} /></div>
          <div><label className="block text-[10px] text-[var(--color-text-muted)] mb-1">Cidade</label>
            <input type="text" value={eq.cidade || ""}
              onChange={(e) => !readonly && onChange({ cidade: e.target.value })}
              readOnly={readonly} placeholder="SP" className={iCls} /></div>
        </div>

        {custoEstimado > 0 && <p className="text-[10px] text-[var(--color-warning)]">⚡ Custo: {bmo(custoEstimado)}</p>}
      </div>
    </div>
  );
}
