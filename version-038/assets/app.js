(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var filterLists = document.querySelectorAll('[data-filter-list]');

    filterLists.forEach(function (list) {
        var queryInput = list.querySelector('[data-filter-query]');
        var categorySelect = list.querySelector('[data-filter-category]');
        var yearSelect = list.querySelector('[data-filter-year]');
        var items = Array.prototype.slice.call(list.querySelectorAll('[data-search-item]'));

        function getQueryFromUrl() {
            var params = new URLSearchParams(window.location.search);
            return params.get('q') || '';
        }

        if (queryInput && !queryInput.value) {
            queryInput.value = getQueryFromUrl();
        }

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function applyFilters() {
            var keyword = normalize(queryInput ? queryInput.value : '');
            var category = normalize(categorySelect ? categorySelect.value : '');
            var year = normalize(yearSelect ? yearSelect.value : '');

            items.forEach(function (item) {
                var haystack = normalize([
                    item.getAttribute('data-title'),
                    item.getAttribute('data-region'),
                    item.getAttribute('data-year'),
                    item.getAttribute('data-keywords')
                ].join(' '));
                var itemCategory = normalize(item.getAttribute('data-category'));
                var itemYear = normalize(item.getAttribute('data-year'));
                var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchesCategory = !category || itemCategory === category;
                var matchesYear = !year || itemYear === year;

                item.classList.toggle('is-hidden', !(matchesKeyword && matchesCategory && matchesYear));
            });
        }

        if (queryInput) {
            queryInput.addEventListener('input', applyFilters);
        }

        if (categorySelect) {
            categorySelect.addEventListener('change', applyFilters);
        }

        if (yearSelect) {
            yearSelect.addEventListener('change', applyFilters);
        }

        applyFilters();
    });

    window.MoviePlayer = {
        setup: function (options) {
            if (!options) {
                return;
            }

            var video = document.getElementById(options.videoId);
            var overlay = document.getElementById(options.overlayId);
            var button = document.getElementById(options.buttonId);
            var mediaUrl = options.mediaUrl;
            var attached = false;
            var hlsInstance = null;

            if (!video || !overlay || !mediaUrl) {
                return;
            }

            function attachMedia() {
                if (attached) {
                    return;
                }

                attached = true;

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = mediaUrl;
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(mediaUrl);
                    hlsInstance.attachMedia(video);
                    return;
                }

                video.src = mediaUrl;
            }

            function startPlayback() {
                attachMedia();
                overlay.classList.add('is-hidden');
                var playTask = video.play();

                if (playTask && typeof playTask.catch === 'function') {
                    playTask.catch(function () {});
                }
            }

            overlay.addEventListener('click', startPlayback);

            if (button) {
                button.addEventListener('click', function (event) {
                    event.stopPropagation();
                    startPlayback();
                });
            }

            video.addEventListener('click', function () {
                if (video.paused) {
                    startPlayback();
                }
            });

            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        }
    };
}());
