// Read saved data safely so malformed or outdated localStorage values do not
// prevent the page from loading.
function load(key, defaultValue) {
  try {
    const saved = localStorage.getItem(key);
    return saved === null ? defaultValue : JSON.parse(saved);
  } catch {
    return defaultValue;
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
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
  } catch {
    return '';
  }
}

function renderLinks() {
  document.getElementById('links').innerHTML = links.map((link, i) => `
    <a class="tile" href="${link.url}" target="_blank" rel="noopener noreferrer">
      <img src="${getFavicon(link.url)}" alt="">
      <button class="del-link" onclick="removeLink(event, ${i})" aria-label="Remove ${link.label}">×</button>
      <span>${link.label}</span>
    </a>
  `).join('');
}

function renderTasks() {
  document.getElementById('tasks').innerHTML = tasks.map((task, i) => `
    <label class="task">
      <input type="checkbox">
      <span class="box" aria-hidden="true"></span>
      <span>${task}</span>
      <button class="del-task" onclick="removeTask(event, ${i})" aria-label="Remove task">×</button>
    </label>
  `).join('');
}

function addLink() {
  const enteredUrl = prompt('Website URL (e.g. https://example.com)');
  if (!enteredUrl) return;

  let url;
  try {
    url = new URL(/^https?:\/\//i.test(enteredUrl) ? enteredUrl : `https://${enteredUrl}`);
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

function removeLink(event, index) {
  event.preventDefault();
  event.stopPropagation();
  links.splice(index, 1);
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
  const imageUrl = URL.createObjectURL(file);
  document.body.style.backgroundImage = `url("${imageUrl}")`;
  document.body.style.backgroundSize = 'cover';
  document.body.style.backgroundPosition = 'center';
}

document.querySelectorAll('[contenteditable][data-key]').forEach((element) => {
  const key = `text-${element.dataset.key}`;
  const saved = localStorage.getItem(key);
  if (saved !== null) element.textContent = saved;

  element.addEventListener('blur', () => {
    localStorage.setItem(key, element.textContent);
  });
});

renderLinks();
renderTasks();
