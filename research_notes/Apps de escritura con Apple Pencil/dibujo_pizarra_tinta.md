# Apps de dibujo y pizarra: motor de tinta y sensación del lápiz con Apple Pencil (Concepts, Procreate, Excalidraw, tldraw, Microsoft Whiteboard, Explain Everything, Freeform, Linea Sketch)

Fecha de la investigación: 25-nov-2026. Objetivo: entender qué hace que la tinta se sienta bien y que cada pluma se sienta distinta, para mejorar Kwanta (Next.js; perfect-freehand + SVG; trazo en vivo en canvas por fragmentos; cámara propia con transformaciones CSS; iPad Safari + Apple Pencil). Nota: el presupuesto de herramientas era limitado (unas 18 llamadas). Varias fuentes son de 2017 a 2024 y se marcan como antiguas.

## 1. Suavizado y estabilización del trazo, curvas de presión y velocidad, afinado de puntas, inclinación, grano y resaltador

### Takeaway
Las mejores apps separan al menos tres "filtros" distintos: (a) suavizado de la *trayectoria* (StreamLine, Stabilization, Motion Filtering, `streamline` de perfect-freehand), (b) suavizado de la *presión* (StreamLine Pressure en Procreate) y (c) suavizado del *contorno* (`smoothing`). Además modelan la anchura con una curva de presión editable, puntas afinadas configurables e inclinación (tilt/azimut) para lápices y plumas de cincel o caligrafía. Procreate documenta todo esto con precisión. Concepts y Linea lo exponen de forma mucho más simple.

