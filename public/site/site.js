/* Portfolio + Blog. No dependencies. Motion stops for prefers-reduced-motion and saveData,
   and the band only runs while it is on screen and the tab is visible. */
(function () {
  "use strict";
  var root = document.documentElement;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var still = reduce || !!(navigator.connection && navigator.connection.saveData);
  var hasIO = "IntersectionObserver" in window;
  root.classList.add("js");

  /* Mobile menu: the burger opens the icon menu; items drop in .125 s apart (CSS). */
  var burger = document.querySelector("[data-burger]");
  if (burger) {
    burger.addEventListener("click", function () {
      var open = burger.getAttribute("aria-expanded") !== "true";
      burger.setAttribute("aria-expanded", String(open));
      burger.closest(".hd").classList.toggle("is-open", open);
    });
  }

  /* Reveal once. Whatever is already on screen at load is never hidden. */
  if (!still && hasIO) {
    var els = [].slice.call(document.querySelectorAll("[data-reveal]"));
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        el.classList.add("is-in");
        requestAnimationFrame(function () { el.classList.remove("is-pre"); });
        io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el, i) {
      if (el.getBoundingClientRect().top < innerHeight) return;
      el.style.transitionDelay = (i % 3) * 90 + "ms";
      el.classList.add("is-pre");
      io.observe(el);
    });
  }

  /* The stack band: the page's single ambient motion. */
  var band = document.querySelector("[data-marquee]");
  if (band && !still) {
    band.classList.add("is-running");
    var paused = false;
    var set = function (on) { paused = !on; band.classList.toggle("is-paused", paused); };
    if (hasIO) new IntersectionObserver(function (e) { set(e[0].isIntersecting && !document.hidden); }).observe(band);
    document.addEventListener("visibilitychange", function () { if (document.hidden) set(false); });
    band.addEventListener("mouseenter", function () { set(false); });
    band.addEventListener("mouseleave", function () { set(true); });
  }

  /* Osaka time in the hero. Updates once a minute; no animation. */
  var clock = document.querySelector("[data-clock]");
  if (clock) {
    var fmt = new Intl.DateTimeFormat("ja-JP", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Tokyo" });
    var tick = function () { clock.textContent = fmt.format(new Date()); };
    tick();
    setTimeout(function () { tick(); setInterval(tick, 60000); }, 60000 - (Date.now() % 60000));
  }

  /* Copy the post URL. The button stays hidden where the Clipboard API is missing. */
  var copy = document.querySelector("[data-copy]");
  if (copy && navigator.clipboard) {
    copy.hidden = false;
    copy.addEventListener("click", function () {
      navigator.clipboard.writeText(copy.getAttribute("data-copy")).then(function () {
        copy.textContent = "コピーしました";
        setTimeout(function () { copy.textContent = "リンクをコピー"; }, 2000);
      });
    });
  }

  /* Copy button on code blocks. Hidden where the Clipboard API is missing. */
  if (navigator.clipboard) {
    [].slice.call(document.querySelectorAll(".prose .code")).forEach(function (block) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "code-copy";
      btn.textContent = "コピー";
      btn.addEventListener("click", function () {
        navigator.clipboard.writeText(block.querySelector("pre").innerText).then(function () {
          btn.textContent = "コピーしました";
          setTimeout(function () { btn.textContent = "コピー"; }, 2000);
        });
      });
      block.classList.add("has-copy");
      block.appendChild(btn);
    });
  }

  /* Blog tag filter. Without JS every post is listed and the buttons stay hidden. */
  var filter = document.querySelector("[data-filter]");
  if (filter) {
    var rows = [].slice.call(document.querySelectorAll(".posts > li"));
    var empty = document.querySelector("[data-filter-empty]");
    var apply = function (tag, push) {
      var shown = 0;
      rows.forEach(function (row) {
        var hit = !tag || row.getAttribute("data-tags").split("|").indexOf(tag) >= 0;
        row.hidden = !hit;
        if (hit) shown++;
      });
      [].forEach.call(filter.querySelectorAll("button"), function (b) {
        b.setAttribute("aria-pressed", String(b.getAttribute("data-tag") === tag));
      });
      if (empty) empty.hidden = shown > 0;
      if (push) history.replaceState(null, "", tag ? "?tag=" + encodeURIComponent(tag) : location.pathname);
    };
    filter.hidden = false;
    filter.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (b) apply(b.getAttribute("data-tag"), true);
    });
    var initial = new URLSearchParams(location.search).get("tag");
    if (initial) apply(initial, false);
  }
})();
