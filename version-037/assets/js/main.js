(function () {
  function normalize(text) {
    return String(text || "").toLowerCase().trim();
  }

  function setupNavigation() {
    var header = document.querySelector(".site-header");
    var toggle = document.querySelector(".mobile-toggle");
    if (!header || !toggle) {
      return;
    }
    toggle.addEventListener("click", function () {
      header.classList.toggle("nav-open");
    });
  }

  function setupFilters() {
    var blocks = document.querySelectorAll("[data-filter-form]");
    blocks.forEach(function (block) {
      var input = block.querySelector("[data-filter-keyword]");
      var year = block.querySelector("[data-filter-year]");
      var region = block.querySelector("[data-filter-region]");
      var type = block.querySelector("[data-filter-type]");
      var scopeId = block.getAttribute("data-filter-target");
      var scope = scopeId ? document.getElementById(scopeId) : document;
      var cards = scope ? Array.prototype.slice.call(scope.querySelectorAll(".search-item")) : [];
      var noResult = scope ? scope.querySelector(".no-result") : null;

      function matches(card) {
        var keyword = normalize(input ? input.value : "");
        var yearValue = normalize(year ? year.value : "");
        var regionValue = normalize(region ? region.value : "");
        var typeValue = normalize(type ? type.value : "");
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-genre")
        ].join(" "));

        if (keyword && haystack.indexOf(keyword) === -1) {
          return false;
        }
        if (yearValue && normalize(card.getAttribute("data-year")) !== yearValue) {
          return false;
        }
        if (regionValue && normalize(card.getAttribute("data-region")).indexOf(regionValue) === -1) {
          return false;
        }
        if (typeValue && normalize(card.getAttribute("data-type")).indexOf(typeValue) === -1) {
          return false;
        }
        return true;
      }

      function apply() {
        var visible = 0;
        cards.forEach(function (card) {
          var ok = matches(card);
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });
        if (noResult) {
          noResult.classList.toggle("is-visible", visible === 0);
        }
      }

      [input, year, region, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q && input) {
        input.value = q;
      }
      apply();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupNavigation();
    setupFilters();
  });
})();
