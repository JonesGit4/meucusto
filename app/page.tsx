"use client";

import { useLocalDB } from "@/hooks/useLocalDB";
import { ValorHoraCard } from "@/components/ValorHoraCard";
import { ProdutoCard } from "@/components/ProdutoCard";
import { EmptyState } from "@/components/EmptyState";
import { BottomNav } from "@/components/BottomNav";
import Link from "next/link";
import { useMemo } from "react";
import { margemLiquida, tempoTotal } from "@/lib/calculos";
import { classificarProduto } from "@/lib/calculos";

export default function Home() {
  const { db, loaded } = useLocalDB();
  const produtos = useMemo(
    () => db.produtos.filter((p) => !p.deletedAt),
    [db.produtos]
  );

  const produtosComMetricas = useMemo(
    () =>
      produtos.map((p) => {
        const { margem } = margemLiquida(
          p.precoVenda,
          p.insumos,
          db.valorHora ?? undefined
        );
        const tempo = tempoTotal(p.insumos);
        const classificacao = classificarProduto(margem, tempo);
        return { ...p, margem, tempo, classificacao };
      }),
    [produtos, db.valorHora]
  );

  const sorted = useMemo(
    () =>
      [...produtosComMetricas].sort(
        (a, b) => b.margem.toNumber() - a.margem.toNumber()
      ),
    [produtosComMetricas]
  );

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)]">
        <div className="w-8 h-8 border-2 border-[var(--color-accent-start)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[var(--color-bg-primary)]/80 backdrop-blur-lg border-b border-[var(--color-border-subtle)]">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">
            <span className="gradient-text">Meu Custo</span>
          </h1>
          <Link
            href="/produtos/novo"
            className="gradient-bg text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
          >
            + Novo
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Valor Hora Card */}
        <ValorHoraCard valorHora={db.valorHora} />

        {/* Dashboard */}
        <section>
          <h2 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-4">
            Seus Produtos
          </h2>

          {sorted.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sorted.map((p, i) => (
                <ProdutoCard
                  key={p.id}
                  produto={p}
                  margem={p.margem}
                  tempo={p.tempo}
                  classificacao={p.classificacao}
                  index={i}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
