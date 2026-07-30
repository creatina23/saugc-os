import type { Metadata } from "next";
import { MídiasView } from "./assets-view";

export const metadata: Metadata = { title: "Mídias" };

export default function MídiasPage() {
  return <MídiasView />;
}