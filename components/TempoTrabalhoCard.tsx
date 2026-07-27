"use client";

interface Props {
  minutos: number;
  onChange: (minutos: number) => void;
}

export function TempoTrabalhoCard({ minutos, onChange }: Props) {
  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl p-4 space-y-2">
      <div className="flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--color-accent-start)]">
          <circle cx="12" cy="12" r="9"/>
          <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <h3 className="text-sm font-medium text-white">Tempo de Trabalho</h3>
      </div>
      <div>
        <label className="block text-[10px] text-[var(--color-text-muted)] mb-1">Tempo total (minutos)</label>
        <input
          type="number"
          inputMode="numeric"
          value={minutos || ""}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          placeholder="Ex: 35"
          className="w-40 bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] rounded-lg px-3 py-2 text-sm text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-active)]"
        />
        {minutos > 0 && (
          <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
            {Math.floor(minutos / 60) > 0 ? `${Math.floor(minutos / 60)}h${minutos % 60 > 0 ? ` ${minutos % 60}min` : ""}` : `${minutos} min`}
          </p>
        )}
      </div>
    </div>
  );
}
