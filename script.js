const ascii = document.getElementById("ascii");
const gutter = document.getElementById("gutter");
const cursor = document.getElementById("cursor");
const gib = document.getElementById("gib");
const canvas = document.getElementById("trail");
const ctx = canvas.getContext("2d");

let mouse = { x: innerWidth / 2, y: innerHeight / 2 };
const dots = Array.from({ length: 14 }, () => ({ x: mouse.x, y: mouse.y }));

function sizeCanvas() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}

function paintAscii(mx = 0, my = 0) {
  const cols = Math.max(40, Math.floor((innerWidth - 48) / 7.4));
  const rows = Math.max(52, Math.floor(document.body.scrollHeight / 22) + 6);
  const cx = mx / 7.4;
  const cy = (my + scrollY) / 22;
  let out = "";
  let nums = "";
  for (let r = 0; r < rows; r++) {
    nums += (r + 1) + "\n";
    let line = "";
    for (let c = 0; c < cols; c++) {
      const dx = c - cx;
      const dy = r - cy;
      const d = Math.sqrt(dx * dx + dy * dy);
      const n = Math.sin(r * 0.17 + c * 0.09) + Math.cos(c * 0.05) + (18 / (d + 2));
      if (d < 6) line += ["/", "*", "+"][(r + c) % 3];
      else if (n > 0.9) line += "/";
      else if (n > 0.55) line += "-";
      else if (n < -0.7) line += "*";
      else if ((r + c) % 37 === 0) line += "+";
      else line += " ";
    }
    out += line + "\n";
  }
  ascii.textContent = out;
  gutter.textContent = nums;
}

function loop() {
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
  paintAscii(e.clientX - 48, e.clientY);
});

window.addEventListener("mouseover", (e) => {
  cursor.classList.toggle("hot", Boolean(e.target.closest("a, button, .tilt")));
});

window.addEventListener("click", (e) => {
  if (e.target.closest("a, button")) return;
  if (Math.random() > 0.35) yell();
});

document.querySelectorAll(".tilt").forEach((el) => {
  el.addEventListener("mousemove", (e) => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `translate(${x * 8}px, ${y * 6}px)` ;
  });
  el.addEventListener("mouseleave", () => {
    el.style.transform = "";
  });
});

sizeCanvas();
paintAscii();
loop();
window.addEventListener("resize", () => { sizeCanvas(); paintAscii(); });
window.addEventListener("scroll", () => paintAscii(mouse.x - 48, mouse.y));
