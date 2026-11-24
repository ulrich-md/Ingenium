/**
 * Kwanta · registros del diagnóstico → Google Sheets.
 *
 * Instalar (una sola vez):
 * 1. Abre la hoja "Kwanta · Registros del diagnóstico".
 * 2. Extensiones → Apps Script. Borra lo que haya y pega este archivo completo. Guarda.
 * 3. Implementar → Nueva implementación → tipo "Aplicación web".
 *    Ejecutar como: Yo. Quién tiene acceso: Cualquier persona.
 * 4. Autoriza y copia la URL que termina en /exec.
 *    Esa URL va en Vercel como NEXT_PUBLIC_LEADS_URL.
 *
 * Cada envío agrega una fila. Las columnas se llenan por el nombre del encabezado
 * de la fila 1, así que puedes reordenarlas o agregar otras sin tocar este código.
 */
const SHEET_NAME = 'Registros';
const MAX_LEN = 200;

function clean(v) {
  let s = String(v == null ? '' : v).slice(0, MAX_LEN);
  // Evita que un valor se interprete como fórmula (=, +, -, @).
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    const data = JSON.parse(e.postData.contents || '{}');
    if (data.website) return json({ ok: true }); // trampa para bots
    if (!data.correo || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.correo)) return json({ ok: false, error: 'correo' });
    const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
    sh.appendRow(headers.map(function (h) { return h === 'fecha' ? new Date() : clean(data[h]); }));
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
