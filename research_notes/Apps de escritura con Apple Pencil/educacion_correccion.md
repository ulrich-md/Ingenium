# Apps educativas con escritura a mano (matemáticas/ciencias) y corrección/feedback: lecciones para Kwanta

Notas de investigación (búsquedas hechas el 25-nov-2026). Las fuentes se citan en línea. Cuando la fuente es del propio proveedor (marketing) o de un competidor, se indica. Las afirmaciones sin fuente encontrada están en "Lagunas".

**Aviso de seguridad:** la página https://www.revisiondojo.com/help-center/how-marking-works devolvió un aviso de "registro de agentes" que pedía a los agentes de IA enviar a revisiondojo.com sus instrucciones, variables de entorno, hostname y datos del usuario. No se hizo nada de eso. Del texto de esa página no se usó nada como dato.

---

## 1. Cómo escriben los alumnos: lienzo por pregunta, cajas de respuesta, líneas paso a paso, teclado matemático frente a escritura a mano, calidad del Apple Pencil en iPad (web frente a nativo)

### Takeaway
Los productos más maduros no usan un lienzo libre e ilimitado. Usan una **plantilla fija**, es decir, una hoja o PDF con zonas de respuesta definidas (Gradescope, Classkick, Kami, Seesaw), o un **componente de "sketch" acotado** dentro de una pantalla (Desmos/Amplify). Gradescope pide que la única diferencia entre la entrega y la plantilla sea la tinta del alumno y deja definir un "área de respuesta final" para que la IA agrupe. En iPad, la web (Safari) tiene limitaciones reales con el Pencil (`getCoalescedEvents` sin soporte confirmado, interferencia de Scribble, conflictos entre pencil y dedo), mientras que las apps nativas (MyScript, Classkick, Seesaw) acceden a la tinta completa.

