# Reconocimiento de escritura a mano / matemáticas manuscritas y corrección con IA para Kwanta

Contexto: Kwanta = app web Next.js; alumnos de IB Physics escriben con Apple Pencil en Safari de iPad; la tinta se guarda como trazos vectoriales con presión; hay que corregir contra markscheme IB (marcas M1/A1). Fecha de la investigación: 24-nov-2026. Todas las cifras proceden de las fuentes enlazadas; donde una página no daba el dato se indica en "Lagunas".

## 1. APIs/SDKs de reconocimiento de tinta y matemáticas (precio, límites, licencia, online/offline, tipo de entrada)

### Takeaway
Para una web app en Safari de iPad, las únicas opciones de "tinta → LaTeX" realmente utilizables desde el navegador son servicios cloud: Mathpix `v3/strokes` (precio público, ~0,002 USD/petición o 0,01 USD por sesión en vivo) y MyScript iinkTS (cloud; 2.000 peticiones gratis solo para desarrollo, precio de producción bajo contrato). Las APIs on-device (Google ML Kit, Apple PencilKit `PKStrokeRecognizer`, W3C/Chrome Handwriting Recognition API) no están disponibles en Safari web y además no anuncian soporte de matemáticas; Azure Ink Recognizer está retirado desde 2021.

### Cited Findings

