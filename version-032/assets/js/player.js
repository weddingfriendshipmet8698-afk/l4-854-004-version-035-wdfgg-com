(function () {
  window.initMoviePlayer = function (config) {
    const video = document.getElementById('movie-player');
    const overlay = document.getElementById('player-overlay');
    const message = document.getElementById('player-message');
    let attached = false;
    let hls = null;

    if (!video || !config || !config.url) {
      return;
    }

    const showMessage = function () {
      if (message) {
        message.classList.add('is-visible');
      }
    };

    const attach = function () {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = config.url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(config.url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showMessage();
          }
        });
      } else {
        video.src = config.url;
      }
    };

    const play = function () {
      attach();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      const promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    };

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    video.addEventListener('error', showMessage);

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
