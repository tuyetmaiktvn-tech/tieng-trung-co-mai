const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const page = fs.readFileSync(path.join(root, 'resources/so-sanh-tu-can-nghia.html'), 'utf8');
const sources = JSON.parse(fs.readFileSync(path.join(root, 'data/near-synonyms-source.json'), 'utf8'));
const decode = text => text.replace(/<[^>]*>/g, ' ').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const groups = [...page.matchAll(/<details class="syn-group" id="([^"]+)">([\s\S]*?)<\/details>/g)].map(m => ({id:m[1],textContent:decode(m[2]),hidden:false,open:false,classList:{contains: x => x === 'syn-group'},scrollIntoView(){this.scrolled=true;}}));
assert.equal(groups.length,124);
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
assert.equal(search('zzzz-no-such-word').length,0);
assert.equal(elements['syn-empty'].hidden,false);
elements['syn-clear'].handlers.click();assert.equal(groups.filter(g=>!g.hidden).length,124);assert(elements['syn-search'].focused);
search('not-a-match');location.hash='#nhom-125';win.handlers.hashchange();assert(groups.at(-1).open);assert(!groups.at(-1).hidden);assert(groups.at(-1).scrolled);
elements['syn-collapse'].handlers.click();assert(groups.every(g=>!g.open));
console.log('PASS: 124 unique groups, all source rows accounted for, local links, Chinese/pinyin/Vietnamese searches, no results, clear, deep link, collapse.');
console.log('DOM behavior simulated; visual browser testing remains separate.');
