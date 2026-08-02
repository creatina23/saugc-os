import type { Metadata } from "next";

import { CrmView } from "./crm-view";

export const metadata: Metadata = {
  title: "CRM — Funil de Vendas | AnuncIA",
  description:
    "Funil de vendas: negócios por etapa, valores, probabilidades e total do funil.",
};

export default function CrmPage() {
  return <CrmView />;
}