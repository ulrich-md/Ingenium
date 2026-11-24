# Videos y charlas útiles para construir Kwanta (escritura a mano con Apple Pencil en la web)

Método de verificación (24-nov-2026): las sesiones de Apple se comprobaron descargando cada página de developer.apple.com/videos (título, descripción y fragmentos de la transcripción); las duraciones vienen del índice "All Videos" de Apple. Los videos de YouTube se comprobaron con el endpoint oEmbed de YouTube (devuelve título y canal reales, así que el enlace lleva al video correcto) y con la página de resultados de búsqueda de YouTube (duración y antigüedad relativa, por ejemplo "hace 2 años"). Los años de YouTube marcados con "~" se calcularon a partir de esa antigüedad relativa y no son fechas exactas. Solo dos videos de YouTube devolvieron la fecha exacta de publicación. El idioma se dedujo del título original y del canal: si no se indica otra cosa, el video está en inglés. YouTube traduce algunos títulos automáticamente (por ejemplo, el video de Paperlike aparece con título en español en búsquedas en español), así que el título que muestre YouTube no indica el idioma del audio.

## 1. Sesiones WWDC de Apple (PencilKit, Apple Pencil, Scribble, Safari/pointer events)

### Takeaway
Todas las sesiones pedidas existen y se verificaron, salvo una sesión dedicada al hover del Apple Pencil, que no aparece en el índice. Para Kwanta, que es una app web, las sesiones más útiles son "Introducing Desktop-class Browsing on iPad" (WWDC19), que explica Pointer Events y `touch-action` en Safari para iPad, e "Introducing PencilKit" (WWDC19), que explica cómo el Pencil mide azimut, altitud y presión, y cómo reducir la latencia con toques predichos. Las sesiones de PencilKit sirven como referencia de UX y de modelo de datos (tool picker, trazos, squeeze), y la de WWDC26 como referencia del reconocimiento de escritura nativo de Apple.

