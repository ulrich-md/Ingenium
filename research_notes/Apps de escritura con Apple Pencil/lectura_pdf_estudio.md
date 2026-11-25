# Apps de lectura, PDF y estudio con Apple Pencil (LiquidText, MarginNote, Muse/Allume, PDF Expert, Kami, Xodo, RemNote)

Notas de investigación para Kwanta (Next.js, iPad Safari, IB Physics: respuestas de examen manuscritas, notas Cornell, panel de fórmulas, markscheme y autocorrección, hojas de práctica). Fecha de investigación: 25 nov 2026. Las páginas de App Store son instantáneas cuyas fechas no siempre muestran el año. Lo indico cuando es así.

**Cambios de nombre detectados (importante):**
- Muse ahora se llama **Allume**. El enlace de la App Store de MarginNote 4 ahora muestra **MarginNote 5**. Ver las secciones de abajo.

## 1. Patrones de pantalla dividida y lado a lado (documento + notas, panel de extractos); cómo mantienen ambos visibles en iPad; paneles plegables

### Takeaway
El patrón dominante es "documento a la izquierda + espacio de trabajo/notas a la derecha", con un divisor arrastrable. LiquidText lo complementa con "pinch to collapse": pellizcar el documento oculta el texto intermedio para comparar pasajes lejanos. MarginNote combina documento y mapa mental, con un layout configurable y una vista limpia que oculta barras. Muse/Allume renuncia a la vista dividida y lo pone todo en un lienzo infinito con tableros anidados.

