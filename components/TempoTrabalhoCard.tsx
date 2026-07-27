"use client";

interface Props {
  minutos: number;
  onChange: (minutos: number) => void;
  readonly?: boolean;
}

export function TempoTrabalhoCard({ minutos, onChange, readonly }: Props) {
  const inputClass = `w-40 bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] rounded-lg px-3 py-1.5 text-sm text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-active)] ${readonly ? "opacity-60 cursor-default" : ""}`;

  return (
    <div className={`bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl overflow-hidden ${minutos > 0 && readonly ? "border-l-[3px] border-l-[var(--color-success)]" : ""}`}>
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--color-accent-start)]">
            <circle cx="12" cy="12" r="9"/>
            <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h3 className="text-sm font-medium text-white">Tempo de Trabalho</h3>
          {minutos > 0 && readonly && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2" className="ml-auto">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
        <div>
          <label className="block text-[10px] text-[var(--color-text-muted)] mb-1">Tempo total (minutos)</label>
          <input
            type="text" inputMode="numeric"
            value={minutos || ""}
            onChange={(e) => {
              if (readonly) return;
              const v = e.target.value.replace(/\D/g, "");
              onChange(v ? Number(v) : 0);
            }}
            readOnly={readonly}
            placeholder="Ex: 35"
            className={inputClass}
          />
          {minutos > 0 && (
            <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
              {Math.floor(minutos / 60) > 0 ? `${Math.floor(minutos / 60)}h${minutos % 60 > 0 ? ` ${minutos % 60}min` : ""}` : `${minutos} min`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
