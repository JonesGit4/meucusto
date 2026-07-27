"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLocalDB } from "@/hooks/useLocalDB";
import { ImageUploader } from "@/components/ImageUploader";
import { InsumoRow } from "@/components/InsumoRow";
import { TempoTrabalhoCard } from "@/components/TempoTrabalhoCard";
import { EquipamentoRow } from "@/components/EquipamentoRow";
import { BottomNav } from "@/components/BottomNav";
import { sanitizeAndTrim } from "@/lib/sanitize";
import {
  custoInsumo, custoMaoDeObra, custoEquipamento,
  custoTotalDireto, margemBruta, calcularPrecoSugerido,
  indicadorSugestao, tempoTotalMinutos, lucroBruto,
} from "@/lib/calculos";
import { formatBRL, formatPercent, formatTempo } from "@/lib/formatters";
import type {
  Produto, Insumo, UnidadeMedida, TipoProduto,
  EquipamentoEletrico, IndicadorSugestao,
} from "@/types";
import Link from "next/link";

const INDICADOR_COR: Record<IndicadorSugestao, string> = {
  verde: "text-[var(--color-success)]",
  amarelo: "text-[var(--color-warning)]",
  vermelho: "text-[var(--color-danger)]",
};

function novoInsumo(ordem: number): Insumo {
  return {
    id: crypto.randomUUID(), nome: "",
    unidade: "unidade" as UnidadeMedida, valorPago: 0, ordem,
  };
}

function novoEquipamento(): EquipamentoEletrico {
  return { id: crypto.randomUUID(), nome: "", potenciaWatts: 0, tempoUsoMinutos: 0, custoKwh: 0.85 };
}

function insumoCompleto(i: Insumo): boolean {
  return i.nome.trim().length > 0 && i.valorPago > 0;
}

type Aba = "materiais" | "tempo" | "equipamentos";

