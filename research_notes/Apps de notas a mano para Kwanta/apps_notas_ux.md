# UX e internals de las apps líderes de notas a mano (Notability, Goodnotes, Apple Notes/Freeform/PencilKit, Nebo/MyScript, Concepts, etc.) — lecciones para Kwanta

Nota de alcance: investigación hecha el 2026-11-24 con ~18 búsquedas/fetches. La cobertura es fuerte en Goodnotes (incl. su versión web en Swift/Wasm), Notability (release notes 2026), PencilKit (latencia) y matemáticas (Goodnotes, Nebo/MyScript, Apple Math Notes). Es débil o nula en Samsung Notes, OneNote, Noteshelf 3, Flexcil y CollaNote (sin fuentes encontradas en el presupuesto; ver Gaps). Las fechas sin año en las release notes de Notability en la App Store son de 2026 (una de ellas menciona iOS 27).

## 1. Barra de herramientas: posición, flotante vs fija, favoritos, personalización

### Takeaway
La tendencia 2023-2025 es pasar de una barra superior fija a barras/menús flotantes y movibles con favoritos y personalización (ocultar/reordenar herramientas). El rediseño de Goodnotes de septiembre de 2025 provocó una fuerte reacción porque los menús flotantes tapaban el lienzo y algunas herramientas quedaron más lejos. Goodnotes tuvo que añadir personalización y la opción de anclar los menús a los bordes en noviembre de 2025. Lección para Kwanta: si la barra es flotante, debe poder anclarse a un borde y no tapar el contenido, y las herramientas frecuentes (pen↔lasso, línea recta, color) deben quedar a un toque.

