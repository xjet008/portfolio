const glyphs = ["/", "-", "+", "*", " ", " ", "/"];

function paintAscii() {
  const el = document.getElementById("ascii");
  const gutter = document.getElementById("gutter");
  const cols = Math.max(40, Math.floor((window.innerWidth - 48) / 7.4));
  const rows = Math.max(48, Math.floor(document.body.scrollHeight / 22) + 8);
  let out = "";
  let nums = "";
  for (let r = 0; r < rows; r++) {
    nums += (r + 1) + "\n";
    let line = "";
    for (let c = 0; c < cols; c++) {
      const n = Math.sin(r * 0.17 + c * 0.09) + Math.cos(c * 0.05);
      if (n > 0.85) line += "/";
      else if (n > 0.55) line += "-";
      else if (n < -0.75) line += "*";
      else if ((r + c) % 37 === 0) line += "+";
      else line += " ";
    }
    out += line + "\n";
  }
  el.textContent = out;
  gutter.textContent = nums;
}

document.getElementById("theme").addEventListener("click", () => {
  document.documentElement.classList.toggle("light");
});

paintAscii();
window.addEventListener("resize", paintAscii);
setTimeout(paintAscii, 50);
