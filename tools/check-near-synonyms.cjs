const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const page = fs.readFileSync(path.join(root, 'resources/so-sanh-tu-can-nghia.html'), 'utf8');
const sources = JSON.parse(fs.readFileSync(path.join(root, 'data/near-synonyms-source.json'), 'utf8'));
const translations = require('./near-synonyms-data.cjs').loadTranslations();
const decode = text => text.replace(/<[^>]*>/g, ' ').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const groups = [...page.matchAll(/<details class="syn-group" id="([^"]+)">([\s\S]*?)<\/details>/g)].map(m => ({id:m[1],textContent:decode(m[2]),hidden:false,open:false,classList:{contains: x => x === 'syn-group'},scrollIntoView(){this.scrolled=true;}}));
assert.equal(groups.length,171);
const bai4Imports = JSON.parse(fs.readFileSync(path.join(root,'data/near-synonyms-th3-bai4-import.json'),'utf8'));
assert.equal(bai4Imports.length,18);
assert.equal(bai4Imports.filter(s=>s.duplicateOf).length,6);
for(const item of bai4Imports) {
  assert(translations.some(g=>g.id===item.id));
  if(item.archive) assert(fs.existsSync(path.join(root,item.archive)));
}
for(const [index,count] of [2,7,5,8,6,8,6,3,2,5,9,6].entries()) {
  const group = translations.find(g=>g.id===161+index);
  assert.equal(group.terms.flatMap(t=>t.examples).length,count,'Bai 4 source example count '+group.id);
}
assert.equal(translations.find(g=>g.id===164).notes.length,3);
const originalExamples = translations.filter(g=>g.id<=125).flatMap(g=>g.terms).flatMap(t=>t.examples);
assert.equal(originalExamples.length,791);
assert.equal(originalExamples.filter(e=>e.wrong).length,84);
const expectedNewCounts = [8,5,7,4,7,8,6,5,4,7,3,5,4,4,7,9,9,5,8,14,6,6,9,9,6,4,13,8,6,14,4,7,5,14,6];
for (const [index, count] of expectedNewCounts.entries()) {
  const group = translations.find(g=>g.id===126+index);
  assert.equal(group.terms.flatMap(t=>t.examples).length,count,'Source example count '+group.id);
}
const imports = JSON.parse(fs.readFileSync(path.join(root,'data/near-synonyms-th3-import.json'),'utf8'));
assert.equal(imports.length,38);
assert.equal(imports.filter(s=>s.duplicateOf).length,3);
for(const item of imports) {
  assert(translations.some(g=>g.id===item.id));
  if(item.archive) assert(fs.existsSync(path.join(root,item.archive)));
}
let exampleCount = 0;
for (const translation of translations) {
  const rendered = groups.find(g => g.id === 'nhom-' + translation.id);
  assert(rendered, 'Missing translated group ' + translation.id);
  for (const term of translation.terms) {
    for (const usage of term.usage) assert(rendered.textContent.includes(usage), `Missing usage: ${translation.id}/${term.zh}`);
    for (const example of term.examples) {
      assert(rendered.textContent.includes(example.zh), `Missing source example: ${translation.id}/${term.zh}`);
      assert(rendered.textContent.includes(example.vi), `Missing translated example: ${translation.id}/${term.zh}`);
      exampleCount++;
    }
  }
  for (const note of translation.notes) assert(rendered.textContent.includes(note));
}
assert.equal(exampleCount, 1104);
assert.equal((page.match(/class="syn-translation"/g) || []).length, exampleCount);
assert.equal((page.match(/class="syn-badge"/g) || []).length, 135);
assert.equal((page.match(/syn-example syn-incomplete/g) || []).length, 0);
assert(!/ảnh gốc bị cắt|Phần cuối bị cắt/.test(page));
const futureGroup = groups.find(g => g.id === 'nhom-59');
for (const ending of ['更好的将来。', '祖国的未来。', '请大家注意安全。', '机器人能取代人类吗？']) {
  assert(futureGroup.textContent.includes(ending), 'Missing restored source text: ' + ending);
}
assert(!page.includes('Lưu ý và cách sửa'));
assert(!page.includes('Xem bảng tiếng Trung gốc'));
assert(!/cần đối chiếu|không rõ phần kết|TODO/.test(page));
for (const s of sources) assert.equal(groups.some(g => g.id === 'nhom-'+s.id),!s.duplicate);
const ids = [...page.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(ids.length,new Set(ids).size);
for (const m of page.matchAll(/(?:href|src)="([^"]+)"/g)) {
  const url=m[1].split(/[?#]/)[0];
  if(url && !/^(?:[a-z]+:|\/\/)/i.test(url)) assert(fs.existsSync(path.resolve(root,'resources',url)),url);
}
function element(){return {value:'',hidden:true,textContent:'',handlers:{},addEventListener(event,fn){this.handlers[event]=fn;},focus(){this.focused=true;}};}
const elements=Object.fromEntries(['syn-search','syn-status','syn-clear','syn-collapse','syn-empty'].map(id=>[id,element()]));
const toolbar=element(), win=element(), location={hash:''};
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/js/near-synonyms.js'),'utf8'),{
  document:{querySelectorAll:()=>groups,querySelector:()=>toolbar,getElementById:id=>elements[id]||groups.find(g=>g.id===id)},window:win,location
});
assert.equal(toolbar.hidden,false);
function search(query){elements['syn-search'].value=query;elements['syn-search'].handlers.input();return groups.filter(g=>!g.hidden).map(g=>g.id);}
assert(search('一直').includes('nhom-1'));
assert(search('yizhi').includes('nhom-1'));
assert.deepEqual(search('liên tục'),search('lien tuc'));
assert(search('jiaoao').includes('nhom-125'));
assert(search('时兴').includes('nhom-145'));
assert(search('shunying').includes('nhom-160'));
assert(search('嗅').includes('nhom-172'));
assert(search('canguan').includes('nhom-161'));
assert(search('chuyen tam').includes('nhom-162'));
assert(search('thích nghi').includes('nhom-159'));
assert(search('phối hợp chặt chẽ').includes('nhom-41'));
assert(search('戴上帽子').includes('nhom-32'));
assert.equal(search('zzzz-no-such-word').length,0);
assert.equal(elements['syn-empty'].hidden,false);
elements['syn-clear'].handlers.click();assert.equal(groups.filter(g=>!g.hidden).length,171);assert(elements['syn-search'].focused);
search('not-a-match');location.hash='#nhom-125';win.handlers.hashchange();assert(groups.find(g=>g.id === 'nhom-125').open);assert(!groups.find(g=>g.id === 'nhom-125').hidden);assert(groups.find(g=>g.id === 'nhom-125').scrolled);
elements['syn-collapse'].handlers.click();assert(groups.every(g=>!g.open));
search('not-a-match');location.hash='#nhom-172';win.handlers.hashchange();
const newest = groups.find(g=>g.id==='nhom-172');
assert(newest.open && !newest.hidden && newest.scrolled);
elements['syn-collapse'].handlers.click();assert(groups.every(g=>!g.open));
console.log('PASS: 171 unique groups, all source rows accounted for, local links, Chinese/pinyin/Vietnamese searches, no results, clear, deep link, collapse.');
console.log('DOM behavior simulated; visual browser testing remains separate.');
console.log(`PASS: ${exampleCount} source-specific examples and translations, usage and shared notes rendered without omission; 135 incorrect-example labels; all four previously cropped examples restored.`);