### Cited Findings
- Notability 10 (agosto de 2020) añadió una "favorites toolbar" para guardar y alternar rápidamente hasta 8 estilos de Pen, Highlighter y Eraser. Es una barra aparte que se puede mover y colocar en cualquier sitio. — [9to5Mac (2020)](https://9to5mac.com/2020/08/31/notability-app-for-iphone-and-ipad-gets-new-themes-sticker-packs-favorites-toolbar-more/); [MacRumors (2020)](https://www.macrumors.com/2020/08/31/notability-10-new-tools-shop/)
- Notability 14 (julio de 2023) trajo un rediseño con una "Toolbox" flotante y movible. Casi todas las herramientas se personalizan y se acceden desde ella, Tape y Ruler incluidas. — [AlternativeTo (2023)](https://alternativeto.net/news/2023/7/notability-unveils-major-update-with-a-refreshed-look-enhanced-accessibility-and-free-tools-for-all-users); [AppAdvice](https://appadvice.com/post/note-taking-app-notability-updated-with-customizable-toolbox-and-more/777878)
- No encontré ningún rediseño de la barra de Notability en 2025-2026. Las release notes de 2026 solo mencionan cambios menores: un botón de bloque de código en la barra de texto (16.8.1) y barras de Learn actualizadas (16.13.5). — [App Store Notability](https://apps.apple.com/us/app/id360593530)
- Goodnotes, nueva barra de septiembre de 2025:
  - Movió muchas herramientas a la barra principal y puso Shapes y Writing Tools en menús flotantes.
  - Los usuarios se quejaron de cinco cosas. El menú flotante tapaba el PDF y el lienzo. El lasso pasó a ser la herramienta por defecto al abrir una nota. Desapareció la herramienta de línea recta de la barra de formas. "Hold to snap" era errático. Zoom Window y otras acciones frecuentes quedaron a más toques.
  - Algunos usuarios dijeron que pensaban pasarse a Notability.
  — [Foro de feedback de Goodnotes, hilo "Sep 2025 Launch New Toolbar"](https://feedback.goodnotes.com/forums/191274-customer-suggestions-for-goodnotes/suggestions/50550846--sep-23-launch-new-toolbar-suggestions?page=2)
- Respuesta oficial de Goodnotes en el mismo hilo:
  - 17-oct-2025: anunció refinamientos.
  - 20-nov-2025 (versión 7.0.14): llegó la personalización de la barra. Permite ocultar y reordenar herramientas, personalizar el panel Writing Tools, añadir Zoom Window, Time Keeper o Ruler a la barra principal, anclar ("snap") los menús flotantes a cualquier borde y volver al diseño por defecto.
  - 4-dic-2025: nuevo menú flotante para cajas de texto y "Pin Text Tool".
  - 22-dic-2025: hilo cerrado como "Completed".
  — [Foro de feedback de Goodnotes](https://feedback.goodnotes.com/forums/191274-customer-suggestions-for-goodnotes/suggestions/50550846--sep-23-launch-new-toolbar-suggestions?page=2)
- Hay además un hilo de feedback de Goodnotes específico de personalización de la barra, en el que usuarios citan Notability como referencia. — [Goodnotes feedback "[Toolbar] Support Customization"](https://feedback.goodnotes.com/forums/191274-customer-suggestions-for-goodnotes/suggestions/50583833--toolbar-support-customization?page=2)

### Inferences
- En las apps nativas, la barra es UI del sistema fuera del lienzo con zoom, así que mantiene siempre su tamaño en pantalla. Ese es el comportamiento esperado. En una web app de Safari, Kwanta debe cumplir dos condiciones:
  - El zoom tiene que ser del lienzo (transform/escala propia), no el pinch-zoom del sistema. Se consigue con `touch-action: none` en el lienzo y `user-scalable=no` / gestos gestionados.
  - La barra debe ir fuera del elemento escalado, con `position: fixed`.
  Si se usa el zoom del navegador, la barra se escala y se descoloca.
- Lo que se debe copiar:
  - Favoritos o presets de pluma (estilo Notability, unos 8 slots).
  - Barra anclable a bordes (estilo Goodnotes post-nov-2025).
  - La pluma como herramienta por defecto al abrir una hoja, no el lasso.
  - Línea recta accesible.
- La historia de Goodnotes demuestra que quitar herramientas a las que la gente está acostumbrada genera rechazo inmediato. Conviene dar una opción de "restablecer diseño" y opciones de personalización.

### Gaps
- No encontré la documentación oficial actual (2026) de Notability sobre Toolbox y favoritos: el artículo de soporte "Three ways to customize your tools" devolvió 404.
- No encontré la documentación de la barra de Noteshelf 3, Samsung Notes, OneNote ni CollaNote.
- La numeración "Goodnotes 7.0.14" aparece en la respuesta oficial del foro. No pude confirmar si "Goodnotes 6" se renumeró a 7.x en la App Store.

## 2. Zoom y scroll

### Takeaway
Goodnotes conserva la "Zoom Window" (caja de zoom con auto-avance) como herramienta clave para escribir en letra pequeña. Tras el rediseño de 2025 se movió a un desplegable, y en noviembre de 2025 volvió a poder añadirse a la barra principal. Notability permite desplazarse con un dedo mientras se escribe con Apple Pencil; sin él, se hace con dos dedos o con la herramienta Navigate. Goodnotes en la web renderiza en un canvas de pantalla completa con WebGL, lo que permite re-renderizar el vector a cualquier zoom.

### Cited Findings
- Goodnotes Zoom Window:
  - Se abre desde la barra o con una pulsación larga con el dedo en la página → Zoom.
  - Al escribir y cruzar la mitad de la ventana aparece un área azul. Seguir escribiendo ahí hace avanzar automáticamente la caja azul por la página (auto-advance).
  - Cuanto más pequeña es la caja, mayor es la magnificación. El tirador de la esquina cambia el tamaño manteniendo la proporción, y los tiradores inferiores cambian solo la altura.
  — [Goodnotes Support](https://support.goodnotes.com/hc/en-us/articles/7353756826383)
- Para salir de la Zoom Window se toca el icono "Exit Zoom Window" arriba a la derecha. — [Goodnotes Notion](https://goodnotes-team.notion.site/Zoom-Window-Tool-69dce725c02d48d99feccff71fe3a284)
- Los usuarios piden poder usar lasso y "scribble to erase" dentro de la zoom window, y critican los "snap backs" (la caja salta de posición) y que la ventana se corte al final de la página. — [Feedback lasso en zoom window](https://feedback.goodnotes.com/forums/191274-customer-suggestions-for-goodnotes/suggestions/50186085-zoom-update); [Feedback snap backs](https://feedback.goodnotes.com/forums/191274-customer-suggestions-for-goodnotes/suggestions/36848953-restore-the-zoom-window-s-functionality-please-r); [Feedback se corta al final de la página](https://feedback.goodnotes.com/forums/191274-customer-suggestions-for-goodnotes/suggestions/42186007-zoom-window-cuts-off-at-bottom-of-page)
- Con el rediseño de 2025, Zoom Window quedó más escondida. Desde la versión 7.0.14 (nov-2025) se puede volver a añadir a la barra principal. — [Foro Goodnotes](https://feedback.goodnotes.com/forums/191274-customer-suggestions-for-goodnotes/suggestions/50550846--sep-23-launch-new-toolbar-suggestions?page=2)
- Notability:
  - Con Apple Pencil, se puede hacer scroll con un dedo mientras se escribe con el lápiz.
  - Sin Pencil, se usa la herramienta Navigate. Con otra herramienta activa, se desplaza con dos dedos.
  - El soporte de palm rejection mejorado y el scroll con un dedo llegaron en la versión 6.2.0 (antigua).
  — [Notability Support "Writing with Apple Pencil"](https://support.gingerlabs.com/hc/en-us/articles/218333197)
- Las release notes 16.13.2 de Notability (octubre de 2026) corrigen un fallo de zoom y scroll en iOS 27. Es la única mención al zoom en las notas recientes. — [App Store Notability](https://apps.apple.com/us/app/id360593530)
- Goodnotes web pasó la vista del documento de elementos DOM a un canvas de pantalla completa para reducir el trabajo del DOM en dispositivos modestos. Además, reescribió algoritmos síncronos que bloqueaban el hilo principal y añadió "yield" para que el navegador pueda pintar. — [web.dev case study Goodnotes](https://web.dev/case-studies/goodnotes)
- El motor de render de Goodnotes es propio, sobre Metal en iOS y WebGL en la web, con la lógica de render compartida y una capa de abstracción por plataforma. El objetivo declarado es más de 60 FPS en el render de tinta en tiempo real. — [Swift.org blog, 1-jun-2026](https://swift.org/blog/bringing-goodnotes-to-web-with-swift/)
- Concepts usa un lienzo infinito con trazos vectoriales que se pueden editar después de dibujarlos (herramienta, color, tamaño, suavizado). Algunas reseñas de usuarios hablan de un límite de unos 30.000 trazos por memoria (afirmación de usuario, no oficial). — [App Store Concepts](https://apps.apple.com/app/560586497)

### Inferences
- Para hojas de examen IB, conviene paginar (páginas A4/Letter con scroll vertical continuo, como Goodnotes y Notability en modo vertical) en lugar de un lienzo infinito. Así la hoja impresa o exportada coincide con lo que se ve. El lienzo infinito (Concepts, Freeform) encaja mejor con borradores.
- Para que la tinta se vea nítida con zoom, hay que guardar los trazos como vectores (puntos con presión) y redibujar al terminar el gesto de zoom a la resolución `devicePixelRatio × zoom`. Durante el pinch se puede escalar el bitmap (CSS transform) y re-rasterizar al soltar. Es la misma estrategia que permite Goodnotes con WebGL. Es una inferencia: Goodnotes no documenta los detalles de su re-render.
- Una "zoom box" estilo Goodnotes es muy útil en iPad para escribir subíndices y fórmulas pequeñas de física. Sus reglas de diseño:
  - La caja se puede redimensionar.
  - Tiene auto-avance al cruzar la mitad.
  - Lasso y borrador deben funcionar dentro de ella.
  - No debe tener "snap backs".
- Gestos recomendados por convención (Notability): el lápiz escribe, un dedo hace scroll (si el Pencil está activo) y dos dedos hacen pinch-zoom o pan.

### Gaps
- No encontré los límites numéricos de zoom (p. ej. máx. 400 % o 800 %) de Goodnotes ni de Notability.
- No encontré documentación oficial sobre si Goodnotes y Notability tienen scroll horizontal (página a página) además del vertical continuo. Por conocimiento general, ambos ofrecen ajuste de dirección de scroll, pero no está verificado aquí.

## 3. Calidad de tinta: latencia, predicción, palm rejection, presión/inclinación, tipos de pluma

### Takeaway
Apple bajó la latencia del Pencil de unos 20 ms a unos 9 ms en iPadOS 13 (ProMotion) combinando predicción de toques, optimizaciones de Metal y procesamiento de eventos a mitad de frame. Las apps que no usan PencilKit deben implementar predicción por su cuenta. En 2026 Notability añadió estabilización de tinta y una pluma caligráfica sensible al ángulo, señal de que el suavizado y el "ink feel" siguen siendo diferenciadores.

### Cited Findings
- La latencia del Apple Pencil pasó de unos 20 ms a 9 ms con iPadOS 13, principalmente en los iPad Pro con ProMotion. Según un email de Craig Federighi, se logra combinando optimizaciones de render en Metal, "touch prediction" y "mid-frame event processing". Los desarrolladores reciben esas mejoras a través de PencilKit. — [MacRumors (2019)](https://www.macrumors.com/2019/06/21/apple-pencil-latency-ipados-developers); [Macworld (2019)](https://www.macworld.com/article/3402336/apple-pencil-changes-and-improvements-in-ipados-13.html)
- La sesión de PencilKit de la WWDC 2019 recomienda usar predicted touches para reducir aún más la latencia. UIKit ofrece predicted touches desde iOS 9. — [WWDC 2019 sesión 221](https://developer.apple.com/videos/play/wwdc2019/221); [9to5Mac sobre PencilKit (2019)](https://9to5mac.com/2019/06/06/pencilkit-apple-wwdc/)
- Apple mantiene una página de actualizaciones de la documentación de Apple Pencil. Las sesiones de la WWDC 2024 (sesión 10214) cubren novedades de PencilKit y Pencil. — [Apple Developer: Apple Pencil updates](https://developer.apple.com/documentation/updates/applepencil.md); [WWDC 2024 sesión 10214](https://developer.apple.com/kr/videos/play/wwdc2024/10214/?time=568)
- Notability 2026:
  - Calligraphy Pen que responde al ángulo del trazo (16.9, agosto).
  - Estabilización de tinta para pen, pencil y highlighter (16.14, noviembre).
  - Nuevos grosores de 1,5 y 2,5 para pen, highlighter y calligraphy (16.12.5, octubre).
  — [App Store Notability](https://apps.apple.com/us/app/id360593530)
- Goodnotes web: cada tipo de trazo (pen, highlighter, fountain pen, shapes, eraser) debe dar el mismo resultado que en iOS, y por eso comparten el motor en Swift. — [web.dev case study](https://web.dev/case-studies/goodnotes)
- Smart Script de Apple (iPadOS 18) suaviza y endereza la escritura a mano en tiempo real con un modelo on-device que conserva el estilo del usuario. También permite insertar espacio, pegar texto tecleado en la letra del usuario y tachar ("scratch out") para borrar. — [Apple Newsroom, jun-2024](https://www.apple.com/newsroom/2024/06/ipados-18-introduces-powerful-intelligence-features-and-apps-for-apple-pencil/); [Apple Support: Use handwriting in Notes](https://support.apple.com/en-ae/121259)
- Concepts permite ajustar el suavizado de un trazo después de dibujarlo, porque los trazos son vectoriales. — [App Store Concepts](https://apps.apple.com/app/560586497)

### Inferences
- En Safari web no hay PencilKit ni predicción nativa expuesta como en UIKit. Kwanta debe hacer tres cosas:
  - Usar Pointer Events (`pointerType === "pen"`) con `getCoalescedEvents()` para obtener todos los puntos.
  - Usar `getPredictedEvents()` si Safari lo soporta, y si no, extrapolar 1 o 2 muestras y descartarlas cuando llega el punto real.
  - Dibujar el trazo en curso en una capa aparte y "cocerlo" en la capa estática al terminar.
  Esto imita la receta de Apple (predicción + render rápido). Pendiente: verificar el soporte de estas APIs en Safari, que no se comprobó en esta investigación.
- Palm rejection en web: ignorar `pointerType === "touch"` para dibujar mientras haya un pen activo, o siempre en "modo solo lápiz" (como Notability, donde el dedo hace scroll).
- Un suavizado/estabilización configurable (Notability 16.14) y el grosor variable por presión son el estándar esperado.

### Gaps
- No encontré cifras públicas de latencia de Goodnotes, Notability ni de la web de Goodnotes.
- No encontré documentación oficial de cómo Goodnotes o Notability calculan la variación de grosor por presión o inclinación, ni de qué algoritmo de suavizado usan.
- No investigué el comportamiento de Apple Pencil hover en Safari ni el soporte de presión e inclinación en Safari iPadOS (los campos `pressure`, `tiltX`/`tiltY`, `altitudeAngle`/`azimuthAngle`). Es probable que lo cubra otro investigador.
- Highlighter que queda debajo de la tinta: no encontré documentación explícita de que Goodnotes o Notability lo hagan.

## 4. Borrador, lasso, formas, línea recta, cinta (tape), gestos de deshacer

### Takeaway
Las apps líderes ofrecen borrado por trazo completo y borrado parcial, lasso para mover, redimensionar y recolorear, y reconocimiento de formas con "dibujar y mantener". También tienen gestos de deshacer: Notability usa tap con dos dedos para deshacer y tap con tres para rehacer, y Goodnotes usa doble tap por problemas de palm rejection. El reconocimiento de formas por "hold" es delicado: los usuarios de Goodnotes se quejaron cuando se volvió obligatorio en el highlighter.

### Cited Findings
- El borrador de Goodnotes tiene dos tipos:
  - "Stroke Eraser" borra el trazo continuo entero.
  - "Standard Eraser" recorta solo la parte del trazo que se toca.
  Solo actúa sobre trazos de pen, pencil, highlighter y tape. El texto tecleado, las imágenes y el texto de PDF se borran con el Lasso y Delete en el menú del objeto. — [Goodnotes Support "Erase content with the Eraser tool"](https://support.goodnotes.com/hc/en-us/articles/7353718249231-Erase-content-with-the-Eraser-tool)
- Hay petición de usuarios de un "selective eraser" en Goodnotes que borre solo un tipo de trazo, p. ej. solo highlighter. — [Feedback Goodnotes](https://feedback.goodnotes.com/forums/191274-customer-suggestions-for-goodnotes/suggestions/44050440-selective-eraser)
- En Notability se dibuja una forma y se mantiene el lápiz un segundo hasta que se autocorrige en una "Perfect Shape". — [Notability Support](https://support.gingerlabs.com/hc/en-us/articles/360029432891)
- Goodnotes, tras el rediseño de 2025, recibió tres quejas relacionadas: "hold to snap" errático, líneas rectas que se unían solas a formas cercanas, y draw-and-hold obligatorio en el highlighter, que daba segmentos en ángulo en vez de líneas rectas. — [Foro Goodnotes](https://feedback.goodnotes.com/forums/191274-customer-suggestions-for-goodnotes/suggestions/50550846--sep-23-launch-new-toolbar-suggestions?page=2)
- Gestos de Notability: tap con dos dedos para deshacer y con tres dedos para rehacer, o swipe con tres dedos a izquierda/derecha. Son configurables en los ajustes de gestos. — [Notability Help (intercom)](https://intercom.help/notability/*/articles/16300204)
- Goodnotes explica que el tap simple chocaba con el palm rejection y se activaba por accidente, y que por eso usa doble tap. Los usuarios aun así piden poder desactivar los "palm gestures". — [Feedback Goodnotes "Palm Gestures" undo/redo](https://feedback.goodnotes.com/forums/191274-customer-suggestions-for-goodnotes-apple/suggestions/50957381--palm-gestures-various-improvements-for-undo-redo?page=2); [Feedback "Disable Palm Gestures"](https://feedback.goodnotes.com/forums/191274-customer-suggestions-for-goodnotes-apple/suggestions/50906222--palm-gestures-disable-palm-gestures?page=2)
- Goodnotes documenta gestos con el lápiz (scribble to erase y otros) en su Notion de ayuda. — [Goodnotes Notion "Pen Gestures"](https://goodnotes-team.notion.site/Pen-Gestures-26fb740273d281e4b3f6cb20cad4590e)
- La Toolbox de Notability 14 (2023) incluye Tape y Ruler. — [AlternativeTo (2023)](https://alternativeto.net/news/2023/7/notability-unveils-major-update-with-a-refreshed-look-enhanced-accessibility-and-free-tools-for-all-users)
- Goodnotes 6 tiene una herramienta "Tape". Los usuarios la usan para tapar palabras clave y estudiar (active recall). No encontré documentación oficial que la vincule a Study Sets. — [Feedback Goodnotes (búsqueda)](https://feedback.goodnotes.com/forums/191274-customer-suggestions-for-goodnotes/suggestions/48623651-significantly-enhanced-ai-math-assistant)
- Apple Smart Script: tachar la escritura la borra. — [Apple Newsroom 2024](https://www.apple.com/newsroom/2024/06/ipados-18-introduces-powerful-intelligence-features-and-apps-for-apple-pencil/)

### Inferences
- Para Kwanta:
  - Borrador con dos modos (trazo entero por defecto, ya que es más rápido para alumnos, y parcial opcional).
  - Lasso con mover, escalar, recolorear y borrar.
  - Línea recta como herramienta explícita (vectores, ejes de gráficas de física), no solo "hold to snap".
  - Hold-to-shape desactivable por herramienta, nunca forzado en el highlighter.
  - Tap con dos dedos para deshacer, con un ajuste para desactivarlo.
- "Tape" (cinta que oculta respuestas) es muy útil para repasar exámenes IB: se tapan las soluciones y se destapan al tocar.

### Gaps
- No encontré documentación oficial del lasso de Goodnotes 6 ni de Notability (redimensionar, recolorear, convertir a texto).
- No encontré documentación de la Tape de Goodnotes 6 (estado actual, interacción).
- No encontré información de Samsung Notes ni OneNote sobre borradores y gestos.

## 5. Reconocimiento de escritura, búsqueda, conversión, matemáticas, plantillas, PDF

### Takeaway
La búsqueda en la escritura a mano es estándar: en Notability, en 2026, entra en todos los planes según las release notes. La conversión de matemáticas manuscritas a tipografía/LaTeX existe en Goodnotes (Math Conversion), Notability (de pago), Nebo/MyScript Notes (copiar como LaTeX) y MyScript Math (vista previa LaTeX en vivo). Ninguna convierte de forma fiable un documento entero a LaTeX, y hay quejas de errores en la conversión. Apple Math Notes resuelve expresiones escritas a mano y muestra el resultado en una letra parecida a la del usuario.

### Cited Findings
- En Notability se puede buscar en escritura a mano, texto tecleado, transcripciones y PDFs. Según la release 16.13.5 (noviembre de 2026), "Every plan includes Handwriting Recognition", pero la descripción de la App Store aún lo lista como función de suscripción, así que hay una contradicción. La conversión de matemáticas es de suscripción. Desde la 16.13.3 (octubre de 2026) se puede escribir una función a mano y verla graficada en la nota. — [App Store Notability](https://apps.apple.com/us/app/id360593530)
- Goodnotes Math Conversion convierte ecuaciones manuscritas en matemáticas tipografiadas. Los usuarios reportan conversiones erróneas y piden poder editar el LaTeX resultante. — [Feedback Goodnotes "edit LaTeX"](https://feedback.goodnotes.com/forums/191274-customer-suggestions-for-goodnotes-apple/suggestions/47075851-allow-user-to-edit-latex-for-math-equations-and-im); [Goodnotes blog "Introducing Goodnotes 6"](https://goodnotes.com/blog/introducing-goodnotes-6)
- Nebo, rebautizado como "MyScript Notes":
  - En documentos, una ecuación se copia como LaTeX con "…" → Copy. En notebooks, boards y PDFs se hace con lasso → Copy.
  - El solver permite elegir redondeo o truncado, grados o radianes, y resolución automática o manual.
  - Soporta funciones básicas (|x|, 1/x, √, ln, log, e^x, x^y, x², x!).
  — [MyScript Help: math en Nebo](https://help.myscript.com/nebo/create-content/math); [MyScript Help: convert to LaTeX](https://help.myscript.com/math/create-and-manage-your-content/convert-to-latex/)
- MyScript Math (app separada para iPad, "handwriting graphing calculator"):
  - Resuelve variables, porcentajes, fracciones y trigonometría inversa.
  - Tiene un espacio "Quick LaTeX" con vista previa tipografiada en vivo y el botón "Copy as LaTeX".
  — [App Store MyScript Math](https://apps.apple.com/us/app/-/id6743237855); [myscript.com/math](https://www.myscript.com/math)
- Apple Math Notes (iPadOS 18) es parte de Calculator: se escriben o teclean expresiones y se resuelven con una letra similar a la del usuario. Las notas aparecen en la carpeta "Math Notes" de Notes. — [Apple Newsroom jun-2024](https://www.apple.com/newsroom/2024/06/ipados-18-introduces-powerful-intelligence-features-and-apps-for-apple-pencil/)
- "Refine" de Apple Notes endereza la escritura seleccionada con un modelo on-device. También hay "Auto-refine Handwriting" en el menú Markup. — [Apple Support 121259](https://support.apple.com/en-ae/121259)
- En Goodnotes web, el reconocimiento de escritura y la indexación de documentos corren en workers en segundo plano (WASI Threads, Web Workers, SharedArrayBuffer). El multihilo mejoró el INP (Interaction to Next Paint) más de 2 veces. SharedArrayBuffer exige Cross-Origin Isolation, y el fallback es concurrencia cooperativa en un solo hilo. — [Swift.org blog, 1-jun-2026](https://swift.org/blog/bringing-goodnotes-to-web-with-swift/)
- Concepts ofrece muchos tipos de papel y cuadrículas sobre un lienzo infinito. Por reseñas de usuarios, parece que no tiene reconocimiento matemático. — [App Store Concepts](https://apps.apple.com/app/560586497)

### Inferences
- Para un público IB Physics, lo prioritario es buscar en la escritura a mano y, opcionalmente, convertir fórmulas a LaTeX con edición manual del LaTeX, que es justo lo que piden los usuarios de Goodnotes. Una solución web posible es MyScript iink (SDK web) o un modelo propio en un Web Worker, siguiendo el patrón de Goodnotes. Esto último es inferencia: el SDK web de MyScript no se investigó aquí.
- El reconocimiento debe correr fuera del hilo principal para no degradar la latencia de la tinta (lección de Goodnotes).
- Plantillas mínimas recomendables: cuadrícula, puntos, rayado y Cornell, más la importación de PDF de exámenes IB para anotarlos encima. Lo más relevante es que la tinta guardada como vector quede por encima del PDF rasterizado o renderizado por pdf.js. Inferencia: no encontré documentación de plantillas Cornell específica de cada app.

### Gaps
- No encontré documentación oficial actual de las plantillas de papel (Cornell, cuadrícula) de Goodnotes, Notability ni Noteshelf.
- No encontré documentación de OneNote "Ink to Math" ni de Samsung Notes (conversión de fórmulas), por falta de presupuesto de búsqueda.
- No encontré el detalle de la página oficial de Math Assist de Goodnotes. Según el resumen de búsqueda: se activa al escribir "=", solo en iOS, solo en cuadernos en inglés, viene desactivado por defecto, y no cubre ecuaciones diferenciales, geometría ni desigualdades. Esto viene de un resumen de búsqueda sobre el soporte de Goodnotes y no se verificó leyendo la página.

## 6. Audio sincronizado (Notability) y funciones de IA (Notability Learn, Goodnotes AI/Math Assist), estado 2025-2026

### Takeaway
Notability sigue liderando en audio sincronizado con la tinta: en 2026 añadió transcripciones agrupadas por grabación con etiquetas de hablante y "Finish My Notes". Su módulo Learn (con Claude de Anthropic) genera resúmenes, quizzes, flashcards con repetición espaciada y chat con toda la biblioteca. Goodnotes apuesta por Math Assist ("spellcheck para matemáticas", on-device) y por exam prep.

### Cited Findings
- En Notability, el audio se sincroniza con el momento exacto de la escritura (replay). — [App Store Notability](https://apps.apple.com/us/app/id360593530)
- Release notes de Notability 2026 (App Store):
  - 16.12 (8-sep): "Finish My Notes" añade contexto desde la transcripción de una grabación, y se puede chatear con toda la biblioteca.
  - 16.14 (16-nov): transcripciones agrupadas por grabación con etiquetas de hablante.
  - 16.9 y 16.9.1 (agosto): flashcards con repetición espaciada y quizzes que se reanudan.
  - 16.13.1: medidor de uso de Learn.
  - 16.13.4 (3-nov): longitud del resumen, dificultad del quiz y campo de estudio personalizables.
  - 16.7 (20-jul): vuelve "Classic" como compra única.
  - Planes: Lite, Plus y Pro. Las transcripciones en vivo son de Pro.
  - Plataformas: iPad, iPhone, Mac, Vision Pro y web.
  — [App Store Notability](https://apps.apple.com/us/app/id360593530)
- Notability Learn genera resúmenes, quizzes (incluidos de completar huecos) y flashcards a partir de notas, PDFs o grabaciones. No está disponible en China continental, Hong Kong ni Macao. Los datos no se usan para entrenar modelos y se puede desactivar en ajustes. — [Notability Support "Notability Learn"](https://support.gingerlabs.com/hc/en-us/articles/8073483239834-Notability-Learn)
- Notability Learn usa Claude para flashcards, quizzes y resúmenes, y los quizzes tienen un botón "Explain This". Es marketing del proveedor (Anthropic). — [Claude customer story: Notability](https://claude.com/customers/notability)
- Goodnotes AI Math Assistance (blog del 17-nov-2023, Goodnotes 6):
  - Funciona "como un spellcheck, pero para matemáticas": revisa en tiempo real lo escrito a mano para avisar antes de que un error temprano se propague.
  - Es poco intrusiva, con pistas y explicaciones paso a paso si el alumno las pide.
  - Está pensada para alumnos que no borran y corrigen en la línea siguiente.
  - Corre en el dispositivo (privacidad) y se presentó como experimental.
  - El contenido de práctica cubre SAT, HKDSE y CSAT coreano.
  — [Goodnotes blog "Design at Goodnotes: AI Math Assistance"](https://www.goodnotes.com/blog/how-its-made-ai-math-assistance)
- Goodnotes anunció funciones mayores para Goodnotes 6 en un livestream. — [Goodnotes blog livestream](https://www.goodnotes.com/blog/livestream-event-major-new-features)

### Inferences
- Para Kwanta (IB Physics), una versión del "spellcheck matemático" que avise de errores de unidades o de pasos algebraicos sin dar la respuesta respeta la "desired difficulty" que menciona Goodnotes. Es un diferenciador alineado con el aprendizaje.
- Grabar audio sincronizado con los trazos es factible en la web: basta con un timestamp por punto o por trazo y MediaRecorder. Es la función estrella de Notability para clases.
- Las flashcards con repetición espaciada y los quizzes generados desde las notas ya son estándar en 2026.

### Gaps
- No encontré el estado 2026 de las funciones de IA de Goodnotes (resúmenes, AI Spellcheck, Study Sets, chat), más allá del blog de 2023 y de menciones de Study Sets (flashcards con repetición espaciada) en resúmenes de búsqueda.
- No encontré los precios exactos de los planes de Notability, que varían por región según la App Store.

## 7. Posts de ingeniería y charlas sobre internals (especialmente Goodnotes web/Wasm)

### Takeaway
Goodnotes es el único gran jugador con documentación pública detallada de su versión web. Compila a WebAssembly (SwiftWasm) el mismo código Swift de iOS, incluido el motor de tinta. Renderiza con WebGL en un canvas de pantalla completa, usa React + TypeScript para la UI, IndexedDB para trabajar offline, CRDTs para colaborar y Web Workers con SharedArrayBuffer para el reconocimiento. El binario pesa unos 50 MB (12 MB con Brotli). Es una referencia directa para la arquitectura de Kwanta, aunque Kwanta no necesita reutilizar código nativo.

### Cited Findings
- Swift.org, "Bringing Goodnotes to the web with Swift and WebAssembly" (Yuta Saito, 1-jun-2026):
  - Origen y escala: la decisión de 2021 fue reutilizar Swift en lugar de reescribir en JS, Flutter o KMP, para mantener más de 60 FPS en la tinta. Lleva dos años de desarrollo y más de dos en producción. La web suma 2,2 millones de líneas de Swift, de las que 1,47 millones (66 %) son compartidas con iOS.
  - Render: Metal en iOS y WebGL en la web.
  - Binario: unos 50 MB, 12 MB con Brotli, con caché mediante Service Workers.
  - Interop con JavaScript: JavaScriptKit.
  - Concurrencia:
    - Multihilo con WASI Threads, Web Workers y SharedArrayBuffer.
    - Actores fijados a workers (SE-0392).
    - Más de 2 veces de mejora en INP.
    - Requisito de Cross-Origin Isolation.
  - Herramientas: depuración en Chrome DevTools y un profiler `wasm-memprof`.
  - Lecciones:
    - Empezar validando con un único componente crítico de rendimiento.
    - Crear capas de abstracción de plataforma pronto.
    - Adoptar de forma gradual.
  - Soporte oficial de Wasm desde Swift 6.2.
  — [Swift.org blog](https://swift.org/blog/bringing-goodnotes-to-web-with-swift/)
- web.dev, case study "Goodnotes everywhere" (sin fecha explícita, hacia 2023):
  - Arquitectura: SwiftWasm, con más de 100.000 líneas reutilizadas en la fase inicial. UI en React + TypeScript (webpack). PWA con service workers, empaquetada con PWABuilder para Windows y con TWA para Android.
  - Render: la vista del documento pasó del DOM a un canvas de pantalla completa. Recomiendan mover el trabajo de Wasm y el render con OffscreenCanvas a workers.
  - Rendimiento y caché: el binario inicial pesaba unos 40 MB. Pasaron a la Cache API con Workbox y dicen que deberían haberlo hecho antes.
  - Datos: IndexedDB para el modo offline y CRDTs para la colaboración. Convirtieron RTF a HTML para el editor de texto.
  - Calendario: unos 6 meses para la versión de solo lectura y 9 más para la primera edición. Los feature flags dinámicos habrían evitado redeploys.
  — [web.dev case study](https://web.dev/case-studies/goodnotes)
- Goodnotes web corre también en ChromeOS, Android y Windows (y Linux, según un gráfico de despliegue) desde la misma base de código. — [web.dev case study](https://web.dev/case-studies/goodnotes)
- Notability está disponible en la web, además de iPad, iPhone, Mac y Vision Pro. — [App Store Notability](https://apps.apple.com/us/app/id360593530)

### Inferences
- Patrones de Goodnotes web que Kwanta puede copiar aunque escriba en TypeScript:
  - Lienzo único de pantalla completa (WebGL o Canvas2D), sin un elemento DOM por trazo.
  - Reconocimiento e indexación en Web Workers.
  - OffscreenCanvas en un worker para el render pesado (miniaturas, exportación).
  - IndexedDB y service worker con Workbox desde el día 1 para el modo offline.
  - "Yield" al navegador en tareas largas para no subir el INP.
- Goodnotes necesitó un binario de 12 a 50 MB por reutilizar código nativo. Una implementación TS nativa puede ser mucho más ligera, una ventaja para cargar rápido en Safari iPad.
- Si se usa SharedArrayBuffer, hay que servir con COOP/COEP (Cross-Origin Isolation), lo que restringe recursos de terceros (imágenes, iframes, fuentes).

### Gaps
- Ni el post de Swift.org ni el de web.dev cuentan cómo Goodnotes web maneja el Apple Pencil en Safari iPad (pointer events, presión, predicción, palm rejection, latencia). Es justo el dato más relevante para Kwanta y no está publicado.
- No encontré posts de ingeniería públicos de Notability (Ginger Labs), Noteshelf, Samsung Notes ni Nebo sobre su motor de tinta, salvo la existencia del SDK MyScript iink, que no se investigó aquí.
- No encontré la charla de Goodnotes en NSSpain 2023, que el case study de web.dev solo menciona. No se revisó.
