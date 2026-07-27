"use client";

import Link from "next/link";
import type Decimal from "decimal.js";
import type { Produto, Classificacao } from "@/types";
import { CLASSIFICACAO_EMOJI, CLASSIFICACAO_LABELS } from "@/types";
import { formatBRL, formatPercent, formatTempo } from "@/lib/formatters";
import { ProdutoImage } from "./ProdutoImage";

export function ProdutoCard({
  produto,
  custo,
  margem,
  mins,
  classificacao,
  index,
}: {
  produto: Produto;
  custo: Decimal;
  margem: Decimal;
  mins: number;
  classificacao: Classificacao;
  index: number;
}) {
  const preco = produto.precoVenda ?? produto.precoSugerido ?? 0;

  return (
    <Link href={`/produtos/${produto.id}`}>
      <div
        className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-2xl overflow-hidden card-hover animate-fade-in"
        style={{ animationDelay: `${index * 60}ms` }}
      >
        <div className="aspect-[4/3] bg-[var(--color-bg-primary)] relative">
          <ProdutoImage imagemUrl={produto.imagemUrl} nome={produto.nome} size="card" />
          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1 text-xs font-medium">
            {CLASSIFICACAO_EMOJI[classificacao]}
          </div>
          {produto.indicadorSugestao && (
            <div className={`absolute top-2 left-2 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1 text-xs font-medium ${
              produto.indicadorSugestao === "verde" ? "text-[var(--color-success)]" :
              produto.indicadorSugestao === "amarelo" ? "text-[var(--color-warning)]" : "text-[var(--color-danger)]"
            }`}>
              Sugestão
            </div>
          )}
        </div>

        <div className="p-4 space-y-2">
          <div>
            <h3 className="font-semibold text-white truncate">{produto.nome}</h3>
            <p className="text-xs text-[var(--color-text-muted)]">
              {produto.tipo === "fisico" ? "Produto físico" : "Serviço"}
              {produto.categoria ? ` · ${produto.categoria}` : ""}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold gradient-text">{formatBRL(preco)}</p>
              {!produto.precoVenda && <p className="text-[10px] text-[var(--color-text-muted)]">preço sugerido</p>}
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-white">{formatPercent(margem)}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{formatTempo(mins)}</p>
            </div>
          </div>

          <div className="w-full h-1 bg-[var(--color-border-subtle)] rounded-full overflow-hidden">
            <div className="h-full rounded-full gradient-bg transition-all duration-500"
              style={{ width: `${Math.min(margem.toNumber(), 100)}%` }} />
          </div>

          <p className="text-xs text-[var(--color-text-muted)]">{CLASSIFICACAO_LABELS[classificacao]}</p>
        </div>
      </div>
    </Link>
  );
}
