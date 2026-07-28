"use client";

import { useState, useCallback, useEffect } from "react";
import type { LocalDB, Produto, ValorHora } from "@/types";
import { getSupabase } from "@/lib/supabase";

const STORAGE_KEY = "meucusto_db";
const CURRENT_VERSION = 1;

function getInitialState(): LocalDB {
  return { versao: CURRENT_VERSION, valorHora: null, produtos: [] };
}

function readDB(): LocalDB {
  if (typeof window === "undefined") return getInitialState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getInitialState();
    const parsed = JSON.parse(raw);
    return {
      versao: CURRENT_VERSION,
      valorHora: parsed.valorHora || null,
      produtos: parsed.produtos || [],
    };
  } catch {
    return getInitialState();
  }
}

function writeDB(db: LocalDB): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(db)); } catch {}
}

export function useLocalDB() {
  const [db, setDb] = useState<LocalDB>(getInitialState);
  const [loaded, setLoaded] = useState(false);
  const [isCloud, setIsCloud] = useState(false);

  // Inicializar
  useEffect(() => {
    const local = readDB();
    setDb(local);
    setLoaded(true);

    // Se logado, carregar da nuvem
    getSupabase().auth.getSession().then(async ({ data }) => {
      if (data.session?.user) {
        setIsCloud(true);
        const remote = await loadFromCloud(data.session.user.id);
        if (remote) {
          // Merge: nuvem ganha se tiver mais produtos, senão mantém local
          if (remote.produtos.length > 0 && local.produtos.length === 0) {
            setDb(remote);
            writeDB(remote);
          } else if (local.produtos.length > 0) {
            // Sobe local pra nuvem
            await syncToCloud(data.session.user.id, local);
          }
        }
      }
    });

    // Escutar mudanças de auth
    const { data: { subscription } } = getSupabase().auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setIsCloud(true);
        const local = readDB();
        if (local.produtos.length > 0) {
          const ok = await syncToCloud(session.user.id, local);
          if (ok) {
            // Não limpa localStorage pra não perder dados — só marca como sincronizado
          }
        } else {
          // Carregar da nuvem
          const remote = await loadFromCloud(session.user.id);
          if (remote) { setDb(remote); writeDB(remote); }
        }
      } else if (event === "SIGNED_OUT") {
        setIsCloud(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const persist = useCallback((newDb: LocalDB) => {
    setDb(newDb);
    writeDB(newDb);
    // Sync pra nuvem se logado
    getSupabase().auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        syncToCloud(data.session.user.id, newDb);
      }
    });
  }, []);

  const saveValorHora = useCallback((vh: ValorHora) => {
    setDb((prev) => { const next = { ...prev, valorHora: vh }; writeDB(next); return next; });
  }, []);

  const addProduto = useCallback((produto: Produto) => {
    setDb((prev) => {
      const next = { ...prev, produtos: [...prev.produtos, produto] };
      writeDB(next);
      getSupabase().auth.getSession().then(({ data }) => {
        if (data.session?.user) syncToCloud(data.session.user.id, next);
      });
      return next;
    });
  }, []);

  const updateProduto = useCallback((id: string, updates: Partial<Produto>) => {
    setDb((prev) => {
      const next = { ...prev, produtos: prev.produtos.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p) };
      writeDB(next);
      getSupabase().auth.getSession().then(({ data }) => {
        if (data.session?.user) syncToCloud(data.session.user.id, next);
      });
      return next;
    });
  }, []);

  const deleteProduto = useCallback((id: string) => {
    setDb((prev) => {
      const next = { ...prev, produtos: prev.produtos.map((p) =>
        p.id === id ? { ...p, deletedAt: new Date().toISOString(), updatedAt: new Date().toISOString() } : p) };
      writeDB(next);
      getSupabase().auth.getSession().then(({ data }) => {
        if (data.session?.user) syncToCloud(data.session.user.id, next);
      });
      return next;
    });
  }, []);

  const getProduto = useCallback((id: string) =>
    db.produtos.find((p) => p.id === id && !p.deletedAt), [db.produtos]);
  const listProdutos = useCallback(() =>
    db.produtos.filter((p) => !p.deletedAt), [db.produtos]);

  return { db, loaded, isCloud, saveValorHora, addProduto, updateProduto, deleteProduto, getProduto, listProdutos, persist };
}

// ═══ Sync helpers ═══

async function syncToCloud(userId: string, db: LocalDB): Promise<boolean> {
  try {
    const sb = getSupabase() as any;
    if (db.valorHora) {
      await sb.from("valor_hora").upsert({
        user_id: userId, salario: db.valorHora.salario, custo_cnpj: db.valorHora.custoCnpj,
        taxas_fixas: db.valorHora.taxasFixas, horas_mes: db.valorHora.horasMes, updated_at: new Date().toISOString(),
      });
    }
    for (const p of db.produtos.filter((p) => !p.deletedAt)) {
      await sb.from("produtos").upsert({
        id: p.id, user_id: userId, nome: p.nome, tipo: p.tipo, preco_venda: p.precoVenda,
        categoria: p.categoria, imagem_url: p.imagemUrl, insumos: p.insumos,
        tempo_trabalho: p.tempoTrabalho, equipamentos: p.equipamentos, cenarios: p.cenarios,
        updated_at: new Date().toISOString(),
      });
    }
    return true;
  } catch (e) {
    console.error("Sync failed:", e);
    return false;
  }
}

async function loadFromCloud(userId: string): Promise<LocalDB | null> {
  try {
    const sb = getSupabase() as any;
    const { data: vh } = await sb.from("valor_hora").select("*").eq("user_id", userId).single();
    const { data: produtos } = await sb.from("produtos").select("*").eq("user_id", userId).is("deleted_at", null).order("created_at", { ascending: false });
    return {
      versao: 1,
      valorHora: vh ? { salario: vh.salario, custoCnpj: vh.custo_cnpj, taxasFixas: vh.taxas_fixas, horasMes: vh.horas_mes } : null,
      produtos: (produtos || []).map((p) => ({
        id: p.id, nome: p.nome, tipo: p.tipo, precoVenda: p.preco_venda, categoria: p.categoria,
        imagemUrl: p.imagem_url, insumos: p.insumos || [], tempoTrabalho: p.tempo_trabalho || { minutos: 0 },
        equipamentos: p.equipamentos || [], cenarios: p.cenarios || [],
        createdAt: p.created_at, updatedAt: p.updated_at,
      })),
    };
  } catch { return null; }
}
