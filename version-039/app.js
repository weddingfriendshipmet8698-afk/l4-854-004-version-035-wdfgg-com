(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-nav]");
        if (toggle && nav) {
            toggle.addEventListener("click", function () {
                nav.classList.toggle("is-open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var current = 0;
            var timer = null;
            var show = function (index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("is-active", i === current);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("is-active", i === current);
                });
            };
            var start = function () {
                window.clearInterval(timer);
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5000);
            };
            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            if (prev) {
                prev.addEventListener("click", function () {
                    show(current - 1);
                    start();
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    show(current + 1);
                    start();
                });
            }
            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    show(i);
                    start();
                });
            });
            if (slides.length > 1) {
                start();
            }
        }

        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
        scopes.forEach(function (scope) {
            var form = scope.querySelector("[data-filter-form]");
            if (!form) {
                return;
            }
            var input = form.querySelector("[data-filter-query]");
            var region = form.querySelector("[data-filter-region]");
            var type = form.querySelector("[data-filter-type]");
            var year = form.querySelector("[data-filter-year]");
            var category = form.querySelector("[data-filter-category]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
            var empty = scope.querySelector("[data-empty]");
            var params = new URLSearchParams(window.location.search);
            var q = params.get("q");
            if (q && input) {
                input.value = q;
            }
            var run = function () {
                var qv = normalize(input && input.value);
                var rv = normalize(region && region.value);
                var tv = normalize(type && type.value);
                var yv = normalize(year && year.value);
                var cv = normalize(category && category.value);
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-tags"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-category")
                    ].join(" "));
                    var matched = true;
                    matched = matched && (!qv || haystack.indexOf(qv) !== -1);
                    matched = matched && (!rv || normalize(card.getAttribute("data-region")) === rv);
                    matched = matched && (!tv || normalize(card.getAttribute("data-type")).indexOf(tv) !== -1);
                    matched = matched && (!yv || normalize(card.getAttribute("data-year")) === yv);
                    matched = matched && (!cv || normalize(card.getAttribute("data-category")) === cv);
                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            };
            [input, region, type, year, category].forEach(function (field) {
                if (field) {
                    field.addEventListener("input", run);
                    field.addEventListener("change", run);
                }
            });
            run();
        });
    });

    window.setupMoviePlayer = function (source) {
        var video = document.getElementById("movie-player");
        var start = document.getElementById("player-start");
        var shell = document.getElementById("player-shell");
        if (!video || !source) {
            return;
        }
        var loaded = false;
        var hls = null;
        var begin = function () {
            if (start) {
                start.classList.add("hidden");
            }
            if (loaded) {
                video.play().catch(function () {});
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                video.addEventListener("loadedmetadata", function () {
                    video.play().catch(function () {});
                }, { once: true });
                video.load();
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
                hls.on(window.Hls.Events.ERROR, function (_event, data) {
                    if (data && data.fatal) {
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            hls.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hls.recoverMediaError();
                        } else {
                            hls.destroy();
                        }
                    }
                });
                return;
            }
            video.src = source;
            video.addEventListener("loadedmetadata", function () {
                video.play().catch(function () {});
            }, { once: true });
            video.load();
        };
        if (start) {
            start.addEventListener("click", begin);
        }
        if (shell) {
            shell.addEventListener("click", function (event) {
                if (!loaded && event.target !== video) {
                    begin();
                }
            });
        }
        video.addEventListener("play", function () {
            if (start) {
                start.classList.add("hidden");
            }
        });
    };
})();
