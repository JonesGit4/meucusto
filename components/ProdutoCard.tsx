"use client";

import Link from "next/link";
import type Decimal from "decimal.js";
import type { Produto, Classificacao } from "@/types";
import { CLASSIFICACAO_EMOJI, CLASSIFICACAO_LABELS } from "@/types";
import { formatBRL, formatPercent, formatTempo } from "@/lib/formatters";
import { ProdutoImage } from "./ProdutoImage";

export function ProdutoCard({
  produto,
  margem,
  tempo,
  classificacao,
  index,
}: {
  produto: Produto;
  margem: Decimal;
  tempo: Decimal;
  classificacao: Classificacao;
  index: number;
}) {
  return (
    <Link href={`/produtos/${produto.id}`}>
      <div
        className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-2xl overflow-hidden card-hover animate-fade-in"
        style={{ animationDelay: `${index * 60}ms` }}
      >
        {/* Imagem */}
        <div className="aspect-[4/3] bg-[var(--color-bg-primary)] relative">
          <ProdutoImage
            imagemUrl={produto.imagemUrl}
            nome={produto.nome}
            size="card"
          />
          {/* Badge classificação */}
          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1 text-xs font-medium">
            {CLASSIFICACAO_EMOJI[classificacao]}
          </div>
        </div>

        {/* Info */}
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
              <p className="text-lg font-bold gradient-text">
                {formatBRL(produto.precoVenda)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-white">
                {formatPercent(margem)}
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">
                {formatTempo(tempo)}
              </p>
            </div>
          </div>

          {/* Barra de margem */}
          <div className="w-full h-1 bg-[var(--color-border-subtle)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full gradient-bg transition-all duration-500"
              style={{ width: `${Math.min(margem.toNumber(), 100)}%` }}
            />
          </div>

          <p className="text-xs text-[var(--color-text-muted)]">
            {CLASSIFICACAO_LABELS[classificacao]}
          </p>
        </div>
      </div>
    </Link>
  );
}
