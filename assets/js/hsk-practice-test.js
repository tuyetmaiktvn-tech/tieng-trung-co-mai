document.addEventListener('DOMContentLoaded', () => {
  const config = JSON.parse(document.getElementById('test-config').textContent);
  const radios = [...document.querySelectorAll('input[type="radio"]')];
  const written = [...document.querySelectorAll('.written-answer')];
  const summary = document.getElementById('summary');
  const audio = document.getElementById('testAudio');
  let startedAt = null, elapsedMs = 0, tick = null, submitted = false;
  const answer = q => document.querySelector('input[name="q' + q + '"]:checked')?.value || document.getElementById('q' + q)?.value.trim() || '';
  const normalizeWriting = value => value.normalize('NFKC').replace(/[\s\p{P}]/gu, '');
  function renderTime() {
    const seconds = Math.floor((elapsedMs + (startedAt === null ? 0 : Date.now() - startedAt)) / 1000);
    document.getElementById('elapsed').textContent = String(Math.floor(seconds / 60)).padStart(2, '0') + ':' + String(seconds % 60).padStart(2, '0');
  }
  function startTime() {
    if (startedAt !== null || submitted) return;
    startedAt = Date.now(); tick = setInterval(renderTime, 1000);
  }
  function stopTime() {
    if (startedAt !== null) elapsedMs += Date.now() - startedAt;
    startedAt = null; clearInterval(tick); tick = null; renderTime();
  }
  function clearResults() {
    summary.hidden = true;
    document.querySelectorAll('.result').forEach(el => { el.textContent = ''; el.className = 'result'; });
    document.getElementById('reviewLinks').replaceChildren();
  }
  function progress() {
    let count = 0;
    for (let q = 1; q <= config.total; q++) if (answer(q)) count++;
    document.getElementById('progress').textContent = 'Đã làm ' + count + '/' + config.total + ' câu';
    return count;
  }
  function answerChanged() {
    if (submitted) { submitted = false; clearResults(); }
    startTime(); progress();
  }
  radios.forEach(input => input.addEventListener('change', answerChanged));
  written.forEach(input => input.addEventListener('input', answerChanged));
  audio.addEventListener('play', startTime);
  document.getElementById('submitTest').addEventListener('click', () => {
    stopTime(); submitted = true; audio.pause();
    let correct = 0;
    const links = document.getElementById('reviewLinks'); links.replaceChildren();
    for (let q = 1; q <= config.total; q++) {
      const picked = answer(q), expected = config.answers[q], result = document.getElementById('r' + q);
      const isWritten = written.some(input => input.name === 'q' + q);
      const accepted = config.acceptedAnswers?.[q] || [expected];
      const matches = isWritten ? accepted.some(value => normalizeWriting(picked) === normalizeWriting(value)) : picked === expected;
      if (matches) { correct++; result.textContent = '✓ Đúng'; result.className = 'result ok'; }
      else {
        result.textContent = (picked ? 'Sai. ' : 'Chưa trả lời. ') + 'Đáp án: ' + accepted.join(' / ');
        result.className = 'result bad';
        const link = document.createElement('a'); link.href = '#question-' + q; link.textContent = 'Câu ' + q; links.append(link);
      }
    }
    const answered = progress();
    document.getElementById('scoreText').textContent = correct + '/' + config.total + ' câu đúng · ' + Math.round(correct / config.total * 100) + '/100 điểm luyện tập';
    document.getElementById('detailText').textContent = 'Đã trả lời ' + answered + '/' + config.total + ' câu. Sai hoặc bỏ trống: ' + (config.total - correct) + ' câu.';
    summary.hidden = false; summary.scrollIntoView({behavior: 'smooth', block: 'start'});
  });
  document.getElementById('resetTest').addEventListener('click', () => {
    stopTime(); submitted = false; elapsedMs = 0;
    audio.pause(); audio.currentTime = 0;
    radios.forEach(input => { input.checked = false; });
    written.forEach(input => { input.value = ''; });
    clearResults(); progress(); renderTime();
  });
});
