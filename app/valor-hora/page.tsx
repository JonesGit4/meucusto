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
  const [horasMes, setHorasMes] = useState("160");

  useEffect(() => {
    if (db.valorHora) {
      setSalario(String(db.valorHora.salario));
      setCustoCnpj(String(db.valorHora.custoCnpj));
      setTaxasFixas(String(db.valorHora.taxasFixas));
      setHorasMes(String(db.valorHora.horasMes));
    }
  }, [db.valorHora]);

  const vh: ValorHora | null =
    salario && horasMes
      ? {
          salario: Number(salario) || 0,
          custoCnpj: Number(custoCnpj) || 0,
          taxasFixas: Number(taxasFixas) || 0,
          horasMes: Number(horasMes) || 1,
        }
      : null;

  const valorHoraCalculado = vh ? calcularValorHora(vh) : null;

  const handleSave = () => {
    if (!vh || vh.salario <= 0 || vh.horasMes <= 0) return;
    saveValorHora(vh);
  };

  const allFilled = salario && horasMes && Number(salario) > 0 && Number(horasMes) > 0;
  const hasChanged =
    !db.valorHora ||
    db.valorHora.salario !== Number(salario) ||
    db.valorHora.custoCnpj !== Number(custoCnpj) ||
    db.valorHora.taxasFixas !== Number(taxasFixas) ||
    db.valorHora.horasMes !== Number(horasMes);

  useEffect(() => {
    if (allFilled && hasChanged) {
      const timer = setTimeout(handleSave, 500);
      return () => clearTimeout(timer);
    }
  }, [salario, custoCnpj, taxasFixas, horasMes]);

  if (!loaded) return null;

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] pb-24">
      <header className="sticky top-0 z-10 bg-[var(--color-bg-primary)]/80 backdrop-blur-lg border-b border-[var(--color-border-subtle)]">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="text-[var(--color-text-secondary)] hover:text-white transition-colors">
            ←
          </Link>
          <h1 className="text-lg font-semibold">Valor Hora</h1>
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
            {db.valorHora ? "Salvo automaticamente" : "Preencha os campos abaixo"}
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <Field
            label="Salário líquido desejado"
            value={salario}
            onChange={setSalario}
            placeholder="R$ 5.000"
            hint="Quanto você quer ganhar por mês"
          />
          <Field
            label="Custo CNPJ/MEI mensal"
            value={custoCnpj}
            onChange={setCustoCnpj}
            placeholder="R$ 200"
            hint="Contador, mensalidade MEI, taxas"
          />
          <Field
            label="Taxas fixas mensais"
            value={taxasFixas}
            onChange={setTaxasFixas}
            placeholder="R$ 800"
            hint="Aluguel, energia, internet, software"
          />
          <Field
            label="Horas trabalhadas por mês"
            value={horasMes}
            onChange={setHorasMes}
            placeholder="160"
            hint="Ex: 160h (40h/semana)"
          />
        </div>

        {/* Info */}
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl p-4">
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
            💡 O Valor Hora é usado automaticamente nos cálculos de mão de obra dos seus
            produtos. Configure uma vez e use em todos.
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  hint: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
        {label}
      </label>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl px-4 py-3 text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-active)] transition-colors"
      />
      <p className="text-xs text-[var(--color-text-muted)] mt-1">{hint}</p>
    </div>
  );
}
