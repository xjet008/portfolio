const ascii = document.getElementById("ascii");
const gutter = document.getElementById("gutter");
const cursor = document.getElementById("cursor");
const toast = document.getElementById("toast");
const dim = document.getElementById("dim");
const CELL_W = 7.3;
const CELL_H = 20;
const A = "JET";
const B = "come fly with me";
const DEBRIS = ["/", "\\", "*", "+", "-", "#"];
const broken = new Map();
const tabs = [...document.querySelectorAll(".tab")];
const yearChips = [...document.querySelectorAll(".year-chip")];
const sections = ["who", "story", "school", "currently", "wallets"].map((id) => document.getElementById(id));
const whoTitle = document.getElementById("who-title");
const jetTrigger = document.getElementById("jet-trigger");
const dontClick = document.getElementById("dont-click");
let clickRound = 0;
const clickMessages = [
  "▶ DON'T CLICK",
  "▶ I SAID DON'T CLICK",
  "▶ BRO, STOP.",
  "▶ WHY ARE YOU STILL CLICKING?",
  "▶ LAST WARNING.",
  "▶ OK FINE. FOLLOW ME ON X →"
];
let cols = 80, rows = 50, t = 0, dirty = true;
let toastTimer;

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
  return "<pre>" + html + "</pre>";
}

function popup(html, duration = 1000) {
  toast.style.setProperty("--popup-duration", duration + "ms");
  toast.innerHTML = asCode(html);
  toast.classList.remove("show");
  void toast.offsetWidth;
  toast.classList.add("show");
  dim.classList.add("on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
    dim.classList.remove("on");
  }, duration);
}

function setTab(id) {
  tabs.forEach((tab) => tab.classList.toggle("on", tab.getAttribute("href") === "#" + id));
}

function setActiveYearChip(year) {
  yearChips.forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.year === year);
  });
}

// Tab navigation with smooth scroll
tabs.forEach((tab) => {
  tab.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const id = tab.getAttribute("href").slice(1);
    const el = document.getElementById(id);
    if (!el) return;
    setTab(id);
    setActiveYearChip(null);
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 52, behavior: "smooth" });
  });
});

// Year chip navigation
yearChips.forEach((chip) => {
  chip.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const year = chip.dataset.year;
    // 2023 and 2024 share one story entry, so both chips target that entry.
    const targetYear = year === "2024" ? "2023" : year;
    const yearElement = document.getElementById(`y-${targetYear}`);
    if (!yearElement) return;
    
    // Play subtle feedback
    popup(`${year} — time travel in progress`, 800);
    
    // Set story tab as active
    setTab("story");
    
    // Smooth scroll to year section
    window.scrollTo({ 
      top: yearElement.getBoundingClientRect().top + window.scrollY - 52, 
      behavior: "smooth" 
    });
    
    // Update active chip
    setActiveYearChip(year);
  });
});

// Scroll event to update active tab and year chip
window.addEventListener("scroll", () => {
  const y = window.scrollY + 80;
  let current = "who";
  sections.forEach((sec) => {
    if (sec && sec.offsetTop <= y) current = sec.id;
  });
  
  setTab(current);
  // Year selection is explicit: scrolling or switching sections must not
  // resurrect an old year highlight.
  if (current !== "story") setActiveYearChip(null);
}, { passive: true });

// Don't-click button: fade out, wait, then return with the next message.
dontClick.addEventListener("click", (e) => {
  e.stopPropagation();

  if (clickRound === clickMessages.length - 1) {
    window.open("https://x.com/xjet008", "_blank", "noopener,noreferrer");
    return;
  }

  clickRound += 1;
  dontClick.classList.add("is-gone");
  window.setTimeout(() => {
    dontClick.textContent = clickMessages[clickRound];
    dontClick.classList.remove("is-gone");
  }, 2000);
});

// Jet popup
jetTrigger.addEventListener("click", (e) => {
  e.stopPropagation();
  popup("Please don't touch me :)" , 2200);
});

// Prompt buttons
document.querySelectorAll(".prompt").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    popup(btn.dataset.html || btn.dataset.msg, Number(btn.dataset.duration) || 1000);
  });
});

// Theme toggle
document.getElementById("theme").addEventListener("click", (e) => {
  e.stopPropagation();
  document.documentElement.classList.toggle("light");
});

// Cursor tracking and shattering
window.addEventListener("mousemove", (e) => {
  cursor.style.left = e.clientX + "px";
  cursor.style.top = e.clientY + "px";
  shatter(e.clientX, e.clientY);
});

window.addEventListener("click", (e) => {
  if (e.target.closest("a,button,.toast")) return;
  shatter(e.clientX, e.clientY);
});

// Initialize
sizeGrid();
requestAnimationFrame(loop);
window.addEventListener("resize", sizeGrid);