export default function NovoProdutoPage() {
  const router = useRouter();
  const { db, addProduto } = useLocalDB();

  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<TipoProduto>("fisico");
  const [precoVenda, setPrecoVenda] = useState("");
  const [categoria, setCategoria] = useState("");
  const [imagemDataUrl, setImagemDataUrl] = useState("");
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [tempoMinutos, setTempoMinutos] = useState(0);
  const [equipamentos, setEquipamentos] = useState<EquipamentoEletrico[]>([]);
  const [aba, setAba] = useState<Aba>("materiais");
  const [saved, setSaved] = useState(false);

  const addInsumo = useCallback(() => {
    setInsumos((p) => {
      // Se já tem um vazio no topo, não adiciona outro
      if (p.length > 0 && !insumoCompleto(p[0])) return p;
      return [novoInsumo(0), ...p];
    });
  }, []);

  const removeInsumo = (id: string) => setInsumos((p) => p.filter((i) => i.id !== id));
  const updateInsumo = (id: string, u: Partial<Insumo>) =>
    setInsumos((p) => p.map((i) => (i.id === id ? { ...i, ...u } : i)));

  const addEquipamento = () => setEquipamentos((p) => [novoEquipamento(), ...p]);
  const removeEquipamento = (id: string) => setEquipamentos((p) => p.filter((e) => e.id !== id));
  const updateEquipamento = (id: string, u: Partial<EquipamentoEletrico>) =>
    setEquipamentos((p) => p.map((e) => (e.id === id ? { ...e, ...u } : e)));

  const tempo = { minutos: tempoMinutos };
  const custo = custoTotalDireto(insumos, db.valorHora ?? undefined, tempo, equipamentos);
  const preco = Number(precoVenda.replace(",", ".")) || null;
  const precoSugerido = calcularPrecoSugerido(custo);
  const indicador = indicadorSugestao(custo, precoSugerido);
  const totalMinutos = tempoTotalMinutos(tempo, equipamentos);

  const handleSave = () => {
    if (!nome.trim()) return;
    setSaved(true);
    const produto: Produto = {
      id: crypto.randomUUID(), nome: sanitizeAndTrim(nome), tipo,
      precoVenda: preco || null,
      precoSugerido: preco ? undefined : precoSugerido,
      indicadorSugestao: preco ? undefined : indicador,
      categoria: categoria ? sanitizeAndTrim(categoria, 50) : undefined,
      imagemUrl: imagemDataUrl || undefined,
      insumos: insumos.filter((i) => i.nome.trim()),
      tempoTrabalho: tempo,
      equipamentos: equipamentos.filter((e) => e.nome.trim()),
      cenarios: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addProduto(produto);
    router.push("/");
  };

  const ABAS: { key: Aba; label: string; count: number }[] = [
    { key: "materiais", label: "Materiais", count: insumos.filter(i => i.nome.trim()).length },
    { key: "tempo", label: "Tempo", count: tempoMinutos > 0 ? 1 : 0 },
    { key: "equipamentos", label: "Equipamentos", count: equipamentos.filter(e => e.nome.trim()).length },
  ];

  const temDados = insumos.some(i => insumoCompleto(i)) || equipamentos.some(e => e.nome.trim()) || tempoMinutos > 0;

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] pb-24">
      <header className="sticky top-0 z-10 bg-[var(--color-bg-primary)]/80 backdrop-blur-lg border-b border-[var(--color-border-subtle)]">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-[var(--color-text-secondary)] hover:text-white">←</Link>
            <h1 className="text-lg font-semibold">{saved ? "✅ Salvo" : "Novo Produto"}</h1>
          </div>
          <button onClick={handleSave} disabled={!nome.trim()} className="gradient-bg text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-40 hover:opacity-90">Salvar</button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Bloqueio: sem Valor Hora */}
        {!db.valorHora && !saved && (
          <div className="glass rounded-2xl p-5 text-center space-y-3 border border-[var(--color-warning)]/30">
            <p className="text-[var(--color-warning)] font-medium">⚡ Configure seu Valor Hora primeiro</p>
            <p className="text-sm text-[var(--color-text-muted)]">É necessário para calcular a mão de obra</p>
            <Link href="/valor-hora" className="gradient-bg text-white px-5 py-2 rounded-xl text-sm font-medium inline-block hover:opacity-90">
              Configurar Agora
            </Link>
          </div>
        )}

        {/* Dados básicos */}
        <section className="space-y-4">
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            readOnly={saved}
            placeholder="Nome do produto *"
            className={`w-full bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl px-4 py-3 text-lg font-semibold text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-active)] ${saved ? "opacity-60" : ""}`}
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Tipo *</label>
              <div className="flex gap-2">
                {(["fisico", "servico"] as TipoProduto[]).map((t) => (
                  <button key={t} onClick={() => !saved && setTipo(t)} disabled={saved}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium ${tipo === t ? "gradient-bg text-white" : "bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]"} ${saved ? "opacity-60 cursor-default" : ""}`}>
                    {t === "fisico" ? "Físico" : "Serviço"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Preço <span className="text-[var(--color-text-muted)]">(opcional)</span></label>
              <input type="text" inputMode="decimal"
                value={precoVenda}
                onChange={(e) => { if (saved) return; setPrecoVenda(e.target.value); }}
                readOnly={saved}
                placeholder="Sugestão automática"
                className={`w-full bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl px-4 py-3 text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-active)] ${saved ? "opacity-60" : ""}`} />
            </div>
          </div>
          <input type="text" value={categoria} onChange={(e) => !saved && setCategoria(e.target.value)} readOnly={saved} placeholder="Categoria (opcional)"
            className={`w-full bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl px-4 py-3 text-sm text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-active)] ${saved ? "opacity-60" : ""}`} />
        </section>

        {/* ═══ PRÉVIA NO TOPO (abaixo do nome) ═══ */}
        {temDados && (
          <section className="glass rounded-2xl p-5 space-y-3 animate-fade-in border border-[var(--color-border-subtle)]">
            <h2 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">📋 Resumo do Custo</h2>

            {insumos.filter(i => insumoCompleto(i)).length > 0 && (
              <div>
                <p className="text-xs text-[var(--color-text-muted)] mb-2 font-medium">📦 Materiais</p>
                <div className="space-y-1">
                  {insumos.filter(i => insumoCompleto(i)).map((i) => {
                    const ci = custoInsumo(i);
                    return (
                      <div key={i.id} className="flex justify-between text-sm">
                        <span className="text-[var(--color-text-secondary)] truncate mr-2">{i.nome}</span>
                        <span className="text-white font-medium whitespace-nowrap">{formatBRL(ci)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Mão de obra — sempre visível se houver tempo */}
            {tempoMinutos > 0 && (
              <div>
                <p className="text-xs text-[var(--color-text-muted)] mb-2 font-medium">👷 Mão de obra</p>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-text-secondary)]">{formatTempo(tempoMinutos)}</span>
                  {db.valorHora ? (
                    <span className="text-white font-medium">{formatBRL(custoMaoDeObra(tempo, db.valorHora))}</span>
                  ) : (
                    <span className="text-[var(--color-text-muted)] text-xs">Configure o Valor Hora</span>
                  )}
                </div>
              </div>
            )}

            {equipamentos.filter(e => e.nome.trim()).length > 0 && (
              <div>
                <p className="text-xs text-[var(--color-text-muted)] mb-2 font-medium">⚡ Equipamentos</p>
                <div className="space-y-1">
                  {equipamentos.filter(e => e.nome.trim()).map((eq) => {
                    const ce = custoEquipamento(eq);
                    return (
                      <div key={eq.id} className="flex justify-between text-sm">
                        <span className="text-[var(--color-text-secondary)] truncate mr-2">{eq.nome}</span>
                        <span className="text-white font-medium whitespace-nowrap">{formatBRL(ce)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="border-t border-[var(--color-border-subtle)]" />
            <div className="flex justify-between">
              <span className="text-sm font-medium text-white">Custo total</span>
              <span className="text-sm font-bold text-white">{formatBRL(custo)}</span>
            </div>
            <div className="flex justify-between text-xs text-[var(--color-text-muted)]">
              <span>Tempo total</span>
              <span>{formatTempo(totalMinutos)}</span>
            </div>

            <div className="border-t border-[var(--color-border-subtle)] pt-3">
              {preco ? (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-[var(--color-text-muted)]">Lucro</p><p className="text-white font-semibold">{formatBRL(lucroBruto(preco, custo))}</p></div>
                  <div><p className="text-[var(--color-text-muted)]">Margem bruta</p><p className="text-white font-semibold">{formatPercent(margemBruta(preco, custo))}</p></div>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-[var(--color-text-muted)]">Preço sugerido (markup 50%)</p>
                  <p className={`text-xl font-bold ${INDICADOR_COR[indicador]}`}>{formatBRL(precoSugerido)}</p>
                  <p className={`text-xs ${INDICADOR_COR[indicador]}`}>
                    {indicador === "verde" ? "🟢 Margem excelente" : indicador === "amarelo" ? "🟡 Margem razoável" : "🔴 Margem baixa — revisar"}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Imagem */}
        {!saved && <section><ImageUploader onImageReady={setImagemDataUrl} currentImage={imagemDataUrl} /></section>}

        {/* ═══ ABAS ═══ */}
        {!saved && (
          <div className="flex gap-1 bg-[var(--color-bg-card)] rounded-xl p-1">
            {ABAS.map(({ key, label, count }) => (
              <button key={key} onClick={() => setAba(key)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors relative ${
                  aba === key ? "gradient-bg text-white" : "text-[var(--color-text-muted)] hover:text-white"
                }`}>
                {label}
                {count > 0 && <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${aba === key ? "bg-white/20" : "bg-[var(--color-border-subtle)]"}`}>{count}</span>}
              </button>
            ))}
          </div>
        )}

        {/* Conteúdo da aba (modo edição) */}
        {!saved && aba === "materiais" && (
          <section className="space-y-2">
            <button onClick={addInsumo} disabled={insumos.length >= 30}
              className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-[var(--color-border-subtle)] rounded-xl py-3 text-sm text-[var(--color-text-secondary)] hover:border-[var(--color-accent-start)] hover:text-[var(--color-accent-start)] transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" strokeLinecap="round"/></svg>
              Adicionar material
            </button>
            {insumos.length === 0 && (
              <p className="text-sm text-[var(--color-text-muted)] text-center py-4">Nenhum material adicionado</p>
            )}
            {insumos.map((i) => (
              <InsumoRow key={i.id} insumo={i} onChange={(u) => updateInsumo(i.id, u)}
                onRemove={() => removeInsumo(i.id)} canRemove={true}
                readonly={false} />
            ))}
          </section>
        )}

        {!saved && aba === "tempo" && (
          <section><TempoTrabalhoCard minutos={tempoMinutos} onChange={setTempoMinutos} readonly={saved} /></section>
        )}

        {!saved && aba === "equipamentos" && (
          <section className="space-y-2">
            {equipamentos.length === 0 && (
              <p className="text-sm text-[var(--color-text-muted)] text-center py-8">Nenhum equipamento. Clique + para adicionar.</p>
            )}
            {equipamentos.map((eq) => (
              <EquipamentoRow key={eq.id} eq={eq} onChange={(u) => updateEquipamento(eq.id, u)}
                onRemove={() => removeEquipamento(eq.id)} canRemove={true} readonly={saved} />
            ))}
          </section>
        )}

        {/* Modo salvo: cards readonly com barra verde */}
        {saved && (
          <section className="space-y-4">
            {insumos.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">Materiais</h3>
                <div className="space-y-2">
                  {insumos.map((i) => (
                    <InsumoRow key={i.id} insumo={i} onChange={() => {}} onRemove={() => {}} canRemove={false} readonly={true} />
                  ))}
                </div>
              </div>
            )}
            {tempoMinutos > 0 && (
              <div>
                <h3 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">Tempo</h3>
                <TempoTrabalhoCard minutos={tempoMinutos} onChange={() => {}} readonly={true} />
              </div>
            )}
            {equipamentos.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">Equipamentos</h3>
                <div className="space-y-2">
                  {equipamentos.map((eq) => (
                    <EquipamentoRow key={eq.id} eq={eq} onChange={() => {}} onRemove={() => {}} canRemove={false} readonly={true} />
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Botão flutuante */}
        {!saved && aba !== "tempo" && (
          <div className="fixed bottom-20 right-4 z-40 md:bottom-6">
            <button
              onClick={() => aba === "materiais" ? addInsumo() : addEquipamento()}
              className="w-14 h-14 rounded-full gradient-bg text-white shadow-lg flex items-center justify-center hover:opacity-90 transition-all active:scale-95"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
