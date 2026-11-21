const fs = require('fs');
const vm = require('vm');
const crypto = require('crypto');
const clean = s => s.replace(/<[^>]+>/g, '').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').trim();
function literal(source, name) {
  const start = source.search(new RegExp('const '+name+'\\s*='));
  if(start < 0) return null;
  const rest = source.slice(source.indexOf('=',start)+1).trimStart();
  let depth=0,quote='',escape=false;
  for(let i=0;i<rest.length;i++) {
    const c=rest[i];
    if(quote){if(escape)escape=false;else if(c==='\\')escape=true;else if(c===quote)quote='';continue;}
    if(c==='"'||c==="'"||c==='`'){quote=c;continue;}
    if(c==='['||c==='{')depth++;
    if(c===']'||c==='}') {depth--;if(depth===0)return vm.runInNewContext('('+rest.slice(0,i+1)+')',{}, {timeout:1000});}
  }
  throw Error('Unclosed data '+name);
}
const result={1:[],2:[],3:[],4:[],5:[],6:[]};
const supplements=JSON.parse(fs.readFileSync('tools/translation-supplements.json','utf8'));
for(const file of fs.readdirSync('hsk').filter(f=>/^hsk[1-6]-lesson\d+\.html$/.test(f)).sort()) {
  const [,level,number]=file.match(/^hsk(\d)-lesson(\d+)/);
  const html=fs.readFileSync('hsk/'+file,'utf8');
  const items=[]; const seen=new Set();
  function add(zh,vi,kind,hint='') {
    if(!zh||!vi)return;
    zh=clean(zh);vi=clean(vi);
    if(!/[\u3400-\u9fff]/.test(zh)||seen.has(zh))return;
    seen.add(zh);
    items.push({id:crypto.createHash('sha256').update(zh+'|'+vi).digest('hex').slice(0,12),zh,vi,kind,hint:hint||'Đối chiếu câu mẫu trong bài học; giữ đúng ý nghĩa, cách xưng hô và trật tự câu.'});
  }
  const d=literal(html,'lessonData');
  let title=d?.title || clean((html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)||[])[1]||'');
  if(d) {
    for(const v of d.vocabulary||[])add(v.example,v.exampleVi,'Câu từ vựng');
    for(const x of d.dialogues||d.dialogue||[])add(x.hanzi,x.vi,'Hội thoại');
    const lines=(d.dialogues||d.dialogue||[]).filter(x=>x.hanzi&&x.vi);
    if(lines.length>1)add(lines.map(x=>x.hanzi).join('\n'),lines.map(x=>x.vi).join('\n'),'Hội thoại trọn bài','Dịch lần lượt từng lượt lời; giữ cách xưng hô và ý nghĩa của cuộc hội thoại.');
    for(const group of d.dialogues||[]) {
      if(!group.lines)continue;
      const rows=group.lines.filter(x=>x[1]&&x[3]);
      for(const row of rows)add(row[1],row[3],'Hội thoại');
      if(rows.length>1)add(rows.map(x=>x[1]).join('\n'),rows.map(x=>x[3]).join('\n'),'Hội thoại trọn bài','Dịch lần lượt từng lượt lời: '+group.title);
    }
  } else if(level==='1') {
    const d=literal(html,'data');
    for(const v of d.vocabulary||[])add(v[3],v[4],'Câu từ vựng');
    for(const dialogue of d.dialogues||[])for(const line of dialogue[1])add(line[1],line[3],'Hội thoại');
    for(const dialogue of d.dialogues||[]) {
      const lines=dialogue[1].filter(x=>x[1]&&x[3]);
      if(lines.length>1)add(lines.map(x=>x[1]).join('\n'),lines.map(x=>x[3]).join('\n'),'Hội thoại trọn bài','Dịch lần lượt từng lượt lời trong hội thoại: '+dialogue[0]);
    }
  } else if(level==='2') {
    for(const section of html.matchAll(/<section\b[^>]*>[\s\S]*?<\/section>/g)) {
      if(!/<h2\b[^>]*>[^<]*Dịch/.test(section[0]))continue;
      for(const q of section[0].matchAll(/data-answer="([^"]+)"[^>]*>\s*<(?:div class="qtext"|b)>([\s\S]*?)<\/(?:div|b)>/g))add(q[1],clean(q[2]).replace(/^\d+\.\s*/,''),'Dịch câu');
    }
    // Vocabulary practice uses exactly the bilingual entries in this lesson.
    const vocabSection=(html.match(/<section\b[^>]*id="(?:tu-vung|tuvung|tu)"[\s\S]*?<\/section>/)||[])[0]||'';
    for(const row of vocabSection.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/g)) {
      const cells=[...row[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g)].map(x=>clean(x[1]));
      if(cells.length>=5)add(cells[1],cells[cells.length-2],'Từ / cụm từ');
    }
  } else if(level==='3') {
    for(const grammar of literal(html,'G')||[])for(const pair of grammar[2]||[])add(pair[0],pair[1],'Câu ngữ pháp',grammar[0]+': '+grammar[1]);
  }
  const extra=supplements[level]?.[Number(number)]||[];
  for(const [zh,vi] of extra)add(zh,vi,'Câu vận dụng','Câu luyện biên soạn theo chủ đề và cấu trúc của bài học. Có thể dùng cách diễn đạt tương đương, miễn đúng và đủ ý.');
  for(let i=0;i+2<extra.length;i+=3) {
    const passage=extra.slice(i,i+3);
    add(passage.map(x=>x[0]).join(''),passage.map(x=>x[1]).join(' '),'Đoạn ngắn','Dịch đủ ba câu, giữ nhất quán người nói, thời gian và các từ nối. Đây là đoạn luyện vận dụng theo bài học.');
  }
  // Keep word review after sentence and passage practice.
  items.sort((a,b)=>Number(a.kind==='Từ / cụm từ')-Number(b.kind==='Từ / cụm từ'));
  if(!items.length)throw Error('No bilingual content: '+file);
  result[level].push({id:Number(number),title,source:file,items});
}
fs.writeFileSync('assets/js/translation-data.js','/* Generated from lesson pages by tools/build-lesson-translations.cjs. */\nwindow.translationLessons = '+JSON.stringify(result,null,2)+';\n');
for(const [level,lessons] of Object.entries(result))console.log('HSK '+level+': '+lessons.length+' lessons, '+lessons.reduce((n,l)=>n+l.items.length,0)+' items');
