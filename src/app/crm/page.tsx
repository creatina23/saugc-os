import type { Metadata } from "next";
import { CrmView } from "./crm-view";

export const metadata: Metadata = {
  title: "CRM & Pipeline | AnuncIA",
  description:
    "Funil de vendas: deals por etapa, valores, probabilidades e total do pipeline.",
};

export default function CrmPage() {
  return <CrmView />;
}