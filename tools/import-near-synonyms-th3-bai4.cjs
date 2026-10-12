const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const sourceDir = process.argv[2];
if (!sourceDir) throw Error('Pass the Bai 4 source directory');
const manifestPath = path.join(root, 'data/near-synonyms-source.json');
const sources = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const content = fs.readFileSync(path.join(root,'data/near-synonyms-th3-bai4.txt'),'utf8');
const groups = content.split(/\r?\n(?=\[)/).map(section=>({id:Number(section.match(/^\[(\d+)\]/)[1]),terms:[...section.matchAll(/^@([^|]+)/gm)].map(m=>m[1])}));
const key = terms => [...terms].sort().join('|');
const audit = [];
const files = fs.readdirSync(sourceDir).filter(f=>f.endsWith('.jpg'));
if(files.length!==18 || groups.length!==12) throw Error('Unexpected source count');
for(const filename of files) {
  const terms = filename.replace('.jpg','').replace('预览','游览').replace('闻-臭','闻-嗅').split('-');
  const fresh = groups.find(g=>key(g.terms)===key(terms));
  const old = sources.find(g=>!g.duplicate && key(g.terms)===key(terms));
  if(!fresh && !old) throw Error('Unmapped source '+filename);
  if(fresh && old && fresh.id!==old.id) throw Error('Duplicate new group '+filename);
  const id = fresh ? fresh.id : old.id;
  if(fresh && !old) sources.push({...fresh,source:filename,duplicate:null,collection:'TH3 Bai 4'});
  const archive = `assets/images/near-synonyms/th3-bai4-${id}.jpg`;
  if(fresh) fs.copyFileSync(path.join(sourceDir,filename),path.join(root,archive));
  audit.push({source:filename,id,duplicateOf:fresh?null:old.id,...(fresh?{archive}:{})});
}
if(audit.filter(a=>a.duplicateOf).length!==6) throw Error('Expected six duplicates');
sources.sort((a,b)=>a.id-b.id);
fs.writeFileSync(manifestPath,JSON.stringify(sources,null,2)+'\n');
fs.writeFileSync(path.join(root,'data/near-synonyms-th3-bai4-import.json'),JSON.stringify(audit,null,2)+'\n');
const glossary = `参观|cānguān|tham quan; học hỏi
游览|yóulǎn|tham quan; du ngoạn
安心|ānxīn|yên tâm; chuyên tâm
放心|fàngxīn|yên tâm; không lo lắng
所有|suǒyǒu|tất cả; toàn bộ
一切|yīqiè|tất cả; mọi thứ
搬|bān|chuyển; dọn
抬|tái|nâng; khiêng
改|gǎi|sửa; thay đổi
改变|gǎibiàn|thay đổi
改正|gǎizhèng|sửa chữa; sửa đúng
更改|gēnggǎi|thay đổi; sửa đổi
旅游|lǚyóu|du lịch
旅行|lǚxíng|du hành; đi xa
讨厌|tǎoyàn|ghét; đáng ghét
嫌|xián|chê; không hài lòng
记得|jìde|nhớ
记住|jìzhù|ghi nhớ
闻|wén|ngửi
嗅|xiù|ngửi; đánh hơi`;
const wordsPath = path.join(root,'data/near-synonyms-words.tsv');
let words = fs.readFileSync(wordsPath,'utf8').trimEnd();
const existing = new Set(words.split(/\r?\n/).map(l=>l.split('\t')[0]));
for(const line of glossary.split('\n')) if(!existing.has(line.split('|')[0])) words+='\n'+line.replaceAll('|','\t');
fs.writeFileSync(wordsPath,words+'\n');
console.log('Imported 12 groups; skipped six existing groups:',audit.filter(a=>a.duplicateOf));
