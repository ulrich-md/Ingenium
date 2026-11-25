import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { Mark } from "@/components/Brand";
import { DeviceProvider, VistaSwitcher } from "@/components/Device";
import TopbarActions from "@/components/TopbarActions";

export const metadata: Metadata = {
  title: "Kwanta · Física IB en español",
  description: "Hojas de examen de Física IB que escribes a mano en el iPad y se corrigen paso a paso. Diagnóstico gratis.",
  applicationName: "Kwanta",
  appleWebApp: { capable: true, title: "Kwanta", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f2f3f6",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@100..125,400..900&family=JetBrains+Mono:wght@400;600&family=Caveat:wght@600;700&display=swap"
        />
      </head>
      <body>
        <DeviceProvider>
          <header className="topbar">
            <div className="wrap">
              <Link href="/" className="logo"><Mark />kwanta</Link>
              <TopbarActions />
            </div>
          </header>
          <main>{children}</main>
          <VistaSwitcher />
        </DeviceProvider>
      </body>
    </html>
  );
}
