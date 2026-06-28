// DOA — shared behaviours: mobile nav + scroll reveal
(function () {
  // ── Vercel Web Analytics: page views (all pages) + download-click event ──
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
  const vaScript = document.createElement('script');
  vaScript.defer = true;
  vaScript.src = '/_vercel/insights/script.js';
  document.head.appendChild(vaScript);

  // Fire a custom event whenever someone clicks the actual installer download
  document.querySelectorAll('a[href*="releases/latest/download"]').forEach(a => {
    a.addEventListener('click', () => {
      window.va('event', { name: 'Download Clicked', data: { page: location.pathname } });
    });
  });

  const burger = document.getElementById('burger');
  const navLinks = document.getElementById('navLinks');
  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      burger.classList.toggle('active');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        burger.classList.remove('active');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Auto-stagger children inside grids so they cascade in rather than pop all at once
  document.querySelectorAll('.features-grid, .pricing-grid, .steps-flow, .visiontypes-grid').forEach(grid => {
    Array.from(grid.querySelectorAll('.reveal')).forEach((el, i) => {
      if (!el.style.transitionDelay) el.style.transitionDelay = (i * 0.09) + 's';
    });
  });

  // Ishihara plate: scroll-grow reveal
  const plateEls = document.querySelectorAll('.filter-plate-lg');
  if (plateEls.length) {
    const plateObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('grown'), 150);
          plateObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.2 });
    plateEls.forEach(el => plateObs.observe(el));

    // Ishihara plate: idle drift + cursor repel on SVG circles
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const plates = Array.from(plateEls).map(svg => {
        const circles = Array.from(svg.querySelectorAll('circle'))
          .filter(c => parseFloat(c.getAttribute('r')) < 12 && !c.closest('defs'));
        return {
          svg,
          dots: circles.map((c, i) => ({
            el: c,
            ox: parseFloat(c.getAttribute('cx')),
            oy: parseFloat(c.getAttribute('cy')),
            phase: i * 0.61803, // golden ratio spacing keeps phases uncorrelated
            speed: 0.55 + (i % 5) * 0.07,
            amp:   1.2  + (i % 3) * 0.4,
            px: 0, py: 0,   // displacement from origin
            vx: 0, vy: 0,   // velocity
          })),
          mouse: null,             // SVG-local cursor coords
        };
      });

      // Track mouse in SVG-local coordinate space
      plates.forEach(p => {
        p.svg.addEventListener('mousemove', ev => {
          const r = p.svg.getBoundingClientRect();
          // map pixel → viewBox (0-120)
          p.mouse = {
            x: (ev.clientX - r.left) / r.width  * 120,
            y: (ev.clientY - r.top)  / r.height * 120,
          };
        });
        p.svg.addEventListener('mouseleave', () => { p.mouse = null; });
      });

      let t = 0;
      const REPEL_RADIUS = 24;   // viewBox units
      const REPEL_STRENGTH = 0.9;
      const SPRING = 0.06;       // stiffness pulling dots back to origin
      const DAMPEN = 0.78;       // velocity friction each frame

      (function tick() {
        requestAnimationFrame(tick);
        t += 0.016;

        plates.forEach(p => {
          p.dots.forEach(d => {
            // gentle idle sine drift
            const idleX = Math.sin(t * d.speed + d.phase)              * d.amp;
            const idleY = Math.cos(t * d.speed * 0.7 + d.phase * 1.3) * d.amp * 0.8;

            // spring force: pull displacement back toward 0
            let fx = -d.px * SPRING;
            let fy = -d.py * SPRING;

            // cursor repel force
            if (p.mouse) {
              const cx = d.ox + d.px + idleX;
              const cy = d.oy + d.py + idleY;
              const dx = cx - p.mouse.x;
              const dy = cy - p.mouse.y;
              const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
              if (dist < REPEL_RADIUS) {
                const force = (1 - dist / REPEL_RADIUS) * REPEL_STRENGTH;
                fx += (dx / dist) * force;
                fy += (dy / dist) * force;
              }
            }

            // integrate
            d.vx = (d.vx + fx) * DAMPEN;
            d.vy = (d.vy + fy) * DAMPEN;
            d.px += d.vx;
            d.py += d.vy;

            d.el.setAttribute('cx', (d.ox + d.px + idleX).toFixed(2));
            d.el.setAttribute('cy', (d.oy + d.py + idleY).toFixed(2));
          });
        });
      })();
    }
  }

  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.12 });
    revealEls.forEach(el => obs.observe(el));
  }
})();
