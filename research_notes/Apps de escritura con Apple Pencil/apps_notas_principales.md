# Apps principales de notas con Apple Pencil: Noteshelf 3, OneNote (iPad), MyScript Notes (ex-Nebo), Apple Notes/Freeform + novedades 2025-2026 de Notability y Goodnotes

Alcance: comparación para Kwanta (Next.js, iPad Safari, tinta vectorial perfect-freehand, cámara pan/zoom propia, toolbar flotante colapsable, panel de fórmulas, auto-corrección con markscheme). No se repiten los básicos de Notability/Goodnotes ya cubiertos (rediseño toolbar, Zoom Window, audio sync, Math Assist, Goodnotes web/SwiftWasm).
Fecha de investigación: 25-nov-2026. Advertencia de fuentes: varias fichas de Paperlike (vendedor de protectores de pantalla) son la fuente más detallada y actualizada; son reseñas comerciales pero con detalle verificable. Reddit no apareció en ningún resultado de búsqueda (se marcan como gap).

## 1. Sensación de tinta, tipos de pluma, presión/inclinación, suavizado/estabilización

### Takeaway
Todas las apps ofrecen 3-6 "personalidades" de pluma (bola/fieltro/pluma estilográfica/lápiz/pincel) más resaltador; la novedad 2025-2026 es la pluma caligráfica con ángulo de plumín (Apple "reed pen", Notability "Calligraphy Pen" con toggle de Stabilization). MyScript se percibe sin lag; OneNote iPad arrastra quejas de latencia desde hace años.

