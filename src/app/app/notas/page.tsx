import { Suspense } from "react";
import NotesPage from "@/components/NotesPage";

export const metadata = { title: "Notas de clase · Kwanta" };

export default function Page() {
  return <Suspense><NotesPage /></Suspense>;
}
