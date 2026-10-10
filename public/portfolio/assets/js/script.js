/* ==========================================================================
   Portfolio · script.js
   Vanilla JS — no external libraries required.

   What this file replaces from the reference site:
   • Typed.js          → typingText() below (rotating "i am into …" text)
   • particles.js      → ParticleNetwork below (canvas network behind hero)
   • ScrollReveal.js    → revealOnScroll() (IntersectionObserver)
   • Vanilla-Tilt.js   → initTilt() (subtle 3D tilt on portrait & cards)
   • jQuery (navs)     → plain DOM events for the mobile menu / back-to-top
   Everything respects prefers-reduced-motion.
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------------
     CONFIG — edit these to make the site yours (see README.md)
     ------------------------------------------------------------------------ */
  var CONFIG = {
    // Your real email address. Leave "" to keep the [placeholder] behaviour,
    // which shows a hint instead of opening a mail client with a wrong address.
    email: "",
    // Rotating hero text. Also editable in index.html (data-typed-strings).
    typedStrings: ["[Web Development]", "[UI/UX Design]", "[Open Source]", "[Creative Coding]"],
  };

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Marks the document as JS-enabled so .reveal styles only hide content
  // when we can actually reveal it again.
  document.documentElement.classList.add("js");

  /* ------------------------------------------------------------------------
     Helpers
     ------------------------------------------------------------------------ */
  function $(sel, ctx) {
    return (ctx || document).querySelector(sel);
  }

  function $all(sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  }

  var toastEl = $("#toast");
  var toastTimer = null;

  function toast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove("show");
    }, 3200);
  }

  /* ------------------------------------------------------------------------
     1. Header shadow on scroll + back-to-top button
     ------------------------------------------------------------------------ */
  var header = $("#header");
  var scrollTopBtn = $("#scroll-top");

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("scrolled", y > 24);
    if (scrollTopBtn) scrollTopBtn.classList.toggle("show", y > 480);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------------------------------
     2. Mobile navigation
     ------------------------------------------------------------------------ */
  var navToggle = $("#nav-toggle");
  var navMenu = $("#nav-menu");

  function setMenu(open) {
    if (!navToggle || !navMenu) return;
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    navMenu.classList.toggle("open", open);
    document.body.classList.toggle("nav-open", open);
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      setMenu(navMenu.classList.contains("open") === false);
    });

    // Close after choosing a section
    $all("a", navMenu).forEach(function (link) {
      link.addEventListener("click", function () {
        setMenu(false);
      });
    });

    // Close on Escape
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && navMenu.classList.contains("open")) {
        setMenu(false);
        navToggle.focus();
      }
    });

    // Reset state when resizing back to desktop
    window.matchMedia("(min-width: 821px)").addEventListener("change", function (event) {
      if (event.matches) setMenu(false);
    });
  }

  /* ------------------------------------------------------------------------
     3. Active nav link while scrolling (scroll-spy)
     ------------------------------------------------------------------------ */
  var sectionIds = ["home", "about", "skills", "experience", "education", "work", "contact"];
  var sections = sectionIds
    .map(function (id) {
      return document.getElementById(id);
    })
    .filter(Boolean);
  var navLinksById = {};

  $all(".nav-link").forEach(function (link) {
    var id = (link.getAttribute("href") || "").replace("#", "");
    navLinksById[id] = link;
  });

  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          Object.keys(navLinksById).forEach(function (id) {
            navLinksById[id].classList.toggle("active", id === entry.target.id);
          });
        });
      },
      // Section counts as "current" when it crosses the middle band of the viewport
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(function (section) {
      spy.observe(section);
    });
  }

  /* ------------------------------------------------------------------------
     4. Typing effect (Typed.js replacement)
     ------------------------------------------------------------------------ */
  function typingText(element, cursor, strings) {
    if (!element || !strings || !strings.length) return;

    if (reducedMotion.matches) {
      element.textContent = strings[0];
      if (cursor) cursor.style.display = "none";
      return;
    }

    var TYPE_SPEED = 65; // ms per character typed
    var BACK_SPEED = 32; // ms per character deleted
    var HOLD_FULL = 1600; // pause on a finished word
    var HOLD_EMPTY = 400; // pause before typing the next word

    var index = 0;
    var charIndex = 0;
    var deleting = false;

    function tick() {
      var word = strings[index];

      if (!deleting) {
        charIndex += 1;
        element.textContent = word.slice(0, charIndex);
        if (charIndex >= word.length) {
          deleting = true;
          window.setTimeout(tick, HOLD_FULL);
          return;
        }
        window.setTimeout(tick, TYPE_SPEED);
      } else {
        charIndex -= 1;
        element.textContent = word.slice(0, charIndex);
        if (charIndex <= 0) {
          deleting = false;
          index = (index + 1) % strings.length;
          window.setTimeout(tick, HOLD_EMPTY);
          return;
        }
        window.setTimeout(tick, BACK_SPEED);
      }
    }

    element.textContent = "";
    window.setTimeout(tick, HOLD_EMPTY);
  }

  // Allow strings from the HTML attribute (single source of truth)
  var typedEl = $("#typed");
  var typedStrings = CONFIG.typedStrings;
  if (typedEl && typedEl.dataset.typedStrings) {
    try {
      var parsed = JSON.parse(typedEl.dataset.typedStrings);
      if (Array.isArray(parsed) && parsed.length) typedStrings = parsed;
    } catch (error) {
      /* keep defaults */
    }
  }
  typingText(typedEl, $("#typed-cursor"), typedStrings);

  /* ------------------------------------------------------------------------
     5. Particle network behind the hero (particles.js replacement)
     Mirrors the reference config: ~80 nodes, link distance 150px, dark
     semi-transparent dots & lines, hover repels, click pushes.
     ------------------------------------------------------------------------ */
  function ParticleNetwork(canvas) {
    if (!canvas || !canvas.getContext) return null;

    var ctx = canvas.getContext("2d");
    var hero = canvas.parentElement;
    var width = 0;
    var height = 0;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var particles = [];
    var rafId = null;
    var mouse = { x: null, y: null, active: false };

    var CONFIG_P = {
      dotColor: "rgba(6, 12, 40, 0.55)",
      lineColor: "rgba(6, 12, 40, 0.28)",
      linkDistance: 150,
      repulseDistance: 190,
      repulseStrength: 3.6,
      pushStrength: 5,
      density: 90000, // one particle per N px² (~80 on a 1280×700 hero)
      minParticles: 28,
      maxParticles: 110,
    };

    function Particle() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.9;
      this.vy = (Math.random() - 0.5) * 0.9;
      this.radius = 1.2 + Math.random() * 3.4;
    }

    function resize() {
      var rect = hero.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var target = Math.round((width * height) / CONFIG_P.density);
      target = Math.max(CONFIG_P.minParticles, Math.min(CONFIG_P.maxParticles, target));
      particles = [];
      for (var i = 0; i < target; i += 1) particles.push(new Particle());
    }

    function step() {
      ctx.clearRect(0, 0, width, height);

      var i;
      var j;
      var p;

      for (i = 0; i < particles.length; i += 1) {
        p = particles[i];

        // hover repulsion
        if (mouse.active && mouse.x !== null) {
          var dx = p.x - mouse.x;
          var dy = p.y - mouse.y;
          var distSq = dx * dx + dy * dy;
          var reach = CONFIG_P.repulseDistance;
          if (distSq < reach * reach && distSq > 0.01) {
            var dist = Math.sqrt(distSq);
            var force = (reach - dist) / reach;
            p.vx += (dx / dist) * force * CONFIG_P.repulseStrength;
            p.vy += (dy / dist) * force * CONFIG_P.repulseStrength;
          }
        }

        p.x += p.vx;
        p.y += p.vy;

        // soft speed limit keeps motion calm
        var speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 1.6) {
          p.vx = (p.vx / speed) * 1.6;
          p.vy = (p.vy / speed) * 1.6;
        }

        // gentle drift back to base speed
        p.vx *= 0.995;
        p.vy *= 0.995;
        if (Math.abs(p.vx) < 0.12) p.vx += p.vx >= 0 ? 0.03 : -0.03;
        if (Math.abs(p.vy) < 0.12) p.vy += p.vy >= 0 ? 0.03 : -0.03;

        // bounce at edges
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        p.x = Math.max(0, Math.min(width, p.x));
        p.y = Math.max(0, Math.min(height, p.y));
      }

      // links
      ctx.lineWidth = 1;
      for (i = 0; i < particles.length; i += 1) {
        for (j = i + 1; j < particles.length; j += 1) {
          var a = particles[i];
          var b = particles[j];
          var lx = a.x - b.x;
          var ly = a.y - b.y;
          var lDist = Math.sqrt(lx * lx + ly * ly);
          if (lDist < CONFIG_P.linkDistance) {
            ctx.globalAlpha = 1 - lDist / CONFIG_P.linkDistance;
            ctx.strokeStyle = CONFIG_P.lineColor;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;

      // dots
      for (i = 0; i < particles.length; i += 1) {
        p = particles[i];
        ctx.fillStyle = CONFIG_P.dotColor;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      rafId = window.requestAnimationFrame(step);
    }

    function drawStatic() {
      // Reduced motion: draw one calm frame, never animate
      ctx.clearRect(0, 0, width, height);
      var i;
      var j;
      for (i = 0; i < particles.length; i += 1) {
        for (j = i + 1; j < particles.length; j += 1) {
          var a = particles[i];
          var b = particles[j];
          var lx = a.x - b.x;
          var ly = a.y - b.y;
          var lDist = Math.sqrt(lx * lx + ly * ly);
          if (lDist < CONFIG_P.linkDistance) {
            ctx.globalAlpha = (1 - lDist / CONFIG_P.linkDistance) * 0.8;
            ctx.strokeStyle = CONFIG_P.lineColor;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      for (i = 0; i < particles.length; i += 1) {
        ctx.fillStyle = CONFIG_P.dotColor;
        ctx.beginPath();
        ctx.arc(particles[i].x, particles[i].y, particles[i].radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function start() {
      stop();
      if (reducedMotion.matches) {
        drawStatic();
        return;
      }
      rafId = window.requestAnimationFrame(step);
    }

    function stop() {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
    }

    // Pointer interactions
    hero.addEventListener("mousemove", function (event) {
      var rect = canvas.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
      mouse.active = true;
    });

    hero.addEventListener("mouseleave", function () {
      mouse.active = false;
      mouse.x = null;
      mouse.y = null;
    });

    hero.addEventListener("click", function (event) {
      if (reducedMotion.matches) return;
      var rect = canvas.getBoundingClientRect();
      var cx = event.clientX - rect.left;
      var cy = event.clientY - rect.top;
      particles.forEach(function (p) {
        var dx = p.x - cx;
        var dy = p.y - cy;
        var dist = Math.sqrt(dx * dx + dy * dy) || 1;
        if (dist < 260) {
          var force = ((260 - dist) / 260) * CONFIG_P.pushStrength;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }
      });
    });

    // Pause when tab is hidden (saves battery) or motion preference changes
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop();
      else start();
    });

    if (typeof reducedMotion.addEventListener === "function") {
      reducedMotion.addEventListener("change", start);
    }

    var resizeTimer = null;
    window.addEventListener("resize", function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () {
        resize();
        if (reducedMotion.matches) drawStatic();
      }, 180);
    });

    resize();
    start();

    return { restart: start, stop: stop };
  }

  ParticleNetwork($("#particles"));

  /* ------------------------------------------------------------------------
     6. Reveal on scroll (ScrollReveal.js replacement)
     ------------------------------------------------------------------------ */
  function revealOnScroll() {
    var items = $all(".reveal");
    if (!items.length) return;

    if (reducedMotion.matches || !("IntersectionObserver" in window)) {
      items.forEach(function (el) {
        el.classList.add("revealed");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target); // reveal once, like the reference
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    items.forEach(function (el) {
      observer.observe(el);
    });
  }

  revealOnScroll();

  /* ------------------------------------------------------------------------
     7. Subtle 3D tilt (Vanilla-Tilt.js replacement, max 12°)
     ------------------------------------------------------------------------ */
  function initTilt() {
    var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine || reducedMotion.matches) return;

    $all("[data-tilt]").forEach(function (el) {
      var MAX = 12;

      el.addEventListener("mousemove", function (event) {
        var rect = el.getBoundingClientRect();
        var px = (event.clientX - rect.left) / rect.width; // 0..1
        var py = (event.clientY - rect.top) / rect.height; // 0..1
        var rotateY = (px - 0.5) * 2 * MAX;
        var rotateX = (0.5 - py) * 2 * MAX;
        el.style.transform =
          "perspective(900px) rotateX(" + rotateX.toFixed(2) + "deg) rotateY(" +
          rotateY.toFixed(2) + "deg) scale3d(1.02, 1.02, 1.02)";
      });

      el.addEventListener("mouseleave", function () {
        el.style.transition = "transform 0.5s ease";
        el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
        window.setTimeout(function () {
          el.style.transition = "";
        }, 500);
      });
    });
  }

  initTilt();

  /* ------------------------------------------------------------------------
     8. Placeholder links — honest hints instead of broken navigation
     ------------------------------------------------------------------------ */
  var PLACEHOLDER_HINT =
    "Placeholder link — put your real URL in index.html (see README.md).";

  document.addEventListener("click", function (event) {
    var link = event.target.closest ? event.target.closest("[data-placeholder-link]") : null;
    if (!link) return;
    event.preventDefault();
    toast(PLACEHOLDER_HINT);
  });

  /* ------------------------------------------------------------------------
     9. Contact — real, safe behaviour:
     a mailto: link + a form that composes an email in the visitor's own
     mail app. Nothing is ever "sent" by this page.
     ------------------------------------------------------------------------ */
  function emailReady() {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(CONFIG.email);
  }

  // Reflect a configured email in the UI
  var contactMail = $("#contact-mail");
  if (emailReady()) {
    $all("[data-email-text]").forEach(function (el) {
      el.textContent = CONFIG.email;
    });
    if (contactMail) {
      contactMail.setAttribute("href", "mailto:" + CONFIG.email);
      contactMail.removeAttribute("data-placeholder-link");
    }
  } else if (contactMail) {
    contactMail.setAttribute("href", "#");
    contactMail.addEventListener("click", function (event) {
      event.preventDefault();
      toast("Add your email in assets/js/script.js (CONFIG.email) — see README.md.");
    });
  }

  var contactForm = $("#contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!emailReady()) {
        toast("Add your email in assets/js/script.js (CONFIG.email) first — see README.md.");
        return;
      }

      var name = $("#cf-name").value.trim();
      var sender = $("#cf-email").value.trim();
      var message = $("#cf-message").value.trim();

      if (!name || !sender || !message) {
        toast("Please fill in your name, email and message.");
        return;
      }

      var subject = "Portfolio message from " + name;
      var body =
        message + "\n\n— " + name + " (" + sender + ")";

      var href =
        "mailto:" + CONFIG.email +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);

      // Hands off to the visitor's mail app — nothing is sent from this page.
      window.location.href = href;
      toast("Opening your mail app… nothing is sent automatically.");
    });
  }

  /* ------------------------------------------------------------------------
     10. Footer year
     ------------------------------------------------------------------------ */
  var yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
