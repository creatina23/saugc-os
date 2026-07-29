import type { Metadata } from "next";
import { CampanhasView } from "./campanhas-view";

export const metadata: Metadata = { title: "Campanhas" };

export default function CampanhasPage() {
  return <CampanhasView />;
}