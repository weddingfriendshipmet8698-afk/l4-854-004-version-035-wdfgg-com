(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function setupMenu() {
    var toggle = document.querySelector(".nav-toggle");
    var menu = document.querySelector(".mobile-nav");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector(".hero-prev");
    var next = hero.querySelector(".hero-next");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    function play() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        play();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        play();
      });
    }

    if (slides.length > 1) {
      play();
    }
  }

  function setupSearch() {
    var input = document.querySelector(".js-list-search");
    var list = document.querySelector(".searchable-list");
    if (!input || !list) {
      return;
    }
    var items = Array.prototype.slice.call(list.querySelectorAll("[data-search]"));
    var empty = document.querySelector(".empty-state");

    function filter() {
      var words = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
      var shown = 0;
      items.forEach(function (item) {
        var text = (item.getAttribute("data-search") || "").toLowerCase();
        var match = words.every(function (word) {
          return text.indexOf(word) !== -1;
        });
        item.style.display = match ? "" : "none";
        if (match) {
          shown += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", shown === 0);
      }
    }

    input.addEventListener("input", filter);
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".js-player"));
    players.forEach(function (shell) {
      var video = shell.querySelector("video");
      var cover = shell.querySelector(".player-cover");
      if (!video) {
        return;
      }

      function start() {
        var src = video.getAttribute("data-src");
        if (!src) {
          return;
        }
        if (!video.getAttribute("src") && !shell.hlsReady) {
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.setAttribute("src", src);
          } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
              maxBufferLength: 60,
              enableWorker: true
            });
            hls.loadSource(src);
            hls.attachMedia(video);
            shell.hlsReady = true;
            shell.hlsInstance = hls;
          } else {
            video.setAttribute("src", src);
          }
        }
        shell.classList.add("is-playing");
        video.controls = true;
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            shell.classList.remove("is-playing");
          });
        }
      }

      if (cover) {
        cover.addEventListener("click", start);
      }
      video.addEventListener("click", function () {
        if (!video.getAttribute("src") && !shell.hlsReady) {
          start();
        }
      });
      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupSearch();
    setupPlayers();
  });
})();
