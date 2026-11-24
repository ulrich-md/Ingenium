# Infraestructura de plataforma para Kwanta: PDF, almacenamiento/sync/colaboración y empaquetado nativo para iPad

Contexto: Kwanta es Next.js 15 / React 19, sin backend (todo en localStorage), estudiantes escriben con Apple Pencil en Safari de iPad. Presupuesto de startup pequeña. Investigación hecha el 2026-11-24. Precios marcados como "verificar" cuando vienen de terceros o pueden estar desactualizados.

## 1. PDF: ver, anotar con tinta y exportar hojas de examen manuscritas a PDF

### Takeaway
Para una startup, la ruta gratuita viable es: renderizar con pdf.js / react-pdf o EmbedPDF (MIT, PDFium en WASM, con tinta), capturar trazos con el motor de tinta propio de Kwanta, y "quemar" los trazos en el PDF con pdf-lib (`drawSvgPath`) para entregarlo al profesor. Nutrient y Apryse son potentes pero cotización-a-medida (Apryse desde ~1.500–2.000 USD/año de entrada; compras típicas de decenas de miles), desproporcionado para la etapa actual.

### Cited Findings
**pdf.js (Mozilla)**
- pdf.js trae una capa de editor de anotaciones desde la serie 3.x con FreeText, Ink, Stamp y Highlight; el modo tinta se activa despachando el evento `switchannotationeditormode` con tipo INK (fuente de un proveedor competidor, Nutrient) — [Nutrient blog: pdfjs annotation editor layer](https://www.nutrient.io/blog/pdfjs-annotation-editor-layer/)
- El InkEditor extiende `DrawingEditor` (src/display/editor/ink.js) — [DeepWiki: pdf.js annotation editor system](https://deepwiki.com/mozilla/pdf.js/3.5-annotation-editor-system)
- Última versión observada: v6.5.438 (1 nov, año no indicado en la página; probablemente 2026). Notas recientes: "Improve ink drawing responsiveness" (v6.3.289, #21733), varios cambios de TouchManager (gestos táctiles, pinch-to-resize), mejoras al editor de firmas y al guardado de anotaciones. No hay notas específicas sobre lápiz/stylus — [GitHub mozilla/pdf.js releases](https://github.com/mozilla/pdf.js/releases)
- Advertencia (afirmación de proveedor competidor): el editor de pdf.js usa overlays HTML y "puede no incrustarse correctamente" en el PDF — [Nutrient: complete guide to pdf.js](https://www.nutrient.io/blog/complete-guide-to-pdfjs.md)

**react-pdf (wojtekmaj)**
- Solo visualización ("Display PDFs in your React app as easily as if they were images"); renderiza capa de texto y capa de anotaciones existentes (links, formularios opcionales); licencia MIT; rama 11.x; el worker debe coincidir con la versión exacta de `pdfjs-dist`. No documenta creación/edición de anotaciones. Para generar PDFs remite a @react-pdf/renderer — [GitHub wojtekmaj/react-pdf](https://github.com/wojtekmaj/react-pdf)

**pdf-lib (escribir tinta en PDF)**
- `PDFPage.drawSvgPath(path: string, options)` con opciones `x`, `y`, `scale`, `color`, `opacity`, `borderColor`, `borderWidth`, `borderOpacity`. Dibuja como contenido de página (vector), no como anotación. PDFPage no documenta ningún método para crear anotaciones (solo `scaleAnnotations`) — [pdf-lib docs: PDFPage](https://pdf-lib.js.org/docs/api/classes/pdfpage)
- Una anotación Ink de PDF es un "scribble" compuesto de uno o más trazos disjuntos, cada uno secuencia de puntos (si se quisiera crear una anotación `/Ink` editable habría que construir el diccionario manualmente) — [MESCIUS: Ink Annotation](https://developer.mescius.com/document-solutions/javascript-pdf-api/docs/features/annotations/ink-annotation)

**EmbedPDF (open source)**
- Visor JS MIT, framework-agnostic (React, Vue, Svelte, Preact, vanilla); anotaciones: highlight, notas, texto libre y tinta (dibujo a mano alzada) — [README embed-pdf-viewer](https://cdn.jsdelivr.net/gh/embedpdf/embed-pdf-viewer@main/README.md); [EmbedPDF React viewer](https://www.embedpdf.com/react-pdf-viewer)
- Motor: PDFium compilado a WebAssembly (`@embedpdf/pdfium`), fork con extensiones EPDF_*; PDFium bajo Apache 2.0 — [GitHub embedpdf/runtime](https://github.com/embedpdf/runtime); [@embedpdf/pdfium README](https://cdn.jsdelivr.net/npm/@embedpdf/pdfium@2.14.3/README.md)
- La página del editor lista dibujo a tinta como "Available Right Now"; redacción de texto libre y edición de texto inline "coming soon" — [EmbedPDF editor](https://www.embedpdf.com/editor)

**Nutrient (ex-PSPDFKit) Web SDK**
- Precio por componentes (Viewer base + add-ons como Annotations, Forms, Signatures), cotización vía ventas; no publica precios — [Nutrient SDK pricing](https://www.nutrient.io/sdk/pricing/)
- Su propio artículo de precios solo da un rango genérico: "five- or six-figure annual contracts" para despliegues empresariales multiplataforma; trial de Web SDK de 30 días sin tarjeta; no menciona programa para startups — [Nutrient: PDF SDK pricing and licensing explained (2026)](https://www.nutrient.io/blog/pdf-sdk-pricing-and-licensing-explained/)
- El Web SDK tiene API de anotaciones de tinta (namespaces headless para ink, shapes, stamps, etc.) — [Nutrient features list](https://www.nutrient.io/sdk/features-list/)
- El soporte explícito de Apple Pencil (tinta sensible a presión, palm rejection, doble toque) está documentado para el **iOS SDK nativo**, no para el Web SDK — [Nutrient iOS SDK annotations](https://www.nutrient.io/sdk/ios/pdf-annotations/)

**Apryse WebViewer (ex-PDFTron)**
- Apryse dice que los paquetes de entrada empiezan "from $1,500"/año — [Apryse pricing](https://apryse.com/pricing); [Apryse pricing guide](https://apryse.com/pricing/guide)
- Checkout: "1 Year Subscription to WebViewer Base" con 5.000 document events por 2.000 USD (puede haber overage) — [Apryse checkout](https://dev.apryse.com/checkout)
- Datos agregados de compradores (no precio de lista): mediana ~24.351 USD/año (45 compras) — [Vendr: Apryse](https://www.vendr.com/marketplace/apryse); promedio SMB 27.539 USD/año, enterprise 64.981 USD/año — [SpendHound: Apryse](https://www.spendhound.com/marketplace/apryse-pricing)

**Alternativa nativa (si se empaqueta con Capacitor)**
- `@capawesome/capacitor-pdf-annotator`: abre un PDF local en un visor nativo a pantalla completa con las herramientas de marcado del sistema (pluma, resaltador, lápiz, borrador, formas, texto, firma) con soporte de Apple Pencil vía **Quick Look**; `open({path})` devuelve la ruta de la copia anotada; el original no se modifica; no soporta web; Android requiere API 30+ con extensión SDK — [Capawesome PDF Annotator docs](https://capawesome.io/docs/sdks/capacitor/pdf-annotator/)
- `capacitor-pdf-annotator` (comunidad): usa QLPreviewController con PencilKit, iOS 14+ — [pkgstats: capacitor-pdf-annotator](https://www.pkgstats.com/pkg:capacitor-pdf-annotator)

### Inferences
- Para "exportar hoja de examen manuscrita a PDF para profesores", lo más simple y robusto es aplanar: convertir cada trazo (ya suavizado, p. ej. con perfect-freehand, a un path SVG) y dibujarlo con `drawSvgPath` sobre la página del enunciado (o una página en blanco con cuadrícula). El resultado se ve igual en cualquier lector y no depende de soporte de anotaciones. Si el profesor debe poder borrar/mover trazos, haría falta una anotación `/Ink` construida a mano o un SDK comercial.
- pdf.js/react-pdf sirve para mostrar enunciados PDF debajo del lienzo de Kwanta; no hace falta su editor de tinta si Kwanta ya tiene su propio motor de tinta (y el editor de pdf.js no es un motor de escritura a mano de calidad "GoodNotes").
- Nutrient/Apryse solo tendrían sentido si Kwanta pasara a ser un producto de anotación de PDFs de terceros a escala; para una startup con presupuesto pequeño son caros y de cotización opaca.

### Gaps
- No encontré precio publicado de Nutrient Web SDK ni cifras de cotizaciones reales para startups (precios por cotización). Las cifras de Vendr/SpendHound son agregados de terceros y pueden estar desactualizados.
- No verifiqué si el editor de tinta de pdf.js lee presión del Apple Pencil ni su latencia en iPad Safari.
- No verifiqué en código cómo EmbedPDF guarda la tinta (anotación /Ink real vs. contenido).
- No encontré si `@capawesome/capacitor-pdf-annotator` es gratuito o parte de un plan pago (la doc enlaza a LICENSE sin detallar).

## 2. Almacenamiento, sincronización y colaboración para documentos de tinta

### Takeaway
El paso más barato y de menor riesgo es: migrar de localStorage a IndexedDB local-first (p. ej. Yjs + y-indexeddb) y agregar un backend sencillo (Supabase Pro 25 USD/mes: Postgres + Storage + Auth + Realtime) para respaldo/sincronización y entrega al profesor. La colaboración en tiempo real (Liveblocks, tldraw sync) es opcional para el caso de uso estudiante→profesor. Para trazos, el estado del arte práctico es codificación delta en binario/base64 (tldraw redujo ~80% el almacenamiento con Float16 deltas).

### Cited Findings
**Yjs + proveedores**
- y-indexeddb guarda las actualizaciones del documento Yjs en IndexedDB; se activa con una línea `IndexeddbPersistence` y emite `synced` al cargar — [Yjs docs: y-indexeddb](https://docs.yjs.dev/ecosystem/database-provider/y-indexeddb); [Yjs: allowing offline editing](https://docs.yjs.dev/getting-started/allowing-offline-editing)
- y-websocket es un proveedor WebSocket que incluye un servidor extensible — [Yjs docs llms.txt](https://docs.yjs.dev/llms.txt)
- Hocuspocus (Tiptap) es un backend open source para Yjs; su provider multiplexa varios documentos por una conexión y no es intercambiable con el servidor de y-websocket — [Tiptap: Hocuspocus provider overview](https://tiptap.dev/docs/hocuspocus/provider/overview.md)
- Patrón offline: combinar y-indexeddb con un proveedor WebSocket, así los cambios persisten offline y se sincronizan al reconectar — [Tiptap: offline support](https://tiptap.dev/docs/guides/offline-support)

**Automerge**
- Automerge 3.0 (14 jul 2025): reducción drástica de memoria (ejemplo Moby Dick: 700 MB en v2 vs 1,3 MB en v3) al usar la representación comprimida en runtime; mismo formato de archivo que v2 y API casi totalmente compatible — [Automerge 3.0 blog](https://automerge.org/blog/automerge-3/)
- Ink & Switch reportó reducciones de "over 10x, sometimes dramatically more" — [Ink & Switch dispatch 012](https://inkandswitch.com/newsletter/dispatch-012)

**Liveblocks** (precios de la página oficial, consultada nov 2026)
- Free: 0 USD, hasta 500 salas activas/mes, 10 conexiones por sala, 10 MB por sala, branding obligatorio; topes duros: 3.000 minutos de colaboración, 3M storage updates, 1 GB realtime storage, 512 MB archivos — [Liveblocks pricing](https://liveblocks.io/pricing.md)
- Pro: 30 USD/mes (25 USD/mes anual), 1.000 salas activas, 30 USD de créditos; overage: 0,002 USD por usuario-minuto de colaboración en tiempo real ("solo sessions are free"), 1 USD por 1M storage updates, 0,15 USD/GB almacenado — [Liveblocks pricing](https://liveblocks.io/pricing.md)
- Team: desde 600 USD/mes (500 anual); Enterprise a medida; self-hosting es add-on pagado de Enterprise — [Liveblocks pricing](https://liveblocks.io/pricing.md)
- Nota de conflicto: agregadores de terceros publican cifras distintas (p. ej. "starts from $100/Month", MAU ilimitados) — [Spotsaas](https://www.spotsaas.com/product/liveblocks/pricing); [budgetforge](https://www.budgetforge.dev/tools/liveblocks-pricing-2026). Usar la página oficial.
- Liveblocks + tldraw: hay un ejemplo oficial (`nextjs-tldraw-whiteboard-storage`) con Liveblocks Storage + Next.js; tldraw.com usó Presence (cursores) + Storage (documento) — [Vercel template: liveblocks-tldraw-whiteboard](https://vercel.com/templates/other/liveblocks-tldraw-whiteboard); [Liveblocks blog: tldraw multiplayer](https://liveblocks.io/blog/tldraw-became-viral-by-converting-its-product-to-multiplayer-using-liveblocks)

**tldraw sync + licencia tldraw**
- tldraw sync: cliente `useSync` (@tldraw/sync) + servidor `TLSocketRoom` (@tldraw/sync-core); un room = un Durable Object en Cloudflare con SQLite integrado; R2 para assets binarios; tú debes añadir auth, límites de subida, historial de snapshots; el demo hospedado es solo para prototipos; versiones de cliente y servidor deben coincidir — [tldraw docs: sync](https://tldraw.dev/docs/sync)
- Licencia del SDK tldraw: gratis en desarrollo; en producción requiere license key (sin ella, tras 5 s deja de renderizar); licencia hobby gratuita no comercial con marca de agua; trial de 100 días; comercial por cotización. La página oficial de planes menciona tarifa fija de 6.000 USD para equipos de <10 personas (terceros lo citan como anual; verificar) — [tldraw license key](https://tldraw.dev/sdk-features/license-key); [tldraw plans](https://tldraw.dev/get-a-license/plans); [tldraw pricing](https://tldraw.dev/pricing)

**Supabase** (página oficial, nov 2026)
- Free: 500 MB BD, 1 GB archivos, 5 GB egress, 50.000 MAU, 200 conexiones realtime, 2M mensajes; proyectos gratuitos se pausan tras 1 semana de inactividad — [Supabase pricing](https://supabase.com/pricing.md)
- Pro: desde 25 USD/mes; 8 GB BD (luego 0,125 USD/GB), 100 GB archivos (luego 0,0213 USD/GB), 250 GB egress (luego 0,09 USD/GB), 100.000 MAU, 500 conexiones realtime (luego 10 USD/1000), 5M mensajes (luego 2,50 USD/M); spend caps activos por defecto; sin pausa — [Supabase pricing](https://supabase.com/pricing.md)
- El precio Pro es base + cómputo (con crédito de 10 USD) — [Supabase: billing](https://supabase.com/docs/guides/platform/billing-on-supabase.md)

**Replicache / Zero (Rocicorp)**
- Zero alcanzó 1.0 (primera versión estable, ~2 años de desarrollo; GA "as of March 2026" según su página de estado; cobertura de InfoQ en junio 2026); índice de release notes llega a 1.10 — [Zero 1.0 release notes](https://zero.rocicorp.dev/docs/release-notes/1.0); [Zero status](https://zero.rocicorp.dev/docs/status.mdx.md); [InfoQ](https://infoq.com/news/2026/06/zero-version-1)
- Rocicorp planea animar a usuarios de Replicache a migrar a Zero una vez GA; no encontré fecha de fin de vida — [Zero docs](https://zero.rocicorp.dev/docs/status.mdx.md)

**Almacenamiento compacto de trazos**
- tldraw v4.3.0 cambió trazos de arrays JSON de puntos a formato base64 con codificación delta: primer punto Float32, siguientes como deltas Float16 (6 bytes/punto con x,y,z/presión); ~80% menos almacenamiento manteniendo fidelidad; delta evita la pérdida de precisión de Float16 absoluto en coordenadas grandes; redimensionar no reescribe puntos (usa scaleX/scaleY) — [tldraw SDK 4.3 blog](https://tldraw.dev/blog/tldraw-sdk-4.3); [tldraw v4.3.0 release](https://tldraw.dev/releases/v4.3.0); [TLDrawShape.ts](https://cdn.jsdelivr.net/npm/@tldraw/tlschema@4.5.9/src/shapes/TLDrawShape.ts)

### Inferences
- localStorage (~5 MB típico, síncrono, solo strings) no es adecuado para tinta; IndexedDB con datos binarios (Uint8Array) es el paso natural. Yjs ya entrega sus updates como binario compacto y el combo y-indexeddb + proveedor de red resuelve offline-first.
- Para el flujo IB (estudiante resuelve, profesor revisa), basta "sync asíncrono + entrega": Supabase Storage para blobs de documentos (o updates Yjs) + Postgres para metadatos/entregas + Auth. Realtime multiusuario puede esperar.
- Si se usa tldraw como motor de lienzo, sus costos de licencia (≈6.000 USD) pesan más que el backend; tldraw sync en Cloudflare es barato de hospedar pero exige trabajo de auth.
- Liveblocks Pro (25–30 USD/mes) es razonable si se quiere colaboración en vivo profesor-estudiante; cobra por minutos de colaboración, y las sesiones en solitario son gratis, lo que encaja con uso mayormente individual.
- Formato de trazo recomendado: puntos cuantizados (enteros o Float16) con delta encoding, presión como tercer componente, empaquetado en Uint8Array/base64; simplificación de puntos antes de guardar.

### Gaps
- No investigué precios actuales de Firebase (Firestore/Storage) ni el estado de Firebase Realtime en 2026.
- No encontré benchmarks de tamaño de documento de tinta Yjs vs Automerge vs formato binario propio.
- Sin precios oficiales de Hocuspocus Cloud / Tiptap Collab.

## 3. Empaquetar como app nativa de iPad para tinta de baja latencia, App Store y PWA

### Takeaway
La tinta en Safari/WKWebView funciona (pointermove a 240 Hz en iPad Pro según reportes, `desynchronized` canvas), pero con limitaciones frente a PencilKit nativo (eventos descartados en frames lentos, exclusividad lápiz/toque en WKWebView). Envolver con Capacitor no mejora la latencia de la tinta web por sí mismo; la mejora real requiere un plugin nativo propio con PKCanvasView (no hay uno "capacitor-pencilkit" mantenido) o React Native con react-native-pencil-kit / Skia. Para App Store, un wrapper "solo web" es rechazado típicamente por la guía 4.2; integrar PencilKit nativo ayuda a justificar la app. Como PWA instalada, los datos están exentos de la regla ITP de 7 días y pueden tener web push (iOS 16.4+).

### Cited Findings
**Latencia de tinta en web/WKWebView**
- En un iPad Pro 12,9" (2.ª gen) con iPadOS 17.0.1, escuchar solo `pointermove` da 240 Hz (120 Hz en Modo de bajo consumo). Recomendaciones: desactivar Scribble para que `pointerdown` dispare consistentemente; desactivar "Prefer Page Rendering Updates near 60fps" para 120 fps; usar `getContext('2d', {desynchronized: true})`. Otro usuario: los eventos se pierden cuando los frames de animación son lentos. Sin respuestas de Apple en el hilo — [Apple Developer Forums: 240Hz Apple Pencil in JS](https://developer.apple.com/forums/thread/689375)
- WebKit implementó `getCoalescedEvents()` (commits de julio 2024 para macOS e iOS) — [WebKit bug 210454 (lista)](https://lists.webkit.org/pipermail/webkit-unassigned/2024-August/1178880.html); [webkit-changes julio 2024](https://lists.webkit.org/pipermail/webkit-changes/2024-July/304567.html). `getPredictedEvents` tiene un bug de seguimiento (264002) marcado como resuelto, sin versión de Safari confirmada — [WebKit bug 264002](https://bugs.webkit.org/show_bug.cgi?id=264002)
- En WKWebView, lápiz y toque no pueden estar activos a la vez (un tipo de entrada a la vez), mientras UIKit nativo sí lo permite — [Apple Developer Forums thread 773213](https://developer.apple.com/forums/thread/773213)
- Apple (WWDC19 PencilKit) recomienda Metal para dibujo personalizado y mantener el trabajo por frame en pocos ms; PencilKit es la vía de menor latencia — [WWDC19 session 221](https://developer.apple.com/videos/play/wwdc2019/221/?time=650)
- WebKit ya despacha eventos hover del Apple Pencil; pidió bugs separados para funciones del Pencil Pro (barrel roll) — [Apple Developer Forums: Pointer Events Pencil Pro](https://developer.apple.com/forums/thread/776468)
- La API de "delegated ink trails" (WICG ink-enhancement) para paridad de latencia con nativo existe en Edge/Chromium; su objetivo declarado es "latency parity with native applications"; no hay evidencia de soporte en Safari — [WICG ink-enhancement](https://wicg.github.io/ink-enhancement)

**Capacitor + PencilKit**
- No encontré un plugin Capacitor de PencilKit genérico mantenido; los más cercanos son plugins de anotación de PDF (Quick Look / QLPreviewController+PencilKit). Lo normal sería escribir un plugin local en Swift — [Capawesome PDF Annotator](https://capawesome.io/docs/sdks/capacitor/pdf-annotator/); [pkgstats: capacitor-pdf-annotator](https://www.pkgstats.com/pkg:capacitor-pdf-annotator); [Capacitor plugins docs](https://capacitorjs.com/docs/plugins)

**React Native / Expo**
- react-native-pencil-kit (mym0404): "full API support iOS PencilKit framework porting", componente `PencilKitView`, solo iOS — [GitHub mym0404/react-native-pencil-kit](https://github.com/mym0404/react-native-pencil-kit)
- expo-pencilkit: wrapper Expo de PencilKit, solo iOS — [expo-pencilkit README](https://unpkg.com/expo-pencilkit@0.1.7/README.md)
- react-native-skia: tutoriales de dibujo a mano alzada; rn-perfect-sketch-canvas usa perfect-freehand sobre Skia; mobile-ink es un motor RN de dibujo con Apple Pencil sobre Skia/Metal, en producción en la app MathNotes — [Notesnook: drawing app with RN Skia](https://notesnook.com/blog/drawing-app-with-react-native-skia); [mobile-ink](https://gh.hhj520.top/mathnotes-app/mobile-ink); [rn-perfect-sketch-canvas](https://awesome.ecosyste.ms/projects/github.com%2Fwobsoriano%2Frn-perfect-sketch-canvas)

**Tauri móvil**
- Tauri v2 estable desde 2 oct 2024 con API móvil estable, pero no todos los plugins de escritorio existen en móvil; en iOS es un shell Swift delgado sobre WKWebView (fuente no oficial) — [zudo-tauri: Tauri Mobile iOS](https://takazudo-zudo-tauri.pages.dev/pj/zudo-tauri/docs/mobile)

**App Store – guía 4.2**
- Texto oficial 4.2: "Your app should include features, content, and UI that elevate it beyond a repackaged website. If your app is not particularly useful, unique, or 'app-like,' it doesn't belong on the App Store." 4.2.2: no deben ser principalmente "web clippings, content aggregators, or a collection of links". 2.5.6: apps que navegan web deben usar WebKit — [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- Comunidad Ionic: usar Capacitor/Cordova solo para cargar un sitio web será rechazado igual — [Ionic Forum: Apple §4.2](https://forum.ionicframework.com/t/apple-4-2-minimum-functionality/189688)
- Caso reportado: app Capacitor con Core Location, plugin Swift propio y portapapeles fue rechazada igualmente por no diferenciarse lo suficiente de navegar la web — [Apple Developer Forums thread 812889](https://developer.apple.com/forums/thread/812889)

**PWA en iPadOS: almacenamiento y push**
- Safari 17: cuota por origen hasta 60% del disco para apps navegador (15% otras apps); cuota global 80%/20%; desalojo LRU por origen cuando se excede la cuota global, hay presión de almacenamiento o el sitio no se usa "for some time"; orígenes en modo persistente excluidos; `navigator.storage.persist()` concedido por heurísticas (p. ej. si es Home Screen Web App); las web apps de pantalla de inicio tienen las mismas cuotas — [WebKit: Updates to Storage Policy](https://webkit.org/blog/14403/updates-to-storage-policy/)
- Regla ITP (2020): Safari borra todo el almacenamiento escribible por script (incl. localStorage e IndexedDB) tras 7 días de uso de Safari sin interacción con el sitio; las web apps añadidas a pantalla de inicio "no son parte de Safari", llevan su propio conteo de días y WebKit no espera que se borren sus datos de primera parte — [WebKit: Full Third-Party Cookie Blocking and More](https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/)
- Web Push para web apps en pantalla de inicio desde iOS/iPadOS 16.4 (beta feb 2023); permiso solo tras interacción directa del usuario; integración con Focus; Badging API — [WebKit: Web Push for Web Apps on iOS and iPadOS](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/)
- Hasta iOS 18 el ícono abre como web app solo si el manifest usa `display: standalone` o `fullscreen` — [OneSignal: web push for iOS](https://documentation.onesignal.com/docs/en/web-push-for-ios)

### Inferences
- Riesgo actual crítico: los datos de Kwanta en localStorage dentro de Safari (no instalada) pueden borrarse tras 7 días sin visita. Mitigación inmediata: pedir "Añadir a pantalla de inicio", llamar `navigator.storage.persist()`, migrar a IndexedDB y tener respaldo en servidor.
- Orden sugerido de inversión: (1) PWA instalada + IndexedDB + backend; (2) si la latencia/feel del lápiz es el diferenciador, app nativa con PencilKit (Capacitor + plugin Swift propio que superponga un PKCanvasView, o React Native/Expo con react-native-pencil-kit); la integración de PencilKit también ayuda a superar la guía 4.2.
- PencilKit guarda `PKDrawing` en su propio formato; si se mezcla tinta nativa (iPad) con tinta web (otros dispositivos) se necesita un modelo de trazos común (puntos + presión) y conversión, lo que añade complejidad.

### Gaps
- No encontré mediciones cuantitativas de latencia (ms) de Apple Pencil en Safari vs WKWebView vs PencilKit.
- No confirmé en qué versión de Safari se publicó `getCoalescedEvents`/`getPredictedEvents` en iPadOS.
- No hay declaración oficial de Apple sobre cuántas funciones nativas bastan para pasar 4.2.
- No investigué el estado específico de Expo (SDK actual, módulos nativos) más allá de expo-pencilkit.

## 4. Ejemplos reales de empresas con escritura a mano en web/híbrido y lecciones

### Takeaway
GoodNotes llevó su motor de tinta Swift a la web vía SwiftWasm (Wasm para el lienzo, React para la UI) compartiendo ~1,47 M líneas; Excalidraw demuestra un modelo freemium barato (6 USD/usuario/mes) con colaboración cifrada; tldraw migró a multijugador con Liveblocks y luego construyó su propio sync en Cloudflare. Lección general: el motor de tinta se comparte entre plataformas y la UI se hace en web; la colaboración se puede externalizar al principio y "internalizar" después.

### Cited Findings
- GoodNotes web: prototipo con SwiftWasm para compilar el código Swift existente a Wasm; áreas de dibujo en Wasm, UI en React; la primera versión (solo lectura) tomó seis meses; Wasm no está oficialmente soportado por Apple pero reusar código fue la mejor opción — [web.dev: Goodnotes everywhere](https://web.dev/case-studies/goodnotes)
- GoodNotes: base Swift web de 2,2 M líneas, 1,47 M compartidas con iOS (66% de la app web, 34% de la app iOS) — [Swift.org: Bringing Goodnotes to the web](https://swift.org/blog/bringing-goodnotes-to-web-with-swift/)
- tldraw.com se hizo multijugador con Liveblocks Presence + Storage + undo/redo multijugador — [Liveblocks blog](https://liveblocks.io/blog/tldraw-became-viral-by-converting-its-product-to-multiplayer-using-liveblocks); hoy tldraw sync corre en producción en tldraw.com sobre Cloudflare Durable Objects — [tldraw docs: sync](https://tldraw.dev/docs/sync)
- Excalidraw+: Free 0 USD (1 escena, colaboradores ilimitados); Plus 6 USD/usuario/mes (escenas ilimitadas, guardado en la nube), 14% de ahorro anual — [Excalidraw+ pricing](https://plus.excalidraw.com/pricing). (Terceros citan 7 USD; la página oficial dice 6 USD — [MakerStack](https://makerstack.co/reviews/excalidraw-review/))
- Excalidraw diseñó sus servidores para no ver el contenido de los dibujos (cifrado de extremo a extremo); clave en el fragmento # de la URL — [Excalidraw+: introducing](https://plus.excalidraw.com/blog/introducing-excalidraw-plus); [Excalidraw security](https://plus.excalidraw.com/security-and-compliance); [DEV: is Excalidraw private](https://dev.to/nologintools/is-excalidraw-private-free-online-whiteboard-no-login-1gc2)
- Microsoft Whiteboard web permite crear/borrar tinta; Microsoft anunció componentes Fluid en Whiteboard; Fluid Framework es MIT — [Microsoft Tech Community: new Whiteboard](https://techcommunity.microsoft.com/blog/microsoft_365blog/meet-the-new-microsoft-whiteboard-designed-for-hybrid-work/2445539); [Wikipedia: Fluid Framework](https://en.wikipedia.org/wiki/Fluid_Framework). Microsoft impulsó la API de tinta delegada en Edge/Chromium (no Safari) — [WICG ink-enhancement](https://wicg.github.io/ink-enhancement)

### Inferences
- Para Kwanta: mantener el motor de tinta desacoplado (modelo de trazos + renderer) permite reutilizarlo en web, PWA y un shell nativo. GoodNotes fue en dirección inversa (nativo → web), pero confirma que separar "lienzo" de "UI" es la arquitectura que escala.
- El precio de Excalidraw+ (6 USD/usuario/mes) es una referencia útil para monetizar herramientas de dibujo/colaboración ligeras.

### Gaps
- No encontré escritos de ingeniería de Miro ni de Explain Everything sobre tinta en web/híbrido.
- No encontré un artículo técnico de Microsoft sobre cómo Whiteboard web combina tinta con Fluid.
- No confirmé de fuente primaria que Excalidraw use Firebase para sus salas (solo una fuente terciaria).
