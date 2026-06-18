(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
      document.body.classList.toggle('menu-open', panel.classList.contains('open'));
    });
  }

  document.querySelectorAll('[data-header-search]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var value = input ? input.value.trim() : '';
      var target = './browse.html';
      if (value) {
        target += '?q=' + encodeURIComponent(value);
      }
      window.location.href = target;
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var next = hero.querySelector('[data-hero-next]');
    var prev = hero.querySelector('[data-hero-prev]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  var filterPanel = document.querySelector('[data-filter-panel]');
  var grid = document.querySelector('[data-card-grid]');
  if (filterPanel && grid) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-card]'));
    var searchInput = filterPanel.querySelector('[data-page-search]');
    var categoryFilter = filterPanel.querySelector('[data-category-filter]');
    var yearFilter = filterPanel.querySelector('[data-year-filter]');
    var typeFilter = filterPanel.querySelector('[data-type-filter]');
    var emptyState = document.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (initialQuery && searchInput) {
      searchInput.value = initialQuery;
    }

    function includesType(cardValue, filterValue) {
      if (!filterValue || filterValue === 'all') {
        return true;
      }
      return cardValue.indexOf(filterValue) !== -1;
    }

    function applyFilters() {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var category = categoryFilter ? categoryFilter.value : 'all';
      var year = yearFilter ? yearFilter.value : 'all';
      var type = typeFilter ? typeFilter.value : 'all';
      var visible = 0;

      cards.forEach(function (card) {
        var searchable = card.getAttribute('data-search') || '';
        var cardCategory = card.getAttribute('data-category') || '';
        var cardYear = card.getAttribute('data-year') || '';
        var cardType = card.getAttribute('data-type') || '';
        var matched = true;

        if (query && searchable.indexOf(query) === -1) {
          matched = false;
        }
        if (category !== 'all' && cardCategory !== category) {
          matched = false;
        }
        if (year !== 'all' && cardYear !== year) {
          matched = false;
        }
        if (!includesType(cardType, type)) {
          matched = false;
        }

        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('show', visible === 0);
      }
    }

    [searchInput, categoryFilter, yearFilter, typeFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }
})();
