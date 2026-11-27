/** The product, shown instead of described: an exam sheet written by hand and marked
 *  with the markscheme (M1, A1 in red in the margin), like the real one in the app. */
export default function HeroSheet() {
  return (
    <div className="hsheet" aria-label="Ejemplo de hoja de examen escrita a mano y corregida con el esquema de marcas" role="img">
      <div className="paper hs-paper" aria-hidden="true">
        <div className="qh"><span><b>1.</b> [Puntuación máxima: 3]</span><span className="code">KW.F.A1.CAIDA</span></div>
        <p className="stem">Se deja caer una piedra desde el reposo a 32 m del suelo. Ignore la resistencia del aire y use g = 9,8 m s⁻².</p>
        <div className="prt">
          <span className="lb">(a)</span>
          <span>Calcule el tiempo que tarda la piedra en llegar al suelo.</span>
          <span className="mk">[2]</span>
        </div>
        <div className="abox hs-box">
          <div className="r"><span className="hw">s = ½ g t²</span><span className="hs-mark">M1 ✓</span></div>
          <div className="r"><span className="hw">t = √(2 · 32 / 9,8)</span></div>
          <div className="r"><span className="hw">t = 2,6 s</span><span className="hs-mark">A1 ✓</span></div>
        </div>
        <div className="prt">
          <span className="lb">(b)</span>
          <span>Calcule la rapidez de la piedra al llegar al suelo.</span>
          <span className="mk">[1]</span>
        </div>
        <div className="abox hs-box">
          <div className="r"><span className="hw">v = g t = 25 m s⁻¹</span><span className="hs-mark">A1 ✓</span></div>
        </div>
        <span className="tot hs-tot">3</span>
      </div>
    </div>
  );
}
