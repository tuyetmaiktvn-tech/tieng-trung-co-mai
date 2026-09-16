document.querySelectorAll('.rail-sentences').forEach(section => {
  const buttons = [...section.querySelectorAll('[data-sentence-filter]')];
  const cards = [...section.querySelectorAll('.rail-sentence')];
  const status = section.querySelector('.rail-sentence-count');
  function filter(category) {
    cards.forEach(card => { card.hidden = category !== 'all' && card.dataset.category !== category; });
    buttons.forEach(button => {
      const selected = button.dataset.sentenceFilter === category;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    status.textContent = 'Hiển thị ' + cards.filter(card => !card.hidden).length + '/' + cards.length + ' mẫu câu';
  }
  buttons.forEach(button => button.addEventListener('click', () => filter(button.dataset.sentenceFilter)));
  filter('all');
});
