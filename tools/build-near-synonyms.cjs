const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const lines = file => read(file).trimEnd().split(/\r?\n/).map(line => line.split('\t'));
const words = new Map();
for (const row of lines('data/near-synonyms-words.tsv')) {
  if (row.length !== 6 || row.some(x => !x.trim()) || words.has(row[0])) throw Error('Invalid/duplicate word: ' + row[0]);
  words.set(row[0], row);
}
const guides = new Map(lines('data/near-synonyms-comparisons.tsv').map(([id, text, note = '']) => [Number(id), {text, note}]));
const sources = JSON.parse(read('data/near-synonyms-source.json'));
const groups = sources.filter(x => !x.duplicate);
const keys = new Set();
const html = groups.map(group => {
  const key = [...group.terms].sort().join('|');
  if (keys.has(key)) throw Error('Duplicate group: ' + key);
  keys.add(key);
  const guide = guides.get(group.id);
  if (!guide?.text) throw Error('Missing translation: ' + group.id);
  const entries = group.terms.map(word => { if (!words.has(word)) throw Error('Missing word: ' + word); return words.get(word); });
  const terms = entries.map(([zh, py, vi, example, ep, ev]) => `<article class="syn-word"><h3 lang="zh">${esc(zh)}</h3><p class="syn-pinyin">${esc(py)}</p><p class="syn-meaning">${esc(vi)}</p><div class="syn-example"><h4>Ví dụ</h4><p lang="zh">${esc(example)}</p><p class="syn-pinyin">${esc(ep)}</p><p>${esc(ev)}</p></div></article>`).join('\n');
  const sourceImage = `../assets/images/near-synonyms/th4-${String(group.id).padStart(3, '0')}.jpg`;
  if (!fs.existsSync(path.join(root, 'resources', sourceImage))) throw Error('Missing source image: ' + group.id);
  return `<details class="syn-group" id="nhom-${group.id}"><summary><span class="syn-title" lang="zh">${esc(group.terms.join(' · '))}</span><span class="syn-preview">${esc(entries.map(x => x[1]).join(' · '))}</span><span class="syn-preview">${esc(entries.map(x => x[2]).join(' / '))}</span></summary><div class="syn-body"><h2>Cách phân biệt</h2><p>${esc(guide.text)}</p><div class="syn-words">${terms}</div>${guide.note ? `<aside class="syn-note"><h3>Lưu ý và cách sửa</h3><p>${esc(guide.note)}</p></aside>` : ''}<p><a href="${sourceImage}" target="_blank" rel="noopener">Xem bảng tiếng Trung gốc ↗</a></p><a class="syn-permalink" href="#nhom-${group.id}">Liên kết nhóm từ này</a></div></details>`;
}).join('\n');
if (groups.length !== 124 || guides.size !== groups.length) throw Error('Incomplete source coverage');
const main = `<main id="syn-main">
<section class="page-hero"><div class="container"><a class="text-link" href="vocabulary.html">← Về Từ vựng</a><h1>So sánh từ cận nghĩa</h1><p>124 nhóm từ · Pinyin · Giải thích và ví dụ tiếng Việt</p></div></section>
<section class="section"><div class="container syn-library"><p class="syn-intro">Chọn một nhóm để xem cách phân biệt và ví dụ minh họa. Nội dung được biên soạn từ bộ tài liệu TH4, bổ sung tiếng Việt và lưu ý cách dùng.</p>
<div class="syn-tools" hidden><label for="syn-search">Tìm chữ Hán, pinyin hoặc nghĩa tiếng Việt</label><div class="syn-search-row"><input id="syn-search" type="search" placeholder="Ví dụ: 一直, yizhi, liên tục" autocomplete="off"><button id="syn-clear" type="button">Xóa tìm kiếm</button></div><button id="syn-collapse" type="button">Thu gọn các nhóm</button><p id="syn-status" role="status" aria-live="polite">124 nhóm từ</p></div>
<p id="syn-empty" hidden>Không tìm thấy nhóm phù hợp. Hãy thử một từ ngắn hơn hoặc bỏ dấu.</p>
<div id="syn-groups">${html}</div><p class="syn-return"><a href="vocabulary.html">← Về Từ vựng</a> · <a href="#syn-main">Về đầu trang ↑</a></p></div></section>
</main>`;
const file = 'resources/so-sanh-tu-can-nghia.html';
let page = read(file).replace(/<main[\s\S]*?<\/main>/, main);
if (!page.includes('near-synonyms.css')) page = page.replace('</head>', '<link rel="stylesheet" href="../assets/css/near-synonyms.css?v=1">\n</head>');
if (!page.includes('near-synonyms.js')) page = page.replace('</body>', '<script src="../assets/js/near-synonyms.js?v=1"></script>\n</body>');
fs.writeFileSync(path.join(root, file), page);
console.log(`Built ${groups.length} groups, ${words.size} unique words; skipped ${sources.length - groups.length} duplicate image.`);
