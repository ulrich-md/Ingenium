/**
 * "Descargar PDF": the browser's print dialog with a print layout of the sheet or note
 * (globals.css, @media print): only the paper and its ink (vector SVG, sharp at any size),
 * A4, no toolbars. On the iPad: Share → Save to Files, or "Save as PDF" on a computer.
 * The document title becomes the file name.
 */
export function exportPdf(title?: string) {
  const prev = document.title;
  if (title) document.title = title.replace(/[\\/:*?"<>|]+/g, " ").trim() || prev;
  document.body.classList.add("printing");
  const done = () => {
    document.title = prev;
    document.body.classList.remove("printing");
    window.removeEventListener("afterprint", done);
  };
  window.addEventListener("afterprint", done);
  // let the panel close before the snapshot
  setTimeout(() => window.print(), 60);
}
