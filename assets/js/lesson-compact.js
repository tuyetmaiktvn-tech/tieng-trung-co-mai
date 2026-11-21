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
    const lesson = Number(location.pathname.match(/lesson(\d+)/)[1]);
    for (const [name,href] of [['Luyện từ',vocab && '#'+(vocab.closest('section')?.id || vocab.id)],['Ngữ pháp',grammar && '#'+(grammar.closest('section')?.id || grammar.id)],['Luyện dịch',`hsk${level}-translation.html?lesson=${lesson}`]]) {
      if(!href) continue;
      const a=document.createElement('a');a.href=href;a.textContent=name;nav.append(a);
    }
    hero.after(nav);
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
