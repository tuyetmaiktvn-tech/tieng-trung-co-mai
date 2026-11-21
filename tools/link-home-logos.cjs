const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
function pages(dir) {
  return fs.readdirSync(dir, {withFileTypes:true}).flatMap(e => {
    if (e.name.startsWith('.') || ['tmp','node_modules','output'].includes(e.name)) return [];
    const file=path.join(dir,e.name);
    return e.isDirectory()?pages(file):e.name.endsWith('.html')?[file]:[];
  });
}
let linked=0, added=0;
for(const file of pages(root)) {
  let html=fs.readFileSync(file,'utf8');
  const home=path.relative(path.dirname(file),path.join(root,'index.html')).replaceAll('\\','/');
  const assets=path.relative(path.dirname(file),path.join(root,'assets')).replaceAll('\\','/');
  const stack=[], edits=[];let found=false;
  const voids=new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
  // Ignore script/style contents: their markup strings are not page elements.
  const tags=/<script\b[^>]*>[\s\S]*?<\/script\s*>|<style\b[^>]*>[\s\S]*?<\/style\s*>|<!--[\s\S]*?-->|<\/?([a-z][\w:-]*)\b[^>]*>/gi;
  for(const m of html.matchAll(tags)) {
    if(!m[1])continue;
    const tag=m[1].toLowerCase();
    if(m[0].startsWith('</')) {const i=stack.map(x=>x.tag).lastIndexOf(tag);if(i>=0)stack.splice(i);continue;}
    if(tag==='img' && /\bsrc=["'][^"']*mai-logo[^"']*["']/i.test(m[0])) {
      found=true;
      const anchor=[...stack].reverse().find(x=>x.tag==='a');
      if(!anchor) {
        edits.push({start:m.index,end:m.index+m[0].length,text:`<a class="tcm-brand" href="${home}" aria-label="Tiếng Trung Cô Mai — Về trang chủ">${m[0]}</a>`});linked++;
      } else {
        const href=anchor.text.match(/\bhref=["']([^"']*)["']/i)?.[1];
        if(href!==home) {
          const text=/\bhref=/i.test(anchor.text)?anchor.text.replace(/\bhref=["'][^"']*["']/i,`href="${home}"`):anchor.text.replace(/>$/,` href="${home}">`);
          if(!edits.some(e=>e.start===anchor.start))edits.push({start:anchor.start,end:anchor.start+anchor.text.length,text});
        }
      }
    }
    if(!voids.has(tag)&&!m[0].endsWith('/>'))stack.push({tag,text:m[0],start:m.index});
  }
  for(const edit of edits.reverse())html=html.slice(0,edit.start)+edit.text+html.slice(edit.end);
  if(!found&&!html.includes('focus-section.js')&&!/http-equiv\s*=\s*["']refresh/i.test(html)) {
    html=html.replace(/<body\b[^>]*>/i,m=>m+`\n<div style="width:93%;max-width:1220px;margin:16px auto"><a class="tcm-brand" href="${home}" aria-label="Tiếng Trung Cô Mai — Về trang chủ"><img class="tcm-unified-logo" src="${assets}/images/mai-logo-circle.png?v=6" alt="Tiếng Trung Cô Mai" width="64" height="64"></a></div>`);
    if(!html.includes('css/brand.css'))html=html.replace('</head>',`<link rel="stylesheet" href="${assets}/css/brand.css?v=2">\n</head>`);
    added++;
  }
  html=html.replace(/focus-section\.js(?:\?v=[\w.-]+)?/g,'focus-section.js?v=2');
  if(html!==fs.readFileSync(file,'utf8'))fs.writeFileSync(file,html);
}
console.log(`Linked ${linked} logos; added home logos to ${added} pages.`);
