/* ============================================================
   Research — theme toggle, scroll reveal, year, carousel.
   ============================================================ */

/* ---- theme toggle (persisted) ---- */
(function () {
  var btn = document.getElementById("theme-toggle");
  if (!btn) return;
  btn.addEventListener("click", function () {
    var d = document.documentElement;
    var next = d.dataset.theme === "dark" ? "light" : "dark";
    /* __setTheme is defined by the boot script in <head>; it writes the
       cookie that carries the choice across the sibling subdomains. */
    if (window.__setTheme) window.__setTheme(next);
    else d.dataset.theme = next;
  });
})();

/* ---- reveal on scroll ---- */
(function () {
  var els = document.querySelectorAll("[data-reveal]");
  if (!els.length || !("IntersectionObserver" in window)) {
    els.forEach(function (el) { el.classList.add("is-in"); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
  els.forEach(function (el) { io.observe(el); });
})();

/* ---- mobile nav drawer ---- */
(function () {
  var toggle = document.getElementById("nav-toggle");
  var nav = document.getElementById("topnav");
  if (!toggle || !nav) return;

  function set(open) {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  }
  toggle.addEventListener("click", function () {
    set(!nav.classList.contains("is-open"));
  });
  /* a drawer that stays open after you pick something, or that you cannot
     dismiss without finding the button again, is worse than no drawer */
  nav.addEventListener("click", function (e) {
    if (e.target.closest("a")) set(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("is-open")) { set(false); toggle.focus(); }
  });
  document.addEventListener("click", function (e) {
    if (!nav.classList.contains("is-open")) return;
    if (!nav.contains(e.target) && !toggle.contains(e.target)) set(false);
  });
})();

/* ---- footer year ---- */
(function () {
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();

/* ---- nav label letter-by-letter stagger ---- */
(function () {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.querySelectorAll(".topnav__link").forEach(function (link, li) {
    var text = link.textContent;
    link.textContent = "";
    link.classList.add("stagger");
    for (var i = 0; i < text.length; i++) {
      var s = document.createElement("span");
      if (text[i] === " ") { s.className = "sp"; s.innerHTML = "&nbsp;"; }
      else s.textContent = text[i];
      s.style.setProperty("--ci", li * 3 + i);
      link.appendChild(s);
    }
  });
})();

/* ---- scrolled nav state ---- */
(function () {
  function onScroll() { document.body.classList.toggle("scrolled", window.scrollY > 40); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();

/* ---- chapter nav: highlight the chapter you're reading ---- */
(function () {
  var nav = document.getElementById("chapnav");
  if (!nav) return;
  var links = Array.prototype.slice.call(nav.querySelectorAll("a"));
  var targets = links.map(function (l) {
    return { link: l, el: document.getElementById(l.getAttribute("href").slice(1)) };
  }).filter(function (t) { return t.el; });
  if (!targets.length) return;

  var ticking = false;
  function update() {
    ticking = false;
    /* active = the last chapter whose top has passed 45% of the viewport */
    var line = window.innerHeight * 0.45;
    var current = targets[0];
    targets.forEach(function (t) {
      if (t.el.getBoundingClientRect().top <= line) current = t;
    });
    targets.forEach(function (t) {
      t.link.classList.toggle("is-active", t === current);
    });
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener("resize", update);
  update();
})();

/* ---- carousels ---- */
(function () {
  document.querySelectorAll(".carousel").forEach(function (carousel) {
    var track = carousel.querySelector(".carousel__track");
    var slides = Array.from(track.children);
    var prev = carousel.querySelector(".prev");
    var next = carousel.querySelector(".next");
    var dotsWrap = carousel.querySelector(".carousel__dots");
    var i = 0;

    slides.forEach(function (_, idx) {
      var dot = document.createElement("button");
      /* not ".dot": the hero eyebrow uses <span class="dot">●</span>, and the
         carousel rule was giving that bullet a cream ring and a pointer cursor */
      dot.className = "carousel__dot" + (idx === 0 ? " active" : "");
      dot.setAttribute("aria-label", "Slide " + (idx + 1));
      dot.addEventListener("click", function () { go(idx); });
      dotsWrap.appendChild(dot);
    });
    var dots = Array.from(dotsWrap.children);

    function go(n) {
      i = (n + slides.length) % slides.length;
      track.style.transform = "translateX(-" + i * 100 + "%)";
      dots.forEach(function (d, idx) { d.classList.toggle("active", idx === i); });
    }
    if (prev) prev.addEventListener("click", function () { go(i - 1); });
    if (next) next.addEventListener("click", function () { go(i + 1); });
  });
})();

/* ---- favicon follows the theme ----
   The SVG carries its own prefers-color-scheme query, which covers the OS
   setting before this runs. That query cannot see the in-page toggle though,
   so swap the file when data-theme changes. The <link> is replaced rather
   than re-pointed: several browsers ignore an href edit on a live icon. */
(function () {
  var cur = document.querySelector('link[rel="icon"]');
  if (!cur) return;
  var base = cur.getAttribute("href").replace(/favicon(-dark|-light)?\.svg$/, "favicon");
  var shown = null;
  function sync() {
    var want = document.documentElement.dataset.theme === "light" ? "light" : "dark";
    if (want === shown) return;
    shown = want;
    var next = document.createElement("link");
    next.rel = "icon";
    next.type = "image/svg+xml";
    next.href = base + "-" + want + ".svg";
    cur.parentNode.replaceChild(next, cur);
    cur = next;
  }
  sync();
  new MutationObserver(sync).observe(document.documentElement,
    { attributes: true, attributeFilter: ["data-theme"] });
})();
