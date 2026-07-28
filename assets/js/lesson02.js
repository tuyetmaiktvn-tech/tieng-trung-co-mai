
let DATA, AUDIO, flashIndex=0, score=0, answered=0;
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const audioButton=(id,text)=>`<button class="audio-btn" onclick="AUDIO.play('${id}',${JSON.stringify(text)},this)">🔊 Nghe</button>`;
async function init(){
 DATA=await fetch('data/lesson02.json').then(r=>r.json()); AUDIO=new AudioManager(DATA.audioManifest);
 renderMeta(); renderObjectives(); renderVocabulary(); renderPatterns(); renderDialogues(); renderPronunciation(); renderReading(); renderCulture(); renderFlash(); renderQuiz();
}
function renderMeta(){$('#titleZh').textContent=DATA.meta.titleZh;$('#titlePy').textContent=DATA.meta.titlePinyin;$('#titleVi').textContent=DATA.meta.titleVi;}
function renderObjectives(){$('#objectives').innerHTML=DATA.objectives.map(x=>`<li>${x}</li>`).join('');}
function renderVocabulary(){$('#vocab').innerHTML=DATA.vocabulary.map(v=>`<article class="item"><div><span class="word hanzi">${v.hanzi}</span>${audioButton(v.id,v.hanzi)}</div><div class="pinyin">${v.pinyin}</div><div class="meaning">${v.pos} · ${v.meaning}</div><hr><div class="zh">${v.exampleZh}${audioButton(v.id+'_ex',v.exampleZh)}</div><div class="pinyin">${v.examplePinyin}</div><div>${v.exampleVi}</div></article>`).join('');}
function renderPatterns(){$('#patterns').innerHTML=DATA.patterns.map(p=>`<article class="item"><h3>${p.title}</h3><p><b>Cấu trúc:</b> ${p.formula}</p>${p.examples.map((e,i)=>`<div class="line"><div class="zh">${e.zh}${audioButton(p.id+'_ex'+(i+1),e.zh)}</div><div class="pinyin">${e.pinyin}</div><div>${e.vi}</div></div>`).join('')}${p.note?`<p><b>Ghi nhớ:</b> ${p.note}</p>`:''}</article>`).join('');}
function renderDialogues(){$('#dialogues').innerHTML=DATA.dialogues.map(d=>`<article class="card"><h3>${d.title}</h3><p><i>${d.context}</i></p>${d.lines.map((l,i)=>`<div class="line"><span class="speaker hanzi">${l.speaker}:</span> <span class="zh">${l.zh}</span>${audioButton(d.id+'_line'+(i+1),l.zh)}<div class="pinyin">${l.pinyin}</div><div>${l.vi}</div></div>`).join('')}</article>`).join('');}
function renderPronunciation(){$('#pronunciation').innerHTML=`<h3>${DATA.pronunciation.title}</h3><p><b>Thanh mẫu:</b> ${DATA.pronunciation.initials.join(', ')}</p><p><b>Vận mẫu:</b> ${DATA.pronunciation.finals.join(', ')}</p><ol>${DATA.pronunciation.rules.map(r=>`<li>${r}</li>`).join('')}</ol><p class="pinyin"><b>Luyện đọc:</b> ${DATA.pronunciation.practice.join(' · ')}</p>`;}
function renderReading(){$('#reading').innerHTML=`<div class="zh word">${DATA.reading.zh}${audioButton('reading',DATA.reading.zh)}</div><div class="pinyin">${DATA.reading.pinyin}</div><p>${DATA.reading.vi}</p>`;}
function renderCulture(){$('#culture').innerHTML=`<h3>${DATA.culture.title}</h3><p>${DATA.culture.content}</p>`;}
function renderFlash(){const f=DATA.flashcards[flashIndex];$('#flash').classList.remove('flipped');$('#flashFront').innerHTML=`<div class="word hanzi">${f.front}</div><div class="pinyin">${f.pinyin}</div>${audioButton(DATA.vocabulary[flashIndex].id,f.front)}`;$('#flashBack').innerHTML=`<div class="meaning">${f.back}</div><p>Nhấp để quay lại</p>`;$('#flashCount').textContent=`${flashIndex+1}/${DATA.flashcards.length}`;}
function nextFlash(n){flashIndex=(flashIndex+n+DATA.flashcards.length)%DATA.flashcards.length;renderFlash();}
function flipFlash(){$('#flash').classList.toggle('flipped');}
function renderQuiz(){score=0;answered=0;$('#quizResult').textContent='';$('#quiz').innerHTML=DATA.exercises.map((q,idx)=>`<article class="item quiz" id="${q.id}"><h3>Câu ${idx+1}</h3><p>${q.question}</p>${q.type==='mcq'?q.options.map((o,i)=>`<button class="option" onclick="answerMCQ('${q.id}',${i},this)">${o}</button>`).join(''):q.type==='reorder'?`<div class="tabs">${q.items.map(x=>`<button class="tab" onclick="pickWord(this)">${x}</button>`).join('')}</div><p class="built"></p><button onclick="checkReorder('${q.id}',this)">Kiểm tra</button>`:`<input class="answer" placeholder="Nhập đáp án"><button onclick="checkFill('${q.id}',this)">Kiểm tra</button>`}<div class="feedback"></div></article>`).join('');}
function finish(card,ok,q){if(card.dataset.done)return;card.dataset.done=1;answered++;if(ok)score++;card.querySelector('.feedback').innerHTML=`<p><b>${ok?'✅ Chính xác':'❌ Chưa đúng'}</b><br>${q.explanation||''}</p>`;if(answered===DATA.exercises.length)$('#quizResult').textContent=`Kết quả: ${score}/${answered} câu đúng.`;}
function answerMCQ(id,i,btn){const q=DATA.exercises.find(x=>x.id===id),card=$('#'+id);if(card.dataset.done)return;card.querySelectorAll('.option').forEach((b,k)=>{if(k===q.answer)b.classList.add('correct');else if(b===btn)b.classList.add('wrong')});finish(card,i===q.answer,q);}
function pickWord(btn){const card=btn.closest('.quiz');card.querySelector('.built').textContent+=(card.querySelector('.built').textContent?' / ':'')+btn.textContent;btn.disabled=true;}
function checkReorder(id,btn){const q=DATA.exercises.find(x=>x.id===id),card=$('#'+id),got=card.querySelector('.built').textContent.split(' / ').filter(Boolean);finish(card,JSON.stringify(got)===JSON.stringify(q.answer),q);}
function checkFill(id,btn){const q=DATA.exercises.find(x=>x.id===id),card=$('#'+id),got=card.querySelector('input').value.trim().replace(/[。！？!?]/g,'');const accepted=(q.accepted||[q.answerText]).map(x=>x.replace(/[。！？!?]/g,''));finish(card,accepted.includes(got),q);}
function resetQuiz(){renderQuiz();$('#quiz').scrollIntoView({behavior:'smooth'});}
function go(id){document.getElementById(id).scrollIntoView({behavior:'smooth'});}
window.addEventListener('DOMContentLoaded',init);
