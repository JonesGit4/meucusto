// ═══════════════════════════════════════
// Meu Custo — Backup (export JSON)
// ═══════════════════════════════════════

import type { LocalDB } from "@/types";

/** Exporta dados locais como arquivo JSON para download */
export function exportBackup(data: LocalDB): void {
  const backup = {
    app: "meucusto",
    versao: data.versao,
    dataExportacao: new Date().toISOString(),
    valorHora: data.valorHora,
    produtos: data.produtos.map((p) => ({
      ...p,
      deletado: !!p.deletedAt,
    })),
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `meucusto-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
