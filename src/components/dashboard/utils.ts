// TR-04.8D.2c-0: helpers PUROS do Dashboard — sem estado, sem efeitos,
// sem conhecimento da máquina de estados Truth. Código movido 1:1.
import type { ContagemRotulo } from "./types";

// TR-04.8D.2c-2 (Correção 1): número ESTRITO p/ o motor de attention —
// ausência (null/undefined/""/NaN/Infinity/valor inválido) vira NaN, NUNCA 0.
// O motor (src/lib/attention.ts) usa Number.isFinite: NaN impede R2 de
// afirmar "0 conversões" sem prova numérica real de zero.
export function numeroEstrito(valor: unknown): number {
  if (valor === null || valor === undefined || valor === "") return NaN;
  const n = Number(valor);
  return Number.isFinite(n) ? n : NaN;
}

export function numero(valor: unknown): number {
  if (typeof valor === "number" && Number.isFinite(valor)) return valor;
  if (typeof valor === "string") {
    const limpo = valor.replace(/[^\d.,-]/g, "").replace(",", ".");
    const n = parseFloat(limpo);
    return Number.isFinite(n) ? n : 0;
  }
  const n = Number(valor);
  return Number.isFinite(n) ? n : 0;
}

// TR-04.8D.1: data curta real para as atualizações derivadas ("12 ago 2026")
export const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export function dataCurta(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`;
}

// TR-04.8D.2a: BRL com centavos p/ CPC (formatBRL arredonda para inteiro).
export function brl2(valor: number): string {
  return `R$ ${valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// TR-04.8D.2b: agrupa contagens por rótulo real (status/categoria). Rótulo
// vazio/null vira "Sem categoria"/"Sem status" factual — nunca inventa.
export function contarPorRotulo(
  linhas: (string | null)[],
  rotuloVazio: string,
  ordemPreferida?: string[]
): ContagemRotulo[] {
  const mapa = new Map<string, number>();
  for (const raw of linhas) {
    const rotulo = (raw ?? "").trim() || rotuloVazio;
    mapa.set(rotulo, (mapa.get(rotulo) ?? 0) + 1);
  }
  const ordem = ordemPreferida ?? [];
  return [...mapa.entries()]
    .map(([rotulo, quantidade]) => ({ rotulo, quantidade }))
    .sort((a, b) => {
      const ia = ordem.indexOf(a.rotulo);
      const ib = ordem.indexOf(b.rotulo);
      if (ia !== -1 || ib !== -1) {
        return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
      }
      return b.quantidade - a.quantidade || a.rotulo.localeCompare(b.rotulo);
    });
}