### Cited Findings
- **LiquidText, documento y workspace.** Saca extractos del documento a un área "Workspace", donde se agrupan; tocar un extracto lleva a su fuente original. — [App Store LiquidText (US)](https://apps.apple.com/us/app/liquidtext/id922765270)
- **LiquidText, colapsar y comparar.**
  - Se pellizca el documento para comparar páginas distantes y se colapsa el texto para ver lado a lado solo las partes anotadas o los resultados de búsqueda. — [App Store LiquidText](https://apps.apple.com/us/app/liquidtext/id922765270)
  - El sitio oficial describe "pinch" para juntar pasajes conectados entre páginas y documentos, y para ver el contexto de los resultados de búsqueda. — [liquidtext.net](https://www.liquidtext.net/)
- **LiquidText, varios documentos.** Permite ver hasta 3 documentos a la vez en iPad (5 en PC); es función de pago (Pro). — [LiquidText pricing-features](https://www.liquidtext.net/pricing-features); [App Store](https://apps.apple.com/us/app/liquidtext/id922765270)
- **MarginNote 5 (antes 4), layout.**
  - Documentos lado a lado y ventanas de documento en iPad y Mac.
  - Opción "Arrange layout" y una "Clean View" que oculta las barras de herramientas.
  - Plantilla "Standard" con cuatro modos: Excerpt, Handwrite, Organize y Recall.
  - Fuente: [App Store MarginNote (US)](https://apps.apple.com/us/app/marginnote-4-ai-notes-mindmap/id1531657269)
- **Muse / Allume, lienzo en lugar de split view.**
  - Cada tablero es "como una pizarra que puede contener más pizarras": tableros anidados.
  - En un mismo lienzo caben tinta, texto, imágenes, PDFs y enlaces.
  - Permite extraer partes de PDFs e imágenes conservando el contexto de la fuente.
  - La ficha de la App Store no menciona vista lado a lado.
  - Fuente: [App Store Allume/Muse (US)](https://apps.apple.com/us/app/muse-canvas-for-ideas/id1501563902)
- **Muse / Allume, críticas (reseñas de 2022).**
  - Es difícil escalar un tablero sin crear uno nuevo.
  - No se pueden bloquear objetos, así que se redimensionan por accidente.
  - Faltaba un lienzo infinito en todas direcciones.
  - Fuente: [App Store Allume](https://apps.apple.com/us/app/muse-canvas-for-ideas/id1501563902)
- **PDF Expert, gestos.** Un reseñista destaca que la app distingue el scroll con el dedo del resaltado con el Pencil. — [App Store PDF Expert](https://apple.co/2VxDctU)
- **Kami en iPad, gestos.** Con un stylus, Kami activa automáticamente "touch scrolling": el dedo desplaza y el lápiz escribe. Muestra un aviso que se puede desactivar. — [Kami Help: Stylus support](https://help.kamiapp.com/en/articles/3038936-stylus-support-for-kami)

### Inferences
- **Layout para Kwanta.** Un layout de "enunciado/PDF | hoja de respuesta" con divisor arrastrable y paneles plegables (fórmulas, markscheme) sigue el modelo de LiquidText y MarginNote. La "Clean View" de MarginNote sugiere un modo foco que oculte todo menos el área de escritura.
- **Colapsar el enunciado.** Mostrar solo las partes subrayadas de una pregunta larga mientras el alumno escribe sería una adaptación barata del "pinch to collapse" de LiquidText.
- **Dedo y lápiz separados.** Separar el dedo (scroll/pan) del Pencil (tinta) es la convención esperada. En la web se resuelve con `pointerType === "pen"` en Pointer Events, como hace Kami en el navegador.
- **Lienzo infinito.** Las críticas a Muse (falta de espacio, objetos que se mueven por accidente) advierten que un lienzo libre necesita poder bloquear o fijar el contenido de la fuente (el enunciado) y crecer en vertical.

### Gaps
- No encontré documentación oficial de PDF Expert ni de Xodo sobre una vista dividida documento + notas en iPad. Ambos son lectores de un solo documento con pestañas, pero no lo verifiqué con una fuente.
- No pude confirmar cómo se ve la ventana dividida de MarginNote 5 (proporciones, si los paneles son plegables) más allá de la ficha de la App Store.

## 2. Herramientas de anotación (plumas/resaltadores, lazo, tinta en márgenes, márgenes expandibles, comentarios, vincular tinta a texto)

### Takeaway
La diferencia clave de LiquidText son los "ink links": trazos que conectan cualquier par de objetos (extracto, nota, página, documento). MarginNote usa capas de escritura a mano y anotaciones sobre tarjetas. Kami y Xodo ofrecen el set clásico (dibujo, resaltador, subrayado, formas, comentarios), y Kami añade comentarios de voz y vídeo.

### Cited Findings
- **LiquidText, tinta e ink links.**
  - Dibujar en notas, documentos o workspace.
  - "Ink links" que cruzan páginas, documentos y notas, y sirven para construir mapas mentales.
  - Notas al margen y comentarios sobre texto, imágenes, notas y extractos, incluso sobre selecciones múltiples.
  - La versión 7.3.18 (6 nov, año no mostrado) añadió seleccionar, redimensionar y recolorear la tinta.
  - Fuente: [App Store LiquidText](https://apps.apple.com/us/app/liquidtext/id922765270)
- **LiquidText, qué es de pago.**
  - El plan Basic gratuito incluye excerpting, vincular extractos a notas, mapas mentales y exportar.
  - La tinta es de pago (Pro): "write-anywhere inking", borrador, modo FingerDraw, InkBoxes, extractos de forma libre, Ink Links entre cualquier par de objetos, enlaces entre documentos y OCR.
  - La página no menciona "márgenes expandibles".
  - Fuente: [LiquidText pricing-features](https://www.liquidtext.net/pricing-features)
- **LiquidText, crítica (reseña de 2024).** El tamaño del resaltador vuelve al valor medio al salir del proyecto, y el usuario pedía estilos y colores por defecto. Un changelog antiguo (7.1.6) ya decía haber corregido que el ancho no se guardaba. — [App Store LiquidText](https://apps.apple.com/us/app/liquidtext/id922765270)
- **MarginNote, tinta.**
  - Escritura a mano con Apple Pencil, capas de escritura y anotaciones manuscritas en tarjetas.
  - Extractos por selección de bloque, en varios colores.
  - Una reseña de 22 ago 2025 pide suavizado de línea en la escritura a mano.
  - Fuente: [App Store MarginNote](https://apps.apple.com/us/app/marginnote-4-ai-notes-mindmap/id1531657269)
- **Kami, herramientas.**
  - Anotación básica: Drawing, Eraser, Highlighter, Underline, Shapes y Strikethrough.
  - Feedback: Voice Comment y Video Comment.
  - Funciones de IA: "Understand" tools, Questions AI, texto predictivo y Read Aloud.
  - La página no deja claro qué plan incluye cada herramienta.
  - Fuente: [Kami Pricing](https://www.kamiapp.com/pricing/)
- **Kami, trazo libre.** Highlighter, Strikethrough, Underline y Drawing funcionan a mano alzada con un stylus activo. — [Kami Help: Stylus support](https://help.kamiapp.com/en/articles/3038936-stylus-support-for-kami)
- **Xodo, Apple Pencil.**
  - La ficha dice "Stylus-friendly: Supports Apple Pencil".
  - Un reseñista dice que tiene que volver a trazar el segundo trazo después del primero.
  - Otro echa de menos una opción "Apple ink" que se quitó en una actualización.
  - Fuente: [App Store Xodo (US)](https://apps.apple.com/us/app/pdf-reader-and-markup-by-xodo/id805075929) (vía resultados de búsqueda; reseñas sin fecha clara)
- **PDF Expert, Pencil.** Se elogia el soporte del Pencil, pero leer en voz alta y anotar a la vez puede fallar. — [App Store PDF Expert (AE)](https://apps.apple.com/ae/app/id743974925)

### Inferences
- **Vincular tinta.** Los "ink links" son el modelo más claro para conectar un trazo con un elemento (una línea del enunciado, una fórmula del data booklet). En Kwanta podría ser "arrastrar desde la respuesta hasta la fórmula usada", y quedaría un enlace navegable.
- **Ajustes de herramienta.** Las críticas sobre el tamaño del resaltador que se reinicia y la falta de suavizado indican que los usuarios valoran que se recuerden los ajustes del pincel y que la tinta sea suave. Para la web conviene usar suavizado tipo perfect-freehand y guardar las preferencias del lápiz por usuario.
- **Latencia.** Las quejas de Xodo (trazos que se pierden) muestran que la latencia o la pérdida del primer trazo es el fallo más visible. Es crítico probarlo en Safari en iPad.

### Gaps
- No encontré documentación de "márgenes expandibles" (añadir espacio en blanco junto a un PDF) en estas apps. Es una función conocida de GoodNotes y Notability, fuera de este alcance. No lo confirmé.
- No encontré detalles verificados del lazo (selección de tinta) en Kami ni en Xodo. Lo único documentado es que LiquidText añadió selección y redimensionado de tinta en la 7.3.18.

## 3. Funciones de estudio (flashcards desde resaltados o escritura, mapas mentales, repetición espaciada, esquemas)

### Takeaway
MarginNote es la referencia: un mismo elemento es a la vez resaltado en el PDF, nodo del mapa mental y flashcard. El repaso usa FSRS y se puede escribir a mano sobre la tarjeta durante el repaso. RemNote convierte cualquier frase de un PDF en flashcard y genera tarjetas y quizzes con IA. LiquidText y Muse/Allume se quedan en organización y mapas, sin repetición espaciada.

### Cited Findings
- **MarginNote, la tarjeta en tres vistas.**
  - "Cards are the same card seen from three angles": resaltado en el documento, nodo del mapa mental y flashcard.
  - Un editor permite crear flashcards con extractos en un solo paso.
  - El repaso usa FSRS.
  - iCloud sincroniza los Study Sets y el progreso de repaso.
  - Fuente: [App Store MarginNote (resultado de búsqueda)](https://apps.apple.com/us/app/-/id1531657269)
- **MarginNote 5, mapas y repaso.**
  - Sub-mapas, tablero para agrupar tarjetas y diagrama de conceptos en lienzo infinito.
  - Export a PDF como estructura o como flujo de tarjetas.
  - Modo **Recall**: oculta y revela el contenido del mapa para autoevaluarse.
  - Escribir sobre la instantánea de la tarjeta durante el repaso.
  - Tarjetas de práctica vía add-on.
  - Modo outline, y esquemas de IA que se convierten en ramas del mapa.
  - Fuente: [App Store MarginNote](https://apps.apple.com/us/app/marginnote-4-ai-notes-mindmap/id1531657269)
- **MarginNote, críticas.**
  - Curva de aprendizaje empinada y sin instrucciones (reseña de 24 sep 2024).
  - Lenta y con fallos en estudios grandes en Mac M1, con pérdida de trabajo (reseña de 15 feb 2025).
  - Fuente: [App Store MarginNote](https://apps.apple.com/us/app/marginnote-4-ai-notes-mindmap/id1531657269)
  - En foros, su interfaz se describe como "inusual y a veces confusa". — [Eastgate Forum](https://forum.eastgate.com/t/marginnote-and-liquidtext/680)
  - Paperlike la considera más compleja de aprender que LiquidText. — [Paperlike](https://paperlike.com/blogs/paperlikers-insights/liquidtext-vs-marginnote-3)
- **RemNote.**
  - Hacer clic en cualquier frase del PDF la convierte en flashcard de repetición espaciada.
  - La IA genera flashcards y quizzes de un documento entero.
  - Hay dibujo a mano alzada sobre PDFs "en ordenador o tablet".
  - Fuente: [RemNote: Annotate PDF](https://www.remnote.com/feature/annotate-pdf)
  - Los resaltados de área (imagen) tienen una opción de IA "convert to text". — [RemNote Help](https://help.remnote.com/en/articles/6690975-annotating-files-with-the-remnote-reader)
  - Su página principal menciona tomar notas manuscritas en tablet, pero un reseñista de la App Store pedía un bloc para notas manuscritas con Apple Pencil, así que el soporte de escritura a mano es dudoso o reciente. — [remnote.com](https://remnote.com); [App Store RemNote](https://apps.apple.com/app/id1545429784)
- **LiquidText.** Incluye mapas mentales con ink links y export de notas y extractos a PDF/DOCX. No encontré flashcards ni repetición espaciada. — [liquidtext.net](https://www.liquidtext.net/); [pricing-features](https://www.liquidtext.net/pricing-features)

### Inferences
- **Una unidad, varias vistas.** "Una unidad, tres vistas" es el patrón más útil para Kwanta. Una pregunta de la columna de pistas de Cornell (o un ítem del markscheme) puede ser a la vez nota, ítem de la hoja de práctica y tarjeta de repaso.
- **Recall frente a Cornell.** El modo Recall de MarginNote (ocultar y revelar) es casi idéntico al método Cornell de tapar la columna de notas y contestar desde la de pistas. Kwanta podría ofrecer "tapar notas" con autocalificación (Again/Hard/Good/Easy) y programar con FSRS (hay librerías JS de código abierto, como ts-fsrs; no lo verifiqué en esta sesión).
- **Escribir durante el repaso.** Escribir a mano sobre la tarjeta en el repaso (MarginNote) encaja con IB Physics: resolver a mano y luego compararlo con el markscheme.
- **Recortes de área.** Que RemNote convierta recortes de área en texto con IA sugiere que, para Kwanta, extraer del PDF de notas un recorte (diagrama o fórmula) como imagen más texto OCR sería la forma de generar tarjetas y hojas de práctica.

### Gaps
- No verifiqué el soporte de imagen y oclusión de Anki ni su escritura a mano en iPad (AnkiMobile). No lo investigué por el límite de tiempo.
- No encontré cómo se exporta de MarginNote a Anki en la versión actual.

## 4. Kami: escuelas, trabajo manuscrito sobre PDF, feedback del profesor, Google Classroom, entrega y precios

### Takeaway
Kami es la referencia más cercana a Kwanta en el aspecto técnico: **en iPad funciona en el navegador, sin app nativa**, con Apple Pencil y scroll con el dedo detectados automáticamente. El circuito con Google Classroom es: el profesor asigna con una copia por alumno, el alumno anota y entrega con "Turn In", y el profesor corrige en Kami y devuelve. El plan Teacher cuesta $149 y los planes de colegio se cotizan a medida.

### Cited Findings
- **Sin app nativa.**
  - No hay app iOS de Kami: en iPad se usa desde el navegador (kami.app).
  - El centro de ayuda recomienda **Chrome**; esa página no menciona Safari.
  - La instalación como PWA en pantalla de inicio solo se describe para tablets Android.
  - Fuente: [Kami for iPad FAQ](https://help.kamiapp.com/en/articles/3969028-kami-for-ipad-faq) (sin fecha; copyright 2026)
- **Apple Pencil.**
  - Soportado en iPad: en Chrome iOS, Kami detecta automáticamente la entrada y activa el touch scrolling.
  - El artículo no menciona presión ni rechazo de palma.
  - Fuente: [Kami Help: Stylus support](https://help.kamiapp.com/en/articles/3038936-stylus-support-for-kami)
- **Safari (anécdota).** Un docente que usaba Canvas, Kami y Safari en iPad informó que el profesor veía la tarea en blanco, aunque las anotaciones del alumno estaban intactas. La respuesta fue recomendar Chrome. Es una sola anécdota de un foro, no un hallazgo oficial. — [Kami Community](https://community.kamihq.com/t/kami-assignment-shows-for-teacher-blank-for-student/3918) (no pude abrir el hilo directamente; dato tomado del resumen de búsqueda)
- **Limitaciones en iPad.**
  - Los profesores no pueden crear asignaciones Kami desde el iPad (la extensión no se instala ahí); deben hacerlo en un ordenador y marcar "Add Links for Mobile Devices".
  - Los alumnos abren con "Open with Kami" y pulsan Turn In.
  - La app de Google Classroom no permite corregir, así que el profesor abre los archivos en Kami.
  - En iPad sí puede usar Class View para corregir.
  - Fuente: [Kami for iPad FAQ](https://help.kamiapp.com/en/articles/3969028-kami-for-ipad-faq)
- **Circuito con Classroom, según guías de distritos.**
  - El profesor adjunta el archivo desde Drive con "Make a copy for each student".
  - Las anotaciones de Kami aparecen en la ventana de calificación de Classroom; el profesor puede corregir con las herramientas de Kami y pulsar Return.
  - El profesor puede ver el progreso **antes** de la entrega.
  - Fuente: [resultados de guías escolares](https://www.mcdowell.k12.nc.us/departments/technology/kami); [Catlin Tucker](https://catlintucker.com/2017/04/annotate-pdfs-with-kami/) (2017, antiguo)
  - Una guía advierte que la entrega directa desde Kami requiere la licencia Teacher de pago. — [Kami Student Guide (JC Schools)](https://www.jcschools.us/cms/lib/MO01909951/Centricity/Domain/4022/Kami-%20Student%20Guide.pdf) (fecha desconocida)
- **Precios** ([Kami Pricing](https://www.kamiapp.com/pricing/), consultado en nov 2026):

  | Plan | Precio | Incluye |
  |---|---|---|
  | Basic | Gratis | 10+ herramientas, Drive/OneDrive, 1.000+ plantillas, colaboradores ilimitados |
  | Teacher | $149 (periodo no indicado; selector mensual/anual con "Save 40%") | 40+ herramientas; integraciones con Google Classroom, Schoology, Canvas y Teams; onboarding; soporte prioritario |
  | School/District | Cotización a medida | Despliegue en todo el dominio y account manager |
  | Pro / Work (no docentes) | Pro: $12/mes o $85/año. Work: $25/mes o $220/año | — |

  - Hay prueba gratuita de 30 días de la licencia Teacher.
  - No hay precio específico para estudiantes.
  - Otras fuentes citan el plan Teacher a $99/año, un dato antiguo que contradice la página actual. — [subscribed.fyi](https://subscribed.fyi/kami/pricing)

### Inferences
- **Viabilidad del modelo web.** Kami demuestra que el modelo "PDF + tinta en el navegador del iPad" funciona a escala escolar. Pero su ayuda recomienda Chrome y no Safari, y no documenta presión ni rechazo de palma. Kwanta, centrado en Safari, debería probar a fondo Pointer Events con presión, inclinación y `touch-action: none`, y el rechazo de palma ignorando `pointerType === "touch"` mientras el Pencil está activo.
- **Flujo de entrega.** El flujo "copia por alumno → anotar → Turn In → feedback (incluso voz o vídeo) → Return", más la vista en vivo del profesor (Class View), es el estándar que esperan los colegios. Para Kwanta, la autocorrección con markscheme podría ser el paso intermedio antes de que el profesor lo revise.
- **Precio de referencia.** Un plan docente ronda los $99–149 al año y los colegios negocian a medida.

### Gaps
- No pude abrir el foro community.kamihq.com (bloqueado por la red de la sesión), así que no tengo las quejas detalladas sobre el soporte de stylus ni el hilo "Poor Stylus Support". Habría que permitir ese dominio para revisarlo.
- No encontré cifras de precios por alumno para colegios ni distritos (son cotizaciones privadas).
- No hay documentación oficial sobre el uso de Kami en Safari en iPad.

## 5. Xodo y PDF Expert: Apple Pencil, calidad de la tinta, versiones web

### Takeaway
PDF Expert (Readdle) es un lector y editor nativo con buen soporte del Pencil y una suscripción cara que molesta a los usuarios. Xodo tiene app iPad con Pencil, versión web y escritorio bajo una misma suscripción, pero hay reseñas que mencionan trazos perdidos.

### Cited Findings
- **PDF Expert, precios.**
  - En la App Store de EE. UU.: Premium $49.99, Mac & iOS $79.99 y Basic $9.99.
  - En 2024 se veían precios más altos: Premium $65.99 y Mac & iOS $102.99 en Canadá.
  - Una suscripción Premium cubre iPhone, iPad y Mac.
  - Fuentes: [App Store PDF Expert](https://apps.apple.com/app/id743974925); [App Store CA](https://apps.apple.com/ca/app/id743974925?l=en-ca)
- **PDF Expert, críticas.**
  - Suscripción cara; los usuarios prefieren el pago único. — [App Store EG](https://apps.apple.com/eg/app/id743974925)
  - Pruebas gratuitas que se convierten en cobro. — [App Store AU](https://apps.apple.com/au/app/id743974925?l=en-au)
  - Lo comprado antes conserva sus funciones. — [App Store ZA](https://apps.apple.com/za/app/id743974925)
- **Xodo, precios y web.**
  - Gratis en iPad.
  - Xodo Pro anual: $107.99 en EE. UU. y $149.99 CAD en Canadá.
  - La suscripción se comparte entre móvil, escritorio y web, con "30+ tools".
  - Fuentes: [App Store Xodo US](https://apps.apple.com/us/app/pdf-reader-and-markup-by-xodo/id805075929); [App Store Xodo CA](https://apps.apple.com/ca/app/id805075929)
- **Xodo, calidad de la tinta.** Hay quejas de que hay que repetir el segundo trazo y de que se eliminó la opción "Apple ink". — [App Store Xodo US](https://apps.apple.com/us/app/pdf-reader-and-markup-by-xodo/id805075929)

### Inferences
- **Xodo como referente.** Su producto web, compartido con el de iPad, es el referente más cercano para un "editor PDF web con tinta". Sus quejas de trazos perdidos confirman que la latencia y la captura de trazos rápidos son los puntos frágiles.
- **Precio.** La resistencia a las suscripciones de PDF Expert y Xodo (más de $100 al año) sugiere precios bajos o institucionales para Kwanta.

### Gaps
- No encontré con fuentes si PDF Expert tiene versión web. Creo que no, pero no está verificado.
- No encontré reseñas técnicas recientes (2025–2026) sobre la latencia de la tinta en Xodo web en Safari en iPad.
- No encontré hilos de Reddit: los resultados de búsqueda no devolvieron Reddit.

## 6. Precios (2025–2026, USD) y críticas de usuarios: resumen

### Takeaway
Hay dos modelos: pago único (MarginNote Pro $12.99, el antiguo LiquidText Pro) y suscripciones de $50–190 al año (LiquidText LIVE, PDF Expert, Xodo, Allume). Las quejas recurrentes son la complejidad (MarginNote), el precio de la suscripción (PDF Expert, Xodo), fallos de tinta (Xodo) y ajustes que no se guardan (LiquidText).

### Cited Findings
- **LiquidText** (App Store US; LIVE e Unlimited son anuales según la web):

  | Plan | General | Estudiante |
  |---|---|---|
  | LIVE | $10.90/mes o $99.99/año | $5.49/mes o $54.90/año |
  | Unlimited | $189.99/año | $10.90/mes o $19.00/año (este último dato es extraño, quizá un error de la ficha) |

  - La web oficial no muestra precios ("Buy Now" para verlos). Ofrece una semana de prueba de LIVE y precio de estudiante dentro de la app. Basic es gratis y no incluye tinta.
  - Valoración en la App Store: 4.6/5 (6.4K valoraciones), Editors' Choice.
  - Fuentes: [App Store LiquidText](https://apps.apple.com/us/app/liquidtext/id922765270); [pricing-features](https://www.liquidtext.net/pricing-features)
  - Capterra (oct 2026) da cifras contradictorias: Pro a $49.99. Un dato más antiguo de Softwarefinder pone Pro 2023 en $89.99 de pago único. — [Capterra](https://www.capterra.com/p/264823/Liquid-Text/pricing); [Softwarefinder](https://softwarefinder.com/legal/liquidtext)
- **MarginNote 5** (App Store US):
  - Prueba de 14 días. Pro para siempre $12.99, Max para siempre $51.99, Max partiendo de Pro $40.00.
  - Suscripción Max: $12.99 o $16.99 al año (la ficha lista ambos precios) o $4.99 por 3 meses.
  - Versión 5.0.3 (nov 2026; la 5.0.2 es del 10 nov). Valoración 4.5/5 (746).
  - Fuente: [App Store MarginNote](https://apps.apple.com/us/app/marginnote-4-ai-notes-mindmap/id1531657269)
- **Allume (antes Muse):**
  - Gratis con compras. Membresía $9.99/mes o $99.99/año (la ficha lista "Unlimited" y "Pro" al mismo precio).
  - La versión 4.0, que la renombró a Allume, salió el 17 jun (probablemente de 2026, el año no se muestra) y añadió Tape Tool y Stroke Eraser.
  - Valoración 4.6/5 (340), Editors' Choice.
  - Fuente: [App Store Allume](https://apps.apple.com/us/app/muse-canvas-for-ideas/id1501563902)
  - Ojo: "Muse Pro" (StyleOf) es otra app, de dibujo con IA, a $8.99/semana. — [App Store Muse Pro](https://apps.apple.com/ch/app/muse-pro/id6475118587)
- **Kami:** Basic gratis, Teacher $149, colegio a medida. — [Kami Pricing](https://www.kamiapp.com/pricing/)
- **PDF Expert:** Premium $49.99, Mac & iOS $79.99. — [App Store](https://apps.apple.com/app/id743974925)
- **Xodo:** Pro $107.99/año (EE. UU.). — [App Store Xodo](https://apps.apple.com/us/app/pdf-reader-and-markup-by-xodo/id805075929)
- **LiquidText frente a MarginNote (comparativa).** LiquidText es más simple y mejor para anotar libremente. MarginNote es más estructurada, con flashcards y mapas, pero más difícil. Exportar notas desde MarginNote es un punto débil. — [Paperlike](https://paperlike.com/blogs/paperlikers-insights/liquidtext-vs-marginnote-3); [DEVONthink forum](https://discourse.devontechnologies.com/t/liquidtext-or-marginnotes3/25043) (fuentes antiguas, de la época de MarginNote 3)

### Inferences
- **Hueco en el mercado.** Ninguna de estas apps tiene contenido de una asignatura concreta (data booklet, markschemes de IB). Todas son herramientas genéricas. El valor de Kwanta está en el contenido ya integrado (fórmulas junto al ejercicio, markscheme, hojas generadas) más un flujo de escritura simple, en lugar de igualar la profundidad de MarginNote.
- **Peso de la curva de aprendizaje.** La crítica recurrente a MarginNote indica que hay que evitar los modos múltiples. En el mejor caso, Kwanta debería tener 2–3 modos claros (Resolver, Corregir, Repasar).

### Gaps
- Los precios de la App Store se tomaron de instantáneas sin año visible y algunas listas tienen duplicados contradictorios (MarginNote Max anual, LiquidText Unlimited estudiante). Conviene confirmarlos en el dispositivo.
- No encontré discusiones de Reddit con estas consultas, y no revisé descripciones de vídeos de YouTube.
