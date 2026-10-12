const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const sourceDir = process.argv[2];
if (!sourceDir) throw Error('Pass the TH3 source directory');
const manifestPath = path.join(root, 'data/near-synonyms-source.json');
const sources = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const text = fs.readFileSync(path.join(root, 'data/near-synonyms-th3.txt'), 'utf8');
const groups = [...text.matchAll(/^\[(\d+)\]\r?\n([\s\S]*?)(?=^\[|$(?![\s\S]))/gm)].map(m => ({id:Number(m[1]), terms:[...m[2].matchAll(/^@([^|]+)/gm)].map(t=>t[1])}));
if (groups.length !== 35) throw Error('Expected 35 new groups');
const key = terms => [...terms].sort().join('|');
const audit = [];
for (const filename of fs.readdirSync(sourceDir).filter(f=>f.endsWith('.jpg'))) {
  const terms = filename.replace('.jpg','').replace('时光','时兴').replace('适应0习惯','适应-习惯').split('-').map(s=>s.trim());
  const fresh = groups.find(g=>key(g.terms)===key(terms));
  const old = sources.find(g=>!g.duplicate && key(g.terms)===key(terms));
  if (!fresh && !old) throw Error('Unmapped image '+filename);
  const id = fresh ? fresh.id : old.id;
  if (fresh && !old) sources.push({...fresh,source:filename,duplicate:null,collection:'TH3'});
  const archive = `assets/images/near-synonyms/th3-${id}.jpg`;
  if (fresh) fs.copyFileSync(path.join(sourceDir,filename),path.join(root,archive));
  audit.push({source:filename,id,duplicateOf:fresh?null:old.id,...(fresh?{archive}:{})});
}
if(audit.length!==38 || audit.filter(a=>a.duplicateOf).length!==3) throw Error('Unexpected import coverage');
sources.sort((a,b)=>a.id-b.id);
fs.writeFileSync(manifestPath,JSON.stringify(sources,null,2)+'\n');
fs.writeFileSync(path.join(root,'data/near-synonyms-th3-import.json'),JSON.stringify(audit,null,2)+'\n');
const glossary = `不但|bùdàn|không những
不仅|bùjǐn|không chỉ
不只|bùzhǐ|không chỉ
不过|bùguò|nhưng; chỉ
但是|dànshì|nhưng
可是|kěshì|nhưng
为|wèi|vì; cho; để
为了|wèile|để; vì
因为|yīnwèi|bởi vì
亲切|qīnqiè|ân cần; thân thương
亲热|qīnrè|thân mật; âu yếm
却|què|nhưng lại
保卫|bǎowèi|bảo vệ; bảo vệ chủ quyền
保护|bǎohù|bảo vệ
维护|wéihù|duy trì; giữ gìn
其实|qíshí|thực ra
实际上|shíjì shàng|trên thực tế
古怪|gǔguài|kỳ quái
奇怪|qíguài|kỳ lạ
害怕|hàipà|sợ hãi
可怕|kěpà|đáng sợ
恐怕|kǒngpà|e rằng
并且|bìngqiě|và; đồng thời
而且|érqiě|mà còn; hơn nữa
怕|pà|sợ; e là
所以|suǒyǐ|cho nên
因此|yīncǐ|vì vậy
新鲜|xīnxiān|tươi; mới lạ
新颖|xīnyǐng|mới mẻ; độc đáo
旧|jiù|cũ
老|lǎo|già; lâu đời
时兴|shíxīng|thịnh hành; hợp mốt
流行|liúxíng|thịnh hành; lan rộng
格外|géwài|đặc biệt; hơn hẳn bình thường
尤其|yóuqí|đặc biệt là
特别|tèbié|đặc biệt
受欢迎|shòu huānyíng|được yêu thích
时髦|shímáo|hợp mốt
渐渐|jiànjiàn|dần dần
慢慢|mànmàn|chậm rãi; từ từ
爱护|àihù|yêu quý và bảo vệ
相信|xiāngxìn|tin; tin tưởng
信|xìn|tin; thư; tin tức
信任|xìnrèn|tín nhiệm
竟然|jìngrán|lại; không ngờ
居然|jūrán|không ngờ
经过|jīngguò|đi qua; trải qua; diễn biến
通过|tōngguò|thông qua; vượt qua
再说|zàishuō|vả lại
谨慎|jǐnshèn|thận trọng
小心|xiǎoxīn|cẩn thận; coi chừng
赶紧|gǎnjǐn|mau chóng; mau lên
赶忙|gǎnmáng|vội vàng
适应|shìyìng|thích nghi; thích ứng
习惯|xíguàn|quen; thói quen
顺应|shùnyìng|thuận theo`;
const wordsPath = path.join(root,'data/near-synonyms-words.tsv');
let words = fs.readFileSync(wordsPath,'utf8').trimEnd();
const existing = new Set(words.split(/\r?\n/).map(l=>l.split('\t')[0]));
for(const line of glossary.split('\n')) if(!existing.has(line.split('|')[0])) words+='\n'+line.replaceAll('|','\t');
fs.writeFileSync(wordsPath,words+'\n');
console.log('Imported 35 groups; recorded 3 existing groups; archived source images.');
