import { Suspense } from "react";
import PracticePage from "@/components/PracticePage";

export const metadata = { title: "Práctica · Kwanta" };

export default function Page() {
  return <Suspense><PracticePage /></Suspense>;
}
