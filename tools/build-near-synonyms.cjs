const fs = require('node:fs');
const path = require('node:path');
const {loadTranslations} = require('./near-synonyms-data.cjs');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Share only pronunciation and the short gloss. Every usage and example is
// specific to its source table, including words appearing in multiple groups.
const words = new Map(read('data/near-synonyms-words.tsv').trimEnd().split(/\r?\n/).map(line => {
  const [zh, py, vi] = line.split('\t');
  if (!zh || !py || !vi) throw Error('Missing word header');
  return [zh, {py, vi}];
}));
const groups = loadTranslations();
const html = groups.map(group => {
  const entries = group.terms.map(term => {
    if (!words.has(term.zh)) throw Error('Missing word: ' + term.zh);
    return {...term, ...words.get(term.zh)};
  });
  const cards = entries.map(term => `<article class="syn-word">
<h3 lang="zh">${esc(term.zh)}</h3><p class="syn-pinyin">${esc(term.py)}</p><p class="syn-meaning">${esc(term.vi)}</p><p class="syn-pos">${esc(term.pos)}</p>
<section class="syn-usage"><h4>Nghĩa và cách dùng</h4><ul>${term.usage.map(item => `<li${item.includes('×') ? ' class="syn-incorrect"' : ''}>${esc(item)}</li>`).join('')}</ul></section>
<section class="syn-examples"><h4>Ví dụ trong tài liệu</h4><ol>${term.examples.map(example => `<li class="syn-example${example.wrong ? ' syn-incorrect' : ''}${example.incomplete ? ' syn-incomplete' : ''}">${example.wrong ? '<span class="syn-badge">× Cách dùng sai trong tài liệu</span>' : ''}<p lang="zh">${esc(example.zh)}</p><p class="syn-translation">${esc(example.vi)}</p></li>`).join('\n')}</ol></section>
</article>`).join('\n');
  return `<details class="syn-group" id="nhom-${group.id}"><summary><span class="syn-title" lang="zh">${esc(entries.map(t => t.zh).join(' · '))}</span><span class="syn-preview">${esc(entries.map(t => t.py).join(' · '))}</span><span class="syn-preview">${esc(entries.map(t => t.vi).join(' / '))}</span></summary><div class="syn-body"><div class="syn-words">${cards}</div>${group.notes.length ? `<aside class="syn-note"><h3>Đối chiếu thêm trong tài liệu</h3>${group.notes.map(note => `<p>${esc(note)}</p>`).join('')}</aside>` : ''}<a class="syn-permalink" href="#nhom-${group.id}">Liên kết nhóm từ này</a></div></details>`;
}).join('\n');
const main = `<main id="syn-main">
<section class="page-hero"><div class="container"><a class="text-link" href="vocabulary.html">← Về Từ vựng</a><h1>So sánh từ cận nghĩa</h1><p>124 nhóm từ · Pinyin · Nghĩa, cách dùng và ví dụ tiếng Việt</p></div></section>
<section class="section"><div class="container syn-library"><p class="syn-intro">Chọn nhóm từ để đọc bản dịch nghĩa, cách dùng và các ví dụ từ tài liệu TH4. Dấu × được giữ theo tài liệu gốc; bản dịch bên dưới giúp hiểu ý của câu.</p>
<div class="syn-tools" hidden><label for="syn-search">Tìm chữ Hán, pinyin hoặc nghĩa tiếng Việt</label><div class="syn-search-row"><input id="syn-search" type="search" placeholder="Ví dụ: 一直, yizhi, liên tục" autocomplete="off"><button id="syn-clear" type="button">Xóa tìm kiếm</button></div><button id="syn-collapse" type="button">Thu gọn các nhóm</button><p id="syn-status" role="status" aria-live="polite">124 nhóm từ</p></div>
<p id="syn-empty" hidden>Không tìm thấy nhóm phù hợp. Hãy thử một từ ngắn hơn hoặc bỏ dấu.</p>
<div id="syn-groups">${html}</div><p class="syn-return"><a href="vocabulary.html">← Về Từ vựng</a> · <a href="#syn-main">Về đầu trang ↑</a></p></div></section>
</main>`;
const file = 'resources/so-sanh-tu-can-nghia.html';
let page = read(file).replace(/<main[\s\S]*?<\/main>/, main);
page = page.replace(/near-synonyms\.css\?v=\d+/g, 'near-synonyms.css?v=3');
fs.writeFileSync(path.join(root, file), page);
const examples = groups.flatMap(g => g.terms).flatMap(t => t.examples);
console.log(`Built ${groups.length} source tables, ${examples.length} translated examples, ${examples.filter(e => e.wrong).length} source-marked incorrect examples.`);
