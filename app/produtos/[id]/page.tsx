"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useLocalDB } from "@/hooks/useLocalDB";
import { ImageUploader } from "@/components/ImageUploader";
import { InsumoRow } from "@/components/InsumoRow";
import { TempoTrabalhoCard } from "@/components/TempoTrabalhoCard";
import { EquipamentoRow } from "@/components/EquipamentoRow";
import { BottomNav } from "@/components/BottomNav";
import { sanitizeAndTrim } from "@/lib/sanitize";
import {
  custoTotalDireto, margemBruta, calcularPrecoSugerido, indicadorSugestao,
  tempoTotalMinutos, lucroBruto,
} from "@/lib/calculos";
import { formatBRL, formatPercent, formatTempo } from "@/lib/formatters";
import type { Insumo, UnidadeMedida, TipoProduto, EquipamentoEletrico, IndicadorSugestao } from "@/types";
import Link from "next/link";

const INDICADOR_COR: Record<IndicadorSugestao, string> = {
  verde: "text-[var(--color-success)]",
  amarelo: "text-[var(--color-warning)]",
  vermelho: "text-[var(--color-danger)]",
};

function novoInsumo(ordem: number): Insumo {
  return { id: crypto.randomUUID(), nome: "", quantidade: 1, unidade: "unidade" as UnidadeMedida, custoUnitario: 0, usaPacote: false, quantidadePacote: 0, valorPacote: 0, ordem };
}
function novoEquipamento(): EquipamentoEletrico {
  return { id: crypto.randomUUID(), nome: "", potenciaWatts: 0, tempoUsoMinutos: 0, custoKwh: 0.85 };
}