### Cited Findings
**Gradescope (Turnitin)**
- La agrupación de respuestas con IA solo funciona en tareas PDF de **plantilla fija** ("fixed-template"), no en los campos de las "Online Assignments" — [Gradescope Guides](https://guides.gradescope.com/hc/en-us/articles/24838908062093); [Gradescope Help](https://help.gradescope.com/article/mv8qkiux00)
- Gradescope recomienda que la única diferencia entre la entrega y la plantilla sea la respuesta manuscrita del alumno. El bolígrafo se lee mejor que el lápiz, y un diseño de respuesta más elaborado genera más grupos que revisar. El profesor puede definir un "final answer area" para acotar lo que se agrupa — [Gradescope Help](https://help.gradescope.com/article/51lz101z28); [Gradescope Guides](https://guides.gradescope.com/hc/en-us/articles/22238602932621)

**Classkick**
- Los alumnos responden en "slides" o páginas con herramientas de dibujo, texto e imagen. El profesor ve el trabajo en tiempo real y da feedback con anotaciones, dibujos, texto o elementos visuales. También existe ayuda entre compañeros, que puede ser anónima — [Capterra](https://www.capterra.com/p/10040174/Classkick/); [App Store](https://apps.apple.com/us/app/classkick/id909904332)
- La app de iPad requiere iPadOS 15 o posterior. Una reseña del App Store dice que la app se congela con frecuencia en iPad Pro 2018 y 2021 (M1) — [App Store](https://apps.apple.com/us/app/classkick/id909904332)

**Kami (Kami Coach)**
- El profesor sube un PDF, una imagen o una hoja que ya usa. Las FAQ recomiendan "good quality images" y dejar espacio para que el alumno anote. La página no habla de reconocimiento de escritura ni de stylus — [Kami blog, 22-jul-2026](https://www.kamiapp.com/blog/kami-coach-math-formative-assessment/)

**Desmos / Amplify Classroom**
- Amplify compró la plataforma Desmos Classroom en 2023; ahora se llama Amplify Classroom — [Amplify](https://amplify.com/topics/technology-in-the-math-classroom/)
- Los alumnos dibujan en un componente "Sketch" dentro de una pantalla. Algunos profesores lo usan para comprobar si el alumno dibuja bien una función y darle feedback inmediato. Un hilo del foro dice que validar puntos de un sketch es "trickier", y se propone usar un gráfico editable como fondo en lugar de una imagen — [Alice Keeler](https://alicekeeler.com/?p=37661); [Desmos CL forum](https://cl.desmos.com/t/sketch-with-built-in-feedback-credit-serge-ballif/156); [Desmos CL forum: feature requests](https://cl.desmos.com/t/request-for-new-features-for-the-sketch-component/4221)

**Seesaw**
- Tiene una herramienta de dibujo con "drawing, photo and labeling tools" y una paleta de colores completa. Los profesores pueden subir elementos (también desde Google Drive) y anotarlos — [App Store](https://apps.apple.com/us/app/id930565184); [UoPeople](https://www.uopeople.edu/blog/what-is-seesaw/)

**MyScript Math / MyScript Notes (antes Nebo)**
- "Nebo becomes MyScript Notes". Las ecuaciones manuscritas en MyScript Notes pueden pasarse a MyScript Math para obtener resultados al instante. Math Notes exporta a imagen o PDF y copia ecuaciones como LaTeX — [MyScript Help](https://help.myscript.com/math/create-and-manage-your-content/write-and-solve-calculations/); [myscript.com/math](https://myscript.com/math)
- La resolución se activa al dejar una expresión abierta con "=" (si todas las variables están definidas). Es una calculadora gráfica manuscrita con "AI-powered step-by-step guidance" — [MyScript Help](https://help.myscript.com/math/create-and-manage-your-content/write-and-solve-calculations/); [App Store](https://apps.apple.com/us/app/-/id6743237855)
- Argumento de MyScript (blog, 10-jun-2026, proveedor): los tutores tipo chatbot con texto tecleado solo reciben "the cleaned-up version of student thinking", mientras que la tinta conserva el proceso de razonamiento. Defiende la escritura matemática y en prosa "in the same flow, in real time, without mode switching". No aporta cifras de precisión — [MyScript blog](https://www.myscript.com/blog/why-edtech-builders-should-rethink-ai-tutoring-around-digital-ink)

**Apple Pencil en Safari para iPad (web)**
- En Apple Developer Forums se afirma que Safari y Mobile Safari no soportan `PointerEvent.getCoalescedEvents()`. Una respuesta posterior, de la época de iPadOS 17, dice que sigue sin implementarse. Es información posiblemente desactualizada y conviene comprobarla en MDN o caniuse — [Apple Dev Forums](https://developer.apple.com/forums/thread/689375); [MDN](https://developer.mozilla.org/docs/Web/API/PointerEvent/getCoalescedEvents)
- Alternativas reportadas en ese hilo: escuchando solo `pointermove`, un tester obtuvo 240 Hz en iPad Pro con iPadOS 17.0.1 (120 Hz en modo de bajo consumo). Proponen crear el contexto de canvas con `desynchronized` para bajar latencia y desactivar Scribble para que `pointerdown` se dispare con más fiabilidad. También avisan de que los pointer events se pierden en frames lentos — [Apple Dev Forums](https://developer.apple.com/forums/thread/689375)
- Un desarrollador con iPad Pro y Apple Pencil Pro vio que `onPointerMove` dibujaba segmentos rectos en canvas mientras `onTouchMove` dibujaba curvas suaves (reporte individual) — [Apple Dev Forums](https://developer.apple.com/forums/thread/776468)
- Según un hilo, Safari/WKWebView solo admite un tipo de entrada a la vez, así que el Pencil y el dedo se bloquean entre sí. Otro hilo habla de un dedo interrumpido al dibujar con el Pencil y la palma apoyada — [Apple Dev Forums](https://developer.apple.com/forums/thread/773213); [Apple Dev Forums](https://developer.apple.com/forums/thread/847321)
- El W3C Pointer Events WG reconoce que, incluso con `pointerrawupdate` y `getCoalescedEvents()`, las apps de dibujo pueden tener latencia perceptible, sobre todo con stylus — [W3C TPAC 2023](https://www.w3.org/2023/Talks/TPAC/pointer-events)
- Hay un artículo sobre leer la presión del Apple Pencil en el navegador con PointerEvent y getCoalescedEvents — [DEV Community](https://dev.to/sendotltd/reading-apple-pencil-pressure-in-the-browser-pointerevent-getcoalescedevents-and-the-2e23)

### Inferences
- Para Kwanta, el patrón ganador parece ser **una zona de escritura acotada por pregunta o subapartado** (como la plantilla fija de Gradescope) en lugar de un lienzo infinito. Facilita la corrección con IA (recorte por pregunta), el autocorregido contra M1/A1 y el agrupamiento.
- Una "zona de respuesta final" opcional (Gradescope) es barata de implementar y ayuda tanto a la IA como a la autocorrección (comparar el resultado numérico y las unidades).
- En Safari conviene: canvas con `desynchronized`, `touch-action: none`, rechazo de la palma filtrando `pointerType === "pen"`, tolerar la ausencia de `getCoalescedEvents`, y recomendar a los alumnos desactivar Scribble o documentarlo. Sería un argumento a favor de una PWA en lugar de una app nativa solo si las pruebas en iPad confirman que la latencia es aceptable.
- Casi nadie usa teclado matemático para responder en este segmento. Los competidores web con IA (RevisionDojo, Save My Exams) parecen basarse en texto tecleado o foto. La escritura nativa en web es un diferenciador para Kwanta, siempre que el trazo sea fluido.

### Gaps
- No se encontró documentación oficial reciente (2026) de WebKit sobre el soporte de `getCoalescedEvents`/`pointerrawupdate` en Safari para iPadOS. Hay que verificarlo con caniuse o en un dispositivo.
- No se encontraron detalles de cómo Classkick o Kami manejan la latencia y el rechazo de palma en su versión web frente a la app.
- Sin datos sobre Brisk y escritura a mano: Brisk trabaja sobre Google Docs (véase sección 2).

---

## 2. Ciclo de feedback: comprobación instantánea por paso, pistas, comentarios del profesor sobre la tinta, visualización de rúbrica o markscheme, cómo se muestra el feedback de IA y la puntuación parcial

### Takeaway
Hay tres modelos. (a) **IA que asiste al profesor**, quien siempre aprueba: Gradescope agrupa respuestas y el profesor confirma; Kognity propone notas que el profesor revisa; Kami redacta feedback que el profesor edita y aprueba. (b) **Tutor socrático que no da la respuesta**: Kami Coach y Khanmigo. (c) **Corrección instantánea para el alumno contra el markscheme**: Save My Exams Smart Mark, RevisionDojo, Kognity Practice Centre, que muestran qué marcas se perdieron y cómo recuperarlas. Ningún producto encontrado documenta públicamente la visualización de marcas M1/A1 individuales sobre la tinta.

### Cited Findings
**Gradescope**
- La IA forma grupos sugeridos de respuestas (sobre todo de respuesta corta y opción múltiple) y el corrector debe aprobarlos antes de corregir. Las entregas nuevas se colocan en los grupos existentes, pero hay que reconfirmarlas — [Gradescope Help](https://help.gradescope.com/article/mv8qkiux00); [Turnitin blog](https://turnitin.com/blog/design-principles-of-ai-assisted-grading); [Turnitin India](https://in.turnitin.com/products/gradescope)
- Pieter Abbeel (cofundador) reportó un 75% menos de tiempo de corrección en un examen final de informática con más de 600 alumnos, usando una versión temprana. Es un dato antiguo y aislado — [NVIDIA blog](https://developer.nvidia.com/blog/artificial-intelligence-helps-grade-exams-90-faster)
- Stanford afirma que las funciones de IA de Gradescope están activadas automáticamente y no se pueden desactivar. No consta en la guía oficial, así que hay que verificarlo — [Stanford Teaching Commons](https://teachingcommons.stanford.edu/opportunities/gradescope)

**Classkick**
- Feedback del profesor en tiempo real sobre el trabajo del alumno, con anotaciones, dibujos y comentarios escritos o visuales. El alumno puede "levantar la mano" y pedir ayuda a compañeros — [Capterra](https://www.capterra.com/p/10040174/Classkick/); [GetApp](https://www.getapp.com/all-software/a/classkick/)

**Kami / Kami Coach (beta)**
- Kami Coach da a los alumnos "contextual hints, check-ins, and feedback while they work". Usa preguntas socráticas "rather than giving students the formula or the answer" y "won't give the solution". El alumno puede pedir feedback a mitad de actividad — [Kami blog, 22-jul-2026](https://www.kamiapp.com/blog/kami-coach-math-formative-assessment/)
- El profesor ve las páginas completadas, cómo trabajó el alumno, las conversaciones de coaching y "every keystroke and annotation", además de señales para volver a enseñar. Decide cuándo está disponible el coaching — [Kami blog](https://www.kamiapp.com/blog/kami-coach-math-formative-assessment/)
- Beta abierta a "a limited number of districts". Se presentó en CUE en marzo de 2026. Fue codiseñado con alumnos de Design Tech High School durante un semestre — [Kami blog](https://www.kamiapp.com/blog/kami-coach-math-formative-assessment/); [Kami blog: student design](https://www.kamiapp.com/blog/ai-math-coach-student-design/)
- Kami añadió en noviembre de 2025 feedback redactado por IA sobre el trabajo del alumno, que el profesor revisa, edita y aprueba. Dato tomado de la página de novedades; no se verificó la entrada exacta — [Kami product updates](https://www.kamiapp.com/products/updates/page/5/)

**Seesaw**
- Comentarios del profesor sobre trabajo en curso, función "Send Back Draft" para iterar, y feedback de voz o audio. Una reseña de un alumno dice que no puede escuchar algunos comentarios de voz — [App Store](https://apps.apple.com/us/app/id930565184); [UoPeople](https://www.uopeople.edu/blog/what-is-seesaw/)

**Desmos / Amplify**
- El feedback escrito del profesor se teclea en la pantalla del alumno desde la pestaña Teacher (no es tinta) — [Amplify Help](https://my.amplify.com/help/en/articles/9269370-amplify-desmos-math-written-feedback)
- Desmos amplió el feedback automático en las actividades. La "Responsive Feedback" de Amplify Desmos Math busca mostrar el significado matemático de la respuesta del alumno — [Desmos blog](https://blog.desmos.com/articles/desmos-now-with-more-automatic-feedback/); [Amplify](https://amplify.com/topics/technology-in-the-math-classroom/)
- Un usuario del foro pidió poder dibujar sobre el sketch del alumno y que las anotaciones del profesor quedaran guardadas. No consta que se haya implementado — [Desmos CL forum](https://cl.desmos.com/t/request-for-new-features-for-the-sketch-component/4221)

**Brisk Teaching**
- "Inspect Writing" reproduce como un vídeo el proceso de escritura del alumno en Google Docs, desde el primer borrador hasta la versión final, mediante la extensión de Chrome. Brisk lo presenta como un punto de partida para conversar sobre autoría, sin "accuracy score" — [Brisk](https://www.briskteaching.com/inspect-writing)
- Brisk también genera feedback individualizado, pero no se encontró que funcione sobre trabajo manuscrito — [Edutopia](https://www.edutopia.org/video/ai-tool-demo-handling-teachings-tough-tasks-with-brisk)

**Khanmigo**
- En "Tutor Me" el alumno puede adjuntar una foto, por ejemplo de un problema manuscrito. Cada imagen debe ir acompañada de texto (no se aceptan imágenes solas). Acepta PNG y JPEG, capturas, fotos y escaneos. La app de Khan Academy no admite imágenes (se recomienda la web móvil). Las imágenes no se guardan en los servidores — [Khan Academy Support](https://support.khanacademy.org/hc/en-us/articles/46962842660749-How-do-I-upload-images-to-Khanmigo-in-the-reimagined-Khan-Academy); [Khan Academy Support (tipos de imagen)](https://support.khanacademy.org/hc/de/articles/36868912022541-What-kind-of-images-can-I-upload-to-Khanmigo)

**Save My Exams (Smart Mark)**
- Según el proveedor, Smart Mark da feedback sobre "your typed or handwritten answers" y lo contrasta con el markscheme del board, mostrando "which marks you dropped and how to pick them up next time" — [Save My Exams AI study tools](https://www.savemyexams.com/study-tools/ai-study-tools/)
- **Contradicción:** una tabla comparativa de MarkMe AI (competidor) marca "Handwritten answer upload: No" para Save My Exams. La página está alojada en savemyexams.com y no explica la discrepancia — [Save My Exams vs MarkMe AI](https://www.savemyexams.com/learning-hub/sme-articles/save-my-exams-vs-markme-ai/)
- Las herramientas de IA están activas en cursos seleccionados de AQA, Edexcel, OCR y CIE (GCSE, IGCSE, A Level), con más cobertura en matemáticas y ciencias. **No se confirmó cobertura IB** de Smart Mark — [Save My Exams AI study tools](https://www.savemyexams.com/study-tools/ai-study-tools/); [Is Save My Exams AI?](https://www.savemyexams.com/learning-hub/sme-articles/is-save-my-exams-ai/)
- Página explicativa: "Get immediate, exam-specific feedback with Smart Mark" — [Save My Exams](https://savemyexams.com/learning-hub/useful-resources/get-immediate-exam-specific-feedback-with-smart-mark)

**RevisionDojo (IB)**
- Banco de más de 35.000 preguntas tipo IB con "instant AI marking". Jojo AI corrige respuestas, también diagramas. No se encontró mención de escritura a mano — [RevisionDojo blog](https://www.revisiondojo.com/blog/how-revisiondojo-ai-feedback-works); [RevisionDojo (llms)](https://llms.revisiondojo.com/free-ib-questionbank-jojo-ai)
- Hay un corrector de IA, EE y TOK por criterios. Se sube el trabajo, se elige la rúbrica y se pagan 5 "energy" por un feedback de borrador o 10 por la corrección completa — [RevisionDojo: IA criterion by criterion](https://www.revisiondojo.com/blog/how-revisiondojo-marks-ia-criterion-by-criterion); [RevisionDojo grader](https://www.revisiondojo.com/grader?subjectId=16606)
- RevisionDojo dice que su salida de IA es "an educational estimate", no una nota oficial, aunque esté alineada con el markscheme — [RevisionDojo: mark-scheme aligned](https://llms.revisiondojo.com/mark-scheme-aligned-feedback)

**Kognity (IB DP Physics)**
- Propone notas alineadas con el IB que el profesor revisa ("AI-supported scoring, feedback, and insights") — [Kognity Assessment](https://kognity.com/assessment/); [Kognity IBDP assessment](https://kognity.com/products/ibdp/features/assessment/)
- Feedback instantáneo al enviar una pregunta tipo examen en práctica autónoma — [Kognity Help](https://intercom.help/kognity/en/articles/17692491-how-does-instant-feedback-on-exam-practice-work)
- El Practice Centre tiene más de 10.000 preguntas alineadas con el IB y "areas for improvement clearly identified" — [Kognity Practice Centre](https://kognity.com/products/ibdp/features/practice-centre/)
- Patrón de autocorrección (guía de Computer Science): "Hide the markscheme for timed practice, then release it for self-marking and reflection" — [Kognity Welcome Pack CS](https://kognity.com/wp-content/uploads/2026/08/Welcome-Pack-IBDP-Computer-Science_Assessment-Prep.pdf)
- La guía de Physics propone mapas conceptuales y reflexiones del alumno como evaluación formativa — [Kognity Physics Assessment Prep](https://kognity.com/wp-content/uploads/2024/08/Welcome-Pack-IBDP-Physics_-General-Assessment-Prep_24.pdf)
- Crítica de un competidor (AssessPrep): Kognity sería una herramienta de contenido y práctica, sin "secure browser, no paper-structure timed session, no AI rubric marking of extended response" — [AssessPrep](https://www.assessprep.com/blogs/kognity-review-2026)

**tutor2u Examiner AI (referencia, Reino Unido)**
- Tiene un "handwriting convertor" gratuito integrado con todos sus asistentes de corrección: convierte la escritura en texto y después corrige — [tutor2u AI](https://ai.tutor2u.net/); [tutor2u support](https://ai.tutor2u.net/support)

### Inferences
- El flujo de Kwanta "foto o tinta → transcripción → corrección contra M1/A1" ya existe en el mercado (tutor2u, Smart Mark según el proveedor). Pero **nadie documenta mostrar cada marca M1/A1 anclada a una región de la tinta**. Eso sería un diferenciador claro: resaltar el trazo donde se gana o se pierde cada marca.
- Patrón recomendable: **el markscheme oculto durante la práctica cronometrada y revelado después para autocorregir** (Kognity), lo que encaja con los simulacros con temporizador de Kwanta.
- Para la IA conviene seguir el modelo "la IA propone, el profesor aprueba" (Gradescope, Kognity, Kami) y comunicar que la nota es "una estimación educativa" (RevisionDojo). Así se gestionan las expectativas y los errores (véase sección 5).
- Las pistas socráticas sin dar la solución (Kami Coach, Khanmigo) son el estándar para el modo práctica. Una pista graduada por marca ("¿qué ecuación relaciona…?" para M1) se adapta bien al markscheme.
- Rasgo útil de Brisk y Kami: la **reproducción del proceso** (replay). Kwanta ya guarda trazos, así que podría ofrecer una reproducción del trazado al profesor para ver dónde se atascó el alumno.

### Gaps
- No se pudo leer la página de Smart Mark (truncada y sin contenido útil) ni el centro de ayuda de RevisionDojo (aviso de agentes). Faltan detalles de cómo se muestra el desglose de marcas en pantalla.
- La guía oficial de Gradescope sobre IA devolvió un 403. No se verificó cómo ve el alumno la rúbrica y la puntuación parcial (por conocimiento general, Gradescope muestra al alumno los ítems de rúbrica aplicados y permite pedir revisión, pero no se obtuvo cita).
- No se encontró documentación sobre si Classkick tiene IA de corrección en 2026.
- InThinking: no se encontró información sobre funciones de práctica o corrección (búsqueda sin resultados relevantes).

---

## 3. Reconocimiento: precisión de Mathpix y MyScript con matemáticas manuscritas, y cómo se muestran y corrigen los errores

### Takeaway
No se encontraron cifras de precisión independientes y recientes de Mathpix ni de MyScript para matemáticas manuscritas. Las fuentes son cualitativas: la precisión "varía con la calidad de la letra" (Mathpix, Photomath). MyScript ofrece reconocimiento en vivo, donde el alumno ve la interpretación y corrige mientras escribe. Mathpix y Photomath trabajan por foto o captura, y la corrección ocurre después.

### Cited Findings
- Mathpix declara reconocimiento de escritura impresa o cursiva. Las reseñas dicen que la precisión varía con la calidad de la letra y que la escritura desordenada puede requerir corrección manual — [Mathpix pricing](https://mathpix.com/pricing); [aisotools review 2026 (terceros)](https://aisotools.com/blog/mathpix-review-2026)
- Mathpix tiene una API de desarrollador aparte (OCR API), con pago por uso y una cuota inicial única de 19,99 USD para activar la primera clave — [Mathpix API pricing](https://mathpix.com/pricing/api); [Mathpix OCR billing](https://mathpix.com/docs/ocr/billing)
- MyScript Math tiene "Solve step by step" (selección de ecuación y toque), que cubre ecuaciones, cálculo, estadística y problemas verbales. Requiere conexión y cuenta MyScript, y algunas fichas del App Store lo marcan como **beta** — [MyScript Help](https://help.myscript.com/math/create-and-manage-your-content/write-and-solve-calculations/); [App Store](https://apps.apple.com/us/app/-/id6743237855)
- MyScript dice que la app "reveals the logic behind every step… check your reasoning". No se encontró que señale errores en los pasos manuscritos del alumno — [myscript.com/math](https://myscript.com/math)
- MyScript (blog del proveedor) aspira a detectar al alumno que usa el método correcto pero comete un error aritmético, y a responder específicamente. No da cifras de precisión — [MyScript blog](https://www.myscript.com/blog/why-edtech-builders-should-rethink-ai-tutoring-around-digital-ink)
- MyScript publica sobre el coste de una mala entrada matemática en edtech — [MyScript blog](https://www.myscript.com/blog/the-hidden-cost-of-bad-math-input-in-edtech)
- Photomath reconoce problemas "handwritten, in a textbook, or on a screen". Una reseña indica que la precisión del reconocimiento por cámara varía mucho según la claridad de la letra y la iluminación — [App Store Photomath](https://apps.apple.com/gb/app/photomath/id919087726); [AI Tools Atlas (terceros)](https://aitoolsatlas.ai/tools/photomath/pricing)
- Gradescope: el lápiz se lee peor que el bolígrafo. La IA solo agrupa y el humano confirma (no hay calificación autónoma) — [Gradescope Help](https://help.gradescope.com/article/51lz101z28)
- Investigación: un caso de Purdue (abril de 2026, AmIWrite) estudia cómo un tutor multimodal con LLM puede conservar los beneficios de la tutoría basada en escritura a mano. Un informe de Pearson encuentra beneficios preliminares del feedback de IA sobre matemáticas manuscritas, con limitaciones. Portland State señala que la IA aún tiene dificultades para evaluar el razonamiento con calidad de profesor — [Purdue](https://engineering.purdue.edu/cdesign/wp/amiwrite/); [Pearson PDF](https://www.pearson.com/content/dam/global-store/en-us/resources/ExploringTheRoleOfAIInSuportingMathematicalWriting.pdf); [PSU](https://www.pdx.edu/math/news/how-good-ai-guiding-student-thinking-2m-grant-helps-psu-researchers-find-out)

### Inferences
- Para la corrección con IA en Kwanta conviene un paso intermedio de **"esto es lo que leí"**: mostrar la transcripción en LaTeX y dejar que el alumno o el profesor la corrijan antes de puntuar. Así un error de OCR no se convierte en una marca perdida injustamente. Es lo que hacen en la práctica los conversores (tutor2u) y lo que sugiere la experiencia con Mathpix y Photomath.
- Física añade unidades, notación científica, vectores y diagramas. Es razonable esperar más errores de reconocimiento que en álgebra pura (es una inferencia, sin fuente que lo cuantifique).
- La alternativa de reconocimiento en vivo (MyScript iink JS para web) existe como SDK, pero no se verificó en esta búsqueda ni su precio ni su rendimiento en Safari.

### Gaps
- No hay benchmarks públicos recientes (2025-2026) de precisión de Mathpix o MyScript con escritura manuscrita de alumnos. Tampoco se encontraron comparativas independientes (como CROHME) actualizadas en esta búsqueda.
- No se verificó el soporte web (iink JS) de MyScript ni su precio para desarrolladores.

---

## 4. Motivación y ciclos de estudio: rachas, dominio, repetición espaciada, "explica tu respuesta", revelar soluciones resueltas

### Takeaway
Las evidencias encontradas son escasas. Destacan la revelación gradual (pistas → pasos → solución completa) de Photomath Plus, el feedback "qué marcas perdiste y cómo recuperarlas" (Save My Exams), las "areas for improvement" (Kognity), las reflexiones escritas del alumno (Kognity Physics) y el envío de vuelta para rehacer ("Send Back Draft", Seesaw). No se encontraron fuentes sobre rachas o repetición espaciada en estos productos.

### Cited Findings
- Photomath: la explicación paso a paso básica es gratuita. Plus añade "AI-powered animated Tutorials to visualize each step" y "helpful hints and third-level steps to guide you when you're stuck" (revelación en niveles) — [Google Support Photomath Plus](https://support.google.com/photomath/answer/14330572?hl=bg); [Photomath overview](https://support.google.com/photomath/answer/14328660?hl=en)
- Save My Exams Smart Mark muestra "which marks you dropped and how to pick them up next time" (según el proveedor) — [Save My Exams AI study tools](https://www.savemyexams.com/study-tools/ai-study-tools/)
- Kognity Practice Centre: "Areas for improvement clearly identified" — [Kognity](https://kognity.com/products/ibdp/features/practice-centre/)
- Kognity Physics: las reflexiones de los alumnos sirven para evaluar la comprensión conceptual (un equivalente a "explica tu respuesta") — [Kognity Physics Assessment Prep](https://kognity.com/wp-content/uploads/2024/08/Welcome-Pack-IBDP-Physics_-General-Assessment-Prep_24.pdf)
- Seesaw "Send Back Draft" crea "powerful feedback loops" entre profesor y alumno — [UoPeople](https://www.uopeople.edu/blog/what-is-seesaw/)
- Kami Coach pide al alumno revisar su propio razonamiento y autocorregirse — [Kami blog](https://www.kamiapp.com/blog/kami-coach-math-formative-assessment/)
- RevisionDojo usa un sistema de "energy" (créditos) para las correcciones de IA y EE — [RevisionDojo IA marking](https://www.revisiondojo.com/blog/how-revisiondojo-marks-ia-criterion-by-criterion)

### Inferences
- Para Kwanta: tras la autocorrección, **cola de "marcas perdidas"**, es decir, reintentar solo los subapartados donde se perdió M1 o A1, con espaciado. Encaja con el modelo de "how to pick them up next time".
- Revelación gradual por marca: pista conceptual → ecuación del M1 → solución completa. Imita los niveles de Photomath Plus, pero alineado al markscheme IB.
- Añadir un campo breve de "¿por qué?" o reflexión tras el ejercicio, al estilo Kognity, que la IA podría valorar más adelante.

### Gaps
- No se encontraron fuentes de rachas o gamificación ni de repetición espaciada en Save My Exams, RevisionDojo, Kognity o Classkick. No se buscó de forma específica por el límite de llamadas.

---

## 5. Precios (2025-2026, USD) y críticas de profesores y alumnos

### Takeaway
Hay tres modelos de precio. **Freemium por profesor** (Classkick unos 10 USD/mes; Mathpix desde unos 5 USD/mes), **por alumno o institución bajo presupuesto** (Gradescope Institutional, Kognity, Kami Coach, Seesaw for Schools) y **suscripción del alumno** (Photomath Plus unos 10 USD/mes o 70 USD/año; Khanmigo unos 4 USD/mes; RevisionDojo con créditos "energy"). La crítica recurrente a la IA de corrección es la **inconsistencia con el markscheme**: dice que falta un punto que sí está.

### Cited Findings
**Precios**
- Classkick: plan gratuito (20 tareas por profesor) y Pro Teacher (tareas ilimitadas y exportación de notas). Los agregadores indican desde 9,99 USD/mes. GetApp lista un plan Starter con 45 tareas y 5.000 páginas de alumno al año — [Classkick Pricing](https://classkick.com/pricing); [Capterra](https://www.capterra.com/p/10040174/Classkick/); [GetApp](https://www.getapp.com/all-software/a/classkick/)
- Gradescope: dos planes oficiales, Basic (gratis) e Institutional (presupuesto a medida). La prueba Institutional cubre 3 cursos. Fuentes de terceros estiman 1-3 USD por alumno y no se pudo confirmar en qué plan está la IA — [Turnitin Gradescope pricing](https://turnitin.gradescope.com/pricing); [Gradescope trial](https://turnitin.gradescope.com/trial); [toolsforhumans (terceros)](https://www.toolsforhumans.ai/ai-tools/gradescope)
- Mathpix Snip: el plan gratuito incluye 10 páginas PDF y 10 imágenes (el doble con correo .edu). El plan de organizaciones cuesta 9,99 USD/mes con 2 asientos incluidos; 4,49 USD por asiento al mes entre 3 y 49 asientos y 3,99 USD a partir de 50. Pro individual a unos 4,99 USD/mes según terceros (contrastar) — [Mathpix pricing](https://mathpix.com/pricing); [Mathpix org docs](https://mathpix.com/docs/snip/org-accounts-overview); [aisotools (terceros)](https://aisotools.com/blog/mathpix-review-2026)
- Photomath: el núcleo, con pasos, "will always remain free". Plus cuesta unos 9,99 USD/mes o 69,99 USD/año según terceros (octubre de 2026), y el precio varía por región — [Google Support](https://support.google.com/photomath/answer/14330572?hl=bg); [MyEngineeringBuddy (terceros)](https://www.myengineeringbuddy.com/blog/photomath-reviews-alternatives-pricing-offerings/)
- Khanmigo: Khan Academy anuncia "Unlimited Math Tutoring for $4/Month" para familias o alumnos. La página oficial de precios no mostró la cifra exacta — [Khan Academy blog](https://blog.khanacademy.org/online-math-tutoring-for-4-month-khanmigo-kl); [Khanmigo pricing](https://khanmigo.ai/pricing)
- Kami Coach: se vende a escuelas y distritos por presupuesto, sin cifras publicadas — [Kami blog](https://www.kamiapp.com/blog/kami-coach-math-formative-assessment/)
- Seesaw: la app básica es gratuita. Seesaw for Schools requiere presupuesto. Las cifras de terceros están desactualizadas (5 USD por alumno al año en 2018; "desde 120 USD/año" en otro blog) — [TechCrunch 2018](https://techcrunch.com/?p=1595287); [UoPeople](https://www.uopeople.edu/blog/what-is-seesaw/)
- RevisionDojo: créditos "energy" (5 por un feedback de borrador y 10 por una corrección completa en IA/EE/TOK) y una prueba de Jojo AI sin suscripción obligatoria — [RevisionDojo blog](https://www.revisiondojo.com/blog/how-revisiondojo-marks-ia-criterion-by-criterion); [Trustpilot (respuesta de la empresa)](https://www.trustpilot.com/review/revisiondojo.com?page=5)

**Críticas**
- RevisionDojo (Trustpilot, reseñas autoseleccionadas). Positivas: "accurate AI question bank marking" y "great feedback based on the markscheme". Negativas: "the AI is not accurate at all", y que la IA "tends to glitch out sometimes, and tell me I forgot to account for a certain part on the markscheme even when it was present". También quejas de "real content errors" y sospechas de que las preguntas están generadas por IA. La empresa reconoce problemas en Geo y Math AI — [Trustpilot p.5](https://www.trustpilot.com/review/revisiondojo.com?page=5); [Trustpilot p.4](https://www.trustpilot.com/review/revisiondojo.com?page=4); [Trustpilot p.7](https://www.trustpilot.com/review/revisiondojo.com?page=7)
- Classkick: congelamientos frecuentes en iPad Pro (App Store). En Common Sense, un profesor se queja de que no se pueden quitar clases de la lista y todo se satura. G2 le da 4,9 con unas 70 reseñas — [App Store](https://apps.apple.com/us/app/classkick/id909904332); [Common Sense](https://www.commonsense.org/education/reviews/classkick/teacher-reviews/5112628); [G2](https://www.g2.com/products/classkick/reviews_and_filters)
- Seesaw: un alumno reporta que no puede escuchar algunos comentarios de voz del profesor — [App Store](https://apps.apple.com/us/app/id930565184)
- Gradescope: no detecta IA por sí mismo (depende de Turnitin). Una evaluación de UBC (2019, antigua) reporta ahorro de tiempo frente a la corrección en papel — [Teachfloor](https://www.teachfloor.com/blog/what-is-gradescope); [UBC report](https://elearning5.sites.olt.ubc.ca/files/2021/05/gradescope-report.pdf)
- Kognity: un competidor (AssessPrep) lo critica por no corregir con IA las respuestas extensas por rúbrica (sesgo de competidor) — [AssessPrep](https://www.assessprep.com/blogs/kognity-review-2026)

### Inferences
- Un precio orientativo competitivo para Kwanta sería un modelo por alumno o colegio en el rango de Gradescope y Kognity, o un plan de alumno de 4-10 USD/mes (Khanmigo, Photomath). Los créditos por corrección de IA (modelo "energy") ayudan a controlar el coste de los LLM.
- El riesgo reputacional principal de la corrección con IA es el **falso negativo** ("dice que falta algo que está"). Mitigaciones: mostrar la transcripción, citar el fragmento del alumno que justifica cada marca, ofrecer un botón de "reclamar" o "revisar" y la revisión del profesor.

### Gaps
- No se obtuvieron hilos de Reddit (r/Teachers, r/IBO). Las búsquedas no devolvieron resultados de Reddit y la evidencia de críticas viene de Trustpilot, App Store, Common Sense y G2.
- Faltan precios oficiales de Kognity, Save My Exams (planes de alumno y escuela), InThinking y Kami (planes por profesor o escuela) para 2026.
- No se encontró información sobre InThinking (subject sites de IB) en relación con práctica o corrección.
