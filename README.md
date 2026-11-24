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

Todo el progreso se guarda en el navegador (`localStorage`). No hay cuentas ni base de datos todavía.

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

- **Tinta vectorial:** cada trazo terminado es un trazo SVG, así que se ve nítido a cualquier zoom, como en una app de notas.
- **Baja latencia:** mientras el lápiz se mueve solo se dibuja el segmento nuevo, en un lienzo del tamaño de la pantalla cuya resolución sigue el zoom. Si el navegador lo ofrece, se dibuja también la punta predicha.
- **Barra flotante abajo,** con plumas dibujadas: estilográfica (sensible a la presión), bolígrafo, lápiz, plumón, resaltador (siempre debajo de la tinta), borrador y lazo. Hay tres colores rápidos y un panel con grosor, más colores, "dedo escribe" y "borrar hoja". Cada pluma recuerda su color y grosor.
- **Lazo:** selecciona, arrastra, borra, duplica o cambia de color.
- El dedo desplaza y hace zoom con el scroll nativo, y la palma no raya.
- `?inkdebug=1` en la URL muestra eventos por segundo, tiempo de dibujo, predicción, zoom y resolución.

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
| `NEXT_PUBLIC_PREVENTA_URL` | Link de pago de Mercado Pago para apartar lugar de fundador | El botón dice "Preventa: abre pronto" |
| `NEXT_PUBLIC_LEADS_URL` | URL `/exec` del Apps Script que guarda los registros en Google Sheets | El formulario de registro no aparece |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Correo de contacto del aviso de privacidad | Dice "nuestro correo de contacto" |

Son variables públicas: se leen al compilar, así que después de cambiarlas hay que volver a desplegar.

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
