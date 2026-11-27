import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import "@/components/psi.css";
import { Mark } from "@/components/Brand";
import { DeviceProvider, VistaSwitcher } from "@/components/Device";
import TopbarActions from "@/components/TopbarActions";

const SITE = process.env.NEXT_PUBLIC_SITE_URL
  ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");
const DESCRIPTION = "Hojas de examen de Física IB que escribes a mano en el iPad o tecleas, corregidas con el esquema de marcas. Diagnóstico gratis en 15 minutos.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "Kwanta · Física IB en español",
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "es_419",
    siteName: "Kwanta",
    title: "Kwanta · Sube hasta el 7 en Física IB",
    description: DESCRIPTION,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Psi, el gato de Kwanta, saluda desde su caja junto al texto: Sube hasta el 7 en Física IB" }],
  },
  twitter: { card: "summary_large_image", title: "Kwanta · Sube hasta el 7 en Física IB", description: DESCRIPTION, images: ["/og.png"] },
  applicationName: "Kwanta",
  appleWebApp: { capable: true, title: "Kwanta", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#2bb5ff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@500..1000&family=JetBrains+Mono:wght@400;600&family=Caveat:wght@600;700&display=swap"
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
