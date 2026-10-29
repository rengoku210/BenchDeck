function load(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v === null ? fallback : JSON.parse(v);
  } catch {
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

let links = load('links', [
  { url: 'https://github.com', label: 'GitHub' },
  { url: 'https://developer.mozilla.org', label: 'MDN' },
  { url: 'https://pinout.xyz', label: 'Pinouts' },
  { url: 'https://octopart.com', label: 'Parts' },
  { url: 'https://falstad.com/circuit/', label: 'Circuit' }
]);

let tasks = load('tasks', [
  'Review pull requests & commit log',
  'Verify schematic voltages & pinouts',
  'Test prototype on bench supply',
  'Update lab notes & datasheets'
]);

function getFavicon(url) {
  try {
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(new URL(url).hostname)}&sz=64`;
  } catch { return ''; }
}

function renderLinks() {
  document.getElementById('links').innerHTML = links.map((link, i) => `
    <a class="tile" href="${link.url}" target="_blank" rel="noopener noreferrer">
      <img src="${getFavicon(link.url)}" alt="">
      <button class="del-link" onclick="removeLink(event, ${i})" aria-label="Remove ${link.label}">&times;</button>
      <span>${link.label}</span>
    </a>
  `).join('');
}

function renderTasks() {
  const el = document.getElementById('tasks');
  el.innerHTML = tasks.map((t, i) =>
    `<label class="task">
      <input type="checkbox">
      <span class="box" aria-hidden="true"></span>
      <span>${t}</span>
      <button class="del-task" onclick="removeTask(event, ${i})" aria-label="Remove task">&times;</button>
    </label>`
  ).join('');
}

function addLink() {
  const raw = prompt('Website URL (e.g. https://example.com)');
  if (!raw) return;

  let url;
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    if (!['http:', 'https:'].includes(url.protocol)) return;
  } catch {
    alert('Please enter a valid website URL.');
    return;
  }

  const label = prompt('Short label for this link') || url.hostname;
  links.push({ url: url.href, label: label.trim() || url.hostname });
  save('links', links);
  renderLinks();
}

function removeLink(e, idx) {
  e.preventDefault();
  e.stopPropagation();
  links.splice(idx, 1);
  save('links', links);
  renderLinks();
}

function addTask() {
  const text = prompt('New task:');
  if (!text || !text.trim()) return;
  tasks.push(text.trim());
  save('tasks', tasks);
  renderTasks();
}

function removeTask(event, index) {
  event.preventDefault();
  event.stopPropagation();
  tasks.splice(index, 1);
  save('tasks', tasks);
  renderTasks();
}

function loadBg(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  const src = URL.createObjectURL(file);
  document.body.style.backgroundImage = `url("${src}")`;
  document.body.style.backgroundSize = 'cover';
  document.body.style.backgroundPosition = 'center';
}

// persist editable fields across reloads
document.querySelectorAll('[contenteditable][data-key]').forEach((el) => {
  const key = `text-${el.dataset.key}`;
  const saved = localStorage.getItem(key);
  if (saved !== null) el.textContent = saved;
  el.addEventListener('blur', () => localStorage.setItem(key, el.textContent));
});

const noteBox = document.getElementById('notes');
noteBox.value = load('notes', '');
noteBox.addEventListener('input', () => save('notes', noteBox.value));

function clearNotes() {
  noteBox.value = '';
  save('notes', '');
}

renderLinks();
renderTasks();
