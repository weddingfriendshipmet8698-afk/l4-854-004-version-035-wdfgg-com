document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector("[data-menu-button]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("img[data-cover]").forEach(function (image) {
    image.addEventListener("error", function () {
      image.classList.add("is-hidden");
    });
  });

  document.querySelectorAll("[data-search-input]").forEach(function (input) {
    var scopeSelector = input.getAttribute("data-search-input") || "body";
    var scope = document.querySelector(scopeSelector) || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
    var empty = scope.querySelector("[data-empty]");

    input.addEventListener("input", function () {
      var keyword = input.value.trim().toLowerCase();
      var visible = 0;

      cards.forEach(function (card) {
        var text = card.getAttribute("data-search") || card.textContent || "";
        var matched = !keyword || text.toLowerCase().indexOf(keyword) !== -1;
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    });
  });

  document.querySelectorAll("[data-player]").forEach(function (player) {
    var video = player.querySelector("video");
    var trigger = player.querySelector("[data-play-trigger]");
    var streamUrl = player.getAttribute("data-stream");
    var hlsInstance = null;

    function bindStream() {
      if (!video || !streamUrl) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        if (video.getAttribute("src") !== streamUrl) {
          video.setAttribute("src", streamUrl);
        }
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        if (!hlsInstance) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false,
            backBufferLength: 90
          });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
        }
        return;
      }

      if (video.getAttribute("src") !== streamUrl) {
        video.setAttribute("src", streamUrl);
      }
    }

    function startPlayback() {
      bindStream();
      player.classList.add("is-playing");
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    if (trigger) {
      trigger.addEventListener("click", startPlayback);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          startPlayback();
        }
      });
      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });
    }
  });
});
