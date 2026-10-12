(() => {
  const groups = [...document.querySelectorAll('.syn-group')];
  const input = document.getElementById('syn-search');
  if (!input) return;
  const normalize = value => value.normalize('NFD').replace(/\p{M}/gu, '').replace(/[đĐ]/g, 'd').toLowerCase().replace(/[\s'’·]+/g, ' ').trim();
  const index = groups.map(group => normalize(group.textContent));
  function filter() {
    const query = normalize(input.value);
    const tokens = query.split(/\s+/).filter(Boolean);
    let count = 0;
    groups.forEach((group, i) => {
      const text = index[i];
      const match = tokens.every(token => text.includes(token) || text.replace(/ /g, '').includes(token));
      group.hidden = !match;
      if (match) count++;
    });
    document.getElementById('syn-status').textContent = `${count}/${groups.length} nhóm từ`;
    document.getElementById('syn-empty').hidden = count !== 0;
  }
  input.addEventListener('input', filter);
  document.getElementById('syn-clear').addEventListener('click', () => { input.value = ''; filter(); input.focus(); });
  document.getElementById('syn-collapse').addEventListener('click', () => { groups.forEach(group => { group.open = false; }); });
  function openHash() {
    const target = document.getElementById(location.hash.slice(1));
    if (!target?.classList.contains('syn-group')) return;
    input.value = ''; filter(); target.open = true;
    target.scrollIntoView({block:'start'});
  }
  document.querySelector('.syn-tools').hidden = false;
  window.addEventListener('hashchange', openHash);
  openHash();
})();
