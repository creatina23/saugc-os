"use client";

// TR-04.8D.3.4.7 — TERM-O-INFO: explicação acessível sob demanda.
// ======================================================================
// O MENOR componente reutilizável para a Compreensão Progressiva (UX-03).
// O termo profissional permanece na superfície; o ⓘ abre a explicação do
// glossário (src/lib/glossario.ts — a explicação NUNCA mora aqui).
//
// Acessibilidade real (não decorativa) — NÃO depende exclusivamente de
// hover:
// - MOUSE: hover mostra escondendo ao sair; clique fixa (outro clique ou
//   clique fora desfixa).
// - TECLADO: o gatilho é um <button> nativo — Tab foca, Enter/Espaço
//   ativa; Escape fecha. Padrão disclosure: aria-expanded + aria-controls
//   + aria-label descritivo. Nenhum ARIA "de enfeite": o painel não tem
//   role porque o anúncio acontece pelo botão expandido, e o foco fica no
//   gatilho (padrão disclosure do WAI).
// - TOQUE: toque no ⓘ alterna; toque fora fecha.
// - TECNOLOGIAS ASSISTIVAS: rótulo falado "Explicação: {termo}" e estado
//   expandido/colapsado; o ícone é aria-hidden.
//
// Semântica deliberada: explicação disponível quando necessária, some
// quando não; usuário avançado simplesmente NÃO interage (custo zero).

import { useEffect, useId, useRef, useState } from "react";
import { Info } from "lucide-react";
import { entradaDoGlossario } from "@/lib/glossario";
import { cn } from "@/lib/utils";

interface TermoInfoProps {
  /** Slug no glossário (src/lib/glossario.ts). */
  slug: string;
  className?: string;
}

export function TermoInfo({ slug, className }: TermoInfoProps) {
  const entrada = entradaDoGlossario(slug);
  const [fixado, setFixado] = useState(false); // aberto por clique/toque
  const [hover, setHover] = useState(false); // aberto por passagem do mouse
  const raizRef = useRef<HTMLSpanElement>(null);
  const idPainel = useId();

  const visivel = fixado || hover;

  // Escape + clique/fora fecham o estado FIXADO (o hover se resolve sozinho).
  useEffect(() => {
    if (!fixado) return;
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") setFixado(false);
    };
    const aoClicarFora = (evento: MouseEvent | TouchEvent) => {
      if (
        raizRef.current !== null &&
        evento.target instanceof Node &&
        !raizRef.current.contains(evento.target)
      ) {
        setFixado(false);
      }
    };
    document.addEventListener("keydown", aoTeclar);
    document.addEventListener("mousedown", aoClicarFora);
    document.addEventListener("touchstart", aoClicarFora);
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.removeEventListener("mousedown", aoClicarFora);
      document.removeEventListener("touchstart", aoClicarFora);
    };
  }, [fixado]);

  // Sem entrada no glossário: NÃO inventa explicação, NÃO quebra a tela.
  if (entrada === undefined) return null;

  return (
    <span
      ref={raizRef}
      className={cn("relative inline-flex align-middle", className)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <button
        type="button"
        aria-expanded={visivel}
        aria-controls={visivel ? idPainel : undefined}
        aria-label={`Explicação: ${entrada.termo}`}
        onClick={() => setFixado((valor) => !valor)}
        onKeyDown={(evento) => {
          if (evento.key === "Escape") {
            setFixado(false);
            setHover(false);
          }
        }}
        className={cn(
          "mx-1 inline-flex size-5 items-center justify-center rounded-full align-middle text-muted-foreground/70 transition-colors hover:text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        )}
      >
        <Info aria-hidden="true" className="size-3.5" />
      </button>
      {visivel && (
        <span
          id={idPainel}
          className="absolute left-1/2 top-full z-50 mt-1.5 block w-64 max-w-[70vw] -translate-x-1/2 rounded-xl border border-white/10 bg-gray-900/95 px-3 py-2.5 text-left normal-case shadow-xl backdrop-blur-md"
        >
          <span className="block text-xs font-semibold text-white">
            {entrada.termo}
            {(entrada.nomeCompleto !== undefined ||
              entrada.traducao !== undefined) && (
              <span className="block pt-0.5 text-[11px] font-normal text-white/60">
                {[entrada.nomeCompleto, entrada.traducao]
                  .filter((parte) => parte !== undefined)
                  .join(" · ")}
              </span>
            )}
          </span>
          <span className="mt-1.5 block text-[11px] leading-relaxed text-white/80">
            {entrada.explicacao}
          </span>
          {entrada.exemplo !== undefined && (
            <span className="mt-1 block text-[11px] leading-relaxed text-white/60">
              Exemplo: {entrada.exemplo}
            </span>
          )}
          {entrada.porQueImporta !== undefined && (
            <span className="mt-1 block text-[11px] leading-relaxed text-white/80">
              <span className="font-semibold text-white">
                Por que isso importa?
              </span>{" "}
              {entrada.porQueImporta}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
