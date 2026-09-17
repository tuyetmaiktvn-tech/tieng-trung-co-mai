window.HskAnswerReview = {
  clear() {
    document.getElementById('answer-review')?.remove();
  },
  render(answers, alternatives = {}) {
    this.clear();
    const wrap = document.createElement('div');
    wrap.id = 'answer-review';
    wrap.className = 'answer-review';
    const table = document.createElement('table');
    const caption = document.createElement('caption');
    caption.textContent = 'Bảng xem lại đáp án';
    table.append(caption);
    const head = document.createElement('thead');
    const headings = document.createElement('tr');
    ['Câu', 'Em đã trả lời', 'Đáp án đúng', 'Kết quả'].forEach(label => {
      const th = document.createElement('th'); th.scope = 'col'; th.textContent = label; headings.append(th);
    });
    head.append(headings); table.append(head);
    const body = document.createElement('tbody');
    Object.keys(answers).sort((a, b) => Number(a) - Number(b)).forEach(q => {
      const picked = document.querySelector('input[name="q' + q + '"]:checked')?.value || document.getElementById('q' + q)?.value.trim() || '';
      const correct = document.getElementById('r' + q).classList.contains('ok');
      const row = document.createElement('tr');
      row.className = correct ? 'review-correct' : 'review-incorrect';
      const number = document.createElement('th'); number.scope = 'row';
      const link = document.createElement('a');
      link.href = document.getElementById('question-' + q) ? '#question-' + q : '#r' + q;
      link.textContent = q; number.append(link); row.append(number);
      [picked || 'Chưa trả lời', (alternatives[q] || [answers[q]]).join(' / '), correct ? '✓ Đúng' : picked ? '✗ Sai' : '✗ Bỏ trống'].forEach(value => {
        const cell = document.createElement('td'); cell.textContent = value; row.append(cell);
      });
      body.append(row);
    });
    table.append(body); wrap.append(table); document.getElementById('summary').append(wrap);
  }
};
// Editing an answer invalidates the submitted review on the final tests too.
['input', 'change'].forEach(event => document.addEventListener(event, e => {
  if (!e.target.matches('input[name^="q"]') || !document.getElementById('answer-review')) return;
  window.HskAnswerReview.clear();
  const summary = document.getElementById('summary');
  summary.classList.remove('show');
  document.querySelectorAll('.result').forEach(result => { result.textContent = ''; result.className = 'result'; });
}));
