const ascii = document.getElementById("ascii");
const gutter = document.getElementById("gutter");
const cursor = document.getElementById("cursor");
const gib = document.getElementById("gib");
const CELL_W = 7.3;
const CELL_H = 20;
const A = "JET";
const B = "come fly with me";
const DEBRIS = ["/", "\\", "*", "+", "-", "#"];
const broken = new Map();
let cols = 80, rows = 50, t = 0, dirty = true;

function sizeGrid() {
  const main = document.querySelector(".main");
  const w = main.clientWidth;
  const h = Math.max(main.scrollHeight, innerHeight - 34);
  cols = Math.max(60, Math.ceil(w / CELL_W) + 2);
  rows = Math.max(48, Math.ceil(h / CELL_H) + 4);
  let nums = "";
  for (let r = 0; r < rows; r++) nums += (r + 1) + "\n";
  gutter.textContent = nums;
  dirty = true;
}

function glyph(r, c) {
  const shift = Math.floor(t / 9) + r * 2;
  const band = r % 11;
  if (band === 1 || band === 6) {
    const phrase = band === 1 ? A : B;
    const i = (c + shift) % (phrase.length + 18);
    return i < phrase.length ? phrase[i] : (c % 17 === 0 ? "/" : " ");
  }
  if (c % 23 === (r * 3) % 23) return "/";
  if (band === 3 && c % 2 === 0 && c < cols * 0.55) return "-";
  if (band === 8 && c % 2 === 0 && c > cols * 0.2 && c < cols * 0.7) return "*";
  return " ";
}

function shatter(x, y) {
  const main = document.querySelector(".main").getBoundingClientRect();
  const cc = (x - main.left) / CELL_W;
  const rr = (y - main.top + document.querySelector(".main").scrollTop) / CELL_H;
  const now = performance.now();
  const radius = 3.2;
  for (let r = Math.floor(rr - radius); r <= rr + radius; r++) {
    if (r < 0 || r >= rows) continue;
    for (let c = Math.floor(cc - radius); c <= cc + radius; c++) {
      if (c < 0 || c >= cols) continue;
      const dx = c - cc, dy = r - rr;
      if (dx * dx + dy * dy > radius * radius) continue;
      broken.set(r + ":" + c, {
        ch: DEBRIS[(Math.random() * DEBRIS.length) | 0],
        until: now + 600 + Math.random() * 1300
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
      line += hit ? hit.ch : glyph(r, c);
    }
    out += line + "\n";
  }
  ascii.textContent = out;
  dirty = false;
}

function loop(now) {
  t = now / 80;
  if (dirty || ((now / 80) | 0) !== (((now - 16) / 80) | 0)) render();
  requestAnimationFrame(loop);
}

document.getElementById("theme").addEventListener("click", (e) => {
  e.stopPropagation();
  document.documentElement.classList.toggle("light");
});
window.addEventListener("mousemove", (e) => {
  cursor.style.left = e.clientX + "px";
  cursor.style.top = e.clientY + "px";
  shatter(e.clientX, e.clientY);
});
window.addEventListener("click", (e) => {
  if (e.target.closest("a,button")) return;
  shatter(e.clientX, e.clientY);
  if (Math.random() > 0.3) {
    gib.classList.remove("show");
    void gib.offsetWidth;
    gib.classList.add("show");
  }
});
sizeGrid();
requestAnimationFrame(loop);
window.addEventListener("resize", sizeGrid);