export default function EditarProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { db, updateProduto, deleteProduto, loaded } = useLocalDB();

  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<TipoProduto>("fisico");
  const [precoVenda, setPrecoVenda] = useState("");
  const [categoria, setCategoria] = useState("");
  const [imagemDataUrl, setImagemDataUrl] = useState("");
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [tempoMinutos, setTempoMinutos] = useState(0);
  const [equipamentos, setEquipamentos] = useState<EquipamentoEletrico[]>([]);

  useEffect(() => {
    if (!loaded) return;
    const p = db.produtos.find((x) => x.id === id && !x.deletedAt);
    if (!p) { router.push("/"); return; }
    setNome(p.nome); setTipo(p.tipo);
    setPrecoVenda(p.precoVenda ? String(p.precoVenda) : "");
    setCategoria(p.categoria || ""); setImagemDataUrl(p.imagemUrl || "");
    setInsumos(p.insumos.length > 0 ? p.insumos : [novoInsumo(0)]);
    setTempoMinutos(p.tempoTrabalho?.minutos ?? 0);
    setEquipamentos(p.equipamentos ?? []);
  }, [loaded, id, db.produtos, router]);

  const addInsumo = () => setInsumos((p) => [...p, novoInsumo(p.length)]);
  const removeInsumo = (iid: string) => setInsumos((p) => p.filter((i) => i.id !== iid));
  const updateInsumo = (iid: string, u: Partial<Insumo>) => setInsumos((p) => p.map((i) => (i.id === iid ? { ...i, ...u } : i)));
  const addEquipamento = () => setEquipamentos((p) => [...p, novoEquipamento()]);
  const removeEquipamento = (eid: string) => setEquipamentos((p) => p.filter((e) => e.id !== eid));
  const updateEquipamento = (eid: string, u: Partial<EquipamentoEletrico>) => setEquipamentos((p) => p.map((e) => (e.id === eid ? { ...e, ...u } : e)));

  const tempo = { minutos: tempoMinutos };
  const custo = custoTotalDireto(insumos, db.valorHora ?? undefined, tempo, equipamentos);
  const preco = Number(precoVenda) || null;
  const precoSugerido = calcularPrecoSugerido(custo);
  const indicador = indicadorSugestao(custo, precoSugerido);
  const totalMinutos = tempoTotalMinutos(tempo, equipamentos);

  const handleSave = () => {
    if (!nome.trim()) return;
    updateProduto(id, {
      nome: sanitizeAndTrim(nome), tipo,
      precoVenda: preco || null,
      precoSugerido: preco ? undefined : precoSugerido,
      indicadorSugestao: preco ? undefined : indicador,
      categoria: categoria ? sanitizeAndTrim(categoria, 50) : undefined,
      imagemUrl: imagemDataUrl || undefined,
      insumos: insumos.filter((i) => i.nome.trim()),
      tempoTrabalho: tempo,
      equipamentos: equipamentos.filter((e) => e.nome.trim()),
    });
    router.push("/");
  };

  const handleDelete = () => {
    if (!confirm("Excluir este produto?")) return;
    deleteProduto(id); router.push("/");
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
          <div className="flex gap-2">
            <button onClick={handleDelete} className="text-xs text-[var(--color-danger)] hover:underline px-2">Excluir</button>
            <button onClick={handleSave} className="gradient-bg text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90">Salvar</button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <section className="space-y-4">
          <div><label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Nome</label><input type="text" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl px-4 py-3 text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-active)]" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Tipo</label><div className="flex gap-2">{(["fisico", "servico"] as TipoProduto[]).map((t) => <button key={t} onClick={() => setTipo(t)} className={`flex-1 py-2.5 rounded-xl text-sm font-medium ${tipo === t ? "gradient-bg text-white" : "bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]"}`}>{t === "fisico" ? "Físico" : "Serviço"}</button>)}</div></div>
            <div><label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Preço <span className="text-[var(--color-text-muted)]">(opcional)</span></label><input type="number" inputMode="decimal" value={precoVenda} onChange={(e) => setPrecoVenda(e.target.value)} placeholder="Sugerir" className="w-full bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl px-4 py-3 text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-active)]" /></div>
          </div>
          <div><label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Categoria</label><input type="text" value={categoria} onChange={(e) => setCategoria(e.target.value)} className="w-full bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl px-4 py-3 text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-active)]" /></div>
        </section>

        <section><ImageUploader onImageReady={setImagemDataUrl} currentImage={imagemDataUrl} /></section>

        <section className="space-y-3">
          <div className="flex items-center justify-between"><h2 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Materiais</h2><button onClick={addInsumo} disabled={insumos.length >= 30} className="text-xs text-[var(--color-accent-start)] font-medium">+ Adicionar</button></div>
          <div className="space-y-2">{insumos.map((i) => <InsumoRow key={i.id} insumo={i} onChange={(u) => updateInsumo(i.id, u)} onRemove={() => removeInsumo(i.id)} canRemove={insumos.length > 1} />)}</div>
        </section>

        <section><TempoTrabalhoCard minutos={tempoMinutos} onChange={setTempoMinutos} /></section>

        <section className="space-y-3">
          <div className="flex items-center justify-between"><h2 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Equipamentos</h2><button onClick={addEquipamento} className="text-xs text-[var(--color-accent-start)] font-medium">+ Adicionar</button></div>
          <div className="space-y-2">{equipamentos.map((eq) => <EquipamentoRow key={eq.id} eq={eq} onChange={(u) => updateEquipamento(eq.id, u)} onRemove={() => removeEquipamento(eq.id)} canRemove={true} />)}</div>
        </section>

        {custo.gt(0) && (
          <section className="glass rounded-2xl p-5 space-y-3"><h2 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Prévia</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-[var(--color-text-muted)]">Custo total</p><p className="text-white font-semibold">{formatBRL(custo)}</p></div>
              <div><p className="text-[var(--color-text-muted)]">Tempo total</p><p className="text-white font-semibold">{formatTempo(totalMinutos)}</p></div>
              {preco ? (<><div><p className="text-[var(--color-text-muted)]">Lucro</p><p className="text-white font-semibold">{formatBRL(lucroBruto(preco, custo))}</p></div><div><p className="text-[var(--color-text-muted)]">Margem bruta</p><p className="text-white font-semibold">{formatPercent(margemBruta(preco, custo))}</p></div></>) : (
                <div className="col-span-2"><p className="text-[var(--color-text-muted)] text-xs">Preço sugerido</p><p className={`text-2xl font-bold ${INDICADOR_COR[indicador]}`}>{formatBRL(precoSugerido)}</p><p className={`text-xs ${INDICADOR_COR[indicador]}`}>{indicador === "verde" ? "🟢 Margem excelente" : indicador === "amarelo" ? "🟡 Margem razoável" : "🔴 Margem baixa"}</p></div>
              )}
            </div>
          </section>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
