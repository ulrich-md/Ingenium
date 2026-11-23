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

## Correr el proyecto

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # pruebas de la corrección y la nota
npm run build      # build de producción
```

Variable opcional: `NEXT_PUBLIC_PREVENTA_URL`, el enlace de pago de la preventa (por ejemplo, un Payment Link de Stripe). Sin ella, el botón dice "Preventa: abre pronto".

## Estructura

```
src/
  app/                 páginas: inicio (/) y diagnóstico (/diagnostico)
  components/
    ExamSheet.tsx      hoja con formato de examen (tinta, tecleada o ejemplo)
    InkLayer.tsx       motor de tinta para Apple Pencil
    SheetStep.tsx      una hoja del diagnóstico + barra de herramientas + corrección
    Diagnostico.tsx    flujo completo y resultados
    Device.tsx         detección de dispositivo y selector "Vista"
    Brand.tsx          logo y diagrama de niveles de energía
    Figures.tsx        figuras estilo examen (SVG)
  lib/
    content.ts         preguntas originales y reglas de marcas
    check.ts           corrección por renglón de respuestas tecleadas
    numbers.ts         lectura de números ("7,07 × 10⁶", "7.07e6", "7.07x10^6")
    scoring.ts         nota aproximada y plan de 12 semanas
```

Las preguntas son originales. Kwanta no está afiliado con la Organización del Bachillerato Internacional.
