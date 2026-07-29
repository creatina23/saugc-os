import type { Metadata } from "next";
import { BibliotecaView } from "./biblioteca-view";

export const metadata: Metadata = { title: "Biblioteca" };

export default function BibliotecaPage() {
  return <BibliotecaView />;
}