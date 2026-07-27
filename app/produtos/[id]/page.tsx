"use client";

import { useState, useEffect, use } from "react";
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
import type { Insumo, UnidadeMedida, TipoProduto } from "@/types";
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

export default function EditarProdutoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { db, updateProduto, deleteProduto, loaded } = useLocalDB();

  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<TipoProduto>("fisico");
  const [precoVenda, setPrecoVenda] = useState("");
  const [categoria, setCategoria] = useState("");
  const [imagemDataUrl, setImagemDataUrl] = useState("");
  const [insumos, setInsumos] = useState<Insumo[]>([]);

  useEffect(() => {
    if (!loaded) return;
    const produto = db.produtos.find((p) => p.id === id && !p.deletedAt);
    if (!produto) {
      router.push("/");
      return;
    }
    setNome(produto.nome);
    setTipo(produto.tipo);
    setPrecoVenda(String(produto.precoVenda));
    setCategoria(produto.categoria || "");
    setImagemDataUrl(produto.imagemUrl || "");
    setInsumos(
      produto.insumos.length > 0 ? produto.insumos : [novoInsumo(0)]
    );
  }, [loaded, id, db.produtos, router]);

  const addInsumo = () =>
    setInsumos((prev) => [...prev, novoInsumo(prev.length)]);

  const removeInsumo = (insumoId: string) =>
    setInsumos((prev) => prev.filter((i) => i.id !== insumoId));

  const updateInsumo = (insumoId: string, updates: Partial<Insumo>) =>
    setInsumos((prev) =>
      prev.map((i) => (i.id === insumoId ? { ...i, ...updates } : i))
    );

  const preco = Number(precoVenda) || 0;
  const custo = custoTotalDireto(insumos, db.valorHora ?? undefined);
  const bruta = margemBruta(preco, insumos, db.valorHora ?? undefined);
  const { margem: liquida } = margemLiquida(preco, insumos, db.valorHora ?? undefined);
  const lucro = lucroBruto(preco, insumos, db.valorHora ?? undefined);
  const tempo = tempoTotal(insumos);

  const handleSave = () => {
    if (!nome.trim() || !precoVenda) return;
    updateProduto(id, {
      nome: sanitizeAndTrim(nome),
      tipo,
      precoVenda: Number(precoVenda),
      categoria: categoria ? sanitizeAndTrim(categoria, 50) : undefined,
      imagemUrl: imagemDataUrl || undefined,
      insumos: insumos.filter((i) => i.nome.trim()),
    });
    router.push("/");
  };

  const handleDelete = () => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    deleteProduto(id);
    router.push("/");
  };

  if (!loaded) return null;

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] pb-24">
      <header className="sticky top-0 z-10 bg-[var(--color-bg-primary)]/80 backdrop-blur-lg border-b border-[var(--color-border-subtle)]">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-[var(--color-text-secondary)] hover:text-white">←</Link>
            <h1 className="text-lg font-semibold">Editar Produto</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="text-xs text-[var(--color-danger)] hover:underline px-2"
            >
              Excluir
            </button>
            <button
              onClick={handleSave}
              className="gradient-bg text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90"
            >
              Salvar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <section className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Nome</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl px-4 py-3 text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-active)] transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Tipo</label>
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
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Preço</label>
              <input
                type="number"
                inputMode="decimal"
                value={precoVenda}
                onChange={(e) => setPrecoVenda(e.target.value)}
                className="w-full bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl px-4 py-3 text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-active)] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Categoria</label>
            <input
              type="text"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl px-4 py-3 text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-active)] transition-colors"
            />
          </div>
        </section>

        <section>
          <ImageUploader onImageReady={setImagemDataUrl} currentImage={imagemDataUrl} />
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Insumos</h2>
            <button onClick={addInsumo} disabled={insumos.length >= 30} className="text-xs text-[var(--color-accent-start)] font-medium">
              + Adicionar
            </button>
          </div>
          <div className="space-y-2">
            {insumos.map((i) => (
              <InsumoRow
                key={i.id}
                insumo={i}
                onChange={(u) => updateInsumo(i.id, u)}
                onRemove={() => removeInsumo(i.id)}
                canRemove={insumos.length > 1}
              />
            ))}
          </div>
        </section>

        {preco > 0 && (
          <section className="glass rounded-2xl p-5 space-y-3">
            <h2 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Prévia</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-[var(--color-text-muted)]">Custo total</p><p className="text-white font-semibold">{formatBRL(custo)}</p></div>
              <div><p className="text-[var(--color-text-muted)]">Lucro</p><p className="text-white font-semibold">{formatBRL(lucro)}</p></div>
              <div><p className="text-[var(--color-text-muted)]">Margem bruta</p><p className="text-white font-semibold">{formatPercent(bruta)}</p></div>
              <div><p className="text-[var(--color-text-muted)]">Margem líquida</p><p className="text-white font-semibold">{formatPercent(liquida)} <span className="text-xs text-[var(--color-text-muted)]">sem rateio</span></p></div>
              <div><p className="text-[var(--color-text-muted)]">Tempo</p><p className="text-white font-semibold">{formatTempo(tempo)}</p></div>
            </div>
          </section>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