### Cited Findings
- **Introducing PencilKit** (WWDC19, sesión 221, 34:51, inglés, Apple). Presenta el framework: un lienzo, tintas, una paleta de herramientas y un modelo de datos. La transcripción explica que el Pencil calcula el azimut y la altitud por trigonometría, que tiene un sensor de fuerza axial para la presión, que hay que usar los toques predichos (*predicted touches*) para bajar la latencia y que conviene evitar las capas Metal transparentes. Útil para entender qué datos da el Pencil y de dónde sale la latencia. — [Apple](https://developer.apple.com/videos/play/wwdc2019/221/)
- **Introducing Desktop-class Browsing on iPad** (WWDC19, sesión 203, inglés, Apple). Anuncia Pointer Events en Safari para iPadOS 13. Explica que en iOS `preventDefault` no bloquea todos los comportamientos del navegador y que hay que usar la propiedad CSS `touch-action` (por ejemplo `none`). Es la sesión de Apple más directamente aplicable a un lienzo web con Pencil en Safari. — [Apple](https://developer.apple.com/videos/play/wwdc2019/203/)
- **What's New for Web Developers** (WWDC19, sesión 518, 12:28, inglés). Resumen de las novedades de Safari 13 que remite a la sesión anterior para Pointer Events. — [Apple](https://developer.apple.com/videos/play/wwdc2019/518/)
- **What's new for web developers** (WWDC20, sesión 10663, 36:05, inglés). Anuncia mejor interoperabilidad en Pointer Events, WebAssembly y SVG, entre otras áreas. — [Apple](https://developer.apple.com/videos/play/wwdc2020/10663/)
- **What's new in PencilKit** (WWDC20, sesión 10107, 10:26, inglés). Introduce `PKCanvasViewDrawingPolicy` para separar el dibujo con Pencil del dibujo con el dedo. Es la misma decisión de UX que Kwanta debe tomar: Pencil para dibujar, dedos para hacer pan y zoom. — [Apple](https://developer.apple.com/videos/play/wwdc2020/10107/)
- **Inspect, modify, and construct PencilKit drawings** (WWDC20, sesión 10148, 16:04, inglés). Explica el modelo de datos de trazos y puntos (`PKStroke`, `PKStrokePoint`), que sirve de referencia para diseñar el formato vectorial de tinta de Kwanta. — [Apple](https://developer.apple.com/videos/play/wwdc2020/10148/)
- **Meet Scribble for iPad** (WWDC20, sesión 10106, 14:13, inglés). Explica Scribble (escribir texto a mano en campos de texto mediante reconocimiento de escritura) y qué hace buena una experiencia de escritura. Es relevante porque Scribble puede activarse sobre los inputs de una web en Safari. — [Apple](https://developer.apple.com/videos/play/wwdc2020/10106/)
- **Squeeze the most out of Apple Pencil** (WWDC24, sesión 10214, 14:58, inglés). Cubre el tool picker personalizable con herramientas propias, el gesto de apretar (*squeeze*) del Apple Pencil Pro para mostrar la paleta "justo donde estás haciendo hover", el giro del lápiz (*barrel roll*), la presión, la altitud y el azimut, y el reconocimiento de formas al pausar al final de un trazo. Es una buena referencia para diseñar la barra flotante de herramientas de Kwanta. — [Apple](https://developer.apple.com/videos/play/wwdc2024/10214/)
- **Meet PaperKit** (WWDC25, sesión 285, 12:11, inglés). PaperKit es el framework de marcado que Apple construyó sobre PencilKit para sus propias apps. — [Apple](https://developer.apple.com/videos/play/wwdc2025/285/)
- **Read between the strokes with PencilKit** (WWDC26, sesión 203, 15:10, inglés). Presenta nuevas APIs de PencilKit: reconocimiento de escritura (la misma tecnología de Notas y Freeform), conversión de trazos a curvas Bézier, identidad y selección de trazos, y corte de trazos (*stroke slicing*). Es una referencia del estado del arte en reconocimiento sobre la tinta. — [Apple](https://developer.apple.com/videos/play/wwdc2026/203/)
- **Unwrap PaperKit** (WWDC26, sesión 372, 7:39, inglés). Explica las "adornments": capas de UI ancladas a coordenadas del lienzo que siguen el zoom y el scroll y no se guardan con el contenido. El patrón sirve para los botones y anotaciones de corrección por IA que Kwanta quiere dibujar encima de la tinta. — [Apple](https://developer.apple.com/videos/play/wwdc2026/372/)
- Sesiones generales de WebKit (sin contenido específico de Pencil): **What's new in Safari and WebKit** (WWDC25, sesión 233, 47:07) — [Apple](https://developer.apple.com/videos/play/wwdc2025/233/). **What's new in WebKit for Safari 27** (WWDC26, sesión 204, 16:32) — [Apple](https://developer.apple.com/videos/play/wwdc2026/204/)

### Inferences
- Apple nunca ha dedicado una sesión a "Apple Pencil en la web". Lo más cercano es la sesión 203 de WWDC19 sobre Pointer Events y `touch-action`. El resto del conocimiento web hay que sacarlo de PencilKit (conceptos) y de charlas de terceros.
- Las APIs de squeeze y barrel roll son nativas de UIKit/PencilKit. Este material no permite afirmar que Safari las exponga a la web, así que Kwanta debería diseñar su barra flotante sin depender de ellas.

### Gaps
- No encontré en el índice de Apple ninguna sesión cuyo título trate del hover del Apple Pencil (WWDC22-23). Es posible que el hover se cubra dentro de sesiones como "What's new in UIKit", pero no lo verifiqué.
- No hay sesión de Apple sobre la latencia del Pencil en Safari ni sobre el Ink API o Delegated Ink en WebKit.

## 2. Steve Ruiz / tldraw (perfect-freehand, lienzo infinito, pizarras)

### Takeaway
Steve Ruiz tiene muchas charlas y podcasts verificados, pero ninguno trata en exclusiva de perfect-freehand. Los más útiles para la ingeniería del lienzo son la entrevista de devtools.fm (~2022) y la de Lightspeed (2024), que tratan sobre construir una pizarra colaborativa. Las charlas de 2024-2026 se centran sobre todo en IA y agentes sobre el lienzo, algo relevante para la futura corrección por IA de Kwanta.

### Cited Findings
- **Steve Ruiz - tldraw** (devtools.fm, 1:19:30, ~2022, inglés). Podcast en video con el creador de tldraw. — [YouTube](https://www.youtube.com/watch?v=_Irg0CcadzQ)
- **Steve Ruiz: The TLDR of the Collaborative Whiteboard tldraw** (Lightspeed Venture Partners, 1:06:03, publicado el 18-ene-2024, inglés). Según la descripción, trata de por qué construir una pizarra digital colaborativa "was anything but easy" y de iterar con la audiencia. — [YouTube](https://www.youtube.com/watch?v=QM-gJYPM_9A)
- **Steve Ruiz and tldraw (ep690)** (ShopTalk Show, 1:15:02, ~2025, inglés). — [YouTube](https://www.youtube.com/watch?v=c1az_z8VoYI)
- **Founder of tldraw Steve Ruiz on creativity, obsession and reaching developers** (Scaling DevTools Podcast, 47:37, ~2025, inglés). — [YouTube](https://www.youtube.com/watch?v=4rkWEUSj4pg)
- **tldraw and AI on the canvas by Steve Ruiz** (Wey Wey Web 2024, inglés; duración no obtenida). Trata del SDK de lienzo infinito de tldraw y de la IA. — [YouTube](https://www.youtube.com/watch?v=xda03Lin5cY)
- **tldraw.computer - Steve Ruiz, tldraw** (AI Engineer, 18:45, ~2025, inglés). — [YouTube](https://www.youtube.com/watch?v=1C2TdPkj6aQ). Complemento del canal oficial: **tldraw computer — how does it work?** (26:47, ~2025) — [YouTube](https://www.youtube.com/watch?v=Kn1De5uwrlY)
- **Agents on the Canvas in tldraw — Steve Ruiz** (AI Engineer, 19:54, ~2026, inglés) — [YouTube](https://www.youtube.com/watch?v=sPUjIBH5Cwg). **Steve Ruiz — Agents on the canvas** (Local-First Conf, 30:24, 2026, inglés) — [YouTube](https://www.youtube.com/watch?v=CpVs1U7pMA0)
- **tldraw's Steve Ruiz: The Infinite Canvas & the Death of Traditional Design** (South Park Commons, 48:09, ~2026, inglés). — [YouTube](https://www.youtube.com/watch?v=hNUEaFmPAwc)
- **introducing tldraw offline** (canal tldraw, 17:34, 2026, inglés) — [YouTube](https://www.youtube.com/watch?v=vCyENfxgyYA). **Bringing tldraw Offline with Steve Ruiz** (Lisbon AI, 27:27, noviembre de 2026, inglés) — [YouTube](https://www.youtube.com/watch?v=f7_PpKoDbQs). Son relevantes si Kwanta quiere que los alumnos puedan escribir sin conexión en clase.
- Podcast Latent Space "The Accidental AI Canvas": Ruiz cuenta que perfect-freehand fue el proyecto que lo dio a conocer y que lo usan Canva, draw.io y Excalidraw. — [Latent Space](https://latent.space/p/tldraw/)
- GitNation recoge una charla suya en React Day Berlin 2024 sobre flechas (perfect-arrows y tldraw), pero no encontré el enlace al video. — [GitNation](https://gitnation.com/person/steve_ruiz)
- Tutoriales de terceros sobre perfect-freehand:
  - **Hands-On Coding a Pressure Sensitive Freehand Drawing App in React** (Nono Martínez Alonso, 15:27, ~2022, inglés). Explica cómo programar una app de dibujo sensible a la presión, que es el caso exacto de Kwanta. — [YouTube](https://www.youtube.com/watch?v=WbPhV1dyva4)
  - **#42 Nono.MA Live! Anatomy of a React Application (using Perfect-Freehand as Example)** (directo de 2:06:51, ~2021, inglés). — [YouTube](https://www.youtube.com/watch?v=8Wz5Zmf2_pk)
  - **Add Perfect Freehand To HTML Canvas | Drawing App Tutorial Pt 5** (Redhwan Nacef, 34:20, ~2021, inglés). Forma parte de una serie sobre una app de dibujo en canvas. — [YouTube](https://www.youtube.com/watch?v=Fx3yt3zKdyk)

### Inferences
- Sobre perfect-freehand en sí, el mejor material sigue siendo el README y el código del repositorio, más el tutorial de Nono Martínez. Las charlas de Ruiz aportan sobre todo contexto de producto y arquitectura del lienzo.
- Las charlas de "agents on the canvas" muestran cómo un LLM puede leer y escribir sobre un lienzo. Sirven de inspiración para mostrar la corrección por IA de Kwanta directamente sobre la hoja.

### Gaps
- No encontré ninguna charla de conferencia grabada que trate específicamente del algoritmo de perfect-freehand (cómo convierte la presión en el contorno del trazo).
- No pude obtener la duración de la charla de Wey Wey Web ni el video de React Day Berlin 2024.

## 3. Charlas de ingeniería: motores de tinta, baja latencia, lienzos (GoodNotes, Microsoft, Google, Excalidraw, Figma)

### Takeaway
La charla más relevante es la de Google I/O 2024 sobre cómo Goodnotes llevó su app de iPad a la web con Swift y WebAssembly. Le siguen las dos charlas de Excalidraw de Christopher "Vjeux" Chedeau, sobre los trucos de JavaScript y canvas de una pizarra web. Sobre latencia de tinta en la web solo encontré la charla genérica del W3C y un video menor sobre el Ink API. No hay ninguna grabación verificada de Microsoft sobre Delegated Ink Trail.

### Cited Findings
- **Write once, run anywhere finally realized with WebAssembly** (Google I/O 2024, canal Chrome for Developers, 14:13, inglés). Ponentes según la página de I/O: Thomas Nattestad y Thomas Steiner (Google). La sesión cuenta "how Goodnotes ported their award-winning iPad app to the web thanks to WebAssembly, and SwiftWasm specifically". — [YouTube](https://www.youtube.com/watch?v=c8hZFtl8EuQ); [Google I/O](https://io.google/2024/explore/3c810cbb-3f43-4a03-aa6d-d5ef36419687)
  - Lectura complementaria (no es video): el estudio de caso de web.dev "Goodnotes everywhere", también en español (es-419) — [web.dev](https://web.dev/case-studies/goodnotes?hl=es-419). El artículo del blog de swift.org de Yuta Saito (Goodnotes) — [swift.org](https://swift.org/blog/bringing-goodnotes-to-web-with-swift/)
- **Getting Started: Note-Taking on Goodnotes on Android, Windows, and Web** (Goodnotes Official, 2:44, ~2023, inglés). Muestra cómo es en la práctica Goodnotes para web, es decir, el resultado de ese port. — [YouTube](https://www.youtube.com/watch?v=Tb8k8xGHfS8)
- **Adventures in WebAssembly - Swift edition** (Swift Heroes 2024, 36:56, inglés). Trata de Swift en WebAssembly en general, sin centrarse en Goodnotes. — [YouTube](https://www.youtube.com/watch?v=qusyk7CEz8M)
- **Excalidraw: Cool JS Tricks Behind the Scenes** (Christopher "Vjeux" Chedeau, ReactEurope 2020, 48:26, inglés). El creador de Excalidraw explica cómo funciona por dentro una pizarra web en canvas. — [YouTube](https://www.youtube.com/watch?v=fix2-SynPGE)
- **Christopher "Vjeux" Chedeau: Excalidraw: Under the hood of the virtual whiteboard** (canal Vercel, Next.js Conf, 20:04, ~2022, inglés). Muy cercano al stack de Kwanta (Next.js). — [YouTube](https://www.youtube.com/watch?v=gvEoTVjVjB8)
- **Reducing input latency on the Web** (canal W3C, 19:04, ~2020, inglés). Trata de la latencia de entrada en la web. No pude confirmar el ponente. — [YouTube](https://www.youtube.com/watch?v=05kxe4xNlZo)
- **ink api** (Hess WebTech, 8:52, publicado el 15-sep-2026, inglés). La descripción dice solo "Brief overview of Ink API". Es un video menor de un canal pequeño. — [YouTube](https://www.youtube.com/watch?v=HETyN7p7K7k)
- Delegated Ink Trail: hay transcripción de la sesión de W3C TPAC 2020 de Mario Bianucci (Microsoft) — [W3C](https://www.w3.org/2020/10/TPAC/delegated_ink_trails.html). MDN documenta el Ink API, que permite al navegador usar el compositor del sistema operativo para dibujar los trazos con menos latencia — [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Ink_API). Microsoft informó una mejora de latencia de hasta el 240% en Edge, según sus propias mediciones — [Windows Central](https://www.windowscentral.com/microsoft-improved-inking-way-240)
- Fundamentos de curvas, útiles para suavizar los trazos:
  - **The Beauty of Bézier Curves** (Freya Holmér, 24:26, ~2021, inglés). — [YouTube](https://www.youtube.com/watch?v=aVwxzDHniEw)
  - **The Continuity of Splines** (Freya Holmér, 1:13:50, publicado el 7-dic-2022, inglés). — [YouTube](https://www.youtube.com/watch?v=jvPPXbo87ds)

### Inferences
- Delegated Ink es una API de Chromium y Edge. Este material no indica que Safari en iPad la soporte, así que para Kwanta su interés es conceptual. En iPad, la latencia depende de renderizar eficientemente con Pointer Events, de usar eventos coalescidos y predichos donde estén disponibles, y del navegador.
- Goodnotes es el único precedente documentado en video de una app de notas a mano "seria" llevada a la web.

### Gaps
- No encontré ninguna grabación en video de Microsoft (Chrome Dev Summit o BlinkOn) sobre Delegated Ink Trail. Solo hay transcripción y documentación.
- No encontré videos sobre la librería Google Ink ni sobre Ink Stroke Modeler: la búsqueda en YouTube no dio resultados relevantes.
- No encontré la charla de Evan Wallace ni ninguna charla de Figma sobre renderizado en WebGL. Tampoco busqué de forma exhaustiva charlas de Figma Config.

## 4. Demos y reseñas de producto: Notability vs Goodnotes 6 vs Apple Notes (2024-2026), orientadas a estudiantes

### Takeaway
Hay muchas comparativas recientes verificadas. Las más completas son la de Graf-X Tech (2026, compara las tres apps), la de Paperlike (2026) y la de Paperless Lab (2025). Para ver funciones concretas que Kwanta podría imitar (zoom window o lupa, audio sincronizado, Math Notes) hay tutoriales específicos. En español hay comparativas de estudiantes, pero son más antiguas (2022-2024).

### Cited Findings
- **Is Apple Notes Good Enough Now? Goodnotes vs Notability vs Apple Notes (2026)** (Graf-X Tech, 20:01, 2026, inglés). Es la única comparativa a tres bandas que encontré. — [YouTube](https://www.youtube.com/watch?v=_UmW7WUSsdU)
- **Goodnotes vs Notability - Which one is better in 2026?** (Paperlike, 14:56, 2026, inglés; YouTube también muestra el título traducido al español). — [YouTube](https://www.youtube.com/watch?v=hFErPbt0q2E)
- **GoodNotes vs Notability (2025) | Which Note-Taking App is Better?** (Paperless Lab, 20:46, ~2025, inglés). — [YouTube](https://www.youtube.com/watch?v=ZFPrMdViHV0)
- **Best Notetaking apps for iPad in 2026** (Paperlike, 18:06, 2026, inglés). — [YouTube](https://www.youtube.com/watch?v=piZsti1UY80)
- **I tested every iPad note-taking app so you don't have to** (KDigitalStudio, 23:22, ~2025, inglés). — [YouTube](https://www.youtube.com/watch?v=3O9GrpPOZRE)
- Apple Notes y Math Notes, relevante para física y matemáticas:
  - **Is Apple Notes Finally the BEST Note-Taking App for iPad?** (Future Simplified, 7:45, ~2025). — [YouTube](https://www.youtube.com/watch?v=n1mRBUVbxq0)
  - **New Tools in Notes on the iPad with iPadOS 18 – Are They Useful?** (Dan's Tutorials, 14:42, ~2025). — [YouTube](https://www.youtube.com/watch?v=YtxFfiZqdyI)
  - **Apple Notes Just Got So Much Better!** (9to5Mac, 13:48, ~2024). — [YouTube](https://www.youtube.com/watch?v=zInF_HcaAjE)
  - **The NEW iPad Calculator App is AMAZING in iOS 18!** (Brandon Butch, 16:45, ~2024). Muestra Math Notes, que resuelve ecuaciones escritas a mano. — [YouTube](https://www.youtube.com/watch?v=d2TqMstGKCk)
- Funciones concretas:
  - **The Ultimate GoodNotes 2026 Tutorial** (Paperless Lab, 34:36, 2026). Recorrido completo por toolbar, herramientas y organización. — [YouTube](https://www.youtube.com/watch?v=-2sb0a5g_no)
  - **Goodnotes magnifying tool!** (Goodnotes Official, 0:40, ~2025). La lupa o zoom window, a tener en cuenta para la escritura precisa de fórmulas en Kwanta. — [YouTube](https://www.youtube.com/watch?v=yTwKUNHzLgg)
  - **iPad Note-Taking with Notability 🔥 Complete Guide** (Paperless Lab, 16:28, ~2025). — [YouTube](https://www.youtube.com/watch?v=7iTtWkYrpJQ)
  - **How I take notes as a medical student 🩺 | Notability tips** (Doddie, 14:14, 2026). Muestra el uso real de una estudiante. — [YouTube](https://www.youtube.com/watch?v=9JDNYV7znEM)
- En español:
  - **GOODNOTES VS NOTABILITY - ¿Cuál Es La Mejor Aplicación Para Hacer Tus Apuntes Y Estudiar En El iPad?** (Caamyleti, 10:43, ~2022, español). — [YouTube](https://www.youtube.com/watch?v=D5LPmb6Pyfo)
  - **MEJORES APPS para hacer APUNTES y NOTAS en IPAD ✏️ Con APPLE PENCIL** (Cristo Vega, 10:22, ~2024, español). — [YouTube](https://www.youtube.com/watch?v=_AhXwXX0UDQ)
  - **iPad para estudiantes 👩‍🎓: aplicaciones, accesorios y funciones imprescindibles** (Maria Soriano, 8:04, ~2024, español). — [YouTube](https://www.youtube.com/watch?v=ckofD9G2W8E)
- Fuentes escritas: las comparativas de 2025-2026 coinciden en que Notability destaca por la grabación de audio sincronizada con las notas y Goodnotes por organizar muchas asignaturas — [Setapp](https://setapp.com/app-reviews/goodnotes-vs-notability); [Goodnotes blog, fuente del propio fabricante](https://www.goodnotes.com/blog/goodnotes-vs-notability)

### Inferences
- Para el equipo de producto, verlas en este orden es lo más eficiente: Graf-X Tech (comparativa a tres), Paperless Lab (tutorial de Goodnotes 2026), Brandon Butch (Math Notes) y Doddie (uso real de una estudiante).

### Gaps
- No encontré reseñas centradas en estudiantes del IB ni de física concretamente.
- Las comparativas en español son de 2022-2024. No encontré ninguna en español de 2025-2026 que compare las tres apps.
- No vi el contenido de los videos: las descripciones de qué cubre cada uno se basan en el título y el canal.

## 5. Tutoriales: reconocimiento de escritura y matemáticas (MyScript, Mathpix, LLMs) y apps de dibujo en el navegador

### Takeaway
MyScript y Mathpix solo tienen demos cortas de producto en YouTube, no tutoriales de integración web. No encontré ningún tutorial técnico serio en video sobre corregir matemáticas manuscritas con LLMs de visión: lo que aparece son demos comerciales, y la evidencia útil está en artículos académicos. Para apps de dibujo en canvas hay tutoriales verificados, incluidos dos en español.

### Cited Findings
- **MyScript iink 3.1 - Math in a note** (MyScript, 0:52, ~2024) — [YouTube](https://www.youtube.com/watch?v=3sAMddD2-O4). **MyScript iink 3.1 - Pencil Stroker** (MyScript, 0:38, ~2024) — [YouTube](https://www.youtube.com/watch?v=CvllHdtxLCI). Son demos oficiales del SDK iink: matemáticas dentro de una nota y renderizado del trazo.
- **Feature Highlights: Mathpix Snip on Mobile & Tablet** (Mathpix, 2:50, ~2022, inglés). Muestra la conversión de matemáticas manuscritas a LaTeX. — [YouTube](https://www.youtube.com/watch?v=th41CCFamYg)
- **How to Integrate MLKIT Digital Ink Recognition in Native iOS app** (Coding and Movies With Nobody, 10:03, ~2024, inglés). ML Kit Digital Ink es la alternativa de Google para reconocer trazos. — [YouTube](https://www.youtube.com/watch?v=143NpqqjD9Q)
- **AI Agent Mode for Grading Handwritten Answer Sheets — Full Product Walkthrough** (Reveronix Labs, 9:12, 2026, inglés). Es una demo comercial de un fabricante, útil solo como referencia de UX de corrección. — [YouTube](https://www.youtube.com/watch?v=1M1Doy35A1s)
- Evidencia escrita (no video) sobre corrección con LLM. GPT-4o corrigió exámenes manuscritos de probabilidad con menos precisión que los correctores humanos. Mejoró cuando se le dieron la respuesta correcta y la rúbrica, y fue peor en preguntas que pedían justificar. — [arXiv 2411.05231](https://arxiv.org/html/2411.05231v1). Un artículo de 2025 encontró que GPT-4o con entrada de visión dio la mayor precisión y calidad de feedback entre los modelos probados — [arXiv 2506.04822](https://arxiv.org/html/2506.04822v2)
- Pointer Events y Apple Pencil en Safari: **Pointer Events stylus (tiltX/tiltY/pressure) support on iPadOS 13.5.1 with Apple Pencil** (Patrick H. Lauke, 1:09, publicado el 8-jun-2020, inglés). Demuestra que Safari en iPad expone la presión y la inclinación del Pencil mediante Pointer Events, usando su demo "pen tracker" (https://patrickhlauke.github.io/touch/pen-tracker/). — [YouTube](https://www.youtube.com/watch?v=cMKVM7rpoBo)
- Apps de dibujo en canvas:
  - **App de dibujo en JavaScript con CANVAS 🎨 | Dibujar ● Deshacer ● Borrar ● Colores** (BananaCoding, 28:08, ~2021, español; oEmbed devuelve un título traducido al inglés). — [YouTube](https://www.youtube.com/watch?v=wCwKkT1P7vY)
  - **Crear una app de dibujo con TensorFlow.js + Canvas + WebComponents** (Carlos F. Gorosito, 36:56, ~2023, español). Combina canvas con reconocimiento por ML en el navegador. — [YouTube](https://www.youtube.com/watch?v=VDqKrE1BrC0)
  - La serie de Redhwan Nacef sobre perfect-freehand en canvas (sección 2) y el tutorial de Nono Martínez (sección 2) completan este bloque.

### Inferences
- Para la corrección por IA, Kwanta debería apoyarse en artículos y benchmarks más que en videos. Los artículos indican que conviene dar al modelo la rúbrica y la solución de referencia.
- El video de Patrick Lauke es una prueba rápida y verificable de que el planteamiento técnico de Kwanta (Pointer Events con presión e inclinación en Safari de iPad) funciona desde iPadOS 13.5.

### Gaps
- No encontré tutoriales en video sobre la integración web de MyScript iink (iink-ts o iinkJS) ni sobre la API de Mathpix.
- No encontré tutoriales técnicos de calidad (de desarrolladores, no comerciales) sobre usar GPT, Gemini o Claude con visión para corregir matemáticas manuscritas.
- No encontré tutoriales en video que cubran específicamente `getCoalescedEvents`, `getPredictedEvents` o el pinch zoom con Pointer Events.
