// TR-04.8D.2c-0: card "MRR por Cliente" — movido 1:1 de
// src/app/dashboard-view.tsx (infográfico de barras proporcional).
import Link from "next/link";
import { BarChart3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBRL } from "@/lib/format";

import type { ReceitaCliente } from "./types";

export function MrrClientes({
  clientes,
  erro,
}: {
  clientes: ReceitaCliente[];
  erro: string | null;
}) {
  const maxReceitaCliente = Math.max(1, ...clientes.map((c) => c.valor));
  return (
    <Card className="lg:col-span-6 card-glow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <BarChart3 className="size-4 text-primary" /> MRR por Cliente
          </CardTitle>
          <CardDescription>Maiores receitas mensais recorrentes da base (clients.mrr)</CardDescription>
        </div>
        <Link href="/clientes">
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">Ver todos</Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-3 pt-2">
        {erro ? (
          <p role="alert" className="text-sm text-destructive py-8 text-center">
            Não consegui carregar os clientes — indisponível agora (isso não é
            zero). Detalhe técnico: {erro}
          </p>
        ) : clientes.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            Nenhum cliente cadastrado ainda. Cadastre clientes com receita
            mensal e este gráfico ganha vida.
          </p>
        ) : (
          clientes.map((c) => {
            const pct = Math.max(8, Math.round((c.valor / maxReceitaCliente) * 100));
            return (
              <div key={c.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium truncate max-w-[200px]">{c.nome}</span>
                  <span className="font-semibold tabular-nums text-primary">{formatBRL(c.valor)}</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-muted/60 overflow-hidden p-0.5">
                  <div
                    style={{ width: `${pct}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-primary to-ai transition-all duration-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                  />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
