(() => {
  const search = document.getElementById('rail-topic-search');
  if (!search) return;
  const cards = [...document.querySelectorAll('.railway-card')];
  const normalize = value => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
  search.addEventListener('input', () => {
    const query = normalize(search.value.trim());
    cards.forEach(card => { card.hidden = !normalize(card.textContent).includes(query); });
    document.getElementById('rail-no-results').hidden = cards.some(card => !card.hidden);
  });
})();
