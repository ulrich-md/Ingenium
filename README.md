# Kwanta

Física IB en español. Hojas de examen originales que se escriben a mano en el iPad, o se teclean en la computadora, y se corrigen con el esquema de marcas.

Este repositorio contiene el **MVP del diagnóstico gratis**.

## Qué hace cada dispositivo

| Dispositivo | Experiencia |
|---|---|
| **iPad** | Hojas de examen a mano con Apple Pencil: pluma con presión, resaltador, borrador, deshacer. El dedo desplaza la hoja (la palma no raya). |
| **Computadora** | La misma hoja de examen, tecleando un paso por renglón, con barra de símbolos (√, ×10ⁿ, Δ, λ…). La corrección es automática por renglón y las marcas quedan en el margen. |
| **Teléfono** | Repaso rápido: opción múltiple. Las preguntas de desarrollo se hacen en iPad o computadora. |

El dispositivo se detecta solo. Para probar otra vista:
- usa el selector "Vista" en la esquina inferior; o
- agrega `?modo=ipad`, `?modo=computadora` o `?modo=telefono` a la URL.

## El diagnóstico

1. **10 preguntas de opción múltiple**, 2 por unidad (A–E), como en la Prueba 1A.
2. **3 hojas de examen**, con formato de Prueba 2: A.1 Cinemática, B.3 Gases y D.1 Campos gravitatorios.
3. **Resultado:** nota proyectada (1–7) en el diagrama de niveles de energía, dominio por unidad y un plan de 12 semanas que empieza por lo más débil.

Corrección en el MVP:
- **Computadora:** corrección real por reglas. Lee números en notación científica y revisa cada punto del esquema (M1, A1).
- **iPad:** el alumno se autocorrige con el esquema y puede ver un **ejemplo de cómo corregirá la IA** (corrección simulada). La corrección con IA de la tinta es el siguiente paso.

Todo el progreso se guarda en el navegador (`localStorage`). No hay cuentas ni base de datos todavía. Como Safari borra los datos de los sitios que no se abren en 7 días:
- Kwanta se puede **instalar en la pantalla de inicio** (manifest en `src/app/manifest.ts`); instalada, Safari no borra sus datos. Inicio muestra cómo hacerlo en el iPad.
- Al entrar pide al navegador **almacenamiento persistente** (`navigator.storage.persist()`).
- En Inicio hay **Copia de seguridad**: descarga un archivo `.json` con todo y lo restaura (`src/lib/storage.ts`).
- El indicador de guardado dice la verdad: "Guardado ✓" o "No se pudo guardar".

**Zoom propio de la hoja (iPad):** como en las apps de notas, la hoja tiene su propia cámara (`src/components/Camera.tsx`): un dedo desplaza (con inercia), dos dedos hacen zoom de 100 a 400 %, el Apple Pencil escribe y la palma se ignora mientras escribe. La barra de plumas, el reloj y los paneles quedan fuera de la cámara, así que nunca crecen. Con trackpad: desplazar y pellizcar. También hay botones de zoom en el panel de la pluma y "Ver toda la hoja" mientras hay zoom.

**Hoja de tamaño fijo (iPad):** cada hoja tiene un ancho de diseño fijo (860 px los exámenes, 900 las notas) y se escala a la pantalla (`src/components/FitPage.tsx`). Así la tinta queda alineada con los recuadros en vertical, horizontal, al escribir y al corregir, y en horizontal hay más espacio para escribir. Los recuadros de respuesta ocupan casi todo el ancho.

**Fórmulas al lado de los ejercicios:** cada hoja muestra las fórmulas del cuadernillo de datos de su tema (`src/lib/formulas.ts`), en LaTeX con KaTeX, con las de ese tipo de ejercicio primero. En pantallas anchas van en una columna; en el iPad vertical, en un panel que se abre con "Fórmulas".

**Motor de tinta:** el trazo en vivo se dibuja por tramos (lo ya escrito se fija y cada fotograma solo se recalcula la punta), una vez por fotograma, y la limpieza del contorno corre en un Web Worker (`src/lib/inkWorker.ts`). Cada pluma se siente distinta: pluma caligráfica (el grosor sigue la dirección), bolígrafo parejo, lápiz de grafito y plumón grueso. La barra se puede plegar.

