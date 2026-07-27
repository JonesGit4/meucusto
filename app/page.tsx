"use client";

import { useLocalDB } from "@/hooks/useLocalDB";
import { ValorHoraCard } from "@/components/ValorHoraCard";
import { ProdutoCard } from "@/components/ProdutoCard";
import { EmptyState } from "@/components/EmptyState";
import { BottomNav } from "@/components/BottomNav";
import Link from "next/link";
import { useMemo } from "react";
import { exportBackup } from "@/lib/backup";
import {
  custoTotalDireto, margemLiquida, classificarProduto, tempoTotalMinutos,
} from "@/lib/calculos";

export default function Home() {
  const { db, loaded } = useLocalDB();
  const produtos = useMemo(() => db.produtos.filter((p) => !p.deletedAt), [db.produtos]);
  const temValorHora = !!db.valorHora;

  const produtosComMetricas = useMemo(
    () =>
      produtos.map((p) => {
        const custo = custoTotalDireto(p.insumos, db.valorHora ?? undefined, p.tempoTrabalho, p.equipamentos);
        const preco = p.precoVenda ?? p.precoSugerido ?? 0;
        const { margem } = margemLiquida(preco, custo);
        const mins = tempoTotalMinutos(p.tempoTrabalho, p.equipamentos);
        const classificacao = classificarProduto(margem, mins);
        return { ...p, custo, margem, mins, classificacao, preco };
      }),
    [produtos, db.valorHora]
  );

  const sorted = useMemo(() => [...produtosComMetricas].sort((a, b) => b.margem.toNumber() - a.margem.toNumber()), [produtosComMetricas]);

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)]">
        <div className="w-8 h-8 border-2 border-[var(--color-accent-start)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] pb-24">
      <header className="sticky top-0 z-10 bg-[var(--color-bg-primary)]/80 backdrop-blur-lg border-b border-[var(--color-border-subtle)]">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold"><span className="gradient-text">Meu Custo</span></h1>
          <div className="flex items-center gap-2">
            {db.produtos.length > 0 && (
              <button onClick={() => exportBackup(db)}
                className="text-xs text-[var(--color-text-muted)] hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-[var(--color-bg-card)]"
                title="Exportar backup">
                📥 Exportar
              </button>
            )}
            {temValorHora ? (
            <Link href="/produtos/novo" className="gradient-bg text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90">+ Novo</Link>
          ) : (
            <Link href="/valor-hora" className="bg-[var(--color-warning)]/20 text-[var(--color-warning)] border border-[var(--color-warning)]/30 px-4 py-2 rounded-xl text-sm font-medium hover:bg-[var(--color-warning)]/30 transition-colors">
              ⚡ Configurar Valor Hora
            </Link>
          )}
          </div>
          </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <ValorHoraCard valorHora={db.valorHora} />

        {!temValorHora && (
          <div className="glass rounded-2xl p-6 text-center space-y-3">
            <p className="text-[var(--color-text-secondary)]">Configure seu <strong className="text-white">Valor Hora</strong> para começar</p>
            <p className="text-sm text-[var(--color-text-muted)]">Isso é necessário para calcular a mão de obra nos seus produtos</p>
            <Link href="/valor-hora" className="gradient-bg text-white px-6 py-3 rounded-xl text-sm font-medium inline-block hover:opacity-90">
              Configurar Agora
            </Link>
          </div>
        )}

        {temValorHora && (
          <section>
            <h2 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-4">Seus Produtos</h2>
            {sorted.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sorted.map((p, i) => (
                  <ProdutoCard key={p.id} produto={p} custo={p.custo} margem={p.margem} mins={p.mins} classificacao={p.classificacao} index={i} />
                ))}
              </div>
            )}
          </section>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
