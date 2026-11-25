import { OptionalAppNav } from "@/components/AppShell";

export default function DiagnosticoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <OptionalAppNav />
      {children}
    </>
  );
}