Mientras se escribe (hojas y notas) la app entra en **modo enfoque**: sin encabezado ni pestañas, la hoja a todo el ancho. En los mocks la barra solo tiene bolígrafo, lápiz y borrador, en negro o azul.

## Cuenta demo

- Entrar: `/entrar`
- Correo: `demo@kwanta.app`
- Contraseña: `Kwanta2027`

Abre la app ya cargada con un diagnóstico de ejemplo y una nota de clase ("Clase 12 · Órbitas y escape"). En Inicio está "Restablecer datos de ejemplo". La cuenta solo protege la app dentro del navegador: no es seguridad real. Las cuentas de alumnos llegan con la base de datos.

## Notas de clase y ejercicios

- **Plantilla de clase** (Cornell adaptada a Física IB): preguntas y palabras clave, notas, ejemplo resuelto (cuadrícula) y resumen en 3 líneas. En iPad se escribe a mano y se pueden agregar páginas; en computadora se teclea; en teléfono se lee.
- **¿Qué vieron hoy?** El alumno marca los subtemas de la clase. En computadora, Kwanta los detecta del texto de las notas.
- **Ejercicios de lo que anotaron:** 4 hojas de examen originales sobre esos subtemas, con números nuevos cada vez, corrección por marcas y solución paso a paso. Hay 14 tipos de ejercicio en A.1, A.2, A.3, B.3 y D.1 (`src/lib/generators.ts`).

## Mocks

Mock corto de Prueba 2 (NM: 6 preguntas, NS: 8) con preguntas de todos los temas y tiempo real (1,8 min por marca). En modo examen no hay pistas ni correcciones. Se entrega a mano o solo al acabarse el tiempo. En computadora se corrige automáticamente; en iPad el alumno se corrige con el esquema. Al final da la nota estimada y el desglose por tema.

## Por dónde empezar

El inicio muestra el siguiente paso del ciclo: Diagnóstico → Notas de clase → Ejercicios → Mock, con un solo botón para continuar.

## Escritura en iPad

Funciona como en las apps de notas (ver `src/lib/inkGeom.ts`):

- **Entrada:** se usan todos los puntos intermedios del Pencil (240 Hz desde iPadOS 18.2) y su predicción, que dibuja la punta un poco por delante.
- **Grosor variable:** cada pluma convierte la presión a su manera y la mezcla con la velocidad (más rápido = más delgado). La estilográfica varía mucho y el bolígrafo casi nada.
- **Trazo limpio:** perfect-freehand suaviza los puntos y construye el contorno, y `polygon-clipping` lo une consigo mismo para que no queden huecos blancos donde el trazo se cruza.
- **Vectorial:** el trazo terminado es un trazo SVG, nítido a cualquier zoom. El trazo en vivo usa el mismo contorno, así no cambia de forma al soltar el lápiz.
- **Barra de plumas:** estilográfica, bolígrafo, lápiz, plumón, resaltador (siempre debajo de la tinta), borrador y lazo, con tres colores rápidos y un panel de grosor y colores. Se arrastra desde el asa (⋮⋮) y se pega al borde más cercano: abajo, arriba, izquierda o derecha.
- **Lazo:** selecciona, arrastra, borra, duplica o cambia de color.
- El dedo desplaza y hace zoom con el scroll nativo, y la palma no raya.
- `?inkdebug=1` muestra eventos por segundo, puntos intermedios, predicción, rango de presión, zoom y resolución.

