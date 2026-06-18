(function () {
  'use strict';

  var hlsLoadPromise = null;
  var hlsUrls = [
    'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js',
    'https://cdn.bootcdn.net/ajax/libs/hls.js/1.5.20/hls.min.js',
    'https://unpkg.com/hls.js@1.5.20/dist/hls.min.js'
  ];

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function loadScriptSequential(urls, index) {
    index = index || 0;
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (index >= urls.length) {
      return Promise.reject(new Error('HLS script load failed'));
    }
    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = urls[index];
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = function () {
        script.remove();
        loadScriptSequential(urls, index + 1).then(resolve).catch(reject);
      };
      document.head.appendChild(script);
    });
  }

  function ensureHls() {
    if (!hlsLoadPromise) {
      hlsLoadPromise = loadScriptSequential(hlsUrls, 0);
    }
    return hlsLoadPromise;
  }

  function setStatus(shell, message) {
    var status = shell.querySelector('[data-player-status]');
    if (status) {
      status.textContent = message;
    }
  }

  function startNative(video, source, shell) {
    video.src = source;
    video.addEventListener('loadedmetadata', function () {
      shell.classList.add('is-playing');
      video.play().catch(function () {
        setStatus(shell, '请点击视频继续播放');
      });
    }, { once: true });
    video.addEventListener('error', function () {
      setStatus(shell, '视频加载失败，请稍后重试');
    }, { once: true });
  }

  function startPlayer(shell) {
    var source = shell.getAttribute('data-source');
    var video = shell.querySelector('video');
    if (!source || !video) {
      setStatus(shell, '未找到播放源');
      return;
    }
    if (shell.dataset.started === '1') {
      video.play();
      return;
    }
    shell.dataset.started = '1';
    shell.classList.add('is-started');
    setStatus(shell, '正在载入播放源');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      startNative(video, source, shell);
      return;
    }

    ensureHls().then(function (Hls) {
      if (Hls && Hls.isSupported()) {
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 60
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          shell.classList.add('is-playing');
          video.play().catch(function () {
            setStatus(shell, '请点击视频继续播放');
          });
        });
        hls.on(Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus(shell, '视频加载失败，请稍后重试');
            hls.destroy();
          }
        });
        shell._hls = hls;
      } else {
        setStatus(shell, '当前浏览器不支持 HLS 播放');
      }
    }).catch(function () {
      startNative(video, source, shell);
    });
  }

  function setupPlayers() {
    document.querySelectorAll('[data-player]').forEach(function (shell) {
      var trigger = shell.querySelector('[data-play-trigger]');
      if (trigger) {
        trigger.addEventListener('click', function () {
          startPlayer(shell);
        });
      }
      var video = shell.querySelector('video');
      if (video) {
        video.addEventListener('play', function () {
          shell.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
          shell.classList.remove('is-playing');
        });
      }
    });
  }

  function setupHero() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });
    restart();
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupCardFilters() {
    document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
      var section = panel.closest('section');
      var cards = section ? Array.prototype.slice.call(section.querySelectorAll('[data-movie-card]')) : [];
      var input = panel.querySelector('[data-card-search]');
      var filters = Array.prototype.slice.call(panel.querySelectorAll('[data-card-filter]'));
      var reset = panel.querySelector('[data-filter-reset]');
      var result = section ? section.querySelector('[data-result-count]') : null;

      function apply() {
        var keyword = normalize(input && input.value);
        var active = {};
        filters.forEach(function (select) {
          active[select.getAttribute('data-card-filter')] = select.value;
        });
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.textContent
          ].join(' '));
          var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchFilters = Object.keys(active).every(function (key) {
            return !active[key] || card.getAttribute('data-' + key) === active[key];
          });
          var isVisible = matchKeyword && matchFilters;
          card.classList.toggle('is-hidden', !isVisible);
          if (isVisible) {
            visible += 1;
          }
        });
        if (result) {
          result.textContent = '当前显示 ' + visible + ' 部';
        }
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      filters.forEach(function (select) {
        select.addEventListener('change', apply);
      });
      if (reset) {
        reset.addEventListener('click', function () {
          if (input) {
            input.value = '';
          }
          filters.forEach(function (select) {
            select.value = '';
          });
          apply();
        });
      }
    });
  }

  function setupGlobalSearch() {
    var index = window.MOVIE_INDEX || [];
    document.querySelectorAll('[data-global-search]').forEach(function (input) {
      var container = input.parentElement;
      var suggest = container ? container.querySelector('[data-search-suggest]') : null;
      if (!suggest) {
        suggest = document.querySelector('[data-search-suggest]');
      }
      if (!suggest) {
        return;
      }

      function close() {
        suggest.classList.remove('is-open');
        suggest.innerHTML = '';
      }

      function render() {
        var keyword = normalize(input.value);
        if (!keyword) {
          close();
          return;
        }
        var matched = index.filter(function (item) {
          var haystack = normalize([item.title, item.year, item.region, item.type, item.category, item.tags, item.oneLine].join(' '));
          return haystack.indexOf(keyword) !== -1;
        }).slice(0, 8);

        if (!matched.length) {
          suggest.innerHTML = '<div class="empty-suggest">没有找到匹配内容</div>';
          suggest.classList.add('is-open');
          return;
        }

        suggest.innerHTML = matched.map(function (item) {
          return [
            '<a href="./' + item.url + '">',
            '<img src="' + item.image + '" alt="' + escapeHtml(item.title) + '">',
            '<span>',
            '<strong>' + escapeHtml(item.title) + '</strong>',
            '<span>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.type) + '</span>',
            '<span>' + escapeHtml(item.oneLine) + '</span>',
            '</span>',
            '</a>'
          ].join('');
        }).join('');
        suggest.classList.add('is-open');
      }

      input.addEventListener('input', render);
      input.addEventListener('focus', render);
      document.addEventListener('click', function (event) {
        if (!container || !container.contains(event.target)) {
          close();
        }
      });
    });
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-main-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupPlayers();
    setupCardFilters();
    setupGlobalSearch();
  });
})();
