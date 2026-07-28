
document.addEventListener("DOMContentLoaded", async () => {
  console.info("Tiếng Trung Cô Mai - Lesson UI 3.3.1 Audio Hotfix loaded");
  const app = document.getElementById("lessonApp");
  if (!app) return;

  const data = await fetch("../data/hsk1/lesson01.json").then(r => {
    if (!r.ok) throw new Error("Không tải được dữ liệu bài học.");
    return r.json();
  });

  const esc = s => String(s ?? "").replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));

  const audioBase = "../assets/audio/hsk1/lesson01";
  const audioButton = (src, text, label = "Nghe phát âm", rate = 0.85) => `
    <button type="button" class="audio-btn-v33"
      data-audio-src="${esc(src)}"
      data-audio-text="${esc(text)}"
      data-audio-rate="${rate}"
      aria-label="${esc(label)}"
      title="${esc(label)}">
      <span class="audio-icon-v33">🔊</span>
      <span class="audio-label-v33">${esc(label)}</span>
    </button>`;
  const bindAudio = () => {
    if (window.AudioManager) {
      window.AudioManager.bind(document);
      return;
    }
    document.querySelectorAll("[data-audio-text]").forEach(button => {
      if (button.dataset.fallbackBound === "true") return;
      button.dataset.fallbackBound = "true";
      button.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        if (!("speechSynthesis" in window)) {
          alert("Trình duyệt này chưa hỗ trợ phát âm tự động.");
          return;
        }
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(button.dataset.audioText || "");
        utterance.lang = "zh-CN";
        utterance.rate = Number(button.dataset.audioRate || 0.85);
        window.speechSynthesis.speak(utterance);
      });
    });
  };

  document.getElementById("objectives").innerHTML = data.objectives.map((x,i) =>
    `<div class="objective-card-v32"><span>${i+1}</span><p>${esc(x)}</p></div>`).join("");

  const vocabBox = document.getElementById("vocabulary");
  function renderVocab(items){
    vocabBox.innerHTML = items.map(v => `
      <article class="vocab-card-v32">
        <div class="vocab-head-v32"><span class="vocab-hanzi-v32">${esc(v.hanzi)}</span><span class="vocab-type-v32">${esc(v.type)}</span></div>
        <div class="vocab-pinyin-row-v33">
          <div class="vocab-pinyin-v32">${esc(v.pinyin)}</div>
          ${audioButton(`${audioBase}/vocabulary/vocab-${String(v.id).padStart(2,"0")}.mp3`, v.hanzi)}
        </div>
        <h3>${esc(v.meaning)}</h3>
        <div class="vocab-example-v32">
          <div class="example-audio-row-v33">
            <strong>${esc(v.example)}</strong>
            ${audioButton(`${audioBase}/examples/example-${String(v.id).padStart(2,"0")}.mp3`, v.example, "Nghe ví dụ")}
          </div>
          <em>${esc(v.example_pinyin)}</em><span>${esc(v.example_vi)}</span>
        </div>
        <p class="vocab-note-v32">💡 ${esc(v.note)}</p>
      </article>`).join("");
  }
  renderVocab(data.vocabulary);
  bindAudio();
  document.getElementById("vocabSearch").addEventListener("input", e => {
    const q = e.target.value.trim().toLowerCase();
    renderVocab(data.vocabulary.filter(v => [v.hanzi,v.pinyin,v.meaning].some(x => x.toLowerCase().includes(q))));
    bindAudio();
  });

  let cardIndex = 0;
  const flashcard = document.getElementById("flashcard");
  function renderCard(){
    const v = data.vocabulary[cardIndex];
    flashcard.classList.remove("flipped");
    document.getElementById("cardHanzi").textContent = v.hanzi;
    document.getElementById("cardPinyin").textContent = v.pinyin;
    document.getElementById("cardMeaning").textContent = v.meaning;
    document.getElementById("cardExample").textContent = `${v.example} — ${v.example_vi}`;
    const cardAudio = document.getElementById("cardAudio");
    cardAudio.dataset.audioSrc = `${audioBase}/vocabulary/vocab-${String(v.id).padStart(2,"0")}.mp3`;
    cardAudio.dataset.audioText = v.hanzi;
    cardAudio.dataset.audioBound = "false";
    bindAudio();
    document.getElementById("cardCounter").textContent = `${cardIndex+1} / ${data.vocabulary.length}`;
  }
  flashcard.addEventListener("click",()=>flashcard.classList.toggle("flipped"));
  flashcard.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();flashcard.classList.toggle("flipped")}});
  document.getElementById("prevCard").addEventListener("click",()=>{cardIndex=(cardIndex-1+data.vocabulary.length)%data.vocabulary.length;renderCard()});
  document.getElementById("nextCard").addEventListener("click",()=>{cardIndex=(cardIndex+1)%data.vocabulary.length;renderCard()});
  renderCard();

  document.getElementById("patterns").innerHTML = data.patterns.map((p,pIndex) => `
    <article class="pattern-card-v32">
      <div class="pattern-formula-row-v33">
        <div class="pattern-formula-v32">${esc(p.formula)}</div>
        ${audioButton(`${audioBase}/patterns/pattern-${String(pIndex+1).padStart(2,"0")}.mp3`, p.formula, "Nghe mẫu câu")}
      </div>
      <h3>${esc(p.title)}</h3>
      <p>${esc(p.explanation)}</p>
      <div class="pattern-examples-v32">${p.examples.map((x,xIndex)=>`<div>
        <div class="example-audio-row-v33"><strong>${esc(x.zh)}</strong>
        ${audioButton(`${audioBase}/patterns/pattern-${String(pIndex+1).padStart(2,"0")}-example-${String(xIndex+1).padStart(2,"0")}.mp3`, x.zh, "Nghe ví dụ")}</div>
        <em>${esc(x.py)}</em><span>${esc(x.vi)}</span></div>`).join("")}</div>
      <div class="pattern-warning-v32">⚠️ ${esc(p.mistake)}</div>
    </article>`).join("");
  bindAudio();

  document.getElementById("dialogues").innerHTML = data.dialogues.map((d,dIndex) => `
    <article class="dialogue-card-v32">
      <div class="dialogue-title-row-v33"><div><h3>${esc(d.title)}</h3><p class="dialogue-context-v32">${esc(d.context)}</p></div>
      ${audioButton(`${audioBase}/dialogues/dialogue-${String(dIndex+1).padStart(2,"0")}.mp3`, d.lines.map(l=>l.zh).join(" "), "Nghe toàn bài")}</div>
      ${d.lines.map((l,lIndex)=>`<div class="dialogue-line-v32"><b>${esc(l.speaker)}</b><div>
        <div class="example-audio-row-v33"><strong>${esc(l.zh)}</strong>
        ${audioButton(`${audioBase}/dialogues/dialogue-${String(dIndex+1).padStart(2,"0")}-line-${String(lIndex+1).padStart(2,"0")}.mp3`, l.zh, "Nghe câu")}</div>
        <em>${esc(l.py)}</em><span>${esc(l.vi)}</span></div></div>`).join("")}
    </article>`).join("");
  bindAudio();

  document.getElementById("teacherTips").innerHTML = `<ul>${data.teacher_tips.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`;

  document.getElementById("pronunciation").innerHTML = `
    <div class="pronunciation-grid-v32">
      <article class="pron-card-v32"><h3>Cấu tạo âm tiết</h3><p>${esc(data.pronunciation.overview)}</p></article>
      <article class="pron-card-v32"><h3>Thanh mẫu</h3><div class="sound-chips-v32">${data.pronunciation.initials.map(x=>`<span>${x}</span>`).join("")}</div></article>
      <article class="pron-card-v32"><h3>Vận mẫu</h3><div class="sound-chips-v32">${data.pronunciation.finals.map(x=>`<span>${x}</span>`).join("")}</div></article>
    </div>
    <div class="tone-grid-v32">${data.pronunciation.tones.map(t=>`<div><strong>${esc(t.name)}</strong><span>${esc(t.example)}</span><small>${esc(t.shape)}</small></div>`).join("")}</div>
    <div class="pron-practice-v32"><h3>Luyện đọc</h3>${data.pronunciation.practice.map((x,i)=>`<span class="pron-audio-chip-v33">${esc(x)}
      ${audioButton(`${audioBase}/pronunciation/practice-${String(i+1).padStart(2,"0")}.mp3`, x, "Nghe", 0.72)}
    </span>`).join("")}</div>`;
  bindAudio();


  const quizBox = document.getElementById("quiz");
  quizBox.innerHTML = data.exercises.map((q,i) => {
    if(q.type==="multiple_choice"){
      return `<article class="quiz-item-v32" data-id="${q.id}" data-type="${q.type}"><h3>Câu ${i+1}. ${esc(q.question)}</h3>${q.options.map((o,idx)=>`<label><input type="radio" name="${q.id}" value="${idx}"> ${esc(o)}</label>`).join("")}<div class="answer-note-v32"></div></article>`;
    }
    return `<article class="quiz-item-v32" data-id="${q.id}" data-type="${q.type}"><h3>Câu ${i+1}. ${esc(q.question)}</h3><input class="quiz-text-v32" type="text" placeholder="Nhập câu trả lời..."><div class="answer-note-v32"></div></article>`;
  }).join("");

  function normalize(s){ return String(s||"").toLowerCase().replace(/[，。！？、,.!?\s]/g,""); }
  function grade(showAll=false){
    let score=0, answered=0;
    data.exercises.forEach(q=>{
      const item=quizBox.querySelector(`[data-id="${q.id}"]`);
      const note=item.querySelector(".answer-note-v32");
      let correct=false, has=false, value="";
      if(q.type==="multiple_choice"){
        const checked=item.querySelector("input:checked");
        if(checked){has=true;value=Number(checked.value);correct=value===q.answer;}
      } else {
        value=item.querySelector("input").value.trim();
        has=!!value;
        const accepted=q.accepted || [q.answer_text];
        correct=accepted.some(a=>normalize(a)===normalize(value));
      }
      if(has) answered++;
      if(correct) score++;
      if(showAll || has){
        note.className=`answer-note-v32 ${correct?"correct":"incorrect"}`;
        note.textContent=correct ? `✓ Đúng. ${q.explanation}` : `✗ Đáp án gợi ý: ${q.options ? q.options[q.answer] : q.answer_text}. ${q.explanation}`;
      }
    });
    const percent=Math.round(score/data.exercises.length*100);
    document.getElementById("quizResult").innerHTML=`<strong>${score}/${data.exercises.length} câu đúng (${percent}%)</strong><span>${percent>=80?"Rất tốt! Bạn đã đạt mục tiêu của bài.":"Hãy ôn lại từ vựng và làm lại bài tập."}</span>`;
    localStorage.setItem("hsk1_lesson01_progress", String(Math.max(percent,Number(localStorage.getItem("hsk1_lesson01_progress")||0))));
    updateProgress();
  }
  document.getElementById("submitQuiz").addEventListener("click",()=>grade(false));
  document.getElementById("showAnswers").addEventListener("click",()=>grade(true));

  function updateProgress(){
    const p=Number(localStorage.getItem("hsk1_lesson01_progress")||0);
    document.getElementById("progressBar").style.width=p+"%";
    document.getElementById("progressText").textContent=p+"% hoàn thành";
  }
  document.getElementById("resetProgress").addEventListener("click",()=>{localStorage.removeItem("hsk1_lesson01_progress");updateProgress();location.reload()});
  updateProgress();
});
