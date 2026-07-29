import type { Metadata } from "next";
import { BriefingsView } from "./briefings-view";

export const metadata: Metadata = { title: "Briefings" };

export default function BriefingsPage() {
  return <BriefingsView />;
}