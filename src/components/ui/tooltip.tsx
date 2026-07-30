// Tooltip leve em CSS puro (sem libs novas).
// Aparece no hover e no foco de teclado; leitores de tela recebem via aria-label.

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface TooltipProps {
  /** Texto exibido na dica. */
  label: string;
  /** Elemento que recebe a dica (botão, ícone, badge...). */
  children: ReactNode;
  /** Posição da dica em relação ao elemento. Padrão: topo. */
  side?: "top" | "bottom";
  className?: string;
}

export function Tooltip({
  label,
  children,
  side = "top",
  className,
}: TooltipProps) {
  const position =
    side === "top"
      ? "bottom-full left-1/2 -translate-x-1/2 mb-2"
      : "top-full left-1/2 -translate-x-1/2 mt-2";

  return (
    <span
      className={cn("group relative inline-flex", className)}
      aria-label={label}
    >
      {children}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute z-50 whitespace-nowrap rounded-lg border border-white/10 bg-gray-900/95 px-2.5 py-1.5 text-xs font-medium text-white/90 shadow-xl backdrop-blur-md",
          "opacity-0 transition-all duration-200",
          "group-hover:opacity-100 group-focus-within:opacity-100",
          side === "top" ? "translate-y-1 group-hover:translate-y-0 group-focus-within:translate-y-0" : "-translate-y-1 group-hover:translate-y-0 group-focus-within:translate-y-0",
          position
        )}
      >
        {label}
      </span>
    </span>
  );
}