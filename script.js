const ascii = document.getElementById("ascii");
const CELL_W = 7.2;
const CELL_H = 20;
const A = "JET   ";
const B = "come fly with me   ";
const DEBRIS = ["/", "\\", "*", "+", "#", "%", ".", "|"];
const broken = new Map();
let cols = 80, rows = 24, t = 0, dirty = true;

function sizeGrid() {
  const r = ascii.getBoundingClientRect();
  cols = Math.max(30, Math.ceil(r.width / CELL_W));
  rows = Math.max(12, Math.ceil(r.height / CELL_H));
  dirty = true;
}
function sourceChar(r, c) {
  const phrase = r % 2 === 0 ? A : B;
  return phrase[(c + Math.floor(t / 8) + r * 3) % phrase.length];
}
function shatter(e) {
  const box = ascii.getBoundingClientRect();
  const cc = (e.clientX - box.left) / CELL_W;
  const rr = (e.clientY - box.top) / CELL_H;
  const now = performance.now();
  for (let r = Math.floor(rr - 3); r <= rr + 3; r++) {
    if (r < 0 || r >= rows) continue;
    for (let c = Math.floor(cc - 3); c <= cc + 3; c++) {
      if (c < 0 || c >= cols) continue;
      const dx = c - cc, dy = r - rr;
      if (dx * dx + dy * dy > 10) continue;
      broken.set(r + ":" + c, {
        ch: DEBRIS[(Math.random() * DEBRIS.length) | 0],
        until: now + 700 + Math.random() * 1300
      });
    }
  }
  dirty = true;
}
function render() {
  const now = performance.now();
  for (const [k, v] of broken) if (now >= v.until) broken.delete(k);
  let out = "";
  for (let r = 0; r < rows; r++) {
    let line = "";
    for (let c = 0; c < cols; c++) {
      const hit = broken.get(r + ":" + c);
      line += hit ? hit.ch : sourceChar(r, c);
    }
    out += line + "\n";
  }
  ascii.textContent = out;
  dirty = false;
}
function loop(now) {
  t = now / 70;
  if (dirty || (now | 0) % 80 < 18) render();
  requestAnimationFrame(loop);
}
ascii.addEventListener("mousemove", shatter);
window.addEventListener("resize", sizeGrid);
sizeGrid();
requestAnimationFrame(loop);
