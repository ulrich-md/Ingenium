import type { Metadata } from "next";
import Diagnostico from "@/components/Diagnostico";

export const metadata: Metadata = {
  title: "Diagnóstico gratis · Kwanta",
  description: "10 preguntas de opción múltiple y 3 de desarrollo en hoja de examen. Nota proyectada y plan de 12 semanas.",
};

export default function Page() {
  return <Diagnostico />;
}
