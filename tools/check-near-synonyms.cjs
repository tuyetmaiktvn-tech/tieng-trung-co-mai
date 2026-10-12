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
assert.equal(groups.length,124);
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
assert.equal(exampleCount, 791);
assert.equal((page.match(/class="syn-translation"/g) || []).length, exampleCount);
assert.equal((page.match(/class="syn-badge"/g) || []).length, 84);
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
assert(search('phối hợp chặt chẽ').includes('nhom-41'));
assert(search('戴上帽子').includes('nhom-32'));
assert.equal(search('zzzz-no-such-word').length,0);
assert.equal(elements['syn-empty'].hidden,false);
elements['syn-clear'].handlers.click();assert.equal(groups.filter(g=>!g.hidden).length,124);assert(elements['syn-search'].focused);
search('not-a-match');location.hash='#nhom-125';win.handlers.hashchange();assert(groups.at(-1).open);assert(!groups.at(-1).hidden);assert(groups.at(-1).scrolled);
elements['syn-collapse'].handlers.click();assert(groups.every(g=>!g.open));
console.log('PASS: 124 unique groups, all source rows accounted for, local links, Chinese/pinyin/Vietnamese searches, no results, clear, deep link, collapse.');
console.log('DOM behavior simulated; visual browser testing remains separate.');
console.log(`PASS: ${exampleCount} source-specific examples and translations, usage and shared notes rendered without omission; 84 incorrect-example labels; all four previously cropped examples restored.`);
