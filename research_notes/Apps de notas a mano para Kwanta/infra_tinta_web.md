# Infraestructura web reutilizable para tinta digital, canvas y pan/zoom (para Kwanta: Next.js 15 / React 19, Apple Pencil en Safari de iPad)

> Notas de investigación (fecha: 24-nov-2026). Cada afirmación lleva su URL. Donde el dato proviene de conocimiento previo y no se volvió a verificar en esta sesión se marca **[no verificado en esta sesión]**; el redactor debería tratarlo como orientativo.

## 1. Librerías: qué son, licencia, madurez, presión, comportamiento en iPad y encaje con Kwanta

### Takeaway
Ninguna librería resuelve "tinta + hoja de examen + zoom en iPad" lista para usar sin coste o sin rehacer la app: tldraw es la más completa pero su SDK ya **no es open source** (licencia de pago con clave obligatoria en producción y precio no publicado); Excalidraw (MIT) usa internamente la misma perfect-freehand que Kwanta ya usa. Lo más rentable es **seguir con perfect-freehand** y aprender/copiar patrones (cámara propia, canvas estático + interactivo) de tldraw/Excalidraw; js-draw (MIT) es la alternativa "editor completo" libre más cercana. La librería Ink de Google (Apache-2.0) hoy es solo C++/Android, sin destino web/WASM oficial.

### Cited Findings

