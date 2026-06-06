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
    d.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) {}
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
      dot.className = "dot" + (idx === 0 ? " active" : "");
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
