"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocalDB } from "@/hooks/useLocalDB";
import { ImageUploader } from "@/components/ImageUploader";
import { InsumoRow } from "@/components/InsumoRow";
import { BottomNav } from "@/components/BottomNav";
import { sanitizeAndTrim } from "@/lib/sanitize";
import {
  custoTotalDireto,
  margemBruta,
  margemLiquida,
  lucroBruto,
  tempoTotal,
} from "@/lib/calculos";
import { formatBRL, formatPercent, formatTempo } from "@/lib/formatters";
import type { Produto, Insumo, UnidadeMedida, TipoProduto } from "@/types";
import Link from "next/link";

function novoInsumo(ordem: number): Insumo {
  return {
    id: crypto.randomUUID(),
    nome: "",
    quantidade: 1,
    unidade: "unidade" as UnidadeMedida,
    custoUnitario: 0,
    altura: undefined,
    largura: undefined,
    tempoHoras: 0,
    ordem,
  };
}

export default function NovoProdutoPage() {
  const router = useRouter();
  const { db, addProduto } = useLocalDB();

  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<TipoProduto>("fisico");
  const [precoVenda, setPrecoVenda] = useState("");
  const [categoria, setCategoria] = useState("");
  const [imagemDataUrl, setImagemDataUrl] = useState("");
  const [insumos, setInsumos] = useState<Insumo[]>([novoInsumo(0)]);

  const addInsumo = () =>
    setInsumos((prev) => [...prev, novoInsumo(prev.length)]);

  const removeInsumo = (id: string) =>
    setInsumos((prev) => prev.filter((i) => i.id !== id));

  const updateInsumo = (id: string, updates: Partial<Insumo>) =>
    setInsumos((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...updates } : i))
    );

  // Cálculos em tempo real
  const preco = Number(precoVenda) || 0;
  const custo = custoTotalDireto(insumos, db.valorHora ?? undefined);
  const bruta = margemBruta(preco, insumos, db.valorHora ?? undefined);
  const { margem: liquida } = margemLiquida(
    preco,
    insumos,
    db.valorHora ?? undefined
  );
  const lucro = lucroBruto(preco, insumos, db.valorHora ?? undefined);
  const tempo = tempoTotal(insumos);

  const handleSave = () => {
    if (!nome.trim() || !precoVenda) return;

    const produto: Produto = {
      id: crypto.randomUUID(),
      nome: sanitizeAndTrim(nome),
      tipo,
      precoVenda: Number(precoVenda),
      categoria: categoria ? sanitizeAndTrim(categoria, 50) : undefined,
      imagemUrl: imagemDataUrl || undefined,
      insumos: insumos.filter((i) => i.nome.trim()),
      cenarios: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addProduto(produto);
    router.push("/");
  };

  const isValid = nome.trim() && precoVenda && Number(precoVenda) > 0;

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[var(--color-bg-primary)]/80 backdrop-blur-lg border-b border-[var(--color-border-subtle)]">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-[var(--color-text-secondary)] hover:text-white">
              ←
            </Link>
            <h1 className="text-lg font-semibold">Novo Produto</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={!isValid}
            className="gradient-bg text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            Salvar
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Dados básicos */}
        <section className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
              Nome do produto *
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Bolsa de Couro Artesanal"
              className="w-full bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl px-4 py-3 text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-active)] transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                Tipo *
              </label>
              <div className="flex gap-2">
                {(["fisico", "servico"] as TipoProduto[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTipo(t)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      tipo === t
                        ? "gradient-bg text-white"
                        : "bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]"
                    }`}
                  >
                    {t === "fisico" ? "Físico" : "Serviço"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                Preço de venda *
              </label>
              <input
                type="number"
                inputMode="decimal"
                value={precoVenda}
                onChange={(e) => setPrecoVenda(e.target.value)}
                placeholder="R$ 300"
                className="w-full bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl px-4 py-3 text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-active)] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
              Categoria
            </label>
            <input
              type="text"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              placeholder="Ex: Bolsas, Acessórios"
              className="w-full bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl px-4 py-3 text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-active)] transition-colors"
            />
          </div>
        </section>

        {/* Imagem */}
        <section>
          <ImageUploader
            onImageReady={setImagemDataUrl}
            currentImage={imagemDataUrl}
          />
        </section>

        {/* Insumos */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
              Insumos
            </h2>
            <button
              onClick={addInsumo}
              disabled={insumos.length >= 30}
              className="text-xs text-[var(--color-accent-start)] hover:text-[var(--color-accent-end)] transition-colors font-medium"
            >
              + Adicionar
            </button>
          </div>

          <div className="space-y-2">
            {insumos.map((insumo) => (
              <InsumoRow
                key={insumo.id}
                insumo={insumo}
                onChange={(u) => updateInsumo(insumo.id, u)}
                onRemove={() => removeInsumo(insumo.id)}
                canRemove={insumos.length > 1}
              />
            ))}
          </div>
        </section>

        {/* Preview de margens */}
        {preco > 0 && (
          <section className="glass rounded-2xl p-5 space-y-3 animate-fade-in">
            <h2 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
              Prévia
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[var(--color-text-muted)]">Custo total</p>
                <p className="text-white font-semibold">{formatBRL(custo)}</p>
              </div>
              <div>
                <p className="text-[var(--color-text-muted)]">Lucro bruto</p>
                <p className="text-white font-semibold">{formatBRL(lucro)}</p>
              </div>
              <div>
                <p className="text-[var(--color-text-muted)]">Margem bruta</p>
                <p className="text-white font-semibold">{formatPercent(bruta)}</p>
              </div>
              <div>
                <p className="text-[var(--color-text-muted)]">Margem líquida</p>
                <p className="text-white font-semibold">
                  {formatPercent(liquida)}
                  <span className="text-xs text-[var(--color-text-muted)] ml-1">
                    sem rateio
                  </span>
                </p>
              </div>
              <div>
                <p className="text-[var(--color-text-muted)]">Tempo total</p>
                <p className="text-white font-semibold">{formatTempo(tempo)}</p>
              </div>
            </div>
          </section>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
