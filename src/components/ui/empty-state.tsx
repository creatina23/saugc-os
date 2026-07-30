// EmptyState — o "estado vazio" oficial da AnuncIA.
// Toda lista/tabela/painel sem dados mostra isso em vez de um vazio sem graça.
// Transmite: clareza ("o que é isso"), próximo passo ("o que fazer").

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  /** Ícone Lucide da dica visual. */
  icon: LucideIcon;
  /** O que está vazio (ex.: "Nenhum deal nesta etapa"). */
  title: string;
  /** Orientação do próximo passo (ex.: "Clique em Novo Deal para começar."). */
  description?: string;
  /** Ação opcional (botão/link) logo abaixo do texto. */
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/15 px-6 py-10 text-center",
        className
      )}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
        <Icon className="h-6 w-6 text-white/60" aria-hidden="true" />
      </span>
      <p className="text-sm font-semibold text-white/80">{title}</p>
      {description ? (
        <p className="max-w-sm text-xs leading-relaxed text-white/50">
          {description}
        </p>
      ) : null}
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}