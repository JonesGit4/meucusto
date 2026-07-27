"use client";

import Link from "next/link";

export function EmptyState() {
  return (
    <div className="glass rounded-2xl p-10 text-center space-y-4 animate-fade-in">
      <div className="w-16 h-16 mx-auto rounded-full bg-[var(--color-bg-card)] flex items-center justify-center">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--color-text-muted)]">
          <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
        </svg>
      </div>
      <div>
        <p className="text-white font-medium">Nenhum produto ainda</p>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Crie seu primeiro produto ou serviço e veja as margens aqui
        </p>
      </div>
      <Link
        href="/produtos/novo"
        className="gradient-bg text-white px-6 py-3 rounded-xl text-sm font-medium inline-block hover:opacity-90 transition-opacity"
      >
        Criar Produto
      </Link>
    </div>
  );
}
