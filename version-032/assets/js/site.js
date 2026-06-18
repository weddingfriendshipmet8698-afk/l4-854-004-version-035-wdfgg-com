(function () {
  const mobileButton = document.querySelector('.mobile-toggle');
  const mobilePanel = document.querySelector('.mobile-panel');

  if (mobileButton && mobilePanel) {
    mobileButton.addEventListener('click', function () {
      const isOpen = mobilePanel.classList.toggle('is-open');
      mobileButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      mobileButton.textContent = isOpen ? '×' : '☰';
    });
  }

  document.querySelectorAll('[data-site-search]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const input = form.querySelector('input[name="q"]');
      const query = input ? input.value.trim() : '';
      const target = query ? './search.html?q=' + encodeURIComponent(query) : './search.html';
      window.location.href = target;
    });
  });

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const thumbs = Array.from(hero.querySelectorAll('[data-hero-thumb]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    const activate = function (nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
      thumbs.forEach(function (thumb, thumbIndex) {
        thumb.classList.toggle('is-active', thumbIndex === index);
      });
    };

    const restart = function () {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        activate(index + 1);
      }, 5600);
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        activate(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('mouseenter', function () {
        activate(Number(thumb.getAttribute('data-hero-thumb')) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        activate(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        activate(index + 1);
        restart();
      });
    }

    activate(0);
    restart();
  }

  const filterRoot = document.querySelector('[data-filter-root]');
  if (filterRoot) {
    const input = filterRoot.querySelector('[data-filter-input]');
    const category = filterRoot.querySelector('[data-filter-category]');
    const year = filterRoot.querySelector('[data-filter-year]');
    const type = filterRoot.querySelector('[data-filter-type]');
    const cards = Array.from(filterRoot.querySelectorAll('.movie-card'));
    const empty = filterRoot.querySelector('[data-filter-empty]');
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');

    if (query && input) {
      input.value = query;
    }

    const apply = function () {
      const keyword = input ? input.value.trim().toLowerCase() : '';
      const categoryValue = category ? category.value : '';
      const yearValue = year ? year.value : '';
      const typeValue = type ? type.value : '';
      let visible = 0;

      cards.forEach(function (card) {
        const haystack = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-meta') || '')).toLowerCase();
        const matchKeyword = !keyword || haystack.includes(keyword);
        const matchCategory = !categoryValue || card.getAttribute('data-category') === categoryValue;
        const matchYear = !yearValue || card.getAttribute('data-year') === yearValue;
        const matchType = !typeValue || card.getAttribute('data-type') === typeValue;
        const show = matchKeyword && matchCategory && matchYear && matchType;
        card.classList.toggle('is-hidden', !show);
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    };

    [input, category, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  }
})();
