"use client";

import { useMemo } from "react";
import type { EquipamentoEletrico } from "@/types";

interface Props {
  eq: EquipamentoEletrico;
  onChange: (u: Partial<EquipamentoEletrico>) => void;
  onRemove: () => void;
  canRemove: boolean;
}

const ICONE_PADRAO = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ICONES: Record<string, React.ReactNode> = {
  costura: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 21l2-2M5 3l14 14M21 3l-2 2" strokeLinecap="round"/>
      <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="2" strokeLinecap="round"/>
      <line x1="15" y1="15" x2="15.01" y2="15" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  laser: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2v4m0 12v4M2 12h4m12 0h4M5.6 5.6l2.8 2.8m7.2 7.2l2.8 2.8M5.6 18.4l2.8-2.8m7.2-7.2l2.8-2.8" strokeLinecap="round"/>
      <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.2"/>
    </svg>
  ),
  impressora3d: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="4" y="2" width="16" height="6" rx="1"/>
      <rect x="6" y="8" width="12" height="12" rx="1"/>
      <line x1="9" y1="14" x2="15" y2="14" strokeLinecap="round"/>
      <line x1="12" y1="8" x2="12" y2="8" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  prensa: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="6" y="2" width="12" height="4" rx="1"/>
      <rect x="4" y="6" width="16" height="14" rx="1"/>
      <line x1="12" y1="10" x2="12" y2="18" strokeLinecap="round"/>
      <line x1="8" y1="14" x2="16" y2="14" strokeLinecap="round"/>
    </svg>
  ),
};

function detectIcon(nome: string): { icon: React.ReactNode; tipo: string } {
  const n = nome.toLowerCase();
  if (n.includes("costur") || n.includes("singer")) return { icon: ICONES.costura, tipo: "Costura" };
  if (n.includes("laser") || n.includes("corte")) return { icon: ICONES.laser, tipo: "Laser/Corte" };
  if (n.includes("3d") || n.includes("impressora") || n.includes("printer")) return { icon: ICONES.impressora3d, tipo: "3D Printer" };
  if (n.includes("prensa") || n.includes("térmica") || n.includes("termica") || n.includes("heat press")) return { icon: ICONES.prensa, tipo: "Prensa Térmica" };
  return { icon: ICONE_PADRAO, tipo: "Equipamento" };
}

export function EquipamentoRow({ eq, onChange, onRemove, canRemove }: Props) {
  const { icon, tipo } = useMemo(() => detectIcon(eq.nome), [eq.nome]);

  const custoEstimado =
    eq.potenciaWatts > 0 && eq.tempoUsoMinutos > 0 && eq.custoKwh > 0
      ? ((eq.potenciaWatts / 1000) * (eq.tempoUsoMinutos / 60) * eq.custoKwh)
      : 0;

  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-[var(--color-warning)]">{icon}</span>
        <div className="flex-1">
          <input
            type="text"
            value={eq.nome}
            onChange={(e) => onChange({ nome: e.target.value })}
            placeholder="Nome do equipamento (ex: Laser de Corte)"
            className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] rounded-lg px-3 py-2 text-sm text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-active)]"
          />
          {eq.nome.trim() && (
            <p className="text-[10px] text-[var(--color-warning)] mt-0.5">{tipo}</p>
          )}
        </div>
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
          <input type="number" inputMode="decimal"
            value={eq.potenciaWatts || ""}
            onChange={(e) => onChange({ potenciaWatts: Number(e.target.value) || 0 })}
            placeholder="Ex: 500" className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] rounded-lg px-2 py-2 text-sm text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-active)]" />
        </div>
        <div>
          <label className="block text-[10px] text-[var(--color-text-muted)] mb-1">Tempo de uso (min)</label>
          <input type="number" inputMode="numeric"
            value={eq.tempoUsoMinutos || ""}
            onChange={(e) => onChange({ tempoUsoMinutos: Number(e.target.value) || 0 })}
            placeholder="Ex: 45" className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] rounded-lg px-2 py-2 text-sm text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-active)]" />
        </div>
        <div>
          <label className="block text-[10px] text-[var(--color-text-muted)] mb-1">Custo kWh (R$)</label>
          <input type="number" inputMode="decimal"
            value={eq.custoKwh || ""}
            onChange={(e) => onChange({ custoKwh: Number(e.target.value) || 0 })}
            placeholder="Ex: 0,85" className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] rounded-lg px-2 py-2 text-sm text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-active)]" />
        </div>
        <div>
          <label className="block text-[10px] text-[var(--color-text-muted)] mb-1">Cidade (opcional)</label>
          <input type="text"
            value={eq.cidade || ""}
            onChange={(e) => onChange({ cidade: e.target.value })}
            placeholder="São Paulo" className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] rounded-lg px-2 py-2 text-sm text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-active)]" />
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
