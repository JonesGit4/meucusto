"use client";

import { useMemo } from "react";

const PASTEL_COLORS = [
  ["#818cf8", "#a78bfa"], // indigo → violet
  ["#34d399", "#6ee7b7"], // emerald → green
  ["#f472b6", "#f9a8d4"], // pink
  ["#fb923c", "#fbbf24"], // orange → amber
  ["#38bdf8", "#7dd3fc"], // sky blue
  ["#a3e635", "#bef264"], // lime
];

export function ProdutoImage({
  imagemUrl,
  nome,
  size = "card",
}: {
  imagemUrl?: string;
  nome: string;
  size?: "card" | "full";
}) {
  const colorIndex = useMemo(
    () => Math.abs(hashString(nome)) % PASTEL_COLORS.length,
    [nome]
  );
  const [start, end] = PASTEL_COLORS[colorIndex];

  if (imagemUrl) {
    return (
      <img
        src={imagemUrl}
        alt={nome}
        className={`${
          size === "card" ? "w-full h-full" : "w-full max-h-64"
        } object-cover`}
        loading="lazy"
      />
    );
  }

  // Ícone padrão SVG com gradiente circular
  const initial = nome.charAt(0).toUpperCase();

  return (
    <div
      className={`${
        size === "card"
          ? "w-full h-full"
          : "w-full h-48"
      } flex items-center justify-center`}
      style={{
        background: `linear-gradient(135deg, ${start}15, ${end}15)`,
      }}
    >
      <svg
        width={size === "card" ? 56 : 80}
        height={size === "card" ? 56 : 80}
        viewBox="0 0 100 100"
      >
        <defs>
          <linearGradient id={`grad-${nome.slice(0, 3)}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={start} stopOpacity="0.3" />
            <stop offset="100%" stopColor={end} stopOpacity="0.5" />
          </linearGradient>
        </defs>
        <circle
          cx="50"
          cy="50"
          r="48"
          fill={`url(#grad-${nome.slice(0, 3)})`}
          stroke={start}
          strokeWidth="1.5"
          opacity="0.8"
        />
        <text
          x="50"
          y="50"
          textAnchor="middle"
          dominantBaseline="central"
          fill={start}
          fontSize="32"
          fontWeight="600"
          fontFamily="Inter, system-ui, sans-serif"
        >
          {initial}
        </text>
      </svg>
    </div>
  );
}

/** Hash simples para consistência de cor por nome */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
