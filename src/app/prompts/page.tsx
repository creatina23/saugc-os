import type { Metadata } from "next";
import { PromptsView } from "./prompts-view";

export const metadata: Metadata = { title: "Prompts" };

export default function PromptsPage() {
  return <PromptsView />;
}