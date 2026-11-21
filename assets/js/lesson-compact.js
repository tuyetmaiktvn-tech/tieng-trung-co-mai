(() => {
  function compact() {
    const level = location.pathname.match(/hsk([1-6])-lesson/)[1];
    // Remove obsolete navigation entries; retain their initialized DOM for legacy renderers.
    const retired = new Set([...document.querySelectorAll('[data-retired-lesson-section]')].flatMap(s => [s.id,...[...s.querySelectorAll('[id]')].map(n => n.id)]));
    document.querySelectorAll('a[href^="#"]').forEach(a => { if(retired.has(a.getAttribute('href').slice(1))) a.remove(); });
    const hero = document.querySelector('.hero,.lesson-hero-v32');
    if (!hero) return;
    const nav = document.createElement('nav');
    nav.className = 'lesson-compact-links';
    nav.setAttribute('aria-label','Nội dung luyện tập');
    const first = selectors => selectors.map(s=>document.querySelector(s)).find(Boolean);
    const vocab = first(['#vocabulary','#tu-vung','#tuvung','#tu','#vocab']);
    const grammar = first(['#grammar','#mau-cau','#ngu-phap','#nguphap','#np']);
    const exercises = [];
    const seenTargets = new Set();
    function addExercise(target, label) {
      if (!target || target.closest('[data-retired-lesson-section]') || seenTargets.has(target)) return;
      seenTargets.add(target);
      if (!target.id) target.id = `lesson-exercise-${exercises.length + 1}`;
      exercises.push([label, target.id]);
    }
    if (level === '1') {
      addExercise(first(['#exercises','#bai-tap']), 'Bài tập từ vựng và mẫu câu');
      const quiz = document.querySelector('#quiz');
      if (quiz && !exercises.some(([,id]) => document.getElementById(id).contains(quiz))) addExercise(quiz.closest('section') || quiz, 'Kiểm tra cuối bài');
    } else if (level === '2') {
      document.querySelectorAll('section:not([data-retired-lesson-section])').forEach(section => {
        const heading = section.querySelector('h2');
        if (heading && /Nhận|Điền|Sắp xếp|Chữa|Biến đổi|Chọn câu|Dịch|kiểm tra/i.test(heading.textContent)) addExercise(section, heading.textContent.replace(/^\d+\.\s*/, ''));
      });
    } else {
      addExercise(document.querySelector('#postTextPractice'), 'Sắp xếp câu và điền từ theo bài khóa');
      addExercise(document.querySelector('#review'), 'Ôn tập từ vựng');
    }
    const lesson = Number(location.pathname.match(/lesson(\d+)/)[1]);
    for (const [name,href] of [['Luyện từ',vocab && '#'+(vocab.closest('section')?.id || vocab.id)],['Ngữ pháp',grammar && '#'+(grammar.closest('section')?.id || grammar.id)],['Luyện tập', exercises.length && '#lesson-practice'],['Luyện dịch',`hsk${level}-translation.html?lesson=${lesson}`]]) {
      if(!href) continue;
      const a=document.createElement('a');a.href=href;a.textContent=name;nav.append(a);
    }
    hero.after(nav);
    if (exercises.length) {
      const panel = document.createElement('section');
      panel.id = 'lesson-practice';
      panel.className = 'lesson-practice-index';
      const heading = document.createElement('h2');
      heading.textContent = `Luyện tập · Bài ${lesson}`;
      panel.append(heading);
      const links = document.createElement('div');
      links.className = 'lesson-practice-options';
      for (const [label,id] of exercises) {
        const link = document.createElement('a');
        link.href = '#'+id; link.textContent = label; links.append(link);
      }
      const translation = document.createElement('a');
      translation.href = `hsk${level}-translation.html?lesson=${lesson}`;
      translation.textContent = 'Dịch Việt–Trung / Trung–Việt';
      links.append(translation); panel.append(links); nav.after(panel);
      const launch = document.createElement('button');
      launch.type = 'button'; launch.className = 'lesson-practice-launch';
      launch.textContent = 'Luyện chọn đáp án theo bài';
      panel.append(launch);
      launch.addEventListener('click', () => {
        launch.disabled = true; launch.textContent = 'Đang mở bài luyện…';
        const script = document.createElement('script');
        script.src = '../assets/js/lesson-practice.js?v=1';
        script.onload = () => { launch.remove(); window.mountLessonPractice(panel, level, lesson); };
        script.onerror = () => { script.remove(); launch.disabled = false; launch.textContent = 'Chưa tải được · Bấm để thử lại'; };
        document.head.append(script);
      });
    }
    // Renumber visible headings/badges after sections were retired.
    let number=0;
    document.querySelectorAll('section:not([data-retired-lesson-section])').forEach(section=>{
      const heading=section.querySelector('h2');
      if(heading && /^\d+\.\s/.test(heading.textContent)) heading.textContent=heading.textContent.replace(/^\d+\.\s/,`${++number}. `);
    });
    let badgeNumber=0;
    document.querySelectorAll('section:not([data-retired-lesson-section]) > div > .badge').forEach(b=>{if(/^\d+$/.test(b.textContent.trim()))b.textContent=String(++badgeNumber).padStart(2,'0')});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',compact,{once:true}); else compact();
})();
