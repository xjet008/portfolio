const terminal = document.getElementById('terminal');
const gutter = document.getElementById('gutter');
const progress = document.getElementById('progress');
const tabs = [...document.querySelectorAll('.tab')];
const cursor = document.getElementById('cursor');
let blocks = [];
let rendered = 0;
let ticking = false;

function parseJetFile(source) {
  return source.trim().split(/(?=^jet@portfolio:~\$)/m).filter(Boolean).map((block) => {
    const lines = block.trim().split('\n');
    const command = lines.shift().trim();
    return { command, body: lines.join('\n').trim() };
  });
}

function renderBlock(block, index) {
  const section = document.createElement('article');
  section.className = 'command-block';
  section.id = index === 0 ? 'whoami' : index === 6 ? 'story' : index === 14 ? 'school' : `command-${index}`;
  const command = document.createElement('div');
  command.className = 'command';
  command.innerHTML = `<span class="prompt-mark">jet@portfolio:~$</span> <span>${escapeHtml(block.command.replace('jet@portfolio:~$ ', ''))}</span>`;
  const output = document.createElement('pre');
  output.className = 'output';
  output.textContent = block.body;
  section.append(command, output);
  terminal.appendChild(section);
}

function escapeHtml(value) { return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[char]); }

function executeTo(target) {
  const next = Math.min(blocks.length, Math.max(0, target));
  while (rendered < next) renderBlock(blocks[rendered], rendered++);
  progress.textContent = `${Math.round((rendered / blocks.length) * 100)}%`;
}

function updateFromScroll() {
  const shell = document.querySelector('.terminal-shell');
  const available = shell.offsetHeight - innerHeight * 0.62;
  const passed = Math.max(0, window.scrollY - shell.offsetTop + innerHeight * 0.25);
  executeTo(Math.ceil((passed / Math.max(1, available)) * blocks.length));
  const active = [...document.querySelectorAll('.command-block')].reverse().find((el) => el.getBoundingClientRect().top < 150);
  if (active) tabs.forEach((tab) => tab.classList.toggle('on', tab.getAttribute('href') === `#${active.id}`));
  ticking = false;
}

window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(updateFromScroll); ticking = true; } }, { passive: true });
tabs.forEach((tab) => tab.addEventListener('click', (event) => { event.preventDefault(); document.getElementById(tab.hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }));
document.getElementById('theme').addEventListener('click', () => document.documentElement.classList.toggle('light'));
window.addEventListener('mousemove', (event) => { cursor.style.left = `${event.clientX}px`; cursor.style.top = `${event.clientY}px`; });
window.addEventListener('resize', () => { gutter.textContent = Array.from({ length: Math.ceil(document.body.scrollHeight / 24) }, (_, i) => String(i + 1).padStart(3, '0')).join('\n'); });

fetch('jet.txt').then((response) => response.text()).then((source) => { blocks = parseJetFile(source); updateFromScroll(); window.dispatchEvent(new Event('resize')); }).catch(() => { terminal.textContent = 'Unable to load jet.txt'; });
