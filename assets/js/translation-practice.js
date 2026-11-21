(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const level = Number(document.body.dataset.level);
  const lessons = window.translationLessons?.[level] || [];
  const answer = $('translation-answer');
  const topic = $('translation-topic');
  const direction = $('translation-direction');
  const itemSelect = $('translation-item');
  if (!lessons.length) {
    $('practice-heading').textContent = 'Chưa có bài học để liên kết';
    document.querySelector('.translation-filters').hidden = true;
    $('translation-source').textContent = 'Phần luyện dịch sẽ được bổ sung theo từng bài khi học phần này có nội dung. Không sử dụng chủ đề rời rạc thay cho bài học.';
    answer.hidden = true;
    document.querySelector('label[for="translation-answer"]').hidden = true;
    document.querySelector('.translation-actions').hidden = true;
    return;
  }
  let active = '0:vi-zh';
  let memory = {};
  const storageKey = `tcm-translation-lessons-v2-hsk${level}`;
  try { const parsed = JSON.parse(localStorage.getItem(storageKey) || '{}'); if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) memory = parsed; } catch (_) {}
  const normalize = s => s.normalize('NFC').toLowerCase().replace(/[\p{P}\p{Z}\s]/gu, '');
  const currentLesson = () => lessons.find(l => String(l.id) === topic.value);
  const currentItem = () => currentLesson().items.find(i => i.id === itemSelect.value);
  const category = item => item.kind === 'Từ / cụm từ' ? 'word' : /Đoạn|trọn bài/.test(item.kind) ? 'passage' : 'sentence';
  const typeLabel = document.createElement('label');
  typeLabel.htmlFor = 'translation-type'; typeLabel.textContent = 'Dạng luyện';
  const typeSelect = document.createElement('select'); typeSelect.id = 'translation-type';
  typeLabel.append(typeSelect);
  itemSelect.parentNode.insertBefore(typeLabel, itemSelect.previousElementSibling);
  const reference = () => currentItem()[direction.value === 'vi-zh' ? 'zh' : 'vi'];
  function store(showMessage = true) {
    memory[active] = answer.value;
    try {
      localStorage.setItem(storageKey, JSON.stringify(memory));
      if (showMessage) $('translation-status').textContent = 'Đã lưu bản nháp trên trình duyệt này.';
    } catch (_) {
      $('translation-status').textContent = 'Không lưu được trên trình duyệt. Hãy sao chép bài làm trước khi rời trang.';
    }
  }
  function clearResult() {
    $('translation-result').hidden = true;
    document.querySelectorAll('.translation-rubric select').forEach(s => s.value = '');
  }
  function render() {
    active = `${topic.value}:${itemSelect.value}:${direction.value}`;
    const row = currentItem();
    $('translation-source').textContent = row[direction.value === 'vi-zh' ? 'vi' : 'zh'];
    $('translation-source').lang = direction.value === 'vi-zh' ? 'vi' : 'zh-CN';
    answer.lang = direction.value === 'vi-zh' ? 'zh-CN' : 'vi';
    answer.value = typeof memory[active] === 'string' ? memory[active] : '';
    $('translation-status').textContent = answer.value ? 'Đã khôi phục bản nháp của bài này.' : 'Bản nháp được lưu riêng theo bài và chiều dịch trên trình duyệt này.';
    clearResult();
  }
  lessons.forEach(row => { const option = document.createElement('option'); option.value = row.id; option.textContent = `Bài ${row.id} · ${row.title}`; topic.append(option); });
  const requested = new URLSearchParams(location.search).get('lesson');
  topic.value = String(lessons.find(l => String(l.id) === String(Number(requested)))?.id || lessons[0].id);
  function populateItems() {
    itemSelect.replaceChildren();
    const items=currentLesson().items.filter(item=>typeSelect.value==='all'||category(item)===typeSelect.value);
    items.forEach((item,index) => { const option=document.createElement('option'); option.value=item.id; const preview=item[direction.value==='vi-zh'?'vi':'zh'].replace(/\s+/g,' '); option.textContent=`${index+1}. ${item.kind} · ${preview.slice(0,65)}${preview.length>65?'…':''}`; itemSelect.append(option); });
    itemSelect.value=items[0].id;
    $('translation-lesson-link').href=currentLesson().source;
    $('translation-lesson-link').textContent=`Xem lại Bài ${currentLesson().id} · ${currentLesson().title}`;
    $('translation-count').textContent=`${items.length} / ${currentLesson().items.length} mục luyện theo bài học này · Mỗi mục có hai chiều dịch`;
  }
  function populateTypes() {
    const previous=typeSelect.value; typeSelect.replaceChildren();
    for(const [value,label] of [['all','Tất cả'],['sentence','Dịch câu'],['passage','Đoạn ngắn / Hội thoại trọn bài'],['word','Ôn từ / cụm từ']]) {
      if(value!=='all'&&!currentLesson().items.some(item=>category(item)===value))continue;
      const option=document.createElement('option');option.value=value;option.textContent=label;typeSelect.append(option);
    }
    typeSelect.value=[...typeSelect.options].some(o=>o.value===previous)?previous:'all';
  }
  topic.addEventListener('change', () => { store(false); populateTypes(); populateItems(); render(); });
  typeSelect.addEventListener('change', () => { store(false); populateItems(); render(); });
  itemSelect.addEventListener('change', () => { store(false); render(); });
  direction.addEventListener('change', () => { store(false); const id=itemSelect.value; populateItems(); itemSelect.value=id; render(); });
  answer.addEventListener('input', () => { clearResult(); $('translation-status').textContent = 'Có thay đổi chưa lưu. Bấm Lưu bản nháp để lưu bài.'; });
  $('translation-save').addEventListener('click', () => store());
  $('translation-reset').addEventListener('click', () => {
    if (!answer.value || window.confirm('Xóa bài làm và bản nháp của bài đang chọn để làm lại?')) {
      answer.value = ''; store(false); clearResult(); $('translation-status').textContent = 'Đã làm lại bài đang chọn. Các bài khác được giữ nguyên.'; answer.focus();
    }
  });
  $('translation-check').addEventListener('click', () => {
    if (!answer.value.trim()) { $('translation-status').textContent = 'Bạn hãy nhập bản dịch trước khi kiểm tra.'; answer.focus(); return; }
    store(false);
    const exact = normalize(answer.value) === normalize(reference());
    $('translation-reference').textContent = reference();
    $('translation-reference').lang = direction.value === 'vi-zh' ? 'zh-CN' : 'vi';
    $('translation-hint').textContent = currentItem().hint;
    $('translation-score').textContent = exact ? '10/10 · Khớp bản dịch tham khảo' : 'Chưa có điểm tự động cho cách dịch này';
    $('translation-feedback').textContent = exact ? 'Bản dịch khớp mẫu sau khi bỏ qua dấu câu, khoảng trắng và chữ hoa/thường.' : 'Khác bản dịch mẫu không có nghĩa là sai. Đối chiếu ý nghĩa, ngữ pháp và cách diễn đạt, rồi chọn mức tự đánh giá bên dưới.';
    $('translation-rubric').hidden = exact;
    $('translation-result').hidden = false;
  });
  document.querySelectorAll('.translation-rubric select').forEach(select => select.addEventListener('change', () => {
    const values = [...document.querySelectorAll('.translation-rubric select')].map(s => s.value);
    $('translation-score').textContent = values.every(v => v !== '') ? `${values.reduce((sum,v) => sum + Number(v), 0)}/10 · Điểm tự đánh giá` : 'Chọn đủ ba tiêu chí để tính điểm tự đánh giá';
  }));
  window.addEventListener('beforeunload', event => {
    if (answer.value !== (memory[active] || '')) { event.preventDefault(); event.returnValue = ''; }
  });
  populateTypes();
  populateItems();
  render();
})();
