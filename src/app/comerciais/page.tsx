import type { Metadata } from "next";
import { ComerciaisView } from "./comerciais-view";

export const metadata: Metadata = { title: "Comerciais" };

export default function ComerciaisPage() {
  return <ComerciaisView />;
}