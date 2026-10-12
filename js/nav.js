/**
 * Universal Mobile Navigation Engine for Generation News
 * Automatically wires up #mobileMenuToggle and #mobileNavDrawer on all pages.
 */
(function() {
  function initMobileNav() {
    const toggleBtn = document.getElementById('mobileMenuToggle');
    const drawer = document.getElementById('mobileNavDrawer');

    if (!toggleBtn || !drawer) return;

    // Avoid double initialization
    if (toggleBtn.dataset.navInitialized === 'true') return;
    toggleBtn.dataset.navInitialized = 'true';

    function openMenu() {
      drawer.classList.add('open');
      toggleBtn.classList.add('open');
      toggleBtn.setAttribute('aria-expanded', 'true');
      drawer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      drawer.classList.remove('open');
      toggleBtn.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    function toggleMenu() {
      if (drawer.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    }

    toggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleMenu();
    });

    // Close when clicking any nav link inside drawer
    drawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        closeMenu();
      });
    });

    // Close when clicking outside drawer
    document.addEventListener('click', (e) => {
      if (drawer.classList.contains('open') && !drawer.contains(e.target) && !toggleBtn.contains(e.target)) {
        closeMenu();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('open')) {
        closeMenu();
      }
    });

    // Handle viewport resize (e.g. desktop resize closes open drawer)
    window.addEventListener('resize', () => {
      if (window.innerWidth > 1024 && drawer.classList.contains('open')) {
        closeMenu();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileNav);
  } else {
    initMobileNav();
  }
})();
