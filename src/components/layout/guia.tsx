"use client";

// Guia Vivo — botão "Como usar esta tela" + painel de passo a passo.
// ------------------------------------------------------------------
// Mora no topo de TODAS as páginas (parafusado no app-shell) e descobre
// sozinho, pelo endereço, qual guia mostrar. Os textos vivem em
// lib/guia-data.ts — mexer no texto não exige tocar neste arquivo.

import { useState } from "react";
import { usePathname } from "next/navigation";
import { BookMarked } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { atalhosGerais, guiaDe } from "@/lib/guia-data";

export function GuiaAjuda() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const guia = guiaDe(pathname);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Como usar a tela ${guia.pagina}`}
        title="Como usar esta tela"
        onClick={() => setOpen(true)}
        className="text-muted-foreground hover:text-foreground"
      >
        <BookMarked />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookMarked className="size-5 text-ai" />
              Como usar: {guia.pagina}
            </DialogTitle>
            <DialogDescription>{guia.resumo}</DialogDescription>
          </DialogHeader>

          <ol className="max-h-[50vh] space-y-2.5 overflow-y-auto pr-1">
            {guia.passos.map((passo, indice) => (
              <li
                key={passo.titulo}
                className="flex gap-3 rounded-xl border border-border bg-[rgba(255,255,255,0.02)] p-3"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-ai/15 text-xs font-bold text-ai">
                  {indice + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{passo.titulo}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {passo.texto}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div className="rounded-xl border border-border bg-[rgba(255,255,255,0.02)] p-3">
            <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Vale no app inteiro
            </p>
            <ul className="mt-1.5 space-y-1">
              {atalhosGerais.map((atalho) => (
                <li
                  key={atalho}
                  className="text-xs leading-relaxed text-muted-foreground"
                >
                  · {atalho}
                </li>
              ))}
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}