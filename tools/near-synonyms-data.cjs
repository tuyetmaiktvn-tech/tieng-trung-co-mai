const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
function loadTranslations() {
  const groups = new Map();
  let group, term;
  const content = ['near-synonyms-faithful.txt', 'near-synonyms-th3.txt'].map(file => fs.readFileSync(path.join(root, 'data', file), 'utf8')).join('\n');
  for (const [index, raw] of content.split(/\r?\n/).entries()) {
    const line = raw.trim();
    if (!line) continue;
    const fail = () => { throw Error(`Invalid translation at line ${index + 1}: ${line}`); };
    const heading = line.match(/^\[(\d+)\]$/);
    if (heading) {
      const id = Number(heading[1]);
      if (groups.has(id)) fail();
      group = {id, terms: [], notes: []}; term = null;
      groups.set(id, group);
    } else if (!group) fail();
    else if (line.startsWith('@')) {
      const [zh, pos, extra] = line.slice(1).split('|');
      if (!zh || !pos || extra || group.terms.some(t => t.zh === zh)) fail();
      term = {zh, pos, usage: [], examples: []}; group.terms.push(term);
    } else if (line.startsWith('= ')) group.notes.push(line.slice(2));
    else if (!term) fail();
    else if (line.startsWith('- ')) term.usage.push(line.slice(2));
    else {
      const [zh, vi, extra] = line.split('=>');
      if (!zh || !vi || extra || zh.includes('×') !== vi.includes('×')) fail();
      term.examples.push({zh, vi, wrong: zh.includes('×'), incomplete: zh.includes('ảnh gốc bị cắt')});
    }
  }
  const sources = JSON.parse(fs.readFileSync(path.join(root, 'data/near-synonyms-source.json'), 'utf8')).filter(s => !s.duplicate);
  if (groups.size !== sources.length) throw Error('Incomplete source coverage');
  const seen = new Set();
  for (const source of sources) {
    const key = [...source.terms].sort().join('|');
    if (seen.has(key)) throw Error('Duplicate source group: ' + key);
    seen.add(key);
    const g = groups.get(source.id);
    if (!g || g.terms.map(t => t.zh).sort().join('|') !== [...source.terms].sort().join('|')) throw Error('Source terms mismatch: ' + source.id);
    if (g.terms.some(t => !t.usage.length || !t.examples.length)) throw Error('Missing usage/examples: ' + source.id);
  }
  return sources.map(s => groups.get(s.id));
}
module.exports = {loadTranslations};
