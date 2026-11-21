(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const level = Number(document.body.dataset.level);
  const lessons = window.translationLessons[level];
  const answer = $('translation-answer');
  const topic = $('translation-topic');
  const direction = $('translation-direction');
  let active = '0:vi-zh';
  let memory = {};
  const storageKey = `tcm-translation-v1-hsk${level}`;
  try { const parsed = JSON.parse(localStorage.getItem(storageKey) || '{}'); if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) memory = parsed; } catch (_) {}
  const normalize = s => s.normalize('NFC').toLowerCase().replace(/[\p{P}\p{Z}\s]/gu, '');
  const reference = () => lessons[Number(topic.value)][direction.value === 'vi-zh' ? 1 : 2];
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
    active = `${topic.value}:${direction.value}`;
    const row = lessons[Number(topic.value)];
    $('translation-source').textContent = row[direction.value === 'vi-zh' ? 2 : 1];
    $('translation-source').lang = direction.value === 'vi-zh' ? 'vi' : 'zh-CN';
    answer.lang = direction.value === 'vi-zh' ? 'zh-CN' : 'vi';
    answer.value = typeof memory[active] === 'string' ? memory[active] : '';
    $('translation-status').textContent = answer.value ? 'Đã khôi phục bản nháp của bài này.' : 'Bản nháp được lưu riêng theo bài và chiều dịch trên trình duyệt này.';
    clearResult();
  }
  lessons.forEach((row, index) => { const option = document.createElement('option'); option.value = index; option.textContent = `Bài ${index + 1} · ${row[0]}`; topic.append(option); });
  [topic, direction].forEach(select => select.addEventListener('change', () => { store(false); render(); }));
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
    $('translation-hint').textContent = lessons[Number(topic.value)][3];
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
  render();
})();
