import type { Metadata } from "next";

import { LaboratorioView } from "./laboratorio-view";

export const metadata: Metadata = {
  title: "Laboratório de IA | AnuncIA",
  description: "Bancada de testes do motor de IA (rota interna, fora do menu).",
};

export default function LaboratorioPage() {
  return <LaboratorioView />;
}