// ═══════════════════════════════════════
// Meu Custo — Sync localStorage → Supabase
// ═══════════════════════════════════════

import { supabase } from "./supabase";
import type { LocalDB } from "@/types";

export async function syncToSupabase(db: LocalDB): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return false;

  const userId = session.user.id;

  try {
    // Sync valor_hora
    if (db.valorHora) {
      await supabase.from("valor_hora").upsert({
        user_id: userId,
        salario: db.valorHora.salario,
        custo_cnpj: db.valorHora.custoCnpj,
        taxas_fixas: db.valorHora.taxasFixas,
        horas_mes: db.valorHora.horasMes,
        updated_at: new Date().toISOString(),
      });
    }

    // Sync produtos
    for (const p of db.produtos.filter((p) => !p.deletedAt)) {
      await supabase.from("produtos").upsert({
        id: p.id,
        user_id: userId,
        nome: p.nome,
        tipo: p.tipo,
        preco_venda: p.precoVenda,
        categoria: p.categoria,
        imagem_url: p.imagemUrl,
        insumos: p.insumos,
        tempo_trabalho: p.tempoTrabalho,
        equipamentos: p.equipamentos,
        cenarios: p.cenarios,
        updated_at: new Date().toISOString(),
      });
    }

    // Limpar localStorage após sync bem-sucedido
    localStorage.removeItem("meucusto_db");
    return true;
  } catch (e) {
    console.error("Sync failed:", e);
    return false;
  }
}

export async function loadFromSupabase(): Promise<LocalDB | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const userId = session.user.id;

  try {
    // Load valor_hora
    const { data: vh } = await supabase
      .from("valor_hora")
      .select("*")
      .eq("user_id", userId)
      .single();

    // Load produtos
    const { data: produtos } = await supabase
      .from("produtos")
      .select("*")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    return {
      versao: 1,
      valorHora: vh
        ? { salario: vh.salario, custoCnpj: vh.custo_cnpj, taxasFixas: vh.taxas_fixas, horasMes: vh.horas_mes }
        : null,
      produtos: (produtos || []).map((p) => ({
        id: p.id,
        nome: p.nome,
        tipo: p.tipo,
        precoVenda: p.preco_venda,
        categoria: p.categoria,
        imagemUrl: p.imagem_url,
        insumos: p.insumos || [],
        tempoTrabalho: p.tempo_trabalho || { minutos: 0 },
        equipamentos: p.equipamentos || [],
        cenarios: p.cenarios || [],
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      })),
    };
  } catch (e) {
    console.error("Load failed:", e);
    return null;
  }
}