## Correr el proyecto

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # pruebas de la corrección y la nota
npm run build      # build de producción
```

## Variables de entorno (Vercel)

| Variable | Para qué | Si falta |
|---|---|---|
| `NEXT_PUBLIC_PREVENTA_URL` | Link de pago de Mercado Pago del Sprint al 7 | Los botones llevan al diagnóstico gratis o a `/precios` |
| `NEXT_PUBLIC_FUNDADOR_HASTA` | Último día del precio de fundador, como texto ("31 de enero") | No se muestra fecha de cierre |
| `NEXT_PUBLIC_LEADS_URL` | URL `/exec` del Apps Script que guarda los registros en Google Sheets | El formulario de registro no aparece |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Correo de contacto del aviso de privacidad | Dice "nuestro correo de contacto" |
| `NEXT_PUBLIC_SITE_URL` | Dirección pública del sitio, para la imagen al compartir el enlace (`/og.png`) | Usa la de producción de Vercel o `localhost` |

Son variables públicas: se leen al compilar, así que después de cambiarlas hay que volver a desplegar.

## Landing y mascota

La portada (`src/app/page.tsx`, estilos en `src/app/landing.css`) sigue el esquema de la de Duolingo: Psi y una sola frase con dos botones, una tira con las unidades A–E, cuatro ideas en zigzag, cómo funciona, las unidades, los dispositivos, una banda oscura para el Sprint al 7, preguntas frecuentes, una última llamada y un footer grande (`src/components/SiteFooter.tsx`, también en `/precios`). Los botones de las páginas públicas van en MAYÚSCULAS; los bloques aparecen al bajar (`src/components/Reveal.tsx`).

**Psi**, el gato de Kwanta (`src/components/Gato.tsx`): vive en una caja, como el gato de Schrödinger, con un ojo celeste y uno ámbar, una onda en la frente y una placa Ψ. Tiene 14 poses y 12 expresiones. Se anima por partes (`src/components/psi.css`: parpadeo, cola, respiración, saludo, salto…) y respeta "reducir movimiento". `src/components/PsiLive.tsx` le agrega que siga el puntero con los ojos y salte al tocarlo.

```bash
npm run mascota      # exporta cada pose (quieta y animada) y cada expresión a public/mascota/
npm run psi-sheet -- plantilla.html salida.html   # arma una ficha del personaje desde una plantilla
```

## Registros en Google Sheets

Al terminar el diagnóstico, el alumno puede dejar nombre, correo, WhatsApp, colegio y país. Cada envío agrega una fila a la hoja "Kwanta · Registros del diagnóstico", con su nota y su porcentaje por unidad. El script y los pasos de instalación están en `scripts/registros-apps-script.gs`.

## Estructura

```
src/
  app/                 páginas: inicio, diagnóstico, entrar, app (inicio, notas, práctica)
  components/
    ExamSheet.tsx      hoja con formato de examen (tinta, tecleada o ejemplo)
    InkLayer.tsx       motor de tinta para Apple Pencil (lazo, resaltador debajo)
    InkTools.tsx       barra de herramientas: colores, grosores, lazo
    NotesPage.tsx      notas de clase con plantilla
    PracticePage.tsx   ejercicios generados y su corrección
    MockPage.tsx       mocks cronometrados de Prueba 2
    Dashboard.tsx      inicio del alumno
    AppShell.tsx       sesión demo y navegación
    SheetStep.tsx      una hoja del diagnóstico + barra de herramientas + corrección
    Diagnostico.tsx    flujo completo y resultados
    Device.tsx         detección de dispositivo y selector "Vista"
    LeadForm.tsx       registro al final del diagnóstico (→ Google Sheets)
    Brand.tsx          logo y diagrama de niveles de energía
    Gato.tsx           Psi, la mascota: poses y expresiones (SVG)
    PsiLive.tsx        Psi animado, con ojos que siguen el puntero
    SiteFooter.tsx     footer grande de las páginas públicas
    Figures.tsx        figuras estilo examen (SVG)
  lib/
    content.ts         preguntas originales y reglas de marcas
    check.ts           corrección por renglón de respuestas tecleadas
    numbers.ts         lectura de números ("7,07 × 10⁶", "7.07e6", "7.07x10^6")
    scoring.ts         nota aproximada y plan de 12 semanas
    generators.ts      generador de ejercicios con números nuevos
    notes.ts           notas y conjuntos de práctica (en el navegador)
    session.ts         cuenta demo y datos de ejemplo
    diag.ts            estado y resultado del diagnóstico
    mocks.ts           mocks guardados en el navegador
```

Las preguntas son originales. Kwanta no está afiliado con la Organización del Bachillerato Internacional.