**tldraw (SDK)**
- Por defecto la licencia del SDK "permits use only in development"; en producción "The SDK will work in production only when provided with a valid and active license key" — [tldraw license](https://tldraw.dev/community/license)
- Tipos de licencia: prueba gratuita de 100 días (una por unidad comercial; la clave deja de funcionar al terminar; durante la prueba el SDK envía a los servidores de tldraw un hash de la clave para analítica, sin contenido del lienzo ni PII), licencia comercial (por formulario; "Startup pricing may be available for small teams") y licencia hobby (no comercial, a discreción de tldraw, **con la marca de agua "made with tldraw" obligatoria**) — [tldraw license](https://tldraw.dev/community/license)
- El SDK es "source available, not open source"; los usuarios de proyectos open source que incluyan tldraw necesitan su propia licencia — [tldraw license](https://tldraw.dev/community/license)
- La página de precios no publica cifra: "value-based pricing", prueba de 100 días "No credit card required", descuento para startups sin importe — [tldraw pricing](https://tldraw.dev/pricing)
- Las claves codifican hosts permitidos, tipo de licencia y fecha de caducidad; se pasan como prop `licenseKey` o variable de entorno `TLDRAW_LICENSE_KEY`; sin clave en producción "the editor will stop rendering after five seconds" (según el resumen del buscador de la página de license-key) — [tldraw license key](https://tldraw.dev/sdk-features/license-key)
- Sin Business License la marca de agua debe permanecer ("To use the tldraw SDK without displaying the Watermark, purchase a Business License") — [Business License](https://tldraw.dev/buy/business)
- La v4.0 (sept. 2025) aplicó el nuevo modelo de licencias, starter kits y CLI; incluía un descuento para quien firmara licencia comercial anual antes de fin de 2025 (oferta presumiblemente caducada) — [tldraw SDK 4.0 blog](https://tldraw.dev/blog/tldraw-sdk-4-0); [AlternativeTo news](https://alternativeto.net/news/2025/9/tldraw-sdk-4-0-adds-five-new-starter-kits-cli-tool-and-enforces-licensing-changes)
- Historia: la licencia dual comercial empezó en 2.0.0-beta.1 (dic-2023); 1.x sigue MIT y las pre-releases 2.x anteriores Apache-2.0 — [License update for the tldraw SDK (Steve Ruiz, 20-dic-2023)](https://tldraw.dev/blog/license-update-for-the-tldraw-sdk)
- Precio: **no encontré cifra oficial**. La cifra "$6,000/year" solo aparece en un comentario de Hacker News, no en tldraw — [HN thread 45293839](https://hnews-reader.vercel.app/ask/45293839)
- Cámara de tldraw: `x`,`y` = desplazamiento en espacio-página; `z` = zoom (1 = 100 %); `zoomSteps` discretos; opciones `wheelBehavior` ('pan'|'zoom'|'none'), `isLocked`, `panSpeed`, `zoomSpeed`, `constraints` (bounds, padding, origin, initialZoom, baseZoom, behavior); conversión `editor.screenToPage` / `editor.pageToScreen` — [tldraw camera](https://tldraw.dev/sdk-features/camera)

**Excalidraw**
- Licencia MIT, repo activo — [excalidraw/excalidraw](https://github.com/excalidraw/excalidraw/)
- Arquitectura en `App.tsx`: importa `StaticCanvas`, `InteractiveCanvas` y `NewElementCanvas` (separación entre escena estática, capa interactiva y el elemento que se está dibujando); un `Renderer(this.scene)`; un objeto `gesture` con `pointers: Map`, `initialDistance`, `initialScale` (pinch implementado con Pointer Events propios, `getCenter`/`getDistance`); el zoom del navegador está "Prevented by default"; viewport/scroll en `appState` (`scrollX`, `scrollY`, `zoom`) y `scrollConstraints` — [App.tsx](https://github.com/excalidraw/excalidraw/blob/master/packages/excalidraw/components/App.tsx)
- El zoom se acota entre 0.1 y 30 y se recalculan `scrollX/scrollY` desde el centro del viewport — [mirror commit 29a5e98](https://gitea.maison43.duckdns.org/gilles/excalidraw/commit/29a5e982c3ca4ba52b8d78362ffe2129c1c41e2f) (espejo, no repo oficial)
- Excalidraw eliminó el soporte de "gestos nativos" de iOS (gesturestart/gesturechange) porque no permitía hacer zoom alrededor del centro del pinch — [commit 2b6d147 "Remove native gesture support from iOS (#2457)"](https://gitea.maison43.duckdns.org/gilles/excalidraw/src/commit/2b6d1470f936bfae113fc4765988b20e7db35bbb) (espejo)
- La herramienta "freedraw" de Excalidraw usa perfect-freehand para generar el contorno del trazo **[no verificado en esta sesión]** — [excalidraw repo](https://github.com/excalidraw/excalidraw/)

**perfect-freehand (Steve Ruiz)**
- Librería MIT que recibe puntos (x, y, presión) y devuelve el **polígono de contorno** del trazo (no una polilínea), con presión real o simulada por velocidad (`simulatePressure`), opciones `thinning`, `smoothing`, `streamline`, `taper`, `last` — [steveruiz/perfect-freehand](https://github.com/steveruiz/perfect-freehand) **[detalles de API no verificados en esta sesión]**
- Es la base de los trazos de tldraw y Excalidraw **[no verificado en esta sesión]** — [perfect-freehand](https://github.com/steveruiz/perfect-freehand)
- Actividad: proyecto estable/"terminado", pocos cambios recientes — **[no verificado; revisar fecha de última release en npm]** — [npm perfect-freehand](https://www.npmjs.com/package/perfect-freehand)

**js-draw (personalizedrefrigerator)**
- Librería de dibujo a mano alzada JS/TS ("pen, touchscreen, or mouse"), licencia MIT; ~1.736 commits, ~302 estrellas; pinch-zoom y rotación; opción de desactivar dibujo táctil para usar solo lápiz; zoom "casi infinito" (~10⁻¹⁰× a 10¹⁰×, configurable con `minZoom`/`maxZoom`); borrado parcial de trazos; exporta SVG (`toSVG`, `toSVGAsync`) y PNG/JPEG (`toDataURL`); ejemplos de edición colaborativa — [js-draw README](https://github.com/personalizedrefrigerator/js-draw)
- Es el editor de dibujo integrado en Joplin **[no verificado en esta sesión]** — [js-draw](https://github.com/personalizedrefrigerator/js-draw)

**Google Ink (github.com/google/ink)**
- "Freehand stroke generation library" que produce trazos suavizados y modelados con shaders de pincel como gráficos vectoriales basados en mallas; núcleo de Android Jetpack Ink; Apache-2.0; ~721 commits; build con Bazel 7 + Android NDK; el módulo de render solo soporta `android.graphics.Mesh`; sin garantías de estabilidad de interfaz; **sin mención a JavaScript/WebAssembly** — [google/ink](https://github.com/google/ink)
- Chromium lo vendoriza como `third_party/ink` (usado históricamente en el visor PDF/anotaciones de Chrome) — [Chromium README.chromium](https://chromium.googlesource.com/chromium/src/+/refs/tags/84.0.4132.0/third_party/ink/README.chromium)
- Jetpack Ink (Android) es la API pública — [androidx ink releases](https://developer.android.com/jetpack/androidx/releases/ink?hl=de)

**Microsoft Live Share Canvas**
- `@microsoft/live-share-canvas` ofrece `InkingManager` (tinta con lápiz, highlighter, láser, borrado) sobre canvas y sincronización colaborativa vía Fluid; licencia MIT **[no verificado en esta sesión]** — [microsoft/live-share-sdk](https://github.com/microsoft/live-share-sdk)

**Otras librerías (datos de conocimiento previo, no re-verificados en esta sesión)**
- Konva: scene graph sobre Canvas 2D, MIT, con binding `react-konva`; útil para formas/selección, no tiene modelo de tinta con presión propio — [konvajs.org](https://konvajs.org/); [konva repo](https://github.com/konvajs/konva) **[no verificado]**
- Fabric.js: canvas orientado a objetos, MIT, v6 reescrita en TypeScript; `PencilBrush` sin presión nativa — [fabricjs/fabric.js](https://github.com/fabricjs/fabric.js) **[no verificado]**
- Paper.js: motor de gráficos vectoriales sobre canvas, MIT, actividad baja en los últimos años — [paperjs/paper.js](https://github.com/paperjs/paper.js) **[no verificado]**
- Atrament: librería pequeña de dibujo en canvas, MIT, con soporte de presión y suavizado — [jakubfiala/atrament](https://github.com/jakubfiala/atrament) **[no verificado]**
- signature_pad: firmas en canvas con curvas Bézier y ancho variable por velocidad, MIT — [szimek/signature_pad](https://github.com/szimek/signature_pad) **[no verificado]**
- Rough.js: estilo "dibujado a mano" (bocetos), MIT; usado por Excalidraw; no es para tinta — [rough-stuff/rough](https://github.com/rough-stuff/rough) **[no verificado]**
- Xournal++: app de escritorio GPL-2.0; formato `.xopp` = XML comprimido con gzip, trazos con anchos por punto (presión) y fondo PDF — [xournalpp/xournalpp](https://github.com/xournalpp/xournalpp) **[no verificado]**
- W3C InkML: Recomendación W3C (2011) para representar tinta digital en XML (canales X, Y, presión, tiempo, etc.) — [W3C InkML](https://www.w3.org/TR/InkML/) **[no verificado]**; implementación JS de ejemplo: [qijinz/InkMLjs](https://github.com/qijinz/InkMLjs)

### Inferences
- Para Kwanta (ya con perfect-freehand), **tldraw no compensa**: obliga a clave de licencia en producción, precio opaco "value-based", y su modelo (lienzo infinito con shapes) no encaja con "hoja de examen fija con fondo". Lo valioso es aprender de su cámara (`screenToPage`, `zoomSteps`, constraints).
- Excalidraw es MIT y su patrón *StaticCanvas + InteractiveCanvas + NewElementCanvas* y el pinch propio con Pointer Events es directamente imitable.
- polygon-clipping (que Kwanta usa para unir/borrar contornos) es caro con miles de trazos; js-draw y tldraw borran por trazo/segmento en lugar de operaciones booleanas de polígonos — conviene evaluar si el borrador puede trabajar sobre puntos en vez de contornos.
- Para persistencia/interoperabilidad, guardar los **puntos de entrada (x, y, presión, t)** en vez de los paths SVG resultantes permite re-renderizar con otros motores y exportar a InkML o similar.
- Google Ink: portarlo a WASM sería un proyecto propio (Bazel + Emscripten, reescribir el renderer de mallas a WebGL); no hay soporte oficial — no recomendable a corto plazo.

### Gaps
- Precio oficial actual de la licencia comercial/Business de tldraw: no publicado (solo por ventas).
- Tamaños de bundle (minified+gzip) de cada librería: no verificados en esta sesión (consultar bundlephobia.com por paquete).
- "Kaleidoscope" como librería de tinta web: no encontré referencias fiables.
- Fecha de última release de perfect-freehand, Atrament, Konva, Fabric, Paper.js en 2025-2026: no verificada.
- No se verificó si Google publica algún binding web de Ink (búsqueda sin resultados).

## 2. APIs del navegador (Safari iPadOS): Delegated Ink, coalesced/predicted, pointerrawupdate, hover, inclinación, Pencil Pro, canvas desincronizado, OffscreenCanvas, 120 Hz

### Takeaway
Safari (iOS/iPadOS 18.2+) ya soporta `getCoalescedEvents` y `getPredictedEvents` (con un bug inicial de pointerId en 18.2), pero **no** Delegated Ink Trail ni `pointerrawupdate`. El hover del Pencil sí genera eventos de puntero; el `twist` (barrel roll del Pencil Pro) aún no llega a la web y el squeeze no está expuesto. El rAF en Safari sigue limitado a ~60 fps por defecto salvo desactivar un feature flag.

### Cited Findings
- `getCoalescedEvents`: soportado en Safari iOS desde 18.2 (18.1 no) — [caniuse getCoalescedEvents](https://caniuse.com/mdn-api_pointerevent_getcoalescedevents); implementación iOS en WebKit julio 2024 — [WebKit bug 276832](https://bugs.webkit.org/show_bug.cgi?id=276832); [webkit-changes jul-2024](https://lists.webkit.org/pipermail/webkit-changes/2024-July/304567.html)
- `getPredictedEvents`: soportado desde Safari 18.2 — [caniuse getPredictedEvents](https://caniuse.com/mdn-api_pointerevent_getpredictedevents); commit agosto 2024 — [WebKit bug 277185](https://bugs.webkit.org/show_bug.cgi?id=277185)
- Bug: en iOS 18.2 los eventos coalescidos venían sin `pointerId` ni `target` correctos; Flutter añadió un workaround — [Flutter engine commit](https://dart.googlesource.com/external/github.com/flutter/engine/+/23447c4674b0837ada66d29099147e05a695cec4)
- En enero de 2026 WebKit eliminó las preferencias `GetCoalescedEventsEnabled`/`GetPredictedEventsEnabled` (ya no están tras flag) — [WebKit bug 305840](https://bugs.webkit.org/show_bug.cgi?id=305840)
- Delegated Ink Trail (`navigator.ink.requestPresenter({presentationArea})`): experimental, no Baseline; solo Chromium (Chrome 94, Edge 93, Opera 80, Samsung Internet); **no soportado en Safari (incluido iOS) ni Firefox** — [MDN Ink API](https://developer.mozilla.org/en-US/docs/Web/API/Ink_API); [MDN requestPresenter](https://developer.mozilla.org/en-US/docs/Web/API/Ink/requestPresenter); [caniuse DelegatedInkTrailPresenter](https://caniuse.com/mdn-api_delegatedinktrailpresenter)
- `pointerrawupdate`: solo Chromium; Safari no lo soporta **[no verificado en esta sesión]** — [caniuse pointerrawupdate](https://caniuse.com/mdn-api_element_pointerrawupdate_event)
- Hover del Apple Pencil: un ingeniero de WebKit confirma "we already dispatch hover events for Apple Pencil hover" (sept-2025) — [WebKit bug 296943](https://bugs.webkit.org/show_bug.cgi?id=296943). Apple añadió inclinación y azimut al hover en iPadOS 16.4 — [MacRumors, iPadOS 16.4 hover](https://www.macrumors.com/2023/03/27/ipados-16-4-apple-pencil-hover/)
- Problemas reportados: Pencil que deja de hacer hover tras dibujar en iPadOS 26.6 — [Apple Developer Forums 841870](https://developer.apple.com/forums/thread/841870); eventos de Pencil Pro en Safari — [forum 760238](https://developer.apple.com/forums/thread/760238), [forum 776468](https://developer.apple.com/forums/thread/776468)
- Pencil Pro barrel roll: petición de exponerlo vía atributo `twist` de Pointer Events (bug abierto ago-2025, estado NEW); hay una implementación experimental (WebKit PR 50207, bug dependiente 298276 "[Experimental] Expose roll angle of Apple Pencil for twist") pero en iPadOS 26.4.1 con iPad Pro M4 + Pencil Pro `twist` sigue siendo siempre 0 (abril 2026). Haptics y squeeze no expuestos — [WebKit bug 296943](https://bugs.webkit.org/show_bug.cgi?id=296943)
- 120 Hz: Safari en iPhone/iPad tiene el feature flag "Prefer Page Rendering Updates near 60fps" **activado por defecto**; al desactivarlo (Ajustes > Safari > Avanzado > Feature Flags) renderiza hasta 120 Hz — [MacRumors how-to](https://www.macrumors.com/how-to/enable-smoother-120hz-browsing-in-safari/); bug histórico — [WebKit bug 173434](https://bugs.webkit.org/show_bug.cgi?id=173434); en web apps de pantalla de inicio (PWA) los reportes son contradictorios (un reporte en iOS 26 logró 120 fps solo tras desactivar el flag) — [WebKit bug 272226](https://bugs.webkit.org/show_bug.cgi?id=272226); [WebKit bug 272165](https://bugs.webkit.org/show_bug.cgi?id=272165)
- Pointer Events del Pencil: `pressure`, `tiltX/tiltY`, `pointerType:'pen'` estándar en la especificación; `altitudeAngle`/`azimuthAngle` definidos en Pointer Events nivel 3 — [W3C Pointer Events](https://www.w3.org/TR/pointerevents/). Soporte de `altitudeAngle/azimuthAngle` en Safari: **[no verificado en esta sesión]** — [caniuse pointer](https://www.caniuse.com/pointer)
- Artículo práctico sobre presión del Pencil y getCoalescedEvents en el navegador — [DEV: Reading Apple Pencil pressure in the browser](https://dev.to/sendotltd/reading-apple-pencil-pressure-in-the-browser-pointerevent-getcoalescedevents-and-the-2e23)
- Pregunta en foros sobre si es posible obtener la entrada a 240 Hz del Pencil en JS — [Apple forum 689375](https://developer.apple.com/forums/thread/689375)
- Canvas `desynchronized: true` (`getContext('2d', {desynchronized:true})`) es una pista de baja latencia soportada en Chromium; Safari no la soporta **[no verificado en esta sesión]** — [MDN getContext](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext)
- OffscreenCanvas: Safari 16.4 añadió OffscreenCanvas con contexto 2D (WebGL en workers llegó después, Safari 17) **[no verificado en esta sesión]** — [caniuse offscreencanvas](https://caniuse.com/offscreencanvas)

### Inferences
- Para Kwanta: mantener `getCoalescedEvents` (más puntos → trazos más fieles) y usar `getPredictedEvents` solo para la **capa de previsualización en vivo** (descartar puntos predichos al confirmar el trazo). Añadir guardas: detectar si la API existe y filtrar por `pointerId` del evento padre por el bug de 18.2.
- No contar con Delegated Ink Trail en iPad; la mejora de latencia debe venir de canvas en vivo pequeño + predicción + rAF.
- Como la mayoría de alumnos tendrá el flag de 60 fps activo, el rAF irá a ~60 Hz: dibujar el trazo en vivo dentro del handler `pointermove` (no esperar al rAF) puede reducir latencia percibida; medir en dispositivo real.
- El hover del Pencil permite mostrar un cursor/preview de grosor antes de tocar (pointermove con `buttons === 0` y `pointerType === 'pen'`).
- Barrel roll / squeeze del Pencil Pro: no planificar funcionalidades sobre ellos en la web.

### Gaps
- No encontré nota oficial de Apple/WebKit fechando exactamente la versión de iPadOS en que Safari empezó a emitir eventos de hover del Pencil (¿16.1 o 16.4?).
- Soporte exacto de `altitudeAngle`/`azimuthAngle` en Pointer Events de Safari: no verificado.
- Estado de `desynchronized` y `pointerrawupdate` en Safari 26: no verificado directamente en esta sesión.
- No hay confirmación de si Safari 26 cambió el valor por defecto del flag de 60 fps (los reportes sugieren que sigue activo por defecto).

## 3. Pan/zoom en la web: zoom nativo vs cámara propia, cómo lo hacen tldraw/Excalidraw, bloquear el pinch de Safari, re-rasterizado, librerías y trampas en iOS

### Takeaway
Las apps de dibujo serias (tldraw, Excalidraw, js-draw) **desactivan el zoom nativo del navegador e implementan su propia cámara** (x, y, zoom) aplicada como transformación al canvas/SVG, con la UI fuera de esa transformación — eso elimina de raíz el problema de la barra de herramientas escalada que Kwanta parcheó con visualViewport. En iOS, bloquear el pinch nativo requiere combinar `touch-action: none`, `preventDefault` en touch/gesture events y pruebas en dispositivo real, porque `user-scalable=no` se ignora desde iOS 10.

### Cited Findings
- iOS 10 cambió el comportamiento: Safari ignora `user-scalable=no` / `maximum-scale` para permitir siempre el zoom por accesibilidad — [WebKit blog: New Interaction Behaviors in iOS 10](https://webkit.org/?p=7367)
- `touch-action: none` en el canvas permite manejar el pinch en JS — [Three.js forum](https://discourse.threejs.org/t/problems-with-running-3d-web-apps-games-on-iphones/9468); [MDN touch-action](https://developer.mozilla.org/Web/CSS/touch-action). Fuentes antiguas indicaban soporte limitado en iOS (solo `auto` y `manipulation`) — [CSS-Tricks touch-action](https://css-tricks.com/almanac/properties/t/touch-action) (posiblemente desactualizado)
- Aun con `preventDefault()` en `gesturestart/gesturechange/gestureend`, el gesto de "pinch para ver todas las pestañas" de Safari se dispara a veces; el workaround conocido es `preventDefault()` en el `touchstart` que inicia el gesto — [WebKit bug 195052](https://bugs.webkit.org/show_bug.cgi?id=195052)
- Con web components hay que añadir handlers de gesturestart/gesturechange en cada componente — [WebKit bug 233141](https://bugs.webkit.org/show_bug.cgi?id=233141) (según resumen del buscador)
- Si un solo elemento tiene `touch-action: pinch-zoom` o `manipulation`, iOS puede hacer zoom automático al tocar inputs pequeños; en iOS 14.6 se bloqueó el pinch pero no el doble toque — [DEV: Disabling viewport zoom on iOS 14](https://dev.to/jasperreddin/disabling-viewport-zoom-on-ios-14-web-browsers-l13)
- `touch-action: none` no impidió el zoom por doble toque en elementos con posición absoluta en iOS Safari — [WebKit bug 218015](https://bugs.webkit.org/show_bug.cgi?id=218015) (según resumen del buscador)
- Pregunta clásica en foros de Apple sobre desactivar el pinch-zoom — [Apple forum 101810](https://developer.apple.com/forums/thread/101810)
- tldraw: cámara `{x, y, z}`, `screenToPage`/`pageToScreen`, `zoomSteps`, `constraints`, `isLocked`, `wheelBehavior` — [tldraw camera](https://tldraw.dev/sdk-features/camera)
- Excalidraw: zoom/scroll en `appState`, pinch propio con mapa de pointers + distancia inicial, zoom de navegador "Prevented by default", canvases estático/interactivo separados — [Excalidraw App.tsx](https://github.com/excalidraw/excalidraw/blob/master/packages/excalidraw/components/App.tsx); eliminó gestos nativos de iOS porque no permitían zoom alrededor del centro — [commit 2b6d147 (espejo)](https://gitea.maison43.duckdns.org/gilles/excalidraw/src/commit/2b6d1470f936bfae113fc4765988b20e7db35bbb)
- js-draw implementa su propio pinch-zoom/rotación con rango de zoom enorme — [js-draw](https://github.com/personalizedrefrigerator/js-draw)
- Diferenciar pinch de trackpad (wheel con `ctrlKey`) vs scroll con dos dedos — [Hashnode: trackpad pinch vs two-finger scroll](https://hashnode.com/posts/how-to-handle-trackpad-pinch-to-zoom-vs-two-finger-scroll-in-javascript-canvas-apps/69a8022db3a49fdacbf8c4f0)
- Ejemplo de pan+zoom fluido en React+canvas — [gist krabhi1](https://gist.github.com/krabhi1/af717bca34b18487753c54f6e7f572f0)
- Librerías de pan/zoom (conocimiento previo, no re-verificadas): `@panzoom/panzoom` (timmywil, MIT, transforma un elemento DOM con CSS transform) — [timmywil/panzoom](https://github.com/timmywil/panzoom); `panzoom` (anvaka, MIT) — [anvaka/panzoom](https://github.com/anvaka/panzoom); `d3-zoom` (ISC) — [d3/d3-zoom](https://github.com/d3/d3-zoom); `@use-gesture/react` (pmndrs, MIT; gestos pinch/drag/wheel unificados, con opción de prevenir gestos de Safari) — [pmndrs/use-gesture](https://github.com/pmndrs/use-gesture); `zoompinch` — [MauriceConrad/zoompinch](https://github.com/MauriceConrad/zoompinch) **[no verificado]**

### Inferences
- Recomendación para Kwanta: **cámara propia** `{x, y, zoom}` en el estado; la hoja (fondo PDF/imagen + capa de tinta) dentro de un contenedor con `transform: translate() scale()`; la barra de herramientas fuera de ese contenedor (posición fija normal, sin visualViewport). Pinch con dos dedos a través de Pointer Events (`pointerType === 'touch'`), escritura solo con `pointerType === 'pen'` (palm rejection gratis).
- Blindaje en iOS: `touch-action: none` en el área de dibujo (y `html, body { overscroll-behavior: none; }`), `preventDefault` en `touchstart`/`touchmove` con `{passive:false}` dentro del área, y en `gesturestart`/`gesturechange` a nivel documento; mantener la meta viewport `width=device-width, initial-scale=1` (aunque iOS ignore `user-scalable=no`). Probar en dispositivo real incluyendo doble toque.
- Nitidez: un `scale()` CSS sobre un canvas rasterizado se ve borroso; tras terminar el gesto (debounce ~150 ms) re-renderizar el canvas con resolución `devicePixelRatio * zoom` (limitando el tamaño máximo del canvas en iOS) o, para la capa SVG, dejar que el navegador re-rasterice al cambiar el `transform` final. Durante el gesto se puede aceptar el escalado borroso para mantener 60 fps.
- Accesibilidad: al desactivar el zoom nativo, ofrecer zoom propio (botones, pinch) para no perjudicar a alumnos con baja visión.

### Gaps
- No obtuve el código concreto de tldraw para bloquear `gesturestart` en Safari ni su doc de "input handling" (no incluida en el fetch).
- Límite de tamaño de canvas en iOS Safari 26 (históricamente ~16,7 Mpx por canvas y memoria total limitada): no verificado en esta sesión.
- Soporte completo de `touch-action` en Safari moderno: las fuentes encontradas son antiguas o contradictorias.

## 4. Rendimiento con miles de trazos (tiles, SVG vs Canvas vs WebGL, Path2D)

### Takeaway
SVG con miles de `<path>` complejos (contornos de perfect-freehand + uniones con polygon-clipping) escala mal en iPad; el patrón usado por Excalidraw/js-draw es **canvas en capas**: una capa estática cacheada (bitmap) que solo se redibuja al cambiar zoom o al confirmar trazos, y una capa interactiva pequeña para el trazo en curso. Path2D precalculado por trazo y teselas (tiles) son las optimizaciones habituales; WebGL solo si hay decenas de miles de trazos.

### Cited Findings
- Excalidraw separa `StaticCanvas` (escena), `InteractiveCanvas` (selección/handles) y `NewElementCanvas` (elemento en curso) — [Excalidraw App.tsx](https://github.com/excalidraw/excalidraw/blob/master/packages/excalidraw/components/App.tsx)
- js-draw ofrece `toSVGAsync()` para imágenes grandes (exportación no bloqueante) — [js-draw README](https://github.com/personalizedrefrigerator/js-draw)
- Google Ink genera trazos como mallas (meshes) para render por GPU — [google/ink](https://github.com/google/ink)
- OffscreenCanvas permite rasterizar en un Worker (soportado en Safari 16.4+ para 2D) **[no verificado en esta sesión]** — [caniuse offscreencanvas](https://caniuse.com/offscreencanvas)
- `Path2D` permite construir un path una vez (incluso desde un string SVG `d`) y reutilizarlo en cada `fill()` — [MDN Path2D](https://developer.mozilla.org/en-US/docs/Web/API/Path2D) **[no verificado en esta sesión]**

### Inferences
- Plan concreto para Kwanta:
  1. Guardar por trazo: puntos crudos + `Path2D` cacheado del contorno + bounding box.
  2. Capa estática: canvas (o tiles de p. ej. 512×512 px de página) con todos los trazos confirmados; al terminar un trazo solo se pinta ese trazo encima (no redibujar todo).
  3. Borrador: hit-test por bounding box + distancia a los puntos (R-tree/rbush para indexar) en vez de `polygon-clipping` sobre todos los contornos; reservar operaciones booleanas para el "borrador parcial" y aplicarlas solo a los trazos afectados.
  4. Zoom: durante el gesto, transformar el bitmap con CSS; al terminar, re-rasterizar solo los tiles visibles a la nueva escala.
  5. Exportación/corrección: SVG generado bajo demanda (no como DOM vivo de edición).
- SVG sigue siendo razonable para pocas centenas de trazos por hoja; con hojas de examen de varias páginas y miles de trazos, el coste de layout/paint del DOM SVG en iPad es el cuello de botella probable (inferencia; medir con Web Inspector en dispositivo).
- WebGL (p. ej. vía mallas tipo Google Ink) solo merecería la pena si se necesitan efectos de pincel o >10⁴ trazos visibles a la vez.

### Gaps
- No encontré benchmarks publicados y recientes (2025-2026) de SVG vs Canvas vs WebGL para tinta en iPad Safari; sería necesario medir.
- No se verificó la documentación de rendimiento de tldraw (culling, renderizado de shapes en DOM/SVG) en esta sesión.
- No hay datos de memoria máxima de canvas en Safari iPadOS 26.
