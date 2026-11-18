(() => {
  const sidebar = document.getElementById('gea-sidebar');
  const button = sidebar?.querySelector('.mobile-menu-toggle');
  const panel = sidebar?.querySelector('.mobile-menu-panel');
  if (!sidebar || !button || !panel) return;
  const close = () => {
    sidebar.classList.remove('menu-open');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', 'Abrir menu de navegação');
    button.textContent = '☰';
  };
  button.addEventListener('click', () => {
    const open = sidebar.classList.toggle('menu-open');
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Fechar menu de navegação' : 'Abrir menu de navegação');
    button.textContent = open ? '✕' : '☰';
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  window.matchMedia('(min-width: 701px)').addEventListener('change', close);
})();
