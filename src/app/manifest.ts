import type { MetadataRoute } from "next";

/** Lets students install Kwanta on the iPad Home Screen: full screen, and Safari's
 *  7-day deletion of site data does not apply to installed web apps. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kwanta · Física IB",
    short_name: "Kwanta",
    description: "Hojas de examen de Física IB que escribes a mano y se corrigen paso a paso.",
    lang: "es",
    start_url: "/app",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#f6f8fc",
    theme_color: "#f6f8fc",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