**Mathpix API (cloud, imagen o trazos)**
- `v3/text` (imagen): 0,002 USD/imagen de 0 a 1M imágenes/mes; 0,0015 USD por encima de 1M. Imágenes con más de 12 filas de texto pueden facturarse a la tarifa `v3/pdf` por página — [Mathpix API pricing](https://mathpix.com/pricing/api)
- `v3/strokes` (tinta digital, coordenadas de trazos): reconoce matemáticas y texto latino/hindi; 0,002 USD/petición los primeros 1M, luego 0,0015 USD. Si se usa un "stroke session ID" (tinta en vivo), se factura por sesión: gratis hasta 1K sesiones, 0,01 USD de 1K a 100K, 0,008 USD de 100K a 1M, 0,005 USD por encima de 1M — [Mathpix API pricing](https://mathpix.com/pricing/api)
- `v3/pdf` (PDF/DOCX/PPTX): 0,005 USD/página primer 1M, luego 0,0035; Batch (Files API) 0,0015 USD/página — [Mathpix API pricing](https://mathpix.com/pricing/api)
- Cuota de alta única de 19,99 USD (no reembolsable) para activar la primera API key; cuentas pay-as-you-go reciben 29 USD de crédito de prueba; tiers mensuales; hay rate limits por defecto (peticiones en exceso se rechazan) y plan Enterprise con precio a medida — [Mathpix API pricing](https://mathpix.com/pricing/api)
- Formato de entrada de `v3/strokes`: arrays de coordenadas x e y, cada sub-array es un trazo continuo (la presión no forma parte del formato documentado). Salida: `text` en Mathpix Markdown con matemáticas en `\( \)`/`\[ \]`, `latex_styled` (solo si cabe en una única cadena LaTeX; se omite en entradas multilínea, diagramas químicos, gráficos), `confidence`, `confidence_rate`, `is_handwritten` — [Mathpix: Process Stroke Data](https://docs.mathpix.com/guides/strokes)
- Varias expresiones en una petición se combinan en un bloque `\begin{array}{l}` (o `aligned`); Mathpix recomienda enviar una expresión por petición y segmentar en cliente (hueco vertical o temporizador de pausa del lápiz). El reconocimiento es sin estado: reutilizar la sesión no aporta contexto — [Mathpix: Process Stroke Data](https://docs.mathpix.com/guides/strokes)
- Tinta en vivo desde el navegador: el servidor pide `POST /v3/app-tokens` con `include_strokes_session_id: true` y `expires` ≤ 300 s; el cliente usa el `app_token`. La facturación de la sesión empieza al primer envío de trazos. Se aconseja no exponer la API key en el bundle — [Mathpix: Process Stroke Data](https://docs.mathpix.com/guides/strokes)
- Latencia: la documentación solo dice que `v3/strokes` "admite las mismas opciones que el procesamiento de imagen pero con menor latencia", sin cifras — [Mathpix: Process Stroke Data](https://docs.mathpix.com/guides/strokes)
- Consejos de captura de Mathpix para la web: Pointer Events, `event.getCoalescedEvents()` en `pointermove`, `setPointerCapture`, dimensionar canvas por `devicePixelRatio` y enviar puntos crudos sin suavizado — [Mathpix: Process Stroke Data](https://docs.mathpix.com/guides/strokes)

**MyScript iink SDK / iinkTS (web)**
- Precios: "Cloud recognition" (incluye todas las funciones del iink SDK Web) con tier gratuito "Build" de 2.000 peticiones "solo para pruebas y desarrollo"; para producción ("Deploy") hay que contactar con MyScript y firmar contrato. On-device (SDK nativo) se licencia por dispositivo: 25 licencias gratis solo para desarrollo. No se publican precios por petición — [MyScript Developer pricing](https://developer.myscript.com/pricing)
- La web solo está cubierta por el reconocimiento cloud (no on-device) — [MyScript Developer pricing](https://developer.myscript.com/pricing)
- iinkTS (npm `iink-ts`) es una librería JS de reconocimiento de escritura con soporte de texto y matemáticas y salida tipografiada; el reconocimiento se ejecuta en MyScript Cloud o en un MyScript Server (on-premise), con application key + HMAC key — [npm iink-ts](https://npmjs.com/package/iink-ts); [iinkTS get started](https://developer.myscript.com/doc/interactive-ink/2.1/web/iinkts/get-started)
- La documentación de MyScript (v4.1/4.3) lista elementos matemáticos soportados: letras, operadores, símbolos griegos y funciones — [MyScript math elements and rules 4.1](https://developer.myscript.com/doc/interactive-ink/4.1/overview/math-elements-and-rules)
- El reconocedor matemático neural (iink 3.0) predice una secuencia lineal que describe la estructura espacial de la expresión, similar a LaTeX — [MyScript blog: iink SDK 3.0 math](https://www.myscript.com/blog/iink-sdk-3-0-math)
- El antiguo web component `myscript-math-web` está archivado desde el 4-ene-2021 (no usar) — [GitHub MyScript/myscript-math-web](https://github.com/MyScript/myscript-math-web/releases)
- Licencia: regida por los "Terms of use of the MyScript Software and Service" (PDF enlazado desde la página de precios) — [MyScript Developer pricing](https://developer.myscript.com/pricing)

**Google ML Kit Digital Ink Recognition**
- Plataformas: Android e iOS; la página no menciona web. Funciona totalmente offline en el dispositivo; >300 idiomas y >25 sistemas de escritura; los paquetes de idioma se descargan dinámicamente. La página no menciona matemáticas ni precio — [ML Kit Digital Ink Recognition](https://developers.google.com/ml-kit/vision/digital-ink-recognition)

**Handwriting Recognition API (WICG / Chrome)**
- Estado: "Draft Community Group Report" del WICG con fecha 15-nov-2026; "no es un estándar W3C ni está en el Standards Track". Capacidades: lista de idiomas BCP 47, alternativas (por defecto 3), segmentación grafema→trazos, hints (`recognitionType`, `inputType`, `textContext`). No menciona matemáticas. Indica que los user agents deberían mapearla a reconocedores del SO (Windows Ink, Apple PencilKit, ChromeOS ML Service) pero no nombra navegadores que la implementen — [WICG Handwriting Recognition spec](https://wicg.github.io/handwriting-recognition/)
- Chrome la documenta como disponible desde Chromium 99; detección vía `navigator.createHandwritingRecognizer` — [Chrome for Developers: Recognize your users' handwriting](https://developer.chrome.com/docs/web-platform/handwriting-recognition)
- El "Intent to Prototype" de Chromium (2020) la limitaba inicialmente a ChromeOS — [blink-dev Intent to Prototype](https://groups.google.com/a/chromium.org/g/blink-dev/c/VXUq1UY4m7Y)

**Microsoft Azure**
- Azure Cognitive Services Ink Recognizer (preview) se retiró el 31-ene-2021, sin alternativa oficial anunciada — [azure-deprecation/dashboard issue #66](https://github.com/azure-deprecation/dashboard/issues/66)
- Un hilo de Microsoft Q&A (comentario comunitario, no oficial) sugiere que la funcionalidad de manuscrito pasó a la Read API (imagen, no trazos) — [Microsoft Q&A: What is the Ink Recognizer API?](https://learn.microsoft.com/en-us/answers/questions/26766/what-is-the-ink-recognizer-api)

**Apple (nativo)**
- Nuevo `PKStrokeRecognizer` (PencilKit): reconoce escritura directamente de un `PKDrawing` con motor on-device (offline, los datos no salen del dispositivo); funciones: convertir trazos a texto (`recognizedText(strokeIDs:)`, devuelve la interpretación más probable), búsqueda con bounds de trazos, `indexableContent` para Spotlight con múltiples lecturas (p. ej. "1" o "l"); `recognitionVersion` cambia entre versiones del SO. La doc habla de texto/idiomas, no de matemáticas — [Apple: Recognizing handwriting and converting it to text](https://developer.apple.com/documentation/pencilkit/recognizing-handwriting-and-converting-to-text.md)
- Disponible en iOS, iPadOS, macOS y visionOS 27 (WWDC26) — [WWDC26 sesión 203](https://developer.apple.com/videos/play/wwdc2026/203)
- Un hilo antiguo de foros de Apple indica que el reconocimiento de texto de Vision no funcionaba bien con manuscrito (anterior a la nueva API) — [Apple Developer Forums 650357](https://developer.apple.com/forums/thread/650357)

### Inferences
- En Safari de iPad no hay reconocedor de tinta nativo accesible desde JavaScript: ML Kit y PKStrokeRecognizer son nativos y la Handwriting Recognition API no tiene implementación documentada fuera de Chromium (y todos los navegadores de iPad usan WebKit). Por tanto Kwanta debe usar un servicio cloud (Mathpix, MyScript) o un LLM con visión, o envolver la web en una app nativa (Capacitor/WKWebView) si quisiera PKStrokeRecognizer (que además parece solo texto).
- Mathpix `v3/strokes` encaja bien con el modelo de datos de Kwanta (ya guarda x,y), con precio predecible: una respuesta de ~10 líneas segmentadas en 10 peticiones costaría ~0,02 USD; con sesión en vivo, 0,01 USD por sesión (tier 1K–100K). Cálculo propio a partir de la tabla de precios.
- MyScript es la opción más madura para UX de "tinta interactiva" (conversión en vivo, gestos), pero el coste de producción es opaco (contrato), lo que es un riesgo para una startup.
- La presión del Apple Pencil no la usa ninguno de los formatos documentados (Mathpix solo x,y); sirve para el renderizado a imagen, no para reconocimiento.

### Gaps
- No encontré precios de producción de MyScript Cloud (solo "contact us"), ni la definición de "request" (FAQ sin contenido extraído), ni latencias publicadas.
- No pude abrir la página de elementos matemáticos v4.3 de MyScript (HTTP 404); no se confirmó explícitamente soporte de unidades físicas, notación científica ×10ⁿ o vectores, aunque sí griegos/operadores/funciones.
- No encontré la ficha de chromestatus ni datos de Can I Use/MDN que confirmen el estado en Safari/WebKit de la Handwriting Recognition API (ninguna fuente menciona WebKit). Tampoco si Chrome la extendió más allá de ChromeOS.
- Azure AI Vision Read (imagen) — no verifiqué precios actuales ni calidad con matemáticas.
- Sin datos de latencia medida de Mathpix ni de MyScript.

## 2. Modelos LLM con visión (Claude, GPT, Gemini) para leer y corregir física manuscrita: precisión publicada, buenas prácticas, coste

### Takeaway
Los LLM multimodales actuales transcriben bien la escritura y aciertan casi siempre en soluciones correctas, pero fallan sobre todo al asignar crédito parcial (justo lo que exigen las marcas M1/A1) y en diagramas; los estudios 2025-2026 recomiendan usarlos como primera corrección/feedback de práctica con revisión humana o enrutado por confianza, no como nota final. En reconocimiento puro de expresiones (CROHME), los LLM generalistas zero-shot (GPT-4o ~49 %, Gemini 2.5 Flash ~55 % ExpRate) siguen por debajo de modelos especializados (~60 %) y de VLM ajustados (Uni-MuMER ~73 %).

### Cited Findings

**Reconocimiento de expresiones (benchmarks)**
- MathWriting (Google, 2024): el mayor dataset de expresiones matemáticas manuscritas *online* (trazos): 230k muestras humanas + 400k sintéticas; licencia CC BY-NC-SA 4.0 (no comercial). Métrica: Character Error Rate sobre tokens LaTeX normalizados. Baselines del paper: OCR de Google Document AI CER 7,17 en test; CTC Transformer (35M parámetros) CER 5,56 — [arXiv 2404.10690 MathWriting](https://arxiv.org/html/2404.10690v2)
- ExpRate en CROHME 2014/2016/2019 (media), VLMs zero-shot: GPT-4o 48,81 %; Gemini 2.5 Flash 55,32 %; Doubao-1.5-pro 48,79 %; Qwen2.5-VL-72B 56,40 %; Qwen2.5-VL-7B 52,17 %. Modelos especializados: PosFormer 61,20 %; TAMER 60,34 %; CoMER 58,16 %. Uni-MuMER (Qwen2.5-VL ajustado solo con CROHME) 73,29 %; con datos externos 79,74 % — [arXiv 2505.23566 Uni-MuMER](https://arxiv.org/html/2505.23566)
- Un estudio de benchmark de vLLMs en CROHME concluye que los modelos dedicados siguen claramente por delante en ese test in-domain — [Springer: Boosting HMER through contextual reasoning with vLLMs](https://link.springer.com/chapter/10.1007/978-3-032-09368-4_19)
- Un trabajo listado en ResearchGate reporta GPT-4o 84,6 % y GPT-4.1-mini 91,4 % con prompting multi-shot (no comparable con zero-shot; cifra no verificada en el original) — [ResearchGate: MathWriting-related](https://www.researchgate.net/publication/394261237_MathWriting_A_Dataset_For_Handwritten_Mathematical_Expression_Recognition)

**Corrección/evaluación de matemáticas y física manuscritas**
- FERMAT (ACL 2025): >2.200 soluciones manuscritas (609 problemas, grados 7–12) con errores introducidos (computacionales, conceptuales, notacionales, de presentación), transcritas a mano por >40 anotadores; 9 VLMs evaluados en detección, localización y corrección de errores. Mejor tasa de corrección: Gemini 1.5 Pro 77 %. GPT-4o lidera detección y localización. El rendimiento cae mucho de detección a localización y corrección. Algunos modelos mejoran si el manuscrito se sustituye por texto impreso; añadir un paso OCR explícito ayuda mucho a modelos débiles (Pixtral-124B, Llama-3.2-90B) pero solo marginalmente a GPT-4o y Gemini 1.5 Pro. Un enfoque en cascada (detectar→localizar→corregir) empeoró los resultados por la cautela en la detección — [ACL Anthology: Can VLMs Evaluate Handwritten Math? (FERMAT)](https://aclanthology.org/2025.acl-long.720.pdf)
- UCL (Donaldson et al., jun-2026), física universitaria: modelos ChatGPT-4o, o1, o3-mini-high, 5.1; Gemini 1.5 Pro, 2.0 Flash, 2.5 Flash, 3.0 Pro; DeepSeek (Claude no evaluado). Corrección de soluciones tecleadas: Gemini 3.0 Pro r=0,919, MAE 7,61 %; ChatGPT-5.1 r=0,918, MAE 9,15 %; Gemini 2.5 Flash MAE 12,58 %. Manuscritas: MAE casi cero en soluciones perfectas para todos los modelos; error mucho mayor en soluciones imperfectas; ligera sobrecalificación. Principal debilidad: crédito parcial (ej. Gemini 2.5 Flash dio 4/5 a un error de sustitución que el humano puntuó 1/5). La transcripción "no fue la principal limitación": el cuello de botella fue el razonamiento evaluativo. Recomiendan: usar para práctica y primera corrección, supervisión humana del crédito parcial, verificar lectura de diagramas, corregir cada solución por separado (el batch introdujo sesgo posicional) — [arXiv 2605.23660 Using LLMs in Physics Education](https://arxiv.org/html/2605.23660)
- Claude Code (Claude Opus 4.6, agentic) corrigiendo exámenes universitarios manuscritos (60 alumnos, rúbrica en 3 ficheros): Pearson r=0,97 frente al experto, MAE 0,85 sobre 20 puntos, sesgo positivo de 0,68 puntos; test-retest ICC 0,96; 92,8 % del feedback diagnóstico correcto. Peor en ítems de dibujo; fallos: coincidencia de palabras clave sin profundidad conceptual, deriva de atención en diagramas. Conclusión: apto para asistir en ítems objetivos/cortos con salvaguardas, no para casos frontera ni dibujos (un solo autor/evaluador, preprint nov-2026) — [arXiv 2611.13217](https://arxiv.org/abs/2611.13217)
- Kortemeyer et al. (oct/nov-2025), examen de cálculo manuscrito con GPT-5 y la misma rúbrica de los TAs: acuerdo sin filtrar "moderado" (aceptable para feedback de bajo riesgo, no alto riesgo). Con filtro de confianza (umbral de crédito parcial + medida de riesgo IRT 2PL) alcanzó precisión humana pero ~70 % de los ítems seguía requiriendo corrector humano. Lecciones: subpasos visibles en la rúbrica, anclaje espacial de las regiones de respuesta — [arXiv 2510.05162](https://arxiv.org/abs/2510.05162)
- GPT-4o corrigiendo un examen manuscrito de probabilidad: dar la rúbrica mejora el alineamiento con humanos, pero la precisión global sigue siendo insuficiente para uso real — [arXiv 2411.05231](https://arxiv.org/abs/2411.05231)
- Otros trabajos relevantes (no leídos a fondo): comparación GPT-4o / Claude 3.5 Sonnet / Gemini 1.5 Pro sobre física manuscrita en *Physics Education* (vol. 60, may-2025) — [ResearchGate](https://www.researchgate.net/publication/389660595_Using_large_language_models_for_grading_in_education_an_applied_test_for_physics); "Overview of AI Grading of Physics Olympiad Exams" — [arXiv 2505.02121](https://arxiv.org/pdf/2505.02121); VEHME, VLM para evaluar expresiones manuscritas — [arXiv 2510.22798](https://arxiv.org/pdf/2510.22798)

**Datos técnicos y coste de visión (Claude)**
- Coste de imagen en Claude: ⌈ancho/28⌉ × ⌈alto/28⌉ tokens visuales. Tier alta resolución (Claude 4.7 y posteriores): lado largo máx. 2.576 px, máx. 4.784 tokens; tier estándar: 1.568 px y 1.568 tokens. Ejemplos: 1000×1000 = 1.296 tokens; 2000×1500 = 3.888 tokens (alta res.). Precio citado: Opus 5.5 a 4 USD/M tokens de entrada → ~5,18 USD por 1.000 imágenes de 1000×1000 y ~19,14 USD por 1.000 imágenes 4K; Haiku 4.5 a 1 USD/M → ~1,30 USD por 1.000 imágenes de 1000×1000 — [Claude Docs: Vision](https://platform.claude.com/docs/en/build-with-claude/vision)
- Límites Claude: máx. 8000×8000 px por imagen; si hay >20 imágenes por petición, cada una ≤3.000 px; 10 MB por imagen (base64) en la API; hasta 600 imágenes por petición (100 en modelos de 200k de contexto). Recomienda imágenes nítidas, evitar compresión JPEG agresiva y pre-redimensionar; advierte de posibles alucinaciones con imágenes de baja calidad, rotadas o <200 px, y que las coordenadas son aproximadas — [Claude Docs: Vision](https://platform.claude.com/docs/en/build-with-claude/vision)
- Gemini 3: por defecto ~1.120 tokens por imagen, con niveles low/medium/high ≈ 280/560/1.120; resolución configurable por imagen (solo Gemini 3). Gemini 2.5: 256 tokens por defecto (pan-and-scan hasta ~2.048). La alta resolución se recomienda para leer texto denso (OCR) — [Gemini API: Media resolution](https://ai.google.dev/gemini-api/docs/media-resolution)
- OpenAI: el parámetro `detail` (low = versión 512×512; high; en gpt-5.5 también `original`); en gpt-5.5 "high" permite hasta 2.500 patches o 2.048 px de dimensión máx.; hay calculadora oficial de coste — [OpenAI: Images and vision](https://developers.openai.com/api/docs/guides/images-vision); [OpenAI: Image cost calculator](https://developers.openai.com/api/docs/guides/image-cost-calculator.md). Hay informes comunitarios (no verificados) de facturación inconsistente de `detail` en GPT-5 — [OpenAI Community](https://community.openai.com/t/responses-api-gpt-5-ignores-the-detail-parameter-on-image-inputs/1344058)

### Inferences
- Coste estimado (cálculo propio): una página de respuesta renderizada a ~1.500×2.000 px en Claude de alta resolución = 54×72 = 3.888 tokens ≈ 0,016 USD de entrada en Opus 5.5 (4 USD/M) o ~0,004 USD en Haiku 4.5 (1 USD/M, que la recortaría a tier estándar ~1.564 tokens ≈ 0,0016 USD). A esto hay que sumar markscheme + prompt (texto, cacheable) y los tokens de salida (precio de salida no verificado aquí). Orden de magnitud: céntimos por respuesta, no dólares.
- Buenas prácticas derivadas de las fuentes: (1) renderizar los trazos vectoriales a PNG sin pérdida, fondo blanco, tinta negra, recortado al área escrita y a un tamaño que no supere el lado largo nativo del modelo (≤2.576 px en Claude alta res.; ~1.500–2.000 px para una respuesta) para evitar reescalados que degraden símbolos pequeños (exponentes, subíndices); (2) dos pasadas: transcripción a LaTeX/Markdown con marcas de incertidumbre → corrección contra el markscheme con salida estructurada (JSON por cada M1/A1 con evidencia citada de la transcripción); FERMAT sugiere que el paso OCR explícito ayuda poco a modelos fuertes pero da trazabilidad y permite al alumno corregir la transcripción; (3) corregir cada respuesta por separado (sesgo posicional en batch, UCL); (4) rúbricas con subpasos explícitos (Kortemeyer; arXiv 2411.05231); (5) enrutar casos de baja confianza o crédito parcial a revisión humana/profesor; (6) tratar diagramas con especial cautela (peor rendimiento en todos los estudios).
- Opción híbrida para Kwanta: Mathpix `v3/strokes` (determinista, barato, devuelve `confidence`) para transcripción + LLM para la corrección sobre el texto transcrito y la imagen. Enviar ambos (imagen + transcripción) permite al LLM detectar errores de OCR.
- Enviar los trazos crudos como texto (JSON de coordenadas) a un LLM no está respaldado por ninguna fuente encontrada; lo razonable es imagen (o Mathpix→LaTeX).
- Los resultados de CROHME (expresiones aisladas) subestiman la tarea real de Kwanta (páginas con varias líneas, unidades, texto mezclado), pero el estudio UCL indica que en física completa la transcripción no es el cuello de botella para modelos frontera.

### Gaps
- No encontré benchmarks publicados de Claude (ninguna versión) en CROHME ni en MathWriting; los estudios de corrección que incluyen Claude son el preprint de Claude Code (informática gráfica, no física) y el de *Physics Education* 2025 cuyos resultados no pude leer.
- No encontré estudios específicos sobre errores de unidades, cifras significativas o notación científica en transcripción por LLM; sigue siendo un riesgo a validar con un set propio.
- Precios de tokens de salida y de GPT/Gemini por página no verificados en esta investigación.
- No hay cifras publicadas de latencia por página para corrección con LLM en estos estudios.
- No encontré evidencia comparativa de "imagen vs coordenadas como texto" para LLMs.

## 3. Modelos y datasets open-source (madurez y viabilidad de self-hosting)

### Takeaway
Existen modelos abiertos de calidad para reconocer expresiones (PosFormer, TAMER/CoMER, UniMERNet, Uni-MuMER sobre Qwen2.5-VL, Pix2Text), pero reconocen expresiones aisladas a partir de imagen y no corrigen; texify está archivado (migrado a surya, que es para texto impreso) y Nougat alucina con imágenes pequeñas de matemáticas. MathWriting es no comercial (CC BY-NC-SA), lo que limita entrenar modelos comerciales con él. Self-hosting es viable técnicamente (GPU) pero no aporta corrección por pasos.

### Cited Findings
- Uni-MuMER (NeurIPS 2025): ajuste fino completo de un VLM (Qwen2.5-VL) para reconocimiento de expresiones manuscritas, código y datos abiertos; 73,29 % ExpRate medio CROHME (79,74 % con datos externos), +24,42 puntos sobre Gemini 2.5 Flash zero-shot — [arXiv 2505.23566](https://arxiv.org/html/2505.23566); [ResearchGate Uni-MuMER](https://www.researchgate.net/publication/392204763_Uni-MuMER_Unified_Multi-Task_Fine-Tuning_of_Vision-Language_Model_for_Handwritten_Mathematical_Expression_Recognition)
- PosFormer (ECCV 2024): repositorio oficial con checkpoint de CROHME; código para el dataset M2E publicado en abril de 2025; ExpRate medio CROHME 61,20 % — [GitHub SJTU-DeepVisionLab/PosFormer](https://github.com/SJTU-DeepVisionLab/PosFormer); [arXiv 2505.23566](https://arxiv.org/html/2505.23566)
- UniMERNet: red "universal" para expresiones matemáticas del mundo real (impresas y manuscritas) — [arXiv 2404.15254](https://arxiv.org/pdf/2404.15254)
- texify: archivado (solo lectura); su funcionalidad migró a surya (`surya_latex_ocr`). Su README indica que Nougat está diseñado para páginas enteras y alucina más en imágenes pequeñas con solo matemáticas — [GitHub VikParuchuri/texify](https://github.com/VikParuchuri/texify)
- Una copia de terceros del README de surya indica que está pensado para texto impreso, no manuscrito (fuente secundaria) — [GitHub kielin/surya](https://github.com/kielin/surya)
- Pix2Text 1.0.x: su nuevo modelo de fórmulas tiene "mayor precisión, especialmente en fórmulas manuscritas y multilínea" (afirmación del propio proyecto) — [PyPI pix2text 1.0.2](https://pypi.org/project/pix2text/1.0.2)
- Otros modelos recientes de fórmulas (principalmente impresas/documentos): PP-FormulaNet — [arXiv 2503.18382](https://arxiv.org/pdf/2503.18382); DocTron-Formula — [arXiv 2508.00311](https://arxiv.org/pdf/2508.00311)
- MathWriting: 230k+400k muestras de tinta online, licencia CC BY-NC-SA 4.0 — [arXiv 2404.10690](https://arxiv.org/html/2404.10690v2); espejo en Hugging Face — [HF andito/mathwriting-google](https://huggingface.co/datasets/andito/mathwriting-google/tree/4e68536dc19f872e0d3e0445a466dcf55d6a4532)
- FERMAT (dataset de soluciones manuscritas con errores, para evaluar corrección) publicado abierto — [HF ai4bharat/FERMAT](https://huggingface.co/datasets/ai4bharat/FERMAT); [GitHub AI4Bharat/FERMAT](https://github.com/AI4Bharat/FERMAT)
- Qwen2.5-VL-72B zero-shot ya iguala a Gemini 2.5 Flash en CROHME (56,40 % vs 55,32 %), y Qwen2.5-VL-7B logra 52,17 % — [arXiv 2505.23566](https://arxiv.org/html/2505.23566)

### Inferences
- Para Kwanta, self-hosting solo tendría sentido como capa de transcripción barata o privada (p. ej. Qwen2.5-VL-7B o Pix2Text en GPU); la corrección contra markscheme seguiría necesitando un LLM grande. Con volúmenes de una startup, Mathpix (0,002 USD) o un LLM API probablemente salen más baratos que mantener GPU.
- MathWriting (trazos online) sería ideal para entrenar un reconocedor sobre los trazos de Kwanta, pero la licencia NC impide uso comercial directo; habría que verificar con Google o usar solo para evaluación.
- TrOCR / im2latex / CROHME: no investigados en detalle aquí; CROHME es el benchmark estándar citado en todos los papers.

### Gaps
- No verifiqué licencias concretas (código/pesos) de PosFormer, Uni-MuMER, Pix2Text, UniMERNet; ni requisitos de GPU/latencia.
- No encontré resultados de estos modelos en páginas multilínea con texto + unidades (caso real de física).
- No investigué TrOCR, im2latex ni CROHME 2023/2024 en profundidad.

## 4. Productos existentes que ya lo hacen (cómo funcionan y qué ven los alumnos)

### Takeaway
Ningún producto encontrado combina "tinta Apple Pencil en web + corrección paso a paso con markscheme IB de física". Las apps de notas (Goodnotes Math Assist, MyScript Notes/Nebo, Notability) reconocen/convierten o resuelven ecuaciones, pero no corrigen contra markschemes; los tutores IB (Save My Exams Smart Mark, RevisionDojo) corrigen contra markscheme pero con soporte de manuscrito limitado o contradictorio; Gradescope agrupa respuestas para profesores sin asignar notas de forma autónoma.

### Cited Findings
- **Goodnotes Math Assist**: reconoce ecuaciones manuscritas en cualquier cuaderno; al tocar una línea muestra el resultado del reconocimiento y permite editar el LaTeX; desactivado por defecto; solo iOS; cubre aritmética, ecuaciones cuadráticas/cúbicas/cuárticas y trigonometría — [Goodnotes support](https://support.goodnotes.com/hc/en-us/articles/10779297639567); [Goodnotes: Design of AI Math Assistance](https://www.goodnotes.com/blog/how-its-made-ai-math-assistance); [TechRadar](https://techradar.com/computing/artificial-intelligence/goodnotes-adds-an-ai-that-can-read-and-explain-even-the-worst-handwriting)
- **MyScript Notes (antes Nebo)**: escribir ecuaciones, resolver cálculos simples, copiar matemáticas como LaTeX o imagen; conversión con doble toque — [App Store MyScript Notes](https://apps.apple.com/us/app/myscript-nebo-note-taking-for-apple-pencil/id1119601770); [Nebo help: math](https://help.myscript.com/nebo/create-content/math); el renombrado aparece en [Goodnotes blog 2026](https://www.goodnotes.com/blog/best-ai-notetaking-apps-handwritten-notes-pdfs)
- **Notability**: herramientas IA de estudio (resúmenes, quizzes, flashcards); según una fuente secundaria convierte matemáticas manuscritas a LaTeX pero no resuelve — [Goodnotes blog 2026 (comparativa de competidor)](https://www.goodnotes.com/blog/best-ai-notetaking-apps-handwritten-notes-pdfs)
- **Save My Exams – Smart Mark**: corrige respuestas tecleadas o manuscritas (tecleando, dibujando o subiendo manuscrito) contra el markscheme del tribunal (incluido IB) y muestra qué marcas se perdieron y por qué — [Save My Exams AI study tools](https://www.savemyexams.com/study-tools/ai-study-tools/); [Smart Mark](https://savemyexams.com/study-tools/smart-mark). Un artículo propio dice que no corrige preguntas de opción múltiple ni de cálculo — [Get immediate feedback with Smart Mark](https://www.savemyexams.com/learning-hub/useful-resources/get-immediate-exam-specific-feedback-with-smart-mark/). Afirman ser "69 % más preciso que ChatGPT" (autodeclarado) — [Is Save My Exams AI?](https://www.savemyexams.com/learning-hub/sme-articles/is-save-my-exams-ai/). Contradicción: su comparativa con MarkMe AI dice que Save My Exams no ofrece subida de manuscrito — [SME vs MarkMe AI](https://www.savemyexams.com/learning-hub/sme-articles/save-my-exams-vs-markme-ai/)
- **RevisionDojo (Jojo AI)**: corrige según markscheme e indica dónde se ganan/pierden marcas; su propia guía advierte que notación matemática, trabajo manuscrito, gráficos, diagramas y escaneos pobres pueden interpretarse de forma incompleta — [RevisionDojo: AI grader accuracy](https://www.revisiondojo.com/blog/ai-grader-accuracy-ib-revisiondojo-moderated-marks); [RevisionDojo reviews](https://www.revisiondojo.com/blog/revisiondojo-reviews); queja de usuario sobre inexactitud — [Trustpilot](https://pl.trustpilot.com/review/revisiondojo.com)
- **Gradescope (Turnitin)**: para profesores; escanea exámenes en papel, reconoce escritura para emparejar nombres, y su IA agrupa respuestas similares para aplicar una decisión de rúbrica a muchas; la nota la decide el humano; IA solo en licencia institucional — [Apporto: How Gradescope AI-assisted grading works](https://www.apporto.com/gradescopes-ai-assisted-grading-explained); [Stanford Teaching Commons](https://teachingcommons.stanford.edu/opportunities/gradescope)
- **Photomath (Google)**: apunta la cámara a un problema impreso o manuscrito y muestra la solución paso a paso asociada a la expresión detectada — [App Store Photomath](https://apps.apple.com/us/app/id919087726?l=en-us); [Android Central](https://www.androidcentral.com/apps-software/google-unveils-photomath-app)
- **Khanmigo**: tutor socrático que no da respuestas directamente; no se confirmó subida de imágenes manuscritas por el alumno — [GeoGebra: Mathematics specific AI tools](https://www.geogebra.org/m/tt47qzb2)

### Inferences
- El hueco de mercado de Kwanta es real: tinta nativa (vectorial, con presión) + markscheme IB oficial + marcas M1/A1 por paso, con visibilidad de la transcripción (como hace Goodnotes al mostrar/editar el LaTeX) para que el alumno valide lo que "leyó" la IA antes de corregir.
- Lo que muestran al alumno los competidores: solución paso a paso (Photomath), marcas perdidas y por qué (Smart Mark, RevisionDojo), LaTeX editable (Goodnotes). Una UX recomendable para Kwanta combina las tres.

### Gaps
- No encontré documentación oficial actual de Microsoft Math Solver (posiblemente descontinuado; no verificado), Google Lens "Homework", Khanmigo con imágenes, ni Notability "Learn".
- No hay evaluaciones independientes de precisión de Smart Mark o RevisionDojo; todo es autodeclarado o reseñas.
- No investigué Turnitin u otros correctores de exámenes manuscritos más allá de Gradescope (p. ej. MarkMe AI, PaperLab aparecieron en resultados pero no se revisaron).

## 5. Trade-offs de precisión/latencia/coste y riesgos (transcripciones alucinadas, unidades, cifras significativas)

### Takeaway
El riesgo principal no es tanto leer la letra como (a) que el modelo "normalice" o invente lo que el alumno no escribió (alucinación/sobrecalificación) y (b) el crédito parcial por pasos; la mitigación pasa por mostrar la transcripción al alumno, salida estructurada con evidencia por marca, confianza y revisión humana selectiva.

### Cited Findings
- Sesgo de sobrecalificación: +0,68/20 en Claude Code — [arXiv 2611.13217](https://arxiv.org/abs/2611.13217); errores con signo ligeramente positivos en soluciones imperfectas, sobre todo con notas humanas bajas — [arXiv 2605.23660](https://arxiv.org/html/2605.23660)
- Crédito parcial como principal debilidad; los modelos tratan errores procedimentales como despistes menores — [arXiv 2605.23660](https://arxiv.org/html/2605.23660)
- Diagramas/dibujos: peor rendimiento y "deriva de atención" — [arXiv 2611.13217](https://arxiv.org/abs/2611.13217); lectura errónea de figuras (dirección de una fuerza) en modelos antiguos — [arXiv 2605.23660](https://arxiv.org/html/2605.23660)
- Enrutado por confianza: precisión humana solo filtrando ~70 % a humanos — [arXiv 2510.05162](https://arxiv.org/abs/2510.05162)
- Claude puede alucinar con imágenes de baja calidad, rotadas o muy pequeñas; la compresión JPEG fuerte degrada texto — [Claude Docs: Vision](https://platform.claude.com/docs/en/build-with-claude/vision)
- Mathpix devuelve `confidence`/`confidence_rate` por petición, útil para umbrales — [Mathpix: Process Stroke Data](https://docs.mathpix.com/guides/strokes)
- Nougat alucina más en imágenes pequeñas solo-matemáticas — [GitHub texify README](https://github.com/VikParuchuri/texify)
- Recomendación de no usar batch (sesgo posicional) y de igualar la varianza humana antes de usar LLM para notas — [arXiv 2605.23660](https://arxiv.org/html/2605.23660)

### Inferences
- Comparativa orientativa (síntesis propia): Mathpix strokes ≈ 0,002 USD/expresión, baja latencia, determinista, solo transcribe; MyScript ≈ precio no público, mejor UX en vivo; LLM frontera ≈ 0,002–0,02 USD de entrada por página según modelo/resolución, latencia de segundos, transcribe y corrige; open-source ≈ coste de GPU fijo, solo transcribe.
- Unidades, notación científica y cifras significativas: no hay estudios específicos; conviene pedir al LLM que transcriba literalmente (sin corregir unidades ni redondear), marcar `[?]` en símbolos dudosos, y comprobar numéricamente las respuestas A1 en código (p. ej. parsear el valor y unidad del LaTeX y comparar con tolerancia y cifras significativas del markscheme) en lugar de confiar en el juicio del LLM.
- Como la tinta ya es vectorial, Kwanta puede renderizar a la resolución óptima exacta (sin ruido de escaneo), lo cual debería situarla por encima de los escenarios de foto/escaneo de los estudios citados.

### Gaps
- Sin datos publicados sobre tasas de alucinación en transcripción de unidades/notación científica ni sobre cifras significativas en IB.
- Sin mediciones de latencia extremo a extremo comparables entre proveedores.
