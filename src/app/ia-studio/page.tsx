import type { Metadata } from "next";
import { IaStudioView } from "./ia-studio-view";

export const metadata: Metadata = { title: "IA Studio" };

export default function IaStudioPage() {
  return <IaStudioView />;
}