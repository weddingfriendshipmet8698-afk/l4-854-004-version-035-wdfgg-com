document.addEventListener('DOMContentLoaded', function () {
    var navButton = document.querySelector('[data-nav-button]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');
    if (navButton && mobilePanel) {
        navButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var params = new URLSearchParams(window.location.search);
    var queryValue = params.get('q') || '';
    var filterInput = document.querySelector('[data-filter-input]');
    var typeSelect = document.querySelector('[data-type-select]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var empty = document.querySelector('[data-filter-empty]');

    if (filterInput && queryValue) {
        filterInput.value = queryValue;
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function runFilter() {
        if (!cards.length) {
            return;
        }
        var q = normalize(filterInput ? filterInput.value : '');
        var selected = normalize(typeSelect ? typeSelect.value : '');
        var shown = 0;
        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-year'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-type'),
                card.getAttribute('data-tags')
            ].join(' '));
            var type = normalize(card.getAttribute('data-type'));
            var matchedText = !q || haystack.indexOf(q) !== -1;
            var matchedType = !selected || selected === 'all' || type.indexOf(selected) !== -1;
            var visible = matchedText && matchedType;
            card.style.display = visible ? '' : 'none';
            if (visible) {
                shown += 1;
            }
        });
        if (empty) {
            empty.style.display = shown ? 'none' : 'block';
        }
    }

    if (filterInput) {
        filterInput.addEventListener('input', runFilter);
    }
    if (typeSelect) {
        typeSelect.addEventListener('change', runFilter);
    }
    runFilter();
});
