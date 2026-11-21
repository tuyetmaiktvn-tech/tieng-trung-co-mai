/* Practice draws only on bilingual material from the current lesson. */
(() => {
  const shuffle = list => {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };
  const normalized = text => text.normalize('NFC').toLowerCase().replace(/[\s.,!?。！？，；;：:]+/g, '');
  function questions(items, direction) {
    const source = direction === 'zhvi' ? 'zh' : 'vi';
    const target = direction === 'zhvi' ? 'vi' : 'zh';
    const seen = new Set();
    return shuffle(items).flatMap(item => {
      const key = normalized(item[source]);
      if (seen.has(key)) return [];
      seen.add(key);
      // Exclude alternate translations of the same prompt from distractors.
      const accepted = new Set(items.filter(x => normalized(x[source]) === key).map(x => normalized(x[target])));
      const wrong = [...new Map(items.filter(x => !accepted.has(normalized(x[target])))
        .map(x => [normalized(x[target]), x[target]])).values()];
      if (wrong.length < 2) return [];
      return [{ prompt: item[source], answer: item[target], options: shuffle([item[target], ...shuffle(wrong).slice(0, 3)]) }];
    });
  }
  window.mountLessonPractice = async (panel, level, lesson) => {
    const host = document.createElement('div'); host.className = 'lesson-quiz'; panel.append(host);
    const el = (tag, text, parent = host) => {
      const node = document.createElement(tag); if (text) node.textContent = text; parent.append(node); return node;
    };
    const button = (label, action, parent = host) => {
      const b = el('button', label, parent); b.type = 'button'; b.addEventListener('click', action); return b;
    };
    async function load() {
      host.replaceChildren(); el('p', 'Đang tải nội dung bài…');
      try {
        if (!window.translationLessons) await new Promise((resolve, reject) => {
          const s = document.createElement('script'); s.src = '../assets/js/translation-data.js';
          s.onload = resolve; s.onerror = () => { s.remove(); reject(new Error('load')); }; document.head.append(s);
        });
        const data = window.translationLessons[level]?.find(x => x.id === lesson);
        if (!data?.items?.length) { host.replaceChildren(); el('p', 'Bài này chưa có dữ liệu luyện chọn đáp án.'); return; }
        menu(data);
      } catch (_) {
        host.replaceChildren(); el('p', 'Chưa tải được nội dung. Vui lòng thử lại.'); button('Thử lại', load);
      }
    }
    function menu(data) {
      host.replaceChildren(); el('h3', `Luyện tập · ${data.title}`);
      el('p', 'Chọn dạng bài. Mỗi lượt sử dụng các câu và từ của bài học hiện tại.');
      const actions = el('div'); actions.className = 'lesson-quiz-actions';
      button('Trung → Việt · Chọn nghĩa', () => start(data, 'zhvi'), actions);
      button('Việt → Trung · Chọn từ / câu', () => start(data, 'vizh'), actions);
    }
    function start(data, direction) {
      const bank = questions(data.items, direction);
      let index = 0, score = 0; const mistakes = [];
      if (!bank.length) { host.replaceChildren(); el('p', 'Chưa đủ phương án khác nhau để tạo bài chọn đáp án.'); button('Quay lại', () => menu(data)); return; }
      function render() {
        host.replaceChildren();
        el('p', `Câu ${index + 1} / ${bank.length} · Đúng ${score} câu`);
        const q = bank[index];
        const prompt = el('h3', q.prompt); prompt.tabIndex = -1; prompt.lang = direction === 'zhvi' ? 'zh-CN' : 'vi';
        const choices = el('div'); choices.className = 'lesson-quiz-choices';
        const feedback = el('p'); feedback.setAttribute('role', 'status');
        let answered = false;
        q.options.forEach((option, i) => {
          const choice = button(`${String.fromCharCode(65 + i)}. ${option}`, () => {
            if (answered) return; answered = true;
            const correct = option === q.answer;
            if (correct) score++; else mistakes.push(q);
            [...choices.children].forEach(b => { b.disabled = true; });
            choice.classList.add(correct ? 'is-correct' : 'is-wrong');
            feedback.textContent = correct ? 'Đúng!' : `Chưa đúng. Đáp án: ${q.answer}`;
            button(index + 1 === bank.length ? 'Xem kết quả' : 'Câu tiếp theo', () => {
              index++; if (index === bank.length) finish(); else render();
            }).focus();
          }, choices);
          choice.lang = direction === 'zhvi' ? 'vi' : 'zh-CN';
        });
        prompt.focus();
      }
      function finish() {
        host.replaceChildren();
        const title = el('h3', `Kết quả: ${score}/${bank.length} câu đúng · ${(score / bank.length * 10).toFixed(1)}/10`);
        title.tabIndex = -1; title.focus();
        if (mistakes.length) {
          el('h4', 'Các câu cần ôn lại');
          const list = el('ul'); mistakes.forEach(q => el('li', `${q.prompt} → ${q.answer}`, list));
        }
        button('Làm lại', () => start(data, direction));
        button('Đổi dạng bài', () => menu(data));
      }
      render();
    }
    await load();
  };
})();
