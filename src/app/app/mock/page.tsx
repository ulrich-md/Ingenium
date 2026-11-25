import { Suspense } from "react";
import MockPage from "@/components/MockPage";

export const metadata = { title: "Simulacros · Kwanta" };

export default function Page() {
  return <Suspense><MockPage /></Suspense>;
}
