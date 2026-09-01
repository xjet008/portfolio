const ascii = document.getElementById("ascii");
const gutter = document.getElementById("gutter");
const cursor = document.getElementById("cursor");
const gib = document.getElementById("gib");
const canvas = document.getElementById("trail");
const ctx = canvas.getContext("2d");

const CELL_W = 7.25;
const CELL_H = 22;
const PHRASE_A = "JET   ";
const PHRASE_B = "come fly with me   ";
const DEBRIS = ["/", "\\", "*", "+", "#", "%", ".", ":", "|", "-"];

let mouse = { x: innerWidth / 2, y: innerHeight / 2 };
const dots = Array.from({ length: 14 }, () => ({ x: mouse.x, y: mouse.y }));
const broken = new Map();
let cols = 80;
let rows = 40;
let t = 0;
let dirty = true;

function sizeGrid() {
  cols = Math.max(48, Math.ceil(innerWidth / CELL_W) + 2);
  rows = Math.max(36, Math.ceil((innerHeight - 36) / CELL_H) + 2);
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  let nums = "";
  for (let r = 0; r < rows; r++) nums += (r + 1) + "\n";
  gutter.textContent = nums;
  dirty = true;
}

function sourceChar(r, c) {
  const phrase = r % 2 === 0 ? PHRASE_A : PHRASE_B;
  const shift = Math.floor(t / 7) + r * 4;
  return phrase[(c + shift) % phrase.length];
}

function shatterAt(clientX, clientY) {
  const x = clientX;
  const y = clientY - 36 + 0;
  const cc = x / CELL_W;
  const rr = y / CELL_H;
  const radius = 3.4;
  const now = performance.now();
  for (let r = Math.floor(rr - radius); r <= Math.ceil(rr + radius); r++) {
    if (r < 0 || r >= rows) continue;
    for (let c = Math.floor(cc - radius); c <= Math.ceil(cc + radius); c++) {
      if (c < 0 || c >= cols) continue;
      const dx = c - cc;
      const dy = r - rr;
      if (dx * dx + dy * dy > radius * radius) continue;
      const key = r + ":" + c;
      broken.set(key, {
        ch: DEBRIS[(Math.random() * DEBRIS.length) | 0],
        until: now + 700 + Math.random() * 1400
      });
    }
  }
  dirty = true;
}

function renderField() {
  const now = performance.now();
  for (const [key, cell] of broken) {
    if (now >= cell.until) broken.delete(key);
  }
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
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  dots.forEach((dot, i) => {
    const target = i === 0 ? mouse : dots[i - 1];
    dot.x += (target.x - dot.x) * (0.28 - i * 0.01);
    dot.y += (target.y - dot.y) * (0.28 - i * 0.01);
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, Math.max(1.2, 5 - i * 0.28), 0, Math.PI * 2);
    ctx.fillStyle = `rgba(190,190,190,${0.22 - i * 0.012})`;
    ctx.fill();
  });
  if (dirty || (now | 0) % 70 < 20) renderField();
  requestAnimationFrame(loop);
}

function yell() {
  gib.classList.remove("show");
  void gib.offsetWidth;
  gib.classList.add("show");
}

document.getElementById("theme").addEventListener("click", (e) => {
  e.stopPropagation();
  document.documentElement.classList.toggle("light");
});

window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  cursor.style.left = e.clientX + "px";
  cursor.style.top = e.clientY + "px";
  shatterAt(e.clientX, e.clientY);
});

window.addEventListener("mouseover", (e) => {
  cursor.classList.toggle("hot", Boolean(e.target.closest("a, button, .tilt")));
});

window.addEventListener("click", (e) => {
  if (e.target.closest("a, button")) return;
  shatterAt(e.clientX, e.clientY);
  if (Math.random() > 0.25) yell();
});

document.querySelectorAll(".tilt").forEach((el) => {
  el.addEventListener("mousemove", (e) => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `translate(${x * 8}px, ${y * 6}px)`;
  });
  el.addEventListener("mouseleave", () => {
    el.style.transform = "";
  });
});

sizeGrid();
requestAnimationFrame(loop);
window.addEventListener("resize", sizeGrid);
