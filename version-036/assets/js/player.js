document.addEventListener('DOMContentLoaded', function () {
    var shell = document.querySelector('[data-player]');
    if (!shell) {
        return;
    }
    var video = shell.querySelector('video');
    var shade = shell.querySelector('[data-player-shade]');
    var button = shell.querySelector('[data-play-button]');
    if (!video) {
        return;
    }
    var playlist = video.getAttribute('data-play') || video.getAttribute('src') || '';
    var loaded = false;

    function attach() {
        if (loaded || !playlist) {
            return;
        }
        loaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = playlist;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new Hls();
            hls.loadSource(playlist);
            hls.attachMedia(video);
        } else {
            video.src = playlist;
        }
    }

    function start() {
        attach();
        video.controls = true;
        if (shade) {
            shade.classList.add('is-hidden');
        }
        var playTask = video.play();
        if (playTask && typeof playTask.catch === 'function') {
            playTask.catch(function () {
                if (shade) {
                    shade.classList.remove('is-hidden');
                }
            });
        }
    }

    if (button) {
        button.addEventListener('click', start);
    }
    if (shade) {
        shade.addEventListener('click', start);
    }
    video.addEventListener('click', function () {
        if (video.paused) {
            start();
        }
    });
});
