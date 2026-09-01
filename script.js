const ascii = document.getElementById("ascii");
const gutter = document.getElementById("gutter");
const cursor = document.getElementById("cursor");
const toast = document.getElementById("toast");
const dim = document.getElementById("dim");
const whoEgg = document.getElementById("whoEgg");
const CELL_W = 7.3;
const CELL_H = 20;
const A = "JET";
const B = "come fly with me";
const DEBRIS = ["/", "\\", "*", "+", "-", "#"];
const broken = new Map();
const tabs = [...document.querySelectorAll(".tab")];
const sections = ["who", "story", "school"].map((id) => document.getElementById(id));
const whoTitle = document.getElementById("who-title");
const whoSecret = document.getElementById("who-secret");
let cols = 80, rows = 50, t = 0, dirty = true;
let toastTimer;
let whoSecretTimer;
let whoClicks = [];

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
  const box = document.querySelector(".main").getBoundingClientRect();
  const cc = (x - box.left) / CELL_W;
  const rr = (y - box.top) / CELL_H;
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

function asCode(html) {
  const hold = document.createElement("div");
  hold.innerHTML = html;
  const plain = hold.textContent.trim();
  const width = Math.max(plain.length + 8, 26);
  const bar = "+" + "-".repeat(width) + "+";
  const gap = " ".repeat(Math.max(0, width - plain.length - 6));
  return (
    "<pre>" +
    bar + "\n" +
    "| // " + html + gap + "|\n" +
    bar +
    "</pre>"
  );
}

function popup(html) {
  toast.innerHTML = asCode(html);
  toast.classList.remove("show");
  void toast.offsetWidth;
  toast.classList.add("show");
  dim.classList.add("on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
    dim.classList.remove("on");
  }, 1000);
}

function setTab(id) {
  tabs.forEach((tab) => tab.classList.toggle("on", tab.getAttribute("href") === "#" + id));
}

tabs.forEach((tab) => {
  tab.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const id = tab.getAttribute("href").slice(1);
    const el = document.getElementById(id);
    if (!el) return;
    setTab(id);
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 52, behavior: "smooth" });
  });
});

window.addEventListener("scroll", () => {
  const y = window.scrollY + 80;
  let current = "who";
  sections.forEach((sec) => {
    if (sec && sec.offsetTop <= y) current = sec.id;
  });
  setTab(current);
}, { passive: true });

document.querySelectorAll(".prompt").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    popup(btn.dataset.html || btn.dataset.msg);
  });
});

document.getElementById("theme").addEventListener("click", (e) => {
  e.stopPropagation();
  document.documentElement.classList.toggle("light");
});

if (whoEgg) {
  whoEgg.addEventListener("click", (e) => {
    e.stopPropagation();
    popup("Jet.exe unlocked");
  });
}

window.addEventListener("mousemove", (e) => {
  cursor.style.left = e.clientX + "px";
  cursor.style.top = e.clientY + "px";
  shatter(e.clientX, e.clientY);
});

window.addEventListener("click", (e) => {
  if (e.target.closest("a,button,.toast,#whoEgg")) return;
  shatter(e.clientX, e.clientY);
  popup("Come Fly With Me");
});

if (whoTitle && whoSecret) {
  const triggerWhoEgg = () => {
    whoTitle.classList.remove("jet-nudge");
    void whoTitle.offsetWidth;
    whoTitle.classList.add("jet-nudge");
    whoSecret.classList.add("on");
    clearTimeout(whoSecretTimer);
    whoSecretTimer = setTimeout(() => {
      whoSecret.classList.remove("on");
    }, 2200);
  };

  whoTitle.addEventListener("click", (e) => {
    e.stopPropagation();
    const now = performance.now();
    whoClicks = whoClicks.filter((ts) => now - ts < 1500);
    whoClicks.push(now);
    if (whoClicks.length >= 3) {
      whoClicks = [];
      triggerWhoEgg();
    }
  });

  whoTitle.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      whoTitle.click();
    }
  });
}

sizeGrid();
requestAnimationFrame(loop);
window.addEventListener("resize", sizeGrid);
