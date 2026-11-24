# Auditoría UX · pantallas de escritura de Kwanta

**Público:** alumnos de IB de 16 a 18 años, que estudian solos en iPad (con Apple Pencil) o en computadora.
**Revisado:** Inicio, Nota de clase, Hoja de examen (diagnóstico, práctica y mock), en iPad Pro 11 horizontal y vertical.
**Principio rector:** mientras el alumno escribe, **la hoja es lo único que importa**. Todo lo demás (configurar, navegar, leer instrucciones) va antes o después, nunca al lado.

---

## Hallazgos y estado

| # | Hallazgo | Gravedad | Estado |
|---|---|---|---|
| 1 | **Panel lateral mientras se escribe.** Ocupaba ~27 % del ancho en horizontal, achicaba la hoja y repetía lo que la hoja ya dice (tema, título, prueba). En notas mezclaba formulario, temas, botón principal y "Borrar nota". | Crítica | ✅ Arreglado: modo enfoque, la hoja ocupa todo el ancho (máx. 980 px, centrada). |
| 2 | **Pestañas de la app visibles al escribir y en el mock.** Cinco salidas a un toque: invitan a irse y rompen el realismo del examen. | Alta | ✅ Se ocultan cuando la barra de plumas está activa. Cada pantalla conserva su salida propia (← Notas, Volver, Salir, Entregar). |
| 3 | **Instrucciones largas repetidas en cada pregunta.** El mismo párrafo de cuatro líneas en cada hoja; a la tercera ya nadie lo lee. | Media | ✅ Una línea con "Entendido", que no vuelve a salir. |
| 4 | **Navegación del mock tapada.** "Siguiente pregunta" quedaba detrás de la barra de plumas; el reloj se encimaba a la barra en vertical. | Alta | ✅ Anterior/Siguiente arriba de la hoja; el reloj sube por encima de la barra. |
| 5 | **"Borrar nota" junto al botón principal**, con el mismo peso visual. | Media | ✅ Separado, al final, en rojo y con confirmación. |
| 6 | **Configuración de la nota siempre a la vista** (título, tema, temas vistos). | Media | ✅ Pasa a un panel que se abre con un botón cuyo texto guía el siguiente paso: "Ponle título y tema" → "Tema y ejercicios" → "Crear ejercicios (2 temas)". |
| 7 | **Corrección en iPad vertical.** Al pulsar "Terminar y corregir", el panel de marcas cae debajo de la hoja: hay que bajar hasta el final y volver a subir para comparar. | Alta | ✅ En pantallas angostas el esquema es un panel desde abajo que se oculta para ver la hoja; la barra de plumas se aparta al corregir. |
| 8 | **Demasiadas plumas en modo examen.** Siete herramientas y tres colores. En el examen IB se escribe con tinta negra o azul; elegir pluma es una decisión que no aporta nada. | Media | ✅ En mocks: bolígrafo, lápiz y borrador, en negro o azul. En notas, la barra completa. |
| 9 | **Encabezado alto.** Logo + título de paso + barra de progreso + aviso ≈ 20–25 % de la altura en horizontal. | Media | ✅ En modo enfoque se ocultan el encabezado del sitio y las pestañas. |
| 10 | **"Se guarda solo" es texto fijo.** No confirma nada. Además, Safari borra localStorage a los 7 días sin visitas (ver informe de investigación). | Alta (confianza) | ✅ Indicador real, invitación a instalar, almacenamiento persistente y copia de seguridad en Inicio. |
| 11 | **Etiquetas en mayúsculas monoespaciadas y naranjas** en todas partes (secciones, pasos, eyebrows). Compiten con el contenido, y el naranja se usa a la vez para marca y para alertas. | Baja | Pendiente: dejar el naranja solo para alertas y reloj; etiquetas en gris. |
| 12 | **Indicador "N" de Next.js** abajo a la izquierda, encima de la zona de la barra. | Baja (solo desarrollo) | ✅ Desactivado. |
| 13 | **Inicio:** la tarjeta "Tu siguiente paso" es muy buena (una sola acción clara). El chip "iPad" arriba a la derecha no le dice nada al alumno (✅ quitado). "Mocks" es jerga en inglés: en LatAm se entiende, pero "Simulacros" es más claro para los papás. | Baja | Pendiente. |
| 14 | **Zoom.** Ya no agranda la barra, pero el zoom sigue siendo el del navegador: sin límites, sin ventana de zoom y con doble toque accidental. | Media | Pendiente: cámara propia de la hoja (ver informe de investigación, recomendación de construir). |

## Lo que ya está bien

- Áreas táctiles de 44 px o más; chips y botones fáciles de tocar con el dedo.
- La hoja parece de examen de verdad (puntuación, [marcas], recuadros): eso entrena el formato real.
- La barra de plumas se puede anclar a cualquier borde y recuerda su posición.
- Un solo botón principal por pantalla en casi todos los casos.

## Próximos pasos sugeridos (en orden)

1. Corrección en iPad vertical (#7): es el momento de más aprendizaje y hoy es incómodo.
2. Barra reducida en modo examen (#8).
3. Indicador de guardado e instalación en pantalla de inicio (#10).
4. Encabezado compacto en modo enfoque (#9).
