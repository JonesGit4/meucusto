// ═══════════════════════════════════════
// Meu Custo — useLocalDB (localStorage versionado)
// ═══════════════════════════════════════

"use client";

import { useState, useCallback, useEffect } from "react";
import type { LocalDB, Produto, ValorHora } from "@/types";

const STORAGE_KEY = "meucusto_db";
const CURRENT_VERSION = 1;

function getInitialState(): LocalDB {
  return {
    versao: CURRENT_VERSION,
    valorHora: null,
    produtos: [],
  };
}

function readDB(): LocalDB {
  if (typeof window === "undefined") return getInitialState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getInitialState();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return getInitialState();
    // Migração futura: migrateLocalDB(parsed.versao, CURRENT_VERSION, parsed)
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
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.error("[MeuCusto] localStorage quota excedida:", e);
    // TODO: Sentry captureException
  }
}

export function useLocalDB() {
  const [db, setDb] = useState<LocalDB>(getInitialState);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setDb(readDB());
    setLoaded(true);
  }, []);

  const persist = useCallback((newDb: LocalDB) => {
    setDb(newDb);
    writeDB(newDb);
  }, []);

  // ─── Valor Hora ──────────────────────

  const saveValorHora = useCallback(
    (vh: ValorHora) => {
      setDb((prev) => {
        const next = { ...prev, valorHora: vh };
        writeDB(next);
        return next;
      });
    },
    []
  );

  // ─── Produtos CRUD ───────────────────

  const addProduto = useCallback(
    (produto: Produto) => {
      setDb((prev) => {
        const next = { ...prev, produtos: [...prev.produtos, produto] };
        writeDB(next);
        return next;
      });
    },
    []
  );

  const updateProduto = useCallback(
    (id: string, updates: Partial<Produto>) => {
      setDb((prev) => {
        const next = {
          ...prev,
          produtos: prev.produtos.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          ),
        };
        writeDB(next);
        return next;
      });
    },
    []
  );

  const deleteProduto = useCallback(
    (id: string) => {
      setDb((prev) => {
        const next = {
          ...prev,
          produtos: prev.produtos.map((p) =>
            p.id === id
              ? { ...p, deletedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
              : p
          ),
        };
        writeDB(next);
        return next;
      });
    },
    []
  );

  const getProduto = useCallback(
    (id: string) => db.produtos.find((p) => p.id === id && !p.deletedAt),
    [db.produtos]
  );

  const listProdutos = useCallback(
    () => db.produtos.filter((p) => !p.deletedAt),
    [db.produtos]
  );

  return {
    db,
    loaded,
    saveValorHora,
    addProduto,
    updateProduto,
    deleteProduto,
    getProduto,
    listProdutos,
    persist,
  };
}
