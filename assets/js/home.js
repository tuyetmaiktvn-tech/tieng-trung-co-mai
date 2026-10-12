const mobileToggle = document.getElementById('mobileToggle');
const mainNav = document.getElementById('mainNav');
function closeMenu() {
  mainNav.classList.remove('open');
  mobileToggle.setAttribute('aria-expanded', 'false');
  mobileToggle.setAttribute('aria-label', 'Mở menu');
}
mobileToggle.addEventListener('click', () => {
  const open = mainNav.classList.toggle('open');
  mobileToggle.setAttribute('aria-expanded', String(open));
  mobileToggle.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
});
mainNav.querySelectorAll('.nav-button').forEach(button => {
  button.addEventListener('click', () => {
    const item = button.closest('.nav-item');
    item.classList.toggle('expanded');
  });
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeMenu();
    mainNav.querySelectorAll('.expanded').forEach(item => item.classList.remove('expanded'));
    if (mainNav.contains(document.activeElement)) mobileToggle.focus();
  }
});
document.addEventListener('click', event => {
  if (!event.target.closest('.site-header')) closeMenu();
});
mainNav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
