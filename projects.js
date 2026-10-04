// Renders the project list (projects.html) and a single project (project.html?id=...)
// from projects/projects.json.
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// Escaped text, with `backticks` turned into <code>
const fmt = (s) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>');
const $ = (sel) => document.querySelector(sel);
const isVideo = (src) => /\.(mp4|webm)$/i.test(src);

async function loadProjects() {
    const res = await fetch('projects/projects.json');
    if (!res.ok) throw new Error(`projects.json: ${res.status}`);
    return res.json();
}

function renderCard(p) {
    const github = (p.links || []).find((l) => l.url.includes('github.com'));
    return `
    <article class="project-card">
      <img src="${esc(p.thumb)}" alt="" loading="lazy">
      <div class="card-text">
        <h3><a class="card-link" href="project.html?id=${encodeURIComponent(p.id)}">${esc(p.title)}</a></h3>
        <div class="tech">${esc(p.tech)}</div>
        <p>${fmt(p.summary)}</p>
        ${github ? `<a class="btn" href="${esc(github.url)}" target="_blank" rel="noopener">View on GitHub</a>` : ''}
      </div>
    </article>`;
}

const renderVideo = (v, extra = '') =>
    `<video controls preload="metadata" ${v.poster ? `poster="${esc(v.poster)}"` : ''} ${extra}><source src="${esc(v.src)}"></video>`;

function renderFeatures(features) {
    let imgCount = 0;
    return features.map((f) => {
        if (!f.image) {
            return `<div class="feature-solo"><h4>${esc(f.title)}</h4><p>${fmt(f.text)}</p></div>`;
        }
        const cls = imgCount++ % 2 === 0 ? 'feature reverse' : 'feature'; // alternate sides
        return `
      <div class="${cls}">
        <div><h4>${esc(f.title)}</h4><p>${fmt(f.text)}</p></div>
        <img src="${esc(f.image)}" alt="${esc(f.title)}" loading="lazy">
      </div>`;
    }).join('');
}

const renderGallery = (items) => `
  <div class="media-grid">
    ${items.map((g) => `
      <figure>
        ${isVideo(g.src) ? renderVideo(g) : `<img src="${esc(g.src)}" alt="${esc(g.alt || g.caption)}" loading="lazy">`}
        ${g.caption ? `<figcaption>${esc(g.caption)}</figcaption>` : ''}
      </figure>`).join('')}
  </div>`;

// Tiny C#-style highlighter: comments, strings, keywords, numbers, PascalCase names
const KEYWORDS = 'public|private|protected|internal|static|virtual|override|abstract|void|bool|int|float|string|var|new|null|true|false|this|return|if|else|for|foreach|in|while|class|struct|enum|interface|namespace|using|switch|case|break|continue|readonly|const|ref|out|get|set|is|as|try|catch|finally';
const TOKEN = new RegExp(`(\\/\\/.*)|("(?:[^"\\\\]|\\\\.)*")|\\b(${KEYWORDS})\\b|\\b(\\d+\\.?\\d*f?)\\b|\\b([A-Z][A-Za-z0-9_]*)\\b`, 'g');

function highlight(code) {
    let out = '', last = 0, m;
    TOKEN.lastIndex = 0;
    while ((m = TOKEN.exec(code))) {
        const cls = m[1] ? 'c' : m[2] ? 's' : m[3] ? 'k' : m[4] ? 'n' : 't';
        out += esc(code.slice(last, m.index)) + `<span class="tok-${cls}">${esc(m[0])}</span>`;
        last = TOKEN.lastIndex;
    }
    return out + esc(code.slice(last));
}

const renderCode = (blocks) => blocks.map((b) => `
  <div class="code-block">
    <div class="code-header">
      <span class="code-title">${esc(b.title)}</span>
      <span class="code-lang">${esc(b.language || 'C#')}</span>
      <button type="button" class="copy-btn">Copy</button>
    </div>
    <pre><code>${highlight(b.lines.join('\n'))}</code></pre>
    ${b.note ? `<p class="code-note">${fmt(b.note)}</p>` : ''}
  </div>`).join('');

// Copy button (one delegated listener for every code box)
document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.copy-btn');
    if (!btn) return;
    const text = btn.closest('.code-block').querySelector('code').textContent;
    try { await navigator.clipboard.writeText(text); btn.textContent = 'Copied!'; }
    catch { btn.textContent = 'Failed'; }
    setTimeout(() => (btn.textContent = 'Copy'), 1500);
});

function renderProject(p) {
    const info = Object.entries(p.info || {})
        .map(([k, v]) => `<li><span class="label">${esc(k)}</span><span class="value">${esc(v)}</span></li>`)
        .join('');
    const links = (p.links || [])
        .map((l) => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`)
        .join('');
    const notes = (p.notes || []).map((n) => `<li>${fmt(n)}</li>`).join('');

    return `
    <a class="back" href="projects.html">Back to Projects</a>
    <div class="hero"><img src="${esc(p.hero)}" alt="${esc(p.title)}"></div>
    <div class="proj-title-block">
      <p class="proj-eyebrow">${esc(p.eyebrow)}</p>
      <h1>${esc(p.title)}</h1>
      <p class="sub">${esc(p.subtitle)}</p>
    </div>
    ${links ? `<div class="proj-links">${links}</div>` : ''}
    <div class="cols">
      <div class="col"><h4>About</h4><p>${fmt(p.about)}</p></div>
      <div class="col"><h4>Project Info</h4><ul class="meta-list">${info}</ul></div>
    </div>
    <section>
      ${p.video ? `<h3>${esc(p.video.title || 'Demo')}</h3>
        <figure class="media-slot">${renderVideo(p.video)}${p.video.caption ? `<figcaption>${esc(p.video.caption)}</figcaption>` : ''}</figure>` : ''}
      <h3>Overview</h3>
      <p class="proj-intro">${fmt(p.intro)}</p>
      ${p.features?.length ? `<h3>Features I Implemented</h3>${renderFeatures(p.features)}` : ''}
      ${p.gallery?.length ? `<h3>Gallery</h3>${renderGallery(p.gallery)}` : ''}
      ${p.code?.length ? `<h3>Code Highlights</h3>${renderCode(p.code)}` : ''}
      ${notes ? `<h3>Technical Notes</h3><ul>${notes}</ul>` : ''}
      ${p.learned ? `<h3>What I Learned</h3><p>${fmt(p.learned)}</p>` : ''}
    </section>`;
}

(async () => {
    const grid = $('#projectGrid');
    const page = $('#projectPage');
    try {
        const projects = await loadProjects();
        if (grid) grid.innerHTML = projects.map(renderCard).join('');
        if (page) {
            const id = new URLSearchParams(location.search).get('id');
            const p = projects.find((x) => x.id === id);
            if (!p) { page.innerHTML = '<a class="back" href="projects.html">Back to Projects</a><p>Project not found.</p>'; return; }
            document.title = `${p.title} — Keon Fryson`;
            page.innerHTML = renderProject(p);
        }
    } catch (err) {
        console.error(err);
        (grid || page).innerHTML = '<p>Could not load projects. If you opened this file directly, run a local server (e.g. <code>npx serve</code>).</p>';
    }
})();