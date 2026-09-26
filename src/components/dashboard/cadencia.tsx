// TR-04.8D.2b: "Registros criados" — cadência real por mês (created_at).
// TR-04.8D.2c-0: movido 1:1 de src/app/dashboard-view.tsx. As fontes da
// cadência chegam como lista de nomes falhos (computada pelo orquestrador).
import { Activity } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import type { MesCadencia } from "./types";

export function CadenciaRegistros({
  meses,
  fontesFalhas,
}: {
  meses: MesCadencia[] | null;
  fontesFalhas: string[];
}) {
  const cadenciaTotalmenteFalha = fontesFalhas.length === 4;
  const maxCadencia = meses ? Math.max(1, ...meses.map((m) => m.total)) : 1;
  return (
    <Card className="lg:col-span-6 card-glow">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Activity className="size-4 text-success" /> Registros criados
        </CardTitle>
        <CardDescription>
          Volume de registros criados por mês — clientes, campanhas, briefings e
          comerciais (últimos 6 meses)
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        {meses === null ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Não disponível na demonstração — o dataset demo não inclui datas de
            criação. Conecte o Supabase para ver a cadência real.
          </p>
        ) : cadenciaTotalmenteFalha ? (
          <p role="alert" className="py-4 text-center text-sm text-destructive">
            Todas as fontes desta contagem falharam — nada a exibir (isso não é
            zero). Use Recarregar.
          </p>
        ) : (
          <>
            {fontesFalhas.length > 0 && (
              <p role="alert" className="mb-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-300">
                Contagem parcial — fonte(s) indisponível(is): {fontesFalhas.join(", ")}.
                Os totais abaixo podem estar menores que o real.
              </p>
            )}
            <div
              className="flex h-20 items-end gap-2"
              role="img"
              aria-label={`Registros criados por mês: ${meses
                .map((m) => `${m.rotulo} ${m.total}`)
                .join(", ")}`}
            >
              {meses.map((m) => {
                const pct = Math.round((m.total / maxCadencia) * 100);
                return (
                  <div key={m.chave} className="flex h-full flex-1 flex-col items-center gap-1">
                    <span className="text-[10px] font-semibold tabular-nums text-foreground">
                      {m.total}
                    </span>
                    <div className="flex w-full flex-1 items-end">
                      <div
                        style={{ height: m.total > 0 ? `${Math.max(6, pct)}%` : "0%" }}
                        className="w-full rounded-t-md bg-gradient-to-t from-primary/70 to-ai/70 transition-all duration-500"
                        title={`${m.rotulo}: ${m.total} registro(s) criados`}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{m.rotulo}</span>
                  </div>
                );
              })}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Mês sem registro aparece como 0 — derivado das datas reais de criação.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
