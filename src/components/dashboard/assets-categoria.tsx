// TR-04.8D.2b: Assets por categoria real (null/vazio = "Sem categoria").
// TR-04.8D.2c-0: movido 1:1 de src/app/dashboard-view.tsx.
import { Image } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import type { ContagemRotulo } from "./types";

export function AssetsCategoria({
  categorias,
  erro,
}: {
  categorias: ContagemRotulo[];
  erro: string | null;
}) {
  const maxAssets = Math.max(1, ...categorias.map((c) => c.quantidade));
  return (
    <Card className="lg:col-span-6 card-glow">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Image className="size-4 text-ai" /> Assets por Categoria
        </CardTitle>
        <CardDescription>Contagem real de arquivos por categoria na biblioteca</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pt-2">
        {erro ? (
          <p role="alert" className="py-6 text-center text-sm text-destructive">
            Biblioteca indisponível — a contagem não pode ser exibida (isso não é
            zero). Detalhe técnico: {erro}
          </p>
        ) : categorias.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nenhum asset na biblioteca ainda. Envie arquivos em Assets para vê-los
            contados aqui.
          </p>
        ) : (
          categorias.map((cat) => (
            <div key={cat.rotulo} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">{cat.rotulo}</span>
                <span className="font-semibold tabular-nums">{cat.quantidade}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60">
                <div
                  style={{ width: `${Math.max(3, Math.round((cat.quantidade / maxAssets) * 100))}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-primary to-ai transition-all duration-500"
                  title={`${cat.rotulo}: ${cat.quantidade} asset(s)`}
                />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