### Cited Findings
**Procreate (manual oficial, Brush Studio)**
- StreamLine: "Assists in smoothing out wobbles or shakes in your line". Tiene *Amount* (más alto da un resultado liso y uniforme; más bajo da un trazo natural) y un control aparte de *Pressure*, que suaviza cómo se aplica la presión: la presión "se acumula" más gradualmente y, si se baja, entra antes en el trazo. — [Procreate Handbook: Brush Studio Settings](https://help.procreate.com/procreate/handbook/brushes/brush-studio-settings)
- Stabilization usa una media móvil del trazo ("the higher the Stabilization, the more it averages out the wobbles") y depende de la velocidad: "The faster you draw, the more it will smooth a stroke out." — [Procreate Handbook: Brush Studio Settings](https://help.procreate.com/procreate/handbook/brushes/brush-studio-settings)
- Motion Filtering elimina los extremos del temblor en lugar de promediarlos y no depende de la velocidad. *Expression* devuelve algo de naturalidad, pero pierde efecto cuanto más alto es el filtrado. Está pensado para temblor de manos y accesibilidad. — [Procreate Handbook: Brush Studio Settings](https://help.procreate.com/procreate/handbook/brushes/brush-studio-settings); [Procreate Handbook 5.2: Accessibility](https://help.procreate.com/procreate/handbook/5.2/interface-gestures/accessibility)
- Hay ajustes globales en Actions > Preferences > Pressure & Smoothing, que se suman a los ajustes por pincel. — [Procreate Handbook: Actions Preferences](https://help.procreate.com/procreate/handbook/actions/actions-preferences) (según el resumen de búsqueda; página no abierta)
- Fuentes de terceros recomiendan mantener Motion Filtering por debajo de ~70 para no perder las curvas. — [Beebom](https://beebom.com/how-draw-smooth-lines-stroke-stabilization-procreate) (fuente secundaria)
- Taper: *Pressure Taper* alarga el afinado natural al inicio y al final con Apple Pencil, y *Touch Taper* añade un afinado artificial al dedo. *Tip* va de punta muy fina a punta gruesa. *Size/Opacity* controlan la brusquedad del paso de grueso a fino y el desvanecimiento de los extremos. Existe *Classic Taper* para recuperar el render antiguo. — [Procreate Handbook: Brush Studio Settings](https://help.procreate.com/procreate/handbook/brushes/brush-studio-settings)
- Curva de presión: un gráfico por pincel mapea la presión del Pencil (eje X) al efecto (eje Y) para Size, Opacity, Flow y Bleed. — [Procreate Handbook: Brush Studio Settings](https://help.procreate.com/procreate/handbook/brushes/brush-studio-settings)
- Inclinación: de 0 a 15° no tiene efecto, de 16 a 30° es menos precisa y funciona mejor de 30 a 90°. El *Tilt Graph* define un "trigger point" donde cambia un atributo. Además hay Tilt Opacity, Tilt Bleed y Tilt Size. — [Procreate Handbook: Brush Studio Settings](https://help.procreate.com/procreate/handbook/brushes/brush-studio-settings)
- Azimut: detecta la dirección de inclinación del Pencil y gira los "stamps", lo que "creates an effect like a calligraphy pen". Solo afecta a trazos con Apple Pencil. — [Procreate Handbook: Brush Studio Settings](https://help.procreate.com/procreate/handbook/brushes/brush-studio-settings)
- Grano: con *Moving* el grano se arrastra con el trazo y queda rayado o difuminado. Con *Texturized* el grano queda fijo detrás del trazo, como un estarcido nítido. *Scale*, *Zoom* (sigue el tamaño o queda recortado), *Depth* (con Moving, la presión afecta al contraste) y *Size Compression* evitan que el grano escale con el pincel. — [Procreate Handbook: Brush Studio Settings](https://help.procreate.com/procreate/handbook/brushes/brush-studio-settings)
- Dynamics: *Speed Size* va de −100 % (lento = más fino) a +100 % (rápido = más fino), y 0 da una anchura uniforme. Hay *Speed Opacity* y *Jitter*, que es aleatorio e independiente de la velocidad. — [Procreate Handbook: Brush Studio Settings](https://help.procreate.com/procreate/handbook/brushes/brush-studio-settings)

**Concepts (manual oficial)**
- Smoothing tiene tres puntos de referencia. Con 0 % sigue la mano. Con 50 % quita muchos baches. Con 100 % produce una línea recta entre inicio y fin. Se ajusta en el anillo medio del Tool Wheel. — [Concepts Manual: Brushes and Tools](https://concepts.app/manual/brushesandtools)
- El manual de Windows dice que el suavizado se aplica *después* de terminar el trazo y que el suavizado en vivo está previsto. Es posible que esto no aplique a iOS o esté desactualizado. — [Concepts Windows Manual: Your Workspace](https://concepts.app/windows/manual/yourworkspace) (según el resumen de búsqueda; no verificado en la página)
- Los pinceles personalizados (solo iOS) permiten mapear presión, inclinación y velocidad a tamaño u opacidad mediante "variance curves". Smoothing no tiene curva. El rango de presión se ajusta en Settings > Stylus. — [Concepts Manual: Brushes and Tools](https://concepts.app/manual/brushesandtools)

**perfect-freehand (la librería que usa Kwanta)**
- Opciones y valores por defecto: `size` 8, `thinning` 0.5 (0 da una línea constante; un valor negativo adelgaza con más presión), `smoothing` 0.5 (bordes), `streamline` 0.5 (trayectoria), `easing` t=>t (sobre la presión), `simulatePressure` true, `start`/`end` {cap, taper, easing} y `last` (true = el trazo termina exactamente en el último punto; false mientras se dibuja). La presión real se pasa como tercer valor del punto con `simulatePressure:false`; si falta, el valor por defecto es 0.5. — [perfect-freehand README v1.2.3](https://cdn.jsdelivr.net/npm/perfect-freehand@1.2.3/README.md)
- Rendimiento: `getStroke` convierte los puntos con formato de objeto a arrays internamente, lo que cuesta rendimiento; para uso intensivo sugiere leer `.x`, `.y` y `.pressure` directamente. Se renderiza con `getSvgPathFromStroke` o con `new Path2D(path)` + `ctx.fill`. — [perfect-freehand README v1.2.3](https://cdn.jsdelivr.net/npm/perfect-freehand@1.2.3/README.md)

**tldraw**
- Pipeline del draw shape: *streamlining* interpola cada punto nuevo hacia el anterior, *smoothing* redondea el contorno y *thinning* varía la anchura por velocidad (ratón) o presión (pen). El ratón y el dedo simulan presión con la velocidad, así que más rápido da un trazo más fino. No se publican valores numéricos. — [tldraw Docs: Draw shape](https://tldraw.dev/sdk-features/draw-shape)
- Se detecta pen si el navegador reporta un puntero pen con presión distinta de cero, o si la presión cae estrictamente en (0,0.5) o en (0.5,1), porque el ratón reporta exactamente 0.5. `isPen` selecciona un "stroke profile" distinto para presión real. — [tldraw Docs: Draw shape](https://tldraw.dev/sdk-features/draw-shape)

**Resaltador**
- tldraw: el resaltador usa la misma captura de puntos y se renderiza semitransparente. Los resaltados no pueden "cerrarse" (no se rellenan). La documentación no describe orden de pintado ni opacidad. — [tldraw Docs: Draw shape](https://tldraw.dev/sdk-features/draw-shape)
- Concepts Marker: tiene la textura, transparencia y borde de un rotulador físico, y el cincel sigue la rotación del lápiz (barrel roll del Apple Pencil Pro, con vista previa del sello). — [Concepts Manual: Brushes and Tools](https://concepts.app/manual/brushesandtools)

### Inferences
- La sensación de que Kwanta va "lenta" puede venir en parte de un `streamline` alto (0.5 por defecto): cada punto se interpola hacia el anterior, así que el trazo se queda visualmente detrás de la punta. Procreate separa claramente el suavizado de trayectoria del de presión. Para escritura conviene un `streamline` bajo (≈0.2–0.35) y suavizar solo la presión con un filtro propio.
- Para que las plumas se sientan distintas no basta cambiar `size`/`thinning`: hay que variar la *fuente* de la anchura (presión, velocidad con signo, inclinación o azimut), el afinado de puntas, la opacidad y la textura, como hacen Procreate y Concepts.
- `last:false` mientras se dibuja y `last:true` al levantar el lápiz evita que el final "salte".

### Gaps
- No encontré documentación oficial de los algoritmos internos de Concepts (por ejemplo, si el suavizado es en vivo en iOS en 2026) ni de Linea (pen models).
- No encontré cómo tldraw ordena el resaltador (si queda debajo de la tinta) ni su opacidad exacta.
- No encontré cómo dibuja Procreate el resaltador (no tiene una herramienta dedicada; se consigue con pinceles y modos de fusión, pero no lo verifiqué).

## 2. Cómo cada app consigue que las plumas se sientan distintas

### Takeaway
La diferencia entre plumas viene de modelos de anchura opuestos: la velocidad adelgaza el trazo en la Pen de Concepts y lo engrosa en la Fountain; la Dynamic responde a la presión; la Fixed Width y la monoline no varían. Los lápices dependen de la inclinación con grano, y el rotulador o resaltador tiene punta de cincel orientada. PencilKit (Freeform) expone un catálogo cerrado de tintas con identidad propia.

### Cited Findings
- Concepts: Pen (rápido = más fino, lento = más grueso), Fountain Pen (lento = más fino, rápido = más grueso), Dynamic Pen (presión; tiene una capa raster sobre el vector), Fixed Width Pen (constante), Wire (anchura constante a cualquier zoom), Soft/Hard Pencil (inclinación + presión + velocidad, y se sombrea inclinando), Marker (cincel que sigue la rotación del lápiz), Airbrush y Watercolor (se mezcla con trazos consecutivos de acuarela en la misma capa). — [Concepts Manual: Brushes and Tools](https://concepts.app/manual/brushesandtools)
- Procreate consigue la sensación de caligrafía con el azimut (rotación de los sellos según la dirección de inclinación) y la del lápiz con grano Texturized/Moving y Tilt Size/Opacity. — [Procreate Handbook: Brush Studio Settings](https://help.procreate.com/procreate/handbook/brushes/brush-studio-settings)
- PencilKit (motor de Freeform y Notas): tintas `pen`, `pencil`, `marker`, y desde iPadOS 17 `monoline` (monolínea), `fountainPen` (caligrafía), `watercolor` y `crayon`. Las tintas de iPadOS 17 requieren `PKContentVersion2`. — [Apple: PKInkingTool](https://developer.apple.com/documentation/pencilkit/pkinkingtool-swift.struct.md); [Apple: PKContentVersion](https://developer.apple.com/documentation/pencilkit/pkcontentversion.md)
- Una referencia de terceros dice que iOS/iPadOS 26 añade una "reed pen" (versión 4). No lo confirmé en Apple. — [tessl.io PencilKit skill](https://tessl.io/registry/dpearson2699/swift-ios-skills/3.6.1/files/skills/pencilkit/SKILL.md) (no oficial)
- Linea Sketch tiene Technical Pencil (mina dura, línea fina), Art Pencil (mina blanda, gruesa), Felt Tip Pen (línea fina sólida que varía en opacidad), Marker (línea gruesa sólida) y Watercolor Brush. — [App Store: Linea Sketch](https://apps.apple.com/us/app/id1094770251)
- Linea (2017): inclinar el Pencil cambia la salida. El Technical Pencil da un trazo suave y difuminado con el borde de la mina, y el Marker da un trazo ancho y plano. — [AppAdvice 2017](https://appadvice.com/post/linea-update-apple-pencil-tilt/740249) (antiguo)
- En reseñas de Linea en la App Store hay quejas de "No smoothing :(" y peticiones de streamline. El desarrollador respondió que le gustaría añadirlo. — [App Store: Linea Sketch](https://apps.apple.com/us/app/id1094770251) (reseñas; fecha incierta)
- tldraw: el estilo `dash: 'draw'` usa el algoritmo freehand completo, mientras que `solid`/`dashed`/`dotted` dibujan con anchura uniforme. Su apariencia "a mano" en formas geométricas usa imperfecciones con un PRNG con semilla (para que no tiemblen en cada render) y un trazo de dos pasadas. — [tldraw Docs: Draw shape](https://tldraw.dev/sdk-features/draw-shape); [tldraw blog: Engineering imperfection with draw shapes](https://tldraw.dev/blog/engineering-imperfection-with-draw-shapes) (según el resumen de búsqueda)

### Inferences
- Propuesta de "pen models" para Kwanta, basada en lo anterior:
  - Bolígrafo: `thinning` ≈0.1–0.2, sin `simulatePressure`, puntas apenas afinadas y una línea casi uniforme.
  - Pluma estilográfica: anchura por presión más una componente de dirección o azimut, imitando una punta a ~30–45°. La anchura depende del ángulo entre la dirección del trazo y la punta, que es lo que hacen Procreate con azimut y PencilKit con fountainPen.
  - Rotulador o marcador: anchura grande casi constante, opacidad uniforme y extremos planos (`cap`).
  - Lápiz: anchura modulada por inclinación (`tiltX`/`tiltY`/`altitudeAngle` en Pointer Events), opacidad baja con grano de textura fija ("Texturized") en lugar de color sólido.
  - Resaltador: cincel plano, anchura constante, `mix-blend-mode: multiply` y renderizado en una capa debajo de la tinta.
- Que todas las plumas usen perfect-freehand con parámetros similares explica la queja de que "se sienten iguales": perfect-freehand solo modela la anchura en función de presión o velocidad, no la dirección, la textura ni la opacidad.

### Gaps
- No hay documentación oficial de los parámetros internos de PencilKit ni de Linea.
- No verifiqué si Linea tiene una herramienta de resaltador en 2026.

## 3. Latencia: predicción, renderizado a la frecuencia de la pantalla, renderizado incremental y enfoques web (Excalidraw, tldraw)

### Takeaway
En la web los cuellos de botella son recalcular todo el trazo en cada punto (perfect-freehand), los trazos largos y el soporte irregular de Safari para `getCoalescedEvents`/`getPredictedEvents`. tldraw parte los trazos largos (600 puntos por shape) y en la 5.2 (julio de 2026) reescribió su algoritmo de tinta para que sea unas 2–3× más rápido y un 57 % más pequeño en SVG. Canva también segmenta los trazos. Ninguna fuente oficial da cifras de latencia en iPad Safari.

### Cited Findings
- tldraw SDK 5.2 (1-jul-2026): "rewrote tldraw's freehand ink algorithm". Los trazos de draw y de resaltador se calculan unas 2× más rápido (hasta 3× en trazos largos) y el path SVG es un 57 % más pequeño, sin cambio visible. La mejora viene de hacer menos trabajo por punto: la dirección se deriva de los puntos vecinos en lugar de guardar un vector por punto, y radio y taper se calculan en la misma pasada que construye el contorno. También añade un gesto táctil de doble toque y arrastre para hacer zoom. — [tldraw blog: SDK 5.2](https://tldraw.dev/blog/tldraw-sdk-5.2); [tldraw v5.2.0 release notes](https://tldraw.dev/releases/v5.2.0)
- tldraw: `maxPointsPerShape` vale 600 por defecto. Al superarlo, el shape actual se completa y empieza uno nuevo en la posición actual. — [tldraw Docs: Draw shape](https://tldraw.dev/sdk-features/draw-shape)
- tldraw codifica los puntos en base64: el primer punto en Float32 y los siguientes como deltas Float16 (pen: x, y, z con presión, 6 bytes por delta; ratón/dedo: x, y, 4 bytes). Redimensionar no recodifica (usa `scaleX`/`scaleY`). — [tldraw Docs: Draw shape](https://tldraw.dev/sdk-features/draw-shape)
- tldraw cambia a render "solid" por rendimiento por debajo del 50 % de zoom (o de un umbral ligado al grosor escalado). Con *dynamic resize* los trazos nuevos tienen el mismo tamaño en pantalla a cualquier zoom. — [tldraw Docs: Draw shape](https://tldraw.dev/sdk-features/draw-shape)
- Canva (marzo de 2024) usa perfect-freehand. Cada punto nuevo obligaba a recalcular todo el trazo y eso ralentizaba los dispositivos móviles con trazos largos, así que dividieron los trazos en segmentos con un número máximo de puntos. Además usan un overlay nativo que guarda en buffer los eventos cuando la VM de JS está ocupada. Para reducir el SVG redondean a 2 decimales, usan comandos relativos (`c`), lo que acorta un ~32 %, y simplifican con Ramer-Douglas-Peucker. Usan una máquina de estados para la entrada y un "touch slop" para descartar toques accidentales. — [Canva Engineering: Behind the draw](https://www.canva.dev/blog/engineering/behind-the-draw/)
- Excalidraw: los usuarios reportan lag con lápiz en el navegador cuando hay muchos trazos, mientras que la demo de perfect-freehand casi no tiene lag. — [Excalidraw issue (vía Lightrun)](https://lightrun.com/answers/excalidraw-excalidraw-improve-free-hand-drawing) (comunidad; fecha incierta)
- Un commit en un *fork* de Excalidraw reescribe el render de freedraw con la lógica del LaserPointer: usa presión real si existe y la simula por velocidad si no, y quita perfect-freehand del render. No confirmé que esté en upstream. — [Commit en fork de Excalidraw](https://gitea.maison43.duckdns.org/gilles/excalidraw/commit/660d21fe4690c68bc2490ad475c537c995f40aa7) (fork, baja confianza)
- Apple Pencil muestrea hasta 240 Hz, y en Mobile Safari los pointer events se pierden en frames lentos. — [Apple Developer Forums: 240Hz Apple Pencil input in JavaScript](https://developer.apple.com/forums/thread/689375)
- Hay fuentes contradictorias sobre Safari en iPad. Algunos proyectos dicen que `getCoalescedEvents` no existe; otros citan su disponibilidad desde Safari 18.2 en contexto seguro. `getPredictedEvents` se reporta ausente en unos y útil en otros (PWA). Se observaron puntos duplicados en los eventos coalescidos (trazos punteados) y el arreglo fue filtrar por timestamp. `desynchronized: true` se aceptaría pero se ignoraría en Safari. — [GitHub: sanenotes #293](https://github.com/swiftsaneai/sanenotes/issues/293); [GitHub: Final-Pri-learning PR #946](https://github.com/Priysharan19/Final-Pri-learning/pull/946); [GitHub: lesson_observer #2](https://github.com/tky-och/lesson_observer/issues/2); [GitHub: mdview #51](https://github.com/henriSchulz/mdview/issues/51) (fuentes de baja autoridad; verificar en MDN o WebKit)

### Inferences
- Para Kwanta:
  1. Leer `getCoalescedEvents()` con detección de la función y deduplicando por timestamp, para no perder los ~240 Hz del Pencil.
  2. Usar predicción propia (extrapolación de 1–2 frames con velocidad suavizada) si `getPredictedEvents` no existe, y dibujar el tramo predicho como cola temporal que se descarta en el siguiente frame.
  3. Dibujar el trazo vivo en canvas en `requestAnimationFrame`, recalculando solo la "cola" (últimos N puntos) y dejando fijo el prefijo ya rasterizado, como la segmentación de Canva y tldraw.
  4. Bajar `streamline`.
  5. Usar `touch-action: none` y no hacer trabajo de React ni de estado por cada punto (la máquina de estados de Canva lo aísla).
  6. Al soltar, convertir a SVG con coordenadas redondeadas y simplificación RDP.
- Mover la cámara con transformaciones CSS mientras se dibuja puede provocar reflow o recomposición; conviene que el canvas del trazo vivo esté en coordenadas de pantalla, fuera del contenedor transformado.

### Gaps
- No encontré qué hace Procreate o Concepts para la latencia (predicción de UIKit, render Metal a 120 Hz). Es conocimiento general de iOS, sin fuente aquí.
- No encontré datos oficiales de WebKit/MDN en esta sesión que confirmen la compatibilidad de `getCoalescedEvents`/`getPredictedEvents` en iPadOS 26 Safari. Hay que verificarlo.
- No encontré una descripción oficial de cómo Excalidraw upstream renderiza hoy freedraw (canvas con caché por elemento).

## 4. Lienzo infinito vs páginas, pan/zoom, gestos, rechazo de palma y modos dedo/lápiz

### Takeaway
Las pizarras (Freeform, tldraw, Excalidraw, Whiteboard) usan lienzo infinito y gestos estándar de dos dedos. Excalidraw tiene un "pen mode" con rechazo de palma, pero los usuarios reportan trazos perdidos y escritura "torpe" en iPad. tldraw añadió en 2026 el zoom con doble toque y arrastre.

### Cited Findings
- Freeform: "The infinite canvas expands as content is added", con navegación por gestos integrados. Se dibuja con el dedo o con el Apple Pencil, y ofrece varios estilos de pincel y colores. — [Apple Newsroom (dic-2022)](https://www.apple.com/newsroom/2022/12/apple-launches-freeform-a-powerful-new-app-designed-for-creative-collaboration) (antiguo); [App Store: Freeform](https://apps.apple.com/bg/app/freeform/id6443742539)
- Excalidraw: el pen mode con rechazo de palma fue bien recibido, pero se reporta que se pierden trazos del Pencil si empiezan muy poco después del anterior. — [Excalidraw issue (vía Lightrun)](https://lightrun.com/answers/excalidraw-excalidraw-freehand-pen-mode-skips-stroke-if-it-starts-within--ms-after-previous-stroke)
- Excalidraw: escribir a mano con freedraw "se volvió viable" gracias al rechazo de palma, pero sigue resultando "awkward and unreliable on iPad", y los usuarios piden suavizado ajustable. — [Excalidraw issue (vía Lightrun)](https://lightrun.com/answers/excalidraw-excalidraw-perfect-freehand-drawing)
- Antes, Excalidraw no tenía rechazo de palma y dibujaba puntos al intentar mover la página. — [GitHub Excalidraw discussion #3808](https://github.com/excalidraw/excalidraw/discussions/3808) (antiguo)
- El plugin de Excalidraw para Obsidian añadió un "pencil lock" que impide que el toque interfiera al dibujar con lápiz (aparece con la herramienta freedraw). — [obsidian-excalidraw-plugin 1.5.23](https://newreleases.io/project/github/zsviczian/obsidian-excalidraw-plugin/release/1.5.23)
- Concepts: atajos de pan, rotación y zoom (Space, R, S). Mantener pulsado cambia de herramienta temporalmente y un toque la deja fija. Selección con un segundo dedo o con Tap+Hold. — [Concepts Manual: Brushes and Tools](https://concepts.app/manual/brushesandtools)
- tldraw 5.2 añadió el gesto táctil de doble toque y arrastre para hacer zoom. — [tldraw blog: SDK 5.2](https://tldraw.dev/blog/tldraw-sdk-5.2)
- Canva usa un "touch slop check" en la capa de despacho para filtrar toques accidentales. — [Canva Engineering: Behind the draw](https://www.canva.dev/blog/engineering/behind-the-draw/)

### Inferences
- Kwanta debería tener un modo "solo lápiz": con `pointerType === 'pen'` se dibuja; con `touch` se hace pan o zoom y nunca se dibuja. Debe ser explícito y estar activado por defecto en iPad cuando se detecte un pen. También debe cuidar que no se pierdan trazos rápidos consecutivos, que es el bug de Excalidraw.

### Gaps
- No encontré límites de zoom documentados (mínimo y máximo) de tldraw, Excalidraw o Freeform.
- No verifiqué en documentación oficial si Freeform tiene un ajuste "solo Apple Pencil" (PencilKit tiene `drawingPolicy`, pero no lo confirmé con una fuente en esta sesión).

## 5. Barras de herramientas: rueda de Concepts, barra lateral de Procreate, selector de PencilKit en Freeform, UIs mínimas

### Takeaway
Concepts concentra el control en una rueda flotante con anillos (herramientas y, en el anillo medio, tamaño, opacidad y suavizado con presets). Freeform usa el selector estándar de PencilKit. Ambos enfoques mantienen los ajustes por pluma a un toque.

### Cited Findings
- Tool Wheel de Concepts: el anillo medio ajusta tamaño, opacidad y suavizado (con 4 presets de tamaño arriba). Tocar la herramienta activa abre el menú de pinceles y se pueden añadir pinceles a la rueda. Doble toque en la máscara abre Quick Clear. — [Concepts Manual: Brushes and Tools](https://concepts.app/manual/brushesandtools)
- PencilKit ofrece un selector de herramientas configurable (`PKToolPicker`, con elementos de tinta configurables). — [Apple: Configuring the PencilKit tool picker](https://developer.apple.com/documentation/pencilkit/configuring-the-pencilkit-tool-picker.md); [Apple: PKToolPickerInkingItem](https://developer.apple.com/documentation/pencilkit/pktoolpickerinkingitem.md)

### Inferences
- Para Kwanta: una barra compacta con 4–5 plumas preconfiguradas, cada una con su propio grosor y color recordados, como el selector de PencilKit. Un control de grosor con presets como en Concepts. Un toque doble o un squeeze (si se expone en la web) para alternar entre goma y pluma.

### Gaps
- No obtuve la página del manual de Procreate sobre la barra lateral (deslizadores de tamaño y opacidad, botón modificador). No hay cita.
- No hay fuente sobre si el squeeze o barrel roll del Apple Pencil Pro están expuestos a la web en Safari.

## 6. Explain Everything y Microsoft Whiteboard: grabar explicaciones con tinta

### Takeaway
Explain Everything se centra en grabar (voz + tinta en el tiempo) y su plan gratuito limita la grabación a 3 minutos. Whiteboard se centra en "ink to shape", el embellecimiento de la escritura y la conversión a texto con Scribble.

### Cited Findings
- Explain Everything: el plan Free tiene un límite de grabación de 3 minutos y los planes de pago permiten grabación ilimitada. — [Explain Everything Help Center](https://help.explaineverything.com/hc/en-us/articles/360013907993); [Explain Everything Help Center](https://help.explaineverything.com/hc/en-us/articles/360013803874) (según el resumen de búsqueda)
- Microsoft Whiteboard: *Ink to Shape* convierte cuadrados, rectángulos, triángulos, círculos, hexágonos, pentágonos y paralelogramos (se puede desactivar). — [Microsoft Support: Ruler and Enhance Shapes](https://support.microsoft.com/en-us/whiteboard/use-ruler-and-enhance-shapes-in-whiteboard)
- *Ink beautification* (2019) analiza la escritura y la reemplaza por trazos más legibles. Se anunció que llegaría a iOS más tarde. — [Microsoft 365 Blog (2019)](https://www.microsoft.com/en-us/microsoft-365/blog/?p=180983) (antiguo)
- La app de iPad de Whiteboard convierte tinta a texto en notas y cuadros de texto (vía Scribble con Apple Pencil). — [App Store: Microsoft Whiteboard](https://apps.apple.com/au/app/id1352499399)
- Canva Shape Assist: mantener el cursor quieto convierte el trazo en forma, usando un modelo ML entrenado con formas dibujadas por usuarios. — [Canva Engineering: Behind the draw](https://www.canva.dev/blog/engineering/behind-the-draw/)

### Inferences
- Para explicar soluciones, Kwanta podría guardar timestamps por punto (ya se capturan) y así reproducir la escritura ("replay") sin grabar vídeo. Es más ligero que el enfoque de Explain Everything. Un "mantener para enderezar o convertir en forma", como Canva y Journal, ayuda a dibujar diagramas.

### Gaps
- No obtuve detalles oficiales de cómo Explain Everything graba la tinta (vectorial frente a vídeo) ni del estado de Whiteboard en iPad en 2026.

## 7. Precios (2025–2026)

### Takeaway
Procreate es una compra única de unos 12,99 USD. Concepts es freemium con suscripción y precio regional. Explain Everything cobra 69 USD al año en el plan Advanced de educación. Freeform es gratis. No encontré el precio actual de Linea.

### Cited Findings
- Procreate cuesta 12,99 USD en pago único (julio de 2026). Procreate Pocket cuesta 5,99 y Dreams 19,99. — [Comparedge](https://comparedge.com/tools/procreate/pricing) (tercero; un agregador con "por mes" probablemente está equivocado: [ideaproof](https://ideaproof.io/saas-pricing/product/procreate))
- Concepts tiene un plan gratuito y Concepts Pro con precio variable por región; remite a las tiendas para el precio exacto. — [Concepts: Pricing explained](https://concepts.app/pricing-explained)
- Explain Everything Advanced (educación) cuesta 69 USD al año; los centros piden presupuesto. — [Explain Everything Pricing](https://explaineverything.com/pricing/)
- Linea: solo encontré una oferta de octubre de 2024 con ~50 % de descuento en la suscripción anual. — [Iconfactory blog (oct-2024)](https://blog.iconfactory.com/2024/10/sketch-your-heart-out-this-october-with-lineas-50-off-sale/) (antiguo)
- Freeform viene incluida y es gratuita en los dispositivos Apple. — [App Store: Freeform](https://apps.apple.com/bg/app/freeform/id6443742539)

### Inferences
- Ninguna.

### Gaps
- No verifiqué los precios actuales de Microsoft Whiteboard (incluido con cuentas Microsoft), Excalidraw+ ni tldraw (licencia del SDK).