### Cited Findings
- **Noteshelf 3**: 4 estilos de pluma — Ball (por defecto; "puede verse borrosa en tamaños grandes"), Felt (líneas más finas y nítidas), Fountain (punta angulada para trazos caligráficos) y Pencil (textura granulada intencional). Todas sensibles a la presión, más notable en Pencil. Cada pluma tiene 3 tamaños preset + slider; estilos de línea sólida, punteada y discontinua — [Paperlike, Noteshelf 3 Review, act. 2-nov-2026](https://paperlike.com/blogs/paperlikers-insights/noteshelf-review)
- Noteshelf: líneas discontinuas/punteadas en la herramienta Pen y líneas curvas añadidas en 2026 (versión Android, ago-2026) — [Google Play, Noteshelf 3](https://play.google.com/store/apps/details?id=com.fluidtouch.noteshelf3&hl=en_US) (dato vía resumen de búsqueda; fechas de mirrors APK inconsistentes)
- Noteshelf resaltador: estilos redondo y biselado, opacidad reducida y pasadas repetidas oscurecen; toggle "Draw Straight Lines" — [Paperlike Noteshelf](https://paperlike.com/blogs/paperlikers-insights/noteshelf-review)
- **MyScript Notes**: Pen con 3 tipos (Felt, Brush, Fountain), 6 grosores, 8 colores preset + rueda de color (sin hex). "Escritura fluida, sin lag" con Apple Pencil; el dedo funciona como pluma pasiva. La reseña no trata presión — [Paperlike, MyScript Notes review, act. 13-oct-2026](https://paperlike.com/blogs/paperlikers-insights/myscript-notes-app-review)
- **Apple Notes**: plumas monoline, fountain, watercolor, lápiz, marcador y crayón — [Paperlike, 11 Best Note-Taking Apps, act. 4-nov-2026](https://paperlike.com/blogs/paperlikers-insights/best-note-taking-apps-ipad); iOS/iPadOS 26 añade la "reed pen" (cálamo) con "stroke-angle presets built into the tool" para caligrafía, en Notes, Preview, Freeform y Journal — [9to5Mac, oct-2025](https://9to5mac.com/2025/10/16/heres-everything-new-for-apple-notes-in-ios-26/); [Apple Newsroom iPadOS 26, jun-2025](https://www.apple.com/newsroom/2025/06/ipados-26-introduces-powerful-new-features-that-push-ipad-even-further/)
- Apple Pencil a nivel sistema: inclinar el Pencil sombrea o varía grosor según herramienta; presionar más oscurece la línea; barrel roll (Pencil Pro) previsualiza el ángulo de resaltador y pluma estilográfica en Freeform/Notes/Markup; hover hasta 12 mm previsualiza herramienta y efecto de borrador — [Apple Support, Draw with Apple Pencil](https://support.apple.com/guide/ipad/draw-with-apple-pencil-ipadc55b6c7a/ipados)
- iPadOS 26: la escritura con Pencil se "refina en tiempo real para verse más legible manteniendo tu estilo" (Handwriting Tools > More > Auto-refine Handwriting) — vía resumen de búsqueda de [Apple Support, Add drawings and handwriting in Notes](https://support.apple.com/en-lk/guide/ipad/ipada87a6078/ipados) (no se pudo leer la página completa)
- **Notability (nuevo, otoño 2026)**: Calligraphy Pen, "dibuja trazos que alternan entre grueso y fino mientras escribes"; tocar una vez la selecciona, tocar otra vez permite ajustar el ángulo del plumín o activar **Stabilization** — [Notability Blog, Back-to-School 2026](https://blog.notability.com/post/notabilitys-back-to-school-2026-guide-every-new-feature-explained)
- **OneNote iPad**: pestaña Draw con pluma, resaltador, borrador y herramienta de formas; colores especiales "galaxy, marble, glitter" — [Paperlike Best Apps](https://paperlike.com/blogs/paperlikers-insights/best-note-taking-apps-ipad). Quejas de latencia: hilo antiguo (2016) dice que OneNote es "mucho más lento que GoodNotes y Notability"; un post reciente (~2025-2026) reporta que el Pencil "no registra lo que escribo hasta como cinco segundos después" tras una auto-actualización; otro (2021) describe trazos que "parpadean y cambian de forma al levantar la pluma" — [MS Q&A latencia iPad Pro](https://learn.microsoft.com/en-us/answers/questions/4921048/apple-pencil-latency-with-onenote-ipad-pro-12-9); [MS Q&A OneNote lagging](https://learn.microsoft.com/en-us/answers/questions/5788251/one-note-lagging-with-apple-pencil); [MS Q&A issue writing](https://learn.microsoft.com/en-us/answers/questions/5098223/issue-writing-with-onenote-for-ipad-using-apple-pe)
- **Goodnotes (nuevo Q3 2026)**: "Restyle" — se selecciona con lasso, icono Smart Ink > Restyle, se elige un estilo; palabras, layout y color se mantienen. Gratis en dispositivos Apple; 8 idiomas incl. español — [Goodnotes blog, jul-sep 2026](https://www.goodnotes.com/blog/whats-new-in-goodnotes-july-september-2026)

### Inferences
- El "cambio de forma al levantar la pluma" que se critica en OneNote es exactamente el riesgo de perfect-freehand si se recalcula el trazo final con parámetros distintos al trazo en vivo (p. ej. `last: true`, thinning/streamline distintos): conviene que el trazo comprometido sea visualmente idéntico al trazo en vivo.
- Las "personalidades" de pluma se pueden emular con perfect-freehand variando `thinning`, `smoothing`, `streamline`, `simulatePressure`, taper y una cap angular (para fountain/calligraphy, multiplicar el ancho por |sin(ángulo trazo − ángulo plumín)|). Un toggle "Estabilización" (Notability) equivale a subir `streamline`.
- Para examen IB, 2-3 plumas (ball/fineliner + fountain + resaltador) bastan; los estilos decorativos (glitter, crayon) no aportan.

### Gaps
- No hay mediciones públicas de latencia (ms) por app; ninguna fuente 2025-2026 las da.
- No se confirmó si Noteshelf/MyScript ofrecen slider de suavizado/estabilización explícito.
- No se encontraron hilos de Reddit sobre sensación de tinta (búsquedas no devolvieron Reddit).

## 2. Diseño de toolbar, cambio rápido de color/tamaño, gestos

### Takeaway
El patrón dominante es: toolbar personalizable (elegir qué herramientas aparecen) + 3 presets de tamaño por pluma + fila de colores favoritos + modo foco que oculta todo; gestos estándar: tap con 2/3 dedos = deshacer/rehacer, doble tap del Pencil = volver a la herramienta anterior, squeeze (Pencil Pro) = paleta flotante junto a la punta. MyScript usa gestos de tinta (tachar para borrar) en vez de cambiar a borrador.

### Cited Findings
- **Noteshelf 3**: More > Customize Toolbar para elegir herramientas, menús y atajos; el panel de pluma es **flotante y se puede mover** a distintas posiciones; pulsación larga en un color permite definir color personalizado (incl. hex) y guardarlo en el menú rápido; hasta 3 tamaños personalizados y colores favoritos en slots del toolbar del resaltador — [Paperlike Noteshelf](https://paperlike.com/blogs/paperlikers-insights/noteshelf-review)
- Noteshelf: **Focus mode** con tap de 4 dedos (o icono) oculta la UI; **read-only mode** oculta el toolbar para evitar marcas accidentales; doble tap del Pencil cambia herramienta; borrador con opción "Auto-select previous tool" (criticada por molesta al borrar varios trazos), modos Erase Entire Stroke / Highlighter Only / Pencil Only / Tape Only — [Paperlike Noteshelf](https://paperlike.com/blogs/paperlikers-insights/noteshelf-review)
- Noteshelf iOS (oct-2026): "navigation pill" para alternar vista vertical, horizontal y doble página; Quick Note — vía resumen de búsqueda de la ficha iOS (no verificado en fuente primaria) — [Google Play / búsqueda](https://play.google.com/store/apps/details?id=com.fluidtouch.noteshelf3&hl=en_US)
- **MyScript Notes**: toolbar con Text, Pen, Highlighter, Eraser, Lasso; cada herramienta con 6 tamaños; ventana de personalización con **vista previa de la pluma antes de escribir** — [Paperlike MyScript](https://paperlike.com/blogs/paperlikers-insights/myscript-notes-app-review). Gestos de tinta: tachar (scratch-out) para borrar; línea vertical hacia abajo para separar letras; hacia arriba para unir; doble tap convierte a texto; subrayar una vez = subtítulo, dos = título; encerrar en caja = resaltar; dibujar viñetas/números = lista — [Paperlike MyScript](https://paperlike.com/blogs/paperlikers-insights/myscript-notes-app-review)
- MyScript iOS 6.7 (feb-2025): deshacer/rehacer con tap de dos o tres dedos; Split View para abrir segunda nota. 7.1 (feb-2026): láser pointer. 7.2 (mar-2026): regla que se arrastra, rota y "snap" para líneas rectas a cualquier ángulo — [MyScript Notes iOS versions](https://help.myscript.com/notes/versions/ios/)
- **Apple Pencil (sistema)**: doble tap (Pencil 2/Pro) vuelve a la última herramienta (p. ej. marcador→borrador), configurable; squeeze (Pencil Pro) ejecuta acción como deshacer o mostrar la paleta de herramientas; háptica en squeeze/doble tap — [Apple Support, Draw with Apple Pencil](https://support.apple.com/guide/ipad/draw-with-apple-pencil-ipadc55b6c7a/ipados)
- **Apple Notes iOS 26**: toolbar (de teclado) adaptativo y deslizable horizontalmente; cambia herramientas según contexto (p. ej. al seleccionar varias líneas muestra lista/indentar) — [9to5Mac](https://9to5mac.com/2025/10/16/heres-everything-new-for-apple-notes-in-ios-26/)
- **Goodnotes (Q1 2026)**: ahora recuerda la última herramienta usada en vez de abrir por defecto en lasso — vía resumen de búsqueda de [Goodnotes blog ene-mar 2026](https://www.goodnotes.com/blog/features-fixes-updates-march-2026) (la URL devolvió 404 al abrirla; dato no verificado directamente). Q3 2026: **Selective Eraser** — elegir tipo de contenido (p. ej. solo resaltados) y borrar solo eso — [Goodnotes jul-sep 2026](https://www.goodnotes.com/blog/whats-new-in-goodnotes-july-september-2026)
- **Notability**: la Calligraphy Pen usa el patrón "tap para seleccionar, segundo tap para abrir ajustes (ángulo, estabilización)" — [Notability Blog](https://blog.notability.com/post/notabilitys-back-to-school-2026-guide-every-new-feature-explained)

### Inferences
- Patrón copiable para Kwanta: "tap = seleccionar, segundo tap sobre la herramienta activa = popover de ajustes" (Notability/Goodnotes/Apple) mantiene el toolbar mínimo.
- Persistir la última herramienta y color por usuario (Goodnotes lo añadió en 2026 por demanda) — trivial en web con localStorage.
- Tap 2 dedos = undo / 3 dedos = redo es ya expectativa del usuario (MyScript lo añadió en 2025); en Safari implica distinguir taps de pan/pinch en el gestor de pointer events.
- Borrador "solo resaltador" / "trazo completo" (Noteshelf, Goodnotes) es útil para estudiantes que resaltan el enunciado.
- Squeeze/doble tap del Pencil NO llegan a Safari web (inferencia: no hay API web pública para estos eventos), así que Kwanta debe ofrecer alternativa táctil (p. ej. botón grande de undo y toggle pluma/borrador accesible con el pulgar).

### Gaps
- No se confirmó la posición/colapsado exacto de la paleta de Apple Notes (borde, auto-minimizar) en una fuente leída en esta sesión (la página de Apple estaba truncada).
- Detalles del toolbar de OneNote iPad 2025-2026: no se encontró documentación oficial reciente.

## 3. Scroll y zoom, zoom window, palm rejection, bordes de página, auto-scroll

### Takeaway
La mayoría usa scroll vertical continuo con opción horizontal/doble página (Noteshelf añadió una "navigation pill" para alternar). Noteshelf mantiene un "Zoom Box" clásico (rectángulo azul + mitad inferior ampliada, con márgenes, interlineado y auto-avance configurables). OneNote y Freeform/MyScript Boards son lienzos libres sin paginación.

### Cited Findings
- **Noteshelf Zoom Box**: More > Zoom Box; un rectángulo azul se mueve sobre la página y la mitad inferior muestra el contenido ampliado; ajustes de márgenes, interlineado, posición de botones; auto-avance desactivable — [Paperlike Noteshelf](https://paperlike.com/blogs/paperlikers-insights/noteshelf-review)
- Noteshelf: 6 "estilos de escritura" (según cómo se sostiene el stylus) para mejorar palm rejection y navegación; en iPad solo soporta Apple Pencil (Noteshelf 2 soportaba Adonit y Wacom) — [Paperlike Noteshelf](https://paperlike.com/blogs/paperlikers-insights/noteshelf-review)
- Noteshelf iOS: navigation pill para vista vertical, horizontal y dos páginas — vía resumen de búsqueda (ficha iOS, oct-2026; no verificado) — [búsqueda / Google Play](https://play.google.com/store/apps/details?id=com.fluidtouch.noteshelf3&hl=en_US)
- Reseña de usuario de Noteshelf: la app puede volverse muy lenta, ~30 s para redibujar la página tras escribir; a veces salta a otra parte del cuaderno mientras se escribe (reseña de ~2024, puede ser anterior a arreglos) — [JustUseApp, Noteshelf 3 reviews](https://justuseapp.com/en/app/6458735203/noteshelf-3-digital-notes/reviews)
- **OneNote**: página "freeform" — texto, tinta y media en cualquier lugar, "como una pizarra más que una hoja fija" — [Paperlike Best Apps](https://paperlike.com/blogs/paperlikers-insights/best-note-taking-apps-ipad)
- **MyScript**: Boards = lienzo infinito sin conversión automática; Documents = páginas pautadas con vista previa en vivo del texto; Notebooks = plantillas en blanco/puntos/líneas/cuadrícula (similar a Goodnotes). Escritura "demasiado grande" se ignora y desaparece al levantar el lápiz en Documents (el tamaño de línea se ajusta en Text Display) — [Paperlike MyScript](https://paperlike.com/blogs/paperlikers-insights/myscript-notes-app-review)
- MyScript 7.3 (ago-2026): PDFs optimizados para cargar y navegar más rápido, sobre todo archivos grandes — [MyScript iOS versions](https://help.myscript.com/notes/versions/ios/)
- Apple Pencil hover (12 mm) previsualiza herramienta antes de tocar — [Apple Support](https://support.apple.com/guide/ipad/draw-with-apple-pencil-ipadc55b6c7a/ipados)

### Inferences
- La "mitad inferior ampliada" de Noteshelf/Goodnotes sigue siendo el patrón de referencia para escribir respuestas largas en letra pequeña; en Kwanta, con cámara propia, una alternativa más simple es zoom fijo + auto-pan horizontal/vertical cuando el trazo se acerca al borde visible.
- La regla "tinta demasiado grande se ignora" de MyScript sugiere que una heurística de tamaño puede ayudar a reconocimiento, pero es frustrante para dibujos; en Kwanta separar zonas de respuesta (reconocible) de zonas de diagrama.
- Hover del Pencil sí está expuesto en Safari como pointer events `pointerType: "pen"` sin presión (inferencia de comportamiento de WebKit; no verificado en esta sesión) — podría mostrar un cursor de previsualización como en Apple Notes.

### Gaps
- Límites de zoom numéricos (p. ej. 400%) por app: no encontrados.
- Auto-scroll al llegar al fondo de página / añadir página automáticamente: no documentado en fuentes leídas (Noteshelf "auto-advance" solo dentro del Zoom Box).
- Ajustes de palm rejection en OneNote iPad 2025-2026 y Freeform: no encontrados.

## 4. Páginas/plantillas (Cornell, cuadrícula, puntos), lienzo infinito vs páginas, añadir páginas

### Takeaway
Noteshelf es "cuaderno con portada + plantillas por página" con galería enorme; MyScript tiene tres tipos (Document/Notebook/Board); OneNote y Freeform son lienzos libres; Apple Notes no tiene plantillas. Ninguna fuente leída menciona Cornell como plantilla nativa destacada (solo vía galerías/planners).

### Cited Findings
- **Noteshelf**: plantillas por defecto + galería con cientos (diarios, planners, trackers, study planners); 4 colores de fondo + rueda; plantilla cambiable por página; favoritos en biblioteca; añadir plantillas como páginas nuevas desde dentro del cuaderno; **Cornell no mencionado** — [Paperlike Noteshelf](https://paperlike.com/blogs/paperlikers-insights/noteshelf-review); [Noteshelf Help, What's New](https://noteshelf-support.fluidtouch.biz/hc/en-us/articles/22024757963929-What-s-New-in-Noteshelf-3)
- Noteshelf (nov-2026, v5.4.3 Android): restaurar páginas y cuadernos borrados desde la Papelera a su ubicación original — vía resumen de búsqueda [APKMirror/Google Play] (fuente secundaria) — [Google Play](https://play.google.com/store/apps/details?id=com.fluidtouch.noteshelf3&hl=en_US)
- **Noteshelf Tape**: cinta recta o a mano alzada con ancho ajustable para **ocultar y revelar** notas (repaso activo: tapar palabras para comprobar memoria); 9 colores sólidos y 9 patrones — [Paperlike Noteshelf](https://paperlike.com/blogs/paperlikers-insights/noteshelf-review)
- **MyScript**: Documents pueden incluir secciones de sketch, imagen, diagrama, matemáticas y board; Notebooks con plantillas blank/dotted/lined/grid — [Paperlike MyScript](https://paperlike.com/blogs/paperlikers-insights/myscript-notes-app-review); críticas: sin plantillas ni personalización — [Paperlike Best Apps](https://paperlike.com/blogs/paperlikers-insights/best-note-taking-apps-ipad)
- **Apple Notes**: sin plantillas ni carpetas muy anidadas; escritura y texto tecleado quedan en bloques separados; PDFs/imágenes son adjuntos — [Paperlike Best Apps](https://paperlike.com/blogs/paperlikers-insights/best-note-taking-apps-ipad)
- **Freeform**: iPadOS 26.2 añadió tablas (celdas con texto, imágenes, documentos y dibujos, que se redimensionan) ; iPadOS 26.4 añadió herramientas avanzadas de imagen y biblioteca premium (Apple Creator Studio) — vía resumen de búsqueda de [Wikipedia, Freeform (Apple)](https://en.wikipedia.org/wiki/Freeform_(Apple))
- **Notability**: Academic Planner 2026-2027 (Course Overview, Assignment Planner, Group Project Planner) en New Note > Templates > Planners; Notability 16 reconoce outlines (índices) de documentos existentes para navegar, pero no permite crear los propios — [Notability Blog](https://blog.notability.com/post/notabilitys-back-to-school-2026-guide-every-new-feature-explained); [Being Paperless, Notability 16 review](https://beingpaperless.com/notability-16-review-new-collaboration-outlines-study-timer-folders-2026/)
- **Goodnotes** Q1 2026: nuevas plantillas de Whiteboard; bloqueo de objetos para gestionar capas — vía resumen de búsqueda [Goodnotes ene-mar 2026](https://www.goodnotes.com/blog/features-fixes-updates-march-2026) (404 al abrir). Q3 2026: **Layers** en early access para Pro en iPad/Mac (pluma, lasso y borrador afectan solo la capa activa; ocultar capas; exportar solo capas seleccionadas) — [Goodnotes jul-sep 2026](https://www.goodnotes.com/blog/whats-new-in-goodnotes-july-september-2026)

### Inferences
- La "Tape" de Noteshelf es muy aplicable a Cornell en Kwanta: tapar la columna de notas y dejar visibles las "cue questions" para auto-examen (método Cornell clásico) — una funcionalidad diferencial y barata.
- Layers de Goodnotes valida separar "capa del enunciado/plantilla" (bloqueada) de "capa del alumno" y "capa de corrección" (marcas del markscheme) — encaja con self-marking.

### Gaps
- No se encontró ninguna app que destaque una plantilla Cornell nativa en 2025-2026 en las fuentes leídas.

## 5. Lasso/edición: mover, escalar, recolorear, convertir a texto, formas, enderezar

### Takeaway
Lasso estándar = mover/escalar/recolorear/convertir a texto/captura. Formas: "mantener al final del trazo para convertir" (Noteshelf "Hold to Convert to Shape"; mismo patrón que Apple). Goodnotes 2026 añadió snapping con guías y "Quick Diagramming"; MyScript convierte diagramas completos a formas editables.

### Cited Findings
- **Noteshelf lasso**: seleccionar, mover, redimensionar, modificar texto, captura, cambiar color/tamaño, convertir a texto; **escalar escritura la vuelve borrosa**; Convert To Text a veces genera texto más grande (se arregla poniendo Font Size en Default) — [Paperlike Noteshelf](https://paperlike.com/blogs/paperlikers-insights/noteshelf-review)
- **Noteshelf formas**: bien con cuadrados y pentágonos; hexágonos/octágonos pueden convertirse en círculos; curvas muy cerradas se vuelven círculos; formas no proporcionales automáticamente; "Hold to Convert to Shape" en ajustes de pluma; nuevas formas (estrella, rectángulo redondeado, corazón) y relleno en 2026; regla rotable que mide distancias — [Paperlike Noteshelf](https://paperlike.com/blogs/paperlikers-insights/noteshelf-review); [Google Play](https://play.google.com/store/apps/details?id=com.fluidtouch.noteshelf3&hl=en_US)
- **MyScript**: diagramas a mano convertidos a texto y formas perfectas (formas básicas y flechas); objetos de diagrama siguen editables al pegar en PowerPoint/Keynote; el lasso aporta poco en Documents (duplica la cinta de texto) — [Paperlike MyScript](https://paperlike.com/blogs/paperlikers-insights/myscript-notes-app-review)
- **Goodnotes Q3 2026**: objetos "encajan" (snap) a objetos cercanos y a la cuadrícula con guías de alineación (escritura, formas, notas adhesivas, imágenes, cuadros de texto), desactivable; Quick Diagramming: tocar un punto en el borde de una forma para añadir forma conectada; conectores curvos o en codo; Highlight Typed Text — [Goodnotes jul-sep 2026](https://www.goodnotes.com/blog/whats-new-in-goodnotes-july-september-2026)
- **Apple Notes** refina formas dibujadas en formas geométricas precisas — [Geeky Gadgets](https://www.geeky-gadgets.com/apple-notes-ipad-features/) (fuente secundaria; función de iPadOS 18)

### Inferences
- Al ser vector (perfect-freehand), Kwanta puede escalar sin blur — ventaja explícita frente a la queja de Noteshelf.
- Para Física IB: "hold to straighten" (línea recta), flechas (vectores de fuerza) y ejes son las formas que importan; no hace falta corazón/estrella. La regla rotable con medida (Noteshelf, MyScript 7.2) es útil para diagramas de rayos/óptica.

### Gaps
- Recolorear por lote y "straighten handwriting" en OneNote iPad: no verificado.

## 6. Reconocimiento de escritura y matemáticas, resolución, búsqueda en manuscrito

### Takeaway
MyScript es el líder en reconocimiento (cursiva/desordenada, vista previa en vivo, ecuaciones multilínea y matrices, export LaTeX, cálculo). Apple Math Notes resuelve al escribir "=" y en iOS 27 se integra en carpetas normales; OneNote iPad históricamente no indexa la tinta automáticamente. Noteshelf indexa manuscrito por OCR con algunos minutos de retraso.

### Cited Findings
- **MyScript**: reconocimiento "el mejor que hemos visto", incluida cursiva y letra desordenada; vista previa en tiempo real (esquina superior izquierda) de cómo interpreta; diccionario personal palabra a palabra (lento); búsqueda en manuscrito, anotaciones PDF y texto de diagramas — [Paperlike MyScript](https://paperlike.com/blogs/paperlikers-insights/myscript-notes-app-review)
- MyScript matemáticas: ecuaciones y **matrices en varias líneas**, resuelve cálculos simples, copia como **LaTeX o imagen**; también ecuaciones químicas — [Paperlike MyScript](https://paperlike.com/blogs/paperlikers-insights/myscript-notes-app-review); vía resumen de búsqueda de [App Store listing](https://apps.apple.com/us/app/myscript-nebo-note-taking-for-apple-pencil/id1119601770). No hubo novedades de matemáticas en las notas de versión iOS 2025-2026 — [MyScript iOS versions](https://help.myscript.com/notes/versions/ios/)
- **Apple Math Notes**: en Calculator (y Notes), se escribe una expresión con Pencil y se añade "=" para obtener el resultado — [Apple Support, Math Notes](https://support.apple.com/guide/ipad/solve-math-with-math-notes-ipadeb38d0f8/ipados); iPadOS 26 añade gráficos 3D en Math Notes — [iDrop News](https://www.idropnews.com/news/math-notes-leaps-into-the-third-dimension-in-ipados-26/250242/) (título del artículo; no leído completo). iOS 27 beta: motor de cálculo integrado en carpetas normales, Siri para redactar ecuaciones y enlace de secciones; el autor dice que "Siri simplemente no está ahí todavía" y que iPad+Pencil encaja mucho mejor que iPhone — vía resumen de búsqueda de [Yahoo Tech](https://tech.yahoo.com/ai/apple-intelligence/articles/math-notes-genius-ipad-why-113921924.html) (impresiones de beta)
- **Apple Notes**: OCR hace buscables manuscritos, imágenes y escaneos; Scribble convierte escritura a texto — [Paperlike Best Apps](https://paperlike.com/blogs/paperlikers-insights/best-note-taking-apps-ipad); Smart Script ordena la tinta sin convertir a texto tecleado — [TapSmart](https://www.tapsmart.com/tips-and-tricks/smart-script-ipad/)
- **Noteshelf**: OCR integrado indexa manuscrito, texto, escaneos y PDF; eficaz incluso con mala letra; tarda unos minutos en ser buscable; motor de reconocimiento intercambiable — [Paperlike Noteshelf](https://paperlike.com/blogs/paperlikers-insights/noteshelf-review)
- **OneNote iPad**: respuesta comunitaria (MS Q&A) dice que no reconoce ni busca tinta automáticamente; workaround: seleccionar con lasso y marcar como escritura (impracticable en notas grandes) — [MS Q&A](https://learn.microsoft.com/en-us/answers/questions/5823268/how-to-enable-searching-recognition-of-handwritten) (no oficial). OneNote tiene Math Assistant integrado — [Paperlike Best Apps](https://paperlike.com/blogs/paperlikers-insights/best-note-taking-apps-ipad). Copilot analiza tinta (GA sept-2024, licencias Copilot Pro/M365 Copilot) — [Microsoft Tech Community](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/onenote-copilot-now-supports-inked-notes/4189327); blogs de terceros dicen que esto apunta sobre todo a Windows y puede no llegar igual a iPad — [positioniseverything](https://www.positioniseverything.net/copilot-in-onenote-now-supports-handwritten-inked-notes-via-canvas-and-ribbon/) (baja confianza)
- **Goodnotes**: Scribble a texto con Apple Pencil en Text Documents (Q3 2026) — [Goodnotes jul-sep 2026](https://www.goodnotes.com/blog/whats-new-in-goodnotes-july-september-2026); crítica: conversión a texto "torpe y lenta" — [Paperlike Best Apps](https://paperlike.com/blogs/paperlikers-insights/best-note-taking-apps-ipad)

### Inferences
- Para auto-corrección con markscheme, la combinación ganadora es la de MyScript: vista previa en vivo de lo reconocido (que el alumno vea "F = ma" interpretado) + export LaTeX. Kwanta podría mostrar el LaTeX reconocido de la respuesta final antes de comparar con el markscheme, para que el alumno corrija errores de OCR y no penalice la nota.
- La latencia de indexado de Noteshelf ("minutos") muestra que el reconocimiento puede ser asíncrono/batch sin dañar la UX de escritura.

### Gaps
- Precisión de reconocimiento matemático cuantificada (MyScript vs Apple vs Goodnotes Math Assist): no hay benchmarks independientes.
- Estado oficial 2026 de búsqueda de tinta en OneNote iPad: sin release notes oficiales.

## 7. Funciones de estudio (flashcards, quizzes, IA) y precios 2025-2026 (USD)

### Takeaway
Notability es el más agresivo en estudio (Learn: quizzes IA en 3 modos, flashcards con repetición espaciada e importación Anki/CSV, temporizador de estudio, Focus Mode); Noteshelf tiene IA y "tape" para auto-examen; Goodnotes se orienta a IA/integraciones (conector de Claude, ChatGPT). Precios: OneNote y Apple Notes gratis; MyScript el más barato de pago ($24.99 vitalicio); Notability reintrodujo compra única "Classic" en jul-2026.

### Cited Findings
- **Notability Learn**: quizzes generados automáticamente en modos Practice, Memorize y Test; flashcards y resúmenes; importar flashcards desde Anki, texto o CSV (incl. generadas con Claude/ChatGPT); cada set importado es una nota; valoración Again/Hard/Good/Easy con repetición espaciada; "Learn Guarantee" (90 días gratis si no ayuda); próximamente comentarios y chat con toda la biblioteca — [Notability Blog](https://blog.notability.com/post/notabilitys-back-to-school-2026-guide-every-new-feature-explained)
- Notability: más tipos de quiz, Focus Mode, puzzles "Daily Brain Break", code blocks y block quotes — [Notability en X](https://x.com/NotabilityApp/status/2081779842048286722); Notability 16 (2026): colaboración en tiempo real con permisos editar/ver, compartir quizzes con no-usuarios, temporizador de estudio (duración, descanso, rondas; contador movible a cualquier parte), carpetas hasta 6 niveles — [Being Paperless](https://beingpaperless.com/notability-16-review-new-collaboration-outlines-study-timer-folders-2026/); app de escritorio Windows/Mac y captura desde calendario (ago-2026) — [Business Wire vía Morningstar](https://www.morningstar.com/news/business-wire/20260825996555/notability-now-lets-users-capture-and-organize-notes-via-their-calendar); Android lanzado ago-2026 y compra única "Classic" reintroducida jul-2026 — vía resumen de búsqueda de [Wikipedia, Notability](https://en.wikipedia.org/wiki/Notability_(application)) (fechas en conflicto con anuncio de beta Android de abril-2026)
- **Precios Notability**: Free con límite mensual de ediciones (cifra no revelada); Plus $7.99/mes o $20/año; Pro $20/mes o $99.99/año — [Paperlike Best Apps](https://paperlike.com/blogs/paperlikers-insights/best-note-taking-apps-ipad) (nota: $7.99/mes vs $20/año parece inconsistente; verificar en App Store)
- **Goodnotes 2026**: IA genera doodles, diagramas y visuales (Q1); conector en Claude e integración ChatGPT, GIPHY, rediseño Liquid Glass (Q2); calendario Google/Outlook, Box/Dropbox (Q3) — vía resumen de búsqueda de [Goodnotes abr-jun 2026](https://www.goodnotes.com/blog/whats-new-in-goodnotes-april-june-2026) y [Goodnotes jul-sep 2026](https://www.goodnotes.com/blog/whats-new-in-goodnotes-july-september-2026); grabación con un toque en el toolbar para usuarios Free/Essential y resumen que se abre automáticamente al parar — [Goodnotes jul-sep 2026](https://www.goodnotes.com/blog/whats-new-in-goodnotes-july-september-2026). Precios: Free limitado; Essential $11.99/año; Pro $35.99/año; Essential también como compra única $35.99 por plataforma — [Paperlike Best Apps](https://paperlike.com/blogs/paperlikers-insights/best-note-taking-apps-ipad)
- **Noteshelf AI**: resumir, esquematizar, traducir, explicar temas y generar notas en una aproximación de tu letra; audio sin sincronizar con la escritura; transcripción requiere iOS 26. Precios: gratis hasta 3 cuadernos (solo Apple); iOS/iPadOS/macOS $7.99/semana, $9.99/mes o $29.99/año; Android $9.99, Windows $7.99; compra separada por SO; la FAQ habla de compra única (inconsistencia) — [Paperlike Noteshelf](https://paperlike.com/blogs/paperlikers-insights/noteshelf-review)
- **MyScript Notes**: prueba 7 días; $1.99/mes, $7.99/año o $24.99 vitalicio; una compra cubre hasta 10 dispositivos iOS/iPadOS/macOS/Android/Windows; quien compró Nebo tiene acceso de por vida — [Paperlike MyScript](https://paperlike.com/blogs/paperlikers-insights/myscript-notes-app-review); renombrado de Nebo a MyScript Notes en sept-2025 (v7.0), compradores del full version usan varios dispositivos gratis con cuenta MyScript — [MyScript iOS versions](https://help.myscript.com/notes/versions/ios/); Windows mantiene el nombre Nebo y está congelado — vía resumen de búsqueda de [Being Paperless](https://beingpaperless.com/about-nebo-handwriting-app-rebranded-to-myscript-notes/)
- **OneNote**: gratis con todas las funciones y dispositivos ilimitados; 5 GB; 100 GB $1.99/mes; M365 Personal (1 TB) $9.99/mes o $99.99/año; Copilot en iPad requiere licencia M365 Copilot (blog terciario) — [Paperlike Best Apps](https://paperlike.com/blogs/paperlikers-insights/best-note-taking-apps-ipad); [Templacity](https://templacity.com/onenote/copilot-in-onenote/) (baja confianza)
- **Apple Notes/Freeform**: gratis, sin compras in-app — [Paperlike Best Apps](https://paperlike.com/blogs/paperlikers-insights/best-note-taking-apps-ipad)

### Inferences
- Para Kwanta: (a) Cornell → quiz automático desde la columna de "cues" (patrón Notability Learn); (b) repetición espaciada con 4 botones Again/Hard/Good/Easy es el estándar de facto (Anki); (c) temporizador de examen IB movible (Notability study timer) encaja con "paper 1/2" cronometrado.
- El mercado se ha movido a "freemium con IA de pago" pero con fuerte presión por compra única (Notability reintrodujo Classic; Goodnotes Essential vitalicio; MyScript $24.99) — los estudiantes son sensibles a suscripciones.

### Gaps
- Precios exactos de Notability Plus/Pro/Classic 2026 no confirmados en fuente primaria.
- Límite numérico del free tier de Notability: no revelado.

## 8. Críticas de usuarios (reseñas App Store, foros)

### Takeaway
Críticas recurrentes: suscripción y migración forzada (Noteshelf 2→3), lentitud con cuadernos grandes, lasso que pixela, sync entre ecosistemas, falta de sync de audio (Noteshelf), latencia y búsqueda de tinta (OneNote), organización limitada (MyScript, Apple Notes).

### Cited Findings
- Noteshelf: gestión documental torpe (cada nota es un cuaderno), sin subcarpetas, sin sync entre Apple y Android, sin colaboración en vivo, lasso borroso, borrador Auto pequeño, app separada de Noteshelf 2 — [Paperlike Noteshelf](https://paperlike.com/blogs/paperlikers-insights/noteshelf-review); reseñas: lentitud (~30 s de redibujado), saltos de posición al escribir, enfado por fin de soporte a Noteshelf 2 y modelo de suscripción; otro usuario lo ve "en gran parte estable" — [JustUseApp](https://justuseapp.com/en/app/6458735203/noteshelf-3-digital-notes/reviews); [App Store (IT)](https://apps.apple.com/ch/app/noteshelf-3/id6458735203?l=it)
- MyScript: jerarquía de 3 niveles limita la organización; editar texto exige teclear todo primero; el resaltador no se oscurece al superponer; sin Family Sharing en iOS — [Paperlike MyScript](https://paperlike.com/blogs/paperlikers-insights/myscript-notes-app-review)
- OneNote: abre en la última pantalla usada; barras laterales en cascada = taps extra; solo respalda en servidores de Microsoft; límite 5 GB — [Paperlike Best Apps](https://paperlike.com/blogs/paperlikers-insights/best-note-taking-apps-ipad); latencia de Pencil (ver sección 1) — [MS Q&A](https://learn.microsoft.com/en-us/answers/questions/5788251/one-note-lagging-with-apple-pencil); memoria saturada por cuadernos con mucha tinta o PDFs grandes (guía de terceros) — [WPS](https://www.wps.com/office-quick-solution/office-app-problems/fix-slow-typing-and-apple-pencil-issues-in-onenote-on-ipad/)
- Apple Notes: PDFs/imágenes como adjuntos, sin plantillas, tinta y texto en bloques separados — [Paperlike Best Apps](https://paperlike.com/blogs/paperlikers-insights/best-note-taking-apps-ipad); Markdown se importa/exporta pero no se renderiza — [9to5Mac](https://9to5mac.com/2025/10/16/heres-everything-new-for-apple-notes-in-ios-26/)
- Notability 16: sin invitaciones in-app, sin colaboración por carpeta, no crear outlines propios, sidebar no redimensionable — [Being Paperless](https://beingpaperless.com/notability-16-review-new-collaboration-outlines-study-timer-folders-2026/); sin sync iCloud (usa Notability Cloud) — [Paperlike Best Apps](https://paperlike.com/blogs/paperlikers-insights/best-note-taking-apps-ipad)
- Goodnotes: conversión a texto torpe y lenta; sync Apple↔Windows/Android requiere suscripción separada por plataforma — [Paperlike Best Apps](https://paperlike.com/blogs/paperlikers-insights/best-note-taking-apps-ipad)

### Inferences
- Rendimiento con documentos largos es la queja transversal: Kwanta debe virtualizar/cachear trazos fuera de vista (render a bitmap por tiles) para evitar el "redibujado de 30 s".
- Ser web (multiplataforma) evita la crítica de "compra/sync por plataforma" de Noteshelf/Goodnotes.

### Gaps
- No se obtuvieron hilos de Reddit (r/ipad, r/GoodNotes, r/notabilityapp, r/noteshelf) — las búsquedas no devolvieron resultados de reddit.com.

## 9. Ideas concretas para copiar en Kwanta (síntesis)

### Takeaway
Lista priorizada de patrones observados en las apps, mapeados a la arquitectura de Kwanta (web, perfect-freehand, cámara propia, toolbar flotante).

### Cited Findings
- Toolbar flotante movible + personalizable (Noteshelf) — [Paperlike Noteshelf](https://paperlike.com/blogs/paperlikers-insights/noteshelf-review)
- 3 presets de tamaño por pluma + colores favoritos con hex — [Paperlike Noteshelf](https://paperlike.com/blogs/paperlikers-insights/noteshelf-review)
- Focus mode con tap de 4 dedos / read-only que oculta el toolbar — [Paperlike Noteshelf](https://paperlike.com/blogs/paperlikers-insights/noteshelf-review)
- Tap 2 dedos undo / 3 dedos redo — [MyScript iOS versions](https://help.myscript.com/notes/versions/ios/)
- Gesto tachar = borrar (scratch-out) — [Paperlike MyScript](https://paperlike.com/blogs/paperlikers-insights/myscript-notes-app-review)
- Vista previa en vivo del reconocimiento + export LaTeX — [Paperlike MyScript](https://paperlike.com/blogs/paperlikers-insights/myscript-notes-app-review)
- Tape para ocultar/revelar (auto-examen) — [Paperlike Noteshelf](https://paperlike.com/blogs/paperlikers-insights/noteshelf-review)
- Selective Eraser y Layers — [Goodnotes jul-sep 2026](https://www.goodnotes.com/blog/whats-new-in-goodnotes-july-september-2026)
- Regla rotable con snap y medida — [MyScript iOS versions](https://help.myscript.com/notes/versions/ios/); [Paperlike Noteshelf](https://paperlike.com/blogs/paperlikers-insights/noteshelf-review)
- Pluma caligráfica con ángulo + toggle de estabilización — [Notability Blog](https://blog.notability.com/post/notabilitys-back-to-school-2026-guide-every-new-feature-explained)
- Quizzes Practice/Memorize/Test + flashcards con repetición espaciada; temporizador movible — [Notability Blog](https://blog.notability.com/post/notabilitys-back-to-school-2026-guide-every-new-feature-explained); [Being Paperless](https://beingpaperless.com/notability-16-review-new-collaboration-outlines-study-timer-folders-2026/)
- Snapping con guías de alineación — [Goodnotes jul-sep 2026](https://www.goodnotes.com/blog/whats-new-in-goodnotes-july-september-2026)

### Inferences
- Prioridad alta (bajo coste, alto valor IB): undo/redo multitouch, persistir última herramienta, tachar-para-borrar, "mantener para enderezar línea/flecha", estabilización configurable, vista previa LaTeX antes del auto-marcado, tape sobre columna Cornell.
- Prioridad media: capas (plantilla bloqueada / alumno / corrección), regla rotable, borrador selectivo, temporizador de examen.
- Prioridad baja/evitar: decoraciones (stickers, glitter), IA que "escribe con tu letra" (Noteshelf) — riesgo de integridad académica en un contexto de examen.

### Gaps
- Sin datos de uso real de estas funciones (adopción) en ninguna fuente.
