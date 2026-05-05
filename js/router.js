window.IELTS = window.IELTS || {};

window.IELTS.router = (() => {
  let routes = {};
  let currentPage = null;

  const register = (name, renderFn) => {
    routes[name] = renderFn;
  };

  const navigate = (page, params = {}) => {
    const render = routes[page];
    if (!render) return;

    const container = document.getElementById('page-container');

    // Slide animation
    container.classList.add('page-exit');
    setTimeout(() => {
      container.innerHTML = '';
      container.classList.remove('page-exit');
      container.classList.add('page-enter');
      render(container, params);
      setTimeout(() => container.classList.remove('page-enter'), 300);
    }, 150);

    // Update nav
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.page === page);
    });

    currentPage = page;
    window.location.hash = page;
  };

  const getCurrentPage = () => currentPage;

  const init = () => {
    // Bottom nav click handler
    document.getElementById('bottom-nav').addEventListener('click', e => {
      const btn = e.target.closest('.nav-btn');
      if (btn && btn.dataset.page) navigate(btn.dataset.page);
    });

    // Back button / hash change
    window.addEventListener('hashchange', () => {
      const page = window.location.hash.slice(1);
      if (page && routes[page] && page !== currentPage) navigate(page);
    });

    // Initial page
    const initialPage = window.location.hash.slice(1) || 'home';
    navigate(initialPage in routes ? initialPage : 'home');
  };

  return { register, navigate, init, getCurrentPage };
})();
