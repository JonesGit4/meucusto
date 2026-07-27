"use client";

import { useLocalDB } from "@/hooks/useLocalDB";
import { useState, useEffect } from "react";
import { calcularValorHora } from "@/lib/calculos";
import { formatBRL } from "@/lib/formatters";
import { BottomNav } from "@/components/BottomNav";
import Link from "next/link";
import type { ValorHora } from "@/types";

export default function ValorHoraPage() {
  const { db, saveValorHora, loaded } = useLocalDB();

  const [salario, setSalario] = useState("");
  const [custoCnpj, setCustoCnpj] = useState("");
  const [taxasFixas, setTaxasFixas] = useState("");
  const [horasMes, setHorasMes] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (db.valorHora) {
      setSalario(String(db.valorHora.salario));
      setCustoCnpj(String(db.valorHora.custoCnpj));
      setTaxasFixas(String(db.valorHora.taxasFixas));
      setHorasMes(String(db.valorHora.horasMes));
      setSaved(true);
    }
  }, [db.valorHora]);

  const vh: ValorHora | null =
    salario && horasMes
      ? { salario: Number(salario) || 0, custoCnpj: Number(custoCnpj) || 0, taxasFixas: Number(taxasFixas) || 0, horasMes: Number(horasMes) || 1 }
      : null;

  const valorHoraCalculado = vh ? calcularValorHora(vh) : null;

  const handleSave = () => {
    if (!vh || vh.salario <= 0 || vh.horasMes <= 0) return;
    saveValorHora(vh);
    setSaved(true);
  };

  const allFilled = salario && horasMes && Number(salario) > 0 && Number(horasMes) > 0;
  const hasChanged = !db.valorHora ||
    db.valorHora.salario !== Number(salario) ||
    db.valorHora.custoCnpj !== Number(custoCnpj) ||
    db.valorHora.taxasFixas !== Number(taxasFixas) ||
    db.valorHora.horasMes !== Number(horasMes);

  // Autosave com debounce
  useEffect(() => {
    if (allFilled && hasChanged) {
      const timer = setTimeout(handleSave, 500);
      return () => clearTimeout(timer);
    }
  }, [salario, custoCnpj, taxasFixas, horasMes]);

  if (!loaded) return null;

  const inputClass = "w-full bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl px-4 py-3 text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-active)] transition-colors";

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] pb-24">
      <header className="sticky top-0 z-10 bg-[var(--color-bg-primary)]/80 backdrop-blur-lg border-b border-[var(--color-border-subtle)]">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="text-[var(--color-text-secondary)] hover:text-white transition-colors">←</Link>
          <h1 className="text-lg font-semibold">Valor Hora</h1>
          {saved && <span className="text-xs text-[var(--color-success)] ml-auto flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Salvo
          </span>}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Resultado */}
        <div className="glass rounded-2xl p-6 text-center">
          <p className="text-sm text-[var(--color-text-muted)] mb-1">Seu valor/hora</p>
          <p className="text-4xl font-bold gradient-text">
            {valorHoraCalculado ? formatBRL(valorHoraCalculado) : "R$ —"}
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-2">
            {saved ? "✅ Salvo automaticamente" : "Preencha os campos abaixo"}
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Salário líquido desejado *</label>
            <input type="text" inputMode="decimal" value={salario}
              onChange={(e) => { setSalario(e.target.value); setSaved(false); }}
              placeholder="Exemplo 5000"
              className={inputClass} />
            <p className="text-xs text-[var(--color-text-muted)] mt-1">Quanto você quer ganhar por mês</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Custo CNPJ/MEI mensal</label>
            <input type="text" inputMode="decimal" value={custoCnpj}
              onChange={(e) => { setCustoCnpj(e.target.value); setSaved(false); }}
              placeholder="Exemplo 200"
              className={inputClass} />
            <p className="text-xs text-[var(--color-text-muted)] mt-1">Contador, mensalidade MEI, taxas</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Taxas fixas mensais</label>
            <input type="text" inputMode="decimal" value={taxasFixas}
              onChange={(e) => { setTaxasFixas(e.target.value); setSaved(false); }}
              placeholder="Exemplo 800"
              className={inputClass} />
            <p className="text-xs text-[var(--color-text-muted)] mt-1">Aluguel, energia, internet, software</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Horas trabalhadas por mês *</label>
            <input type="text" inputMode="numeric" value={horasMes}
              onChange={(e) => { setHorasMes(e.target.value); setSaved(false); }}
              placeholder="Exemplo 160"
              className={inputClass} />
            <p className="text-xs text-[var(--color-text-muted)] mt-1">Ex: 160h (40h/semana)</p>
          </div>
        </div>

        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl p-4">
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
            💡 O Valor Hora é <strong className="text-white">obrigatório</strong> para criar produtos. Configure uma vez e use em todos os cálculos de mão de obra.
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
