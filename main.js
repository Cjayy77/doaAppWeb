// DOA — shared behaviours: mobile nav + scroll reveal
(function () {
  const burger = document.getElementById('burger');
  const navLinks = document.getElementById('navLinks');
  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      burger.classList.toggle('active');
    });
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        burger.classList.remove('active');
      });
    });
  }

  // Auto-stagger children inside grids so they cascade in rather than pop all at once
  document.querySelectorAll('.features-grid, .pricing-grid, .steps-flow, .visiontypes-grid').forEach(grid => {
    Array.from(grid.querySelectorAll('.reveal')).forEach((el, i) => {
      if (!el.style.transitionDelay) el.style.transitionDelay = (i * 0.09) + 's';
    });
  });

  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.12 });
    revealEls.forEach(el => obs.observe(el));
  }
})();
