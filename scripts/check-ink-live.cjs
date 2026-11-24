// Regression check: while the Pencil moves, the live ink must be under the tip (not offset).
// Run with the app on :3123 (npm run build && npx next start -p 3123), then: node scripts/check-ink-live.cjs
const { chromium, devices } = require('playwright');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ ...devices['iPad Pro 11 landscape'] }); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:3123/entrar'); await p.fill('#login-correo', 'demo@kwanta.app'); await p.fill('#login-contrasena', 'Kwanta2027');
  await p.getByRole('button', { name: 'Entrar' }).last().click(); await p.waitForURL(/\/app$/);
  await p.goto('http://localhost:3123/app/notas?id=demo-orbitas&inkdebug=1'); await p.waitForSelector('.inklayer');
  for (const scroll of [0, 400, 900]) {
    await p.evaluate((y) => window.scrollTo(0, y), scroll); await p.waitForTimeout(200);
    const r = await p.evaluate(() => {
      const el = document.querySelector('.inklayer'); const rr = el.getBoundingClientRect();
      const f = (t, x, y) => el.dispatchEvent(new PointerEvent(t, { bubbles: true, cancelable: true, pointerId: 6, pointerType: 'pen', clientX: x, clientY: y, pressure: 0.5, buttons: t === 'pointerup' ? 0 : 1 }));
      const x0 = rr.left + 300, y0 = Math.max(rr.top + 40, 450);
      f('pointerdown', x0, y0); for (let i = 1; i <= 30; i++) f('pointermove', x0 + i * 4, y0);
      const live = el.querySelectorAll('canvas.vp')[1]; const lr = live.getBoundingClientRect(); const k = live.width / lr.width;
      const px = live.getContext('2d').getImageData(Math.round((x0 + 60 - lr.left) * k), Math.round((y0 - lr.top) * k), 1, 1).data;
      const out = { liveAt: [Math.round(lr.left), Math.round(lr.top)], inkUnderPencil: px[3] > 0 };
      f('pointerup', x0 + 120, y0);
      out.liveClearedAfterLift = live.getContext('2d').getImageData(Math.round((x0 + 60 - lr.left) * k), Math.round((y0 - lr.top) * k), 1, 1).data[3] === 0;
      const svg = el.querySelectorAll('svg.inksvg')[1];
      out.committedAsVector = svg.querySelectorAll('path').length > 0;
      return out;
    });
    console.log('scroll', scroll, JSON.stringify(r));
  }
  await p.waitForTimeout(600);
  console.log('debug overlay:', await p.locator('.inkdebug').textContent());
  console.log('errors', errs); await b.close();
})();
