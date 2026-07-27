// ═══════════════════════════════════════
// Meu Custo — Migração de Schema
// ═══════════════════════════════════════

import type { LocalDB } from "@/types";

/**
 * Migra dados entre versões de schema.
 * Adicionar novas transformações aqui quando o schema evoluir.
 */
export function migrateLocalDB(from: number, to: number, data: Partial<LocalDB>): LocalDB {
  let current = { ...data } as LocalDB;

  // v0 → v1: normalizar nomes de campos
  if (from < 1 && to >= 1) {
    current.versao = 1;
    if (!current.produtos) current.produtos = [];
    // Garantir que todos os produtos tenham campos obrigatórios
    current.produtos = current.produtos.map((p) => ({
      ...p,
      tipo: p.tipo || "fisico",
      insumos: p.insumos || [],
      cenarios: p.cenarios || [],
      createdAt: p.createdAt || new Date().toISOString(),
      updatedAt: p.updatedAt || new Date().toISOString(),
    }));
  }

  // v1 → v2: placeholder para futuras migrações
  // if (from < 2 && to >= 2) { ... }

  return {
    versao: to,
    valorHora: current.valorHora || null,
    produtos: current.produtos || [],
  };
}
