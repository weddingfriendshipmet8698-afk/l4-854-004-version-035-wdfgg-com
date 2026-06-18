(function () {
  var panel = document.querySelector('[data-player]');
  if (!panel) {
    return;
  }

  var video = panel.querySelector('video');
  var button = panel.querySelector('[data-play-button]');
  var stream = panel.getAttribute('data-stream');
  var started = false;
  var hlsInstance = null;

  function bindStream() {
    if (!video || !stream || started) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60
      });
      hlsInstance.loadSource(stream);
      hlsInstance.attachMedia(video);
    } else {
      video.src = stream;
    }

    started = true;
  }

  function playVideo() {
    bindStream();
    panel.classList.add('playing');
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        panel.classList.remove('playing');
      });
    }
  }

  if (button) {
    button.addEventListener('click', playVideo);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (!started || video.paused) {
        playVideo();
      }
    });
    video.addEventListener('play', function () {
      panel.classList.add('playing');
    });
    video.addEventListener('pause', function () {
      if (!video.currentTime) {
        panel.classList.remove('playing');
      }
    });
  }

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
})();
