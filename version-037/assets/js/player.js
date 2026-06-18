(function () {
  function initMoviePlayer(sourceUrl) {
    var video = document.getElementById("moviePlayer");
    var start = document.getElementById("playerStart");
    var shell = document.querySelector(".player-shell");
    var hlsInstance = null;
    var attached = false;

    if (!video || !sourceUrl) {
      return;
    }

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
    }

    function begin() {
      attach();
      if (shell) {
        shell.classList.add("is-playing");
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    if (start) {
      start.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        begin();
      });
    }

    if (shell) {
      shell.addEventListener("click", function (event) {
        if (event.target && event.target.closest && event.target.closest(".player-start")) {
          return;
        }
        if (video.paused) {
          begin();
        }
      });
    }

    video.addEventListener("play", function () {
      if (shell) {
        shell.classList.add("is-playing");
      }
    });

    video.addEventListener("pause", function () {
      if (shell && video.currentTime === 0) {
        shell.classList.remove("is-playing");
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
