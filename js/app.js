/**
 * GENERATION NEWS — YOUTH DEVELOPMENT PLATFORM
 * Core Application Engine & Reference Interactivity
 * Reference: TurnOver + Havenly + Amaeya
 */

document.addEventListener('DOMContentLoaded', () => {
  // GSAP Registration & Entrance Motion
  if (window.gsap) {
    const ctx = gsap.context(() => {
      gsap.from('.copy > *', {
        y: 25,
        opacity: 0,
        stagger: 0.08,
        duration: 0.7,
        ease: 'power3.out'
      });

      gsap.from('.services .service', {
        x: 35,
        opacity: 0,
        stagger: 0.12,
        duration: 0.8,
        delay: 0.25,
        ease: 'power2.out'
      });
    });

    window.addEventListener('beforeunload', () => ctx.revert());
  }

  /* ==========================================================================
     TURNOVER 3D CANVAS SPIRAL RIBBON ENGINE (Infinite Typography Spiral)
     ========================================================================== */
  const canvas = document.getElementById("scene");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    let paused = reducedMotion.matches;
    let avatar = null, width = 900, height = 800, phase = 0, last = 0, raf = 0;

    const config = {
      speed: 32, // Text travel in design-space pixels per second
      ribbonHeight: 35,
      fontSize: 15
    };

    // Open spiral matching the 3D depth reference:
    // 1. Upper-right diagonal tail behind the avatar.
    // 2. Left-hand curl sweeping in front.
    // 3. Middle return hidden behind the neck.
    // 4. Broad lower sweep across the foreground.
    const sections = [
      {
        front: false,
        points: [[980, 145], [740, 215], [62, 365], [82, 435]],
        colors: ["#ffc456", "#ff9939", "#fa7a2b"]
      },
      {
        front: true,
        points: [[82, 435], [99, 495], [330, 540], [465, 507]],
        colors: ["#ffb36a", "#ff7e35", "#ed5b20"]
      },
      {
        front: false,
        points: [[465, 507], [600, 474], [836, 451], [840, 500]],
        colors: ["#ffbe51", "#ffa135", "#f78a26"]
      },
      {
        front: true,
        points: [[840, 500], [844, 560], [385, 730], [190, 667]],
        colors: ["#ffb941", "#ff8b29", "#f1641b"]
      }
    ];

    function bezier(points, t) {
      const u = 1 - t;
      return {
        x: u * u * u * points[0][0] + 3 * u * u * t * points[1][0] + 3 * u * t * t * points[2][0] + t * t * t * points[3][0],
        y: u * u * u * points[0][1] + 3 * u * u * t * points[1][1] + 3 * u * t * t * points[2][1] + t * t * t * points[3][1]
      };
    }

    // Arc length parametrization
    let totalLength = 0;
    sections.forEach(section => {
      section.start = totalLength;
      section.samples = [];
      let previous = null;
      for (let i = 0; i <= 240; i++) {
        const p = bezier(section.points, i / 240);
        if (previous) totalLength += Math.hypot(p.x - previous.x, p.y - previous.y);
        section.samples.push({ ...p, d: totalLength });
        previous = p;
      }
      section.end = totalLength;
    });

    const mod = (x, n) => (x % n + n) % n;

    function atDistance(section, d) {
      const a = section.samples;
      let lo = 0, hi = a.length - 1;
      while (lo + 1 < hi) {
        const mid = (lo + hi) >> 1;
        if (a[mid].d < d) lo = mid; else hi = mid;
      }
      const p = a[lo], q = a[hi];
      const f = Math.max(0, Math.min(1, (d - p.d) / (q.d - p.d || 1)));
      return { x: p.x + (q.x - p.x) * f, y: p.y + (q.y - p.y) * f, dx: q.x - p.x, dy: q.y - p.y };
    }

    let glyphs = [], textPeriod = 1;
    function prepareText() {
      ctx.font = `500 ${config.fontSize}px "DM Sans", sans-serif`;
      const phrase = "Real Skills   ·   Trades   ·   Sneaker Lab   ·   Digital Creator   ·   Built by Doing   ·   ";
      glyphs = [];
      let advance = 0;
      for (const char of phrase) {
        const w = ctx.measureText(char).width + 0.4;
        glyphs.push({ char, offset: advance + w / 2 });
        advance += w;
      }
      textPeriod = advance;
    }
    prepareText();

    function paintText(section) {
      const half = config.ribbonHeight / 2;
      ctx.save();
      ctx.beginPath();
      section.samples.forEach((p, i) => i ? ctx.lineTo(p.x, p.y - half) : ctx.moveTo(p.x, p.y - half));
      for (let i = section.samples.length - 1; i >= 0; i--) {
        const p = section.samples[i]; ctx.lineTo(p.x, p.y + half);
      }
      ctx.closePath();
      ctx.clip();
      ctx.font = `500 ${config.fontSize}px "DM Sans", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = section.front ? "rgba(255,245,222,0.93)" : "rgba(255,248,233,0.78)";
      const direction = section.points[3][0] < section.points[0][0] ? -1 : 1;
      const shift = mod(phase, textPeriod);

      for (let base = -textPeriod; base < totalLength + textPeriod; base += textPeriod) {
        for (const glyph of glyphs) {
          const offset = direction < 0 ? textPeriod - glyph.offset : glyph.offset;
          const d = base + offset + shift;
          if (d < section.start || d >= section.end) continue;
          const p = atDistance(section, d);
          let angle = Math.atan2(p.dy, p.dx);
          if (p.dx < 0) angle += Math.PI;
          const scale = Math.max(0.25, Math.abs(p.dx) / Math.hypot(p.dx, p.dy));
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(angle);
          ctx.scale(scale, 1);
          ctx.fillText(glyph.char, 0, 0);
          ctx.restore();
        }
      }
      ctx.restore();
    }

    function makeSurface(front) {
      const layer = document.createElement("canvas");
      layer.width = 1100;
      layer.height = 850;
      const c = layer.getContext("2d");
      sections.filter(s => s.front === front).forEach(s => {
        const pts = s.samples, half = config.ribbonHeight / 2;
        const g = c.createLinearGradient(100, 300, 880, 650);
        g.addColorStop(0, s.colors[0]);
        g.addColorStop(0.5, s.colors[1]);
        g.addColorStop(1, s.colors[2]);
        c.beginPath();
        pts.forEach((p, i) => i ? c.lineTo(p.x, p.y - half) : c.moveTo(p.x, p.y - half));
        for (let i = pts.length - 1; i >= 0; i--) c.lineTo(pts[i].x, pts[i].y + half);
        c.closePath();
        c.fillStyle = g;
        c.fill();
        [-half, half].forEach((off, i) => {
          c.beginPath();
          pts.forEach((p, j) => j ? c.lineTo(p.x, p.y + off) : c.moveTo(p.x, p.y + off));
          c.strokeStyle = i ? "#c94d1533" : "#fff0bdbb";
          c.lineWidth = i ? 0.8 : 1.3;
          c.stroke();
        });
      });
      return layer;
    }

    const rearSurface = makeSurface(false);
    const frontSurface = makeSurface(true);

    function draw() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const scale = Math.min(width / 900, height / 800);
      ctx.translate((width - 900 * scale) / 2, (height - 800 * scale) / 2);
      ctx.scale(scale, scale);

      ctx.drawImage(rearSurface, 0, 0);
      sections.filter(s => !s.front).forEach(paintText);
      if (avatar) {
        const ratio = avatar instanceof HTMLImageElement
          ? avatar.naturalHeight / avatar.naturalWidth
          : avatar.height / avatar.width;
        ctx.drawImage(avatar, 20, -35, 860, 860 * ratio);
      }
      ctx.drawImage(frontSurface, 0, 0);
      sections.filter(s => s.front).forEach(paintText);
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      draw();
    }

    function tick(time) {
      raf = 0;
      if (!last) last = time;
      if (!paused) phase += Math.min((time - last) / 1000, 0.05) * config.speed;
      last = time;
      draw();
      if (!paused && !document.hidden) raf = requestAnimationFrame(tick);
    }

    function start() {
      last = 0;
      if (!raf && !paused && !document.hidden) raf = requestAnimationFrame(tick);
    }

    function updateControl() {
      const button = document.getElementById("motion");
      if (button) {
        button.textContent = paused ? "▶ Play ribbon" : "Ⅱ Pause ribbon";
        button.setAttribute("aria-pressed", String(paused));
      }
    }

    const motionBtn = document.getElementById("motion");
    if (motionBtn) {
      motionBtn.onclick = () => {
        paused = !paused;
        updateControl();
        start();
      };
    }

    reducedMotion.addEventListener("change", e => {
      paused = e.matches;
      updateControl();
      start();
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else {
        start();
      }
    });

    // Avatar library with instant live switching
    const avatarPaths = {
      cyber: "./cyber_avatar.png",
      friendly: "./assets/avatars/friendly_student_creator.png",
      warmclay: "./assets/avatars/warm_clay_avatar.png",
      maker: "./assets/avatars/maker_avatar.png"
    };

    const avatarImages = {};
    function setAvatar(type) {
      if (avatarImages[type]) {
        avatar = avatarImages[type];
        draw();
        return;
      }
      const img = new Image();
      img.onload = () => {
        avatarImages[type] = img;
        avatar = img;
        draw();
      };
      img.src = avatarPaths[type];
    }

    // Default is the original cyber avatar as requested
    setAvatar('cyber');

    // Avatar switcher buttons on hero
    const avatarButtons = document.querySelectorAll('.avatar-btn');
    const thumb = document.getElementById("thumbnail");
    avatarButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        avatarButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const type = btn.getAttribute('data-avatar');
        setAvatar(type);
        if (thumb) {
          if (type === 'friendly') thumb.src = "assets/avatars/friendly_student_creator.png";
          else if (type === 'warmclay') thumb.src = "assets/avatars/warm_clay_avatar.png";
          else if (type === 'maker') thumb.src = "assets/avatars/maker_avatar.jpg";
          else thumb.src = "cyber_avatar.png";
        }
      });
    });

    new ResizeObserver(resize).observe(canvas);
    document.fonts.ready.then(() => {
      prepareText();
      draw();
    });

    updateControl();
    start();
  }

  /* ==========================================================================
     HERO DETAILS & INTERACTIVE DIALOG MODAL
     ========================================================================== */
  const dialogContent = {
    trades: ["Trades & Technical Academy", "Learn electrical basics, equipment troubleshooting, carpentry, and hands-on maintenance from master craftspeople. Young adults leave with real-world project portfolios and verified competencies."],
    design: ["Sneaker Lab & Product Design", "Step-by-step footwear deconstruction, design thinking, material dyeing, custom stitching, and building your own resale or custom product line."],
    growth: ["Digital Creator & Commerce", "Master professional video production, creative direction, portfolio presentation, and digital storefront setup to launch your independent micro-business."],
    story: ["Watch Our Story (2 Min)", "See how over 1,240 young people (ages 13–20) turned raw curiosity into tangible craft, paying freelance gigs, and independent community ventures."],
    work: ["Sneaker Lab Cohort — Applications Open", "4 seats remaining for the upcoming summer cohort. Get hands-on equipment access, 1-on-1 industry mentors, and materials supplied."]
  };

  const heroDialog = document.getElementById("details");
  if (heroDialog) {
    document.querySelectorAll("[data-info]").forEach(el => {
      el.addEventListener("click", () => {
        const item = dialogContent[el.dataset.info];
        if (item) {
          const title = document.getElementById("dialog-title");
          const copy = document.getElementById("dialog-copy");
          if (title) title.textContent = item[0];
          if (copy) copy.textContent = item[1];
          heroDialog.showModal();
        }
      });
    });

    const closeBtn = heroDialog.querySelector(".close");
    if (closeBtn) closeBtn.onclick = () => heroDialog.close();

    heroDialog.addEventListener("click", event => {
      if (event.target === heroDialog) heroDialog.close();
    });
  }

  /* ==========================================================================
     1. VIEW ROUTER (12 SECTIONS)
     ========================================================================== */
  const navButtons = document.querySelectorAll('[data-nav-target]');
  const viewSections = document.querySelectorAll('.view-section');

  function switchView(targetViewId) {
    if (!targetViewId) return;

    window.scrollTo({ top: 0, behavior: 'smooth' });

    viewSections.forEach(section => {
      if (section.id === `view-${targetViewId}`) {
        section.classList.add('active-view');
      } else {
        section.classList.remove('active-view');
      }
    });

    navButtons.forEach(btn => {
      if (btn.dataset.navTarget === targetViewId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    window.location.hash = targetViewId;
  }

  navButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      switchView(btn.dataset.navTarget);
    });
  });

  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash && document.getElementById(`view-${hash}`)) {
      switchView(hash);
    }
  });

  if (window.location.hash) {
    const initHash = window.location.hash.replace('#', '');
    if (document.getElementById(`view-${initHash}`)) {
      switchView(initHash);
    }
  }

  /* ==========================================================================
     2. BROWSE BY TRACK: HOVER PREVIEW ANCHORED UPPER / BOTTOM OF TITLE CONTAINER
     ========================================================================== */
  const topicAccordion = document.querySelector('.topics-accordion');
  const topicRows = document.querySelectorAll('.topic-row-item');
  const floatingPreview = document.getElementById('floatingTopicPreview');
  const previewImg = document.getElementById('floatingPreviewImg');
  const previewBadge = document.getElementById('floatingPreviewBadge');

  if (topicRows.length && floatingPreview && previewImg) {
    if (floatingPreview.parentElement !== document.body) {
      document.body.appendChild(floatingPreview);
    }

    const cardWidth = 320;
    const cardHeight = 180;

    if (window.gsap) {
      gsap.set(floatingPreview, {
        xPercent: 0,
        yPercent: 0,
        autoAlpha: 0,
        scale: 0.92,
        rotation: 0,
        transformOrigin: "center center",
        force3D: true
      });

      let currentRow = null;
      let targetX = 0;
      let targetY = 0;

      function updateCardPosition(row, clientX) {
        const titleContainer = row.querySelector('.topic-left-title');
        const titleRect = titleContainer ? titleContainer.getBoundingClientRect() : row.getBoundingClientRect();
        const rowRect = row.getBoundingClientRect();

        // Determine whether to place upper (above) or bottom (below) the title container
        const isFirst = row.dataset.trackId === 'trades';
        const spaceAbove = rowRect.top;
        const placeUpper = !isFirst && spaceAbove >= (cardHeight + 25);

        if (placeUpper) {
          // Appear upper (cleanly above the title container)
          targetY = rowRect.top - cardHeight - 14;
        } else {
          // Appear bottom (cleanly below the title container)
          targetY = rowRect.bottom + 14;
        }

        // Anchor horizontally to the title container with subtle cursor parallax
        const baseLeft = titleRect.left + 20;
        const maxLeft = Math.max(20, Math.min(window.innerWidth - cardWidth - 24, baseLeft));
        const cursorParallax = clientX ? (clientX - (titleRect.left + titleRect.width / 2)) * 0.06 : 0;
        targetX = Math.max(16, Math.min(window.innerWidth - cardWidth - 16, maxLeft + cursorParallax));

        gsap.to(floatingPreview, {
          x: targetX,
          y: targetY,
          duration: 0.28,
          ease: "power2.out",
          overwrite: "auto"
        });
      }

      topicRows.forEach(row => {
        row.addEventListener('mouseenter', (e) => {
          currentRow = row;
          const imgSrc = row.dataset.previewImg;
          const badgeText = row.dataset.trackBadge || 'Active Cohort';

          if (imgSrc) {
            previewImg.src = imgSrc;
            if (previewBadge) previewBadge.textContent = badgeText;

            updateCardPosition(row, e.clientX);

            gsap.to(floatingPreview, {
              autoAlpha: 1,
              scale: 1,
              duration: 0.35,
              ease: "power3.out",
              overwrite: "auto"
            });

            gsap.fromTo(previewImg,
              { scale: 1.15, filter: "brightness(0.9)" },
              { scale: 1.0, filter: "brightness(1)", duration: 0.5, ease: "power2.out", overwrite: "auto" }
            );
          }
        });

        row.addEventListener('mousemove', (e) => {
          if (currentRow === row) {
            updateCardPosition(row, e.clientX);
          }
        });

        row.addEventListener('click', () => {
          switchView('programs');
        });
      });

      if (topicAccordion) {
        topicAccordion.addEventListener('mouseleave', () => {
          currentRow = null;
          gsap.to(floatingPreview, {
            autoAlpha: 0,
            scale: 0.92,
            duration: 0.22,
            ease: "power2.inOut",
            overwrite: "auto"
          });
        });
      }
    }
  }

  /* ==========================================================================
     3. HAVENLY INTERACTIVE GOAL PICKER (Reference 2ed451fc...)
     ========================================================================== */
  const goalPills = document.querySelectorAll('.goal-pill');
  goalPills.forEach(pill => {
    pill.addEventListener('click', () => {
      goalPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      
      const targetProg = pill.dataset.targetProgram;
      if (targetProg) {
        switchView('programs');
      }
    });
  });

  /* ==========================================================================
     4. APPLICATION MODAL & MINOR PARENT CONSENT
     ========================================================================== */
  const appModal = document.getElementById('appModal');
  const openModalBtns = document.querySelectorAll('[data-open-apply]');
  const closeModalBtns = document.querySelectorAll('[data-close-apply]');
  const appForm = document.getElementById('modalAppForm');
  const appSuccessMsg = document.getElementById('modalAppSuccess');
  const programSelect = document.getElementById('modalProgramSelect');
  const ageSelect = document.getElementById('modalAgeSelect');
  const parentConsentRow = document.getElementById('parentConsentRow');

  openModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const prefill = btn.dataset.prefillProgram;
      if (prefill && programSelect) {
        programSelect.value = prefill;
      }
      if (appModal) appModal.classList.add('open');
    });
  });

  closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (appModal) appModal.classList.remove('open');
    });
  });

  if (appModal) {
    appModal.addEventListener('click', (e) => {
      if (e.target === appModal) appModal.classList.remove('open');
    });
  }

  if (ageSelect && parentConsentRow) {
    ageSelect.addEventListener('change', () => {
      const age = parseInt(ageSelect.value, 10);
      if (age < 18) {
        parentConsentRow.style.display = 'block';
        parentConsentRow.querySelectorAll('input').forEach(i => i.required = true);
      } else {
        parentConsentRow.style.display = 'none';
        parentConsentRow.querySelectorAll('input').forEach(i => i.required = false);
      }
    });
  }

  if (appForm) {
    appForm.addEventListener('submit', (e) => {
      e.preventDefault();
      appForm.style.display = 'none';
      if (appSuccessMsg) appSuccessMsg.style.display = 'block';
    });
  }

  /* ==========================================================================
     5. PROGRAM FILTERS (PROGRAMS VIEW)
     ========================================================================== */
  const progCards = document.querySelectorAll('.program-card');
  const progCatFilters = document.querySelectorAll('[data-filter-prog-cat]');
  const progAgeFilters = document.querySelectorAll('[data-filter-prog-age]');

  let selCat = 'all';
  let selAge = 'all';

  function applyProgFilters() {
    progCards.forEach(card => {
      const cCat = card.dataset.category || '';
      const cAge = card.dataset.age || '';

      const matchC = selCat === 'all' || cCat.includes(selCat);
      const matchA = selAge === 'all' || cAge.includes(selAge);

      if (matchC && matchA) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  }

  progCatFilters.forEach(btn => {
    btn.addEventListener('click', () => {
      progCatFilters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selCat = btn.dataset.filterProgCat;
      applyProgFilters();
    });
  });

  progAgeFilters.forEach(btn => {
    btn.addEventListener('click', () => {
      progAgeFilters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selAge = btn.dataset.filterProgAge;
      applyProgFilters();
    });
  });

  /* ==========================================================================
     MOBILE NAVIGATION DRAWER
     ========================================================================== */
  const toggleBtn = document.getElementById('mobileMenuToggle');
  const drawer = document.getElementById('mobileNavDrawer');

  if (toggleBtn && drawer) {
    function toggleMenu() {
      const isOpen = drawer.classList.contains('open');
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    }

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

    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu();
    });

    drawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        closeMenu();
      });
    });

    document.addEventListener('click', (e) => {
      if (drawer.classList.contains('open') && !drawer.contains(e.target) && !toggleBtn.contains(e.target)) {
        closeMenu();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('open')) {
        closeMenu();
      }
    });
  }
});
