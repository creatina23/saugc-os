import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <span className="text-gradient text-7xl font-extrabold tracking-tight sm:text-8xl">
        404
      </span>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-white">
          Página não encontrada
        </h1>
        <p className="max-w-md text-sm text-white/60">
          A página que você tentou acessar não existe ou foi movida. Verifique o
          endereço ou volte para o Dashboard.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Voltar ao Dashboard</Link>
      </Button>
    </div>
  );
}