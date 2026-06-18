(function () {
  function text(value) {
    return (value || "").toString().toLowerCase();
  }

  function escapeHtml(value) {
    return (value || "").toString().replace(/[&<>"]/g, function (item) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[item];
    });
  }

  var menuButton = document.querySelector("[data-menu-toggle]");
  var menu = document.querySelector("[data-mobile-menu]");

  if (menuButton && menu) {
    menuButton.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  var globalSearch = document.getElementById("globalSearch");
  var globalCategory = document.getElementById("globalCategory");
  var globalYear = document.getElementById("globalYear");
  var searchResults = document.getElementById("searchResults");
  var movies = window.SITE_MOVIES || [];

  function renderGlobalResults() {
    if (!globalSearch || !searchResults) {
      return;
    }

    var query = text(globalSearch.value).trim();
    var category = globalCategory ? globalCategory.value : "";
    var year = globalYear ? globalYear.value : "";

    if (!query && !category && !year) {
      searchResults.classList.remove("active");
      searchResults.innerHTML = "";
      return;
    }

    var list = movies.filter(function (movie) {
      var haystack = text([movie.title, movie.oneLine, movie.region, movie.genre, movie.tags, movie.category].join(" "));
      var okQuery = !query || haystack.indexOf(query) !== -1;
      var okCategory = !category || movie.category === category;
      var okYear = !year || movie.year === year;
      return okQuery && okCategory && okYear;
    }).slice(0, 48);

    searchResults.innerHTML = list.map(function (movie) {
      return [
        "<a class=\"movie-card poster\" href=\"" + movie.url + "\">",
        "<span class=\"movie-poster\"><img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\"></span>",
        "<span class=\"movie-card-body\">",
        "<strong>" + escapeHtml(movie.title) + "</strong>",
        "<em>" + escapeHtml(movie.year + " · " + movie.region) + "</em>",
        "<span>" + escapeHtml(movie.oneLine) + "</span>",
        "<small>" + escapeHtml(movie.genre) + "</small>",
        "</span>",
        "</a>"
      ].join("");
    }).join("");

    searchResults.classList.add("active");
  }

  [globalSearch, globalCategory, globalYear].forEach(function (item) {
    if (item) {
      item.addEventListener("input", renderGlobalResults);
      item.addEventListener("change", renderGlobalResults);
    }
  });

  document.querySelectorAll("[data-category-filter]").forEach(function (panel) {
    var queryInput = panel.querySelector("[data-filter-query]");
    var genreSelect = panel.querySelector("[data-filter-genre]");
    var yearSelect = panel.querySelector("[data-filter-year]");
    var grid = panel.parentElement.querySelector(".category-movie-grid");

    function filterCards() {
      if (!grid) {
        return;
      }

      var query = queryInput ? text(queryInput.value).trim() : "";
      var genre = genreSelect ? text(genreSelect.value).trim() : "";
      var year = yearSelect ? text(yearSelect.value).trim() : "";

      grid.querySelectorAll("[data-movie-card]").forEach(function (card) {
        var haystack = text([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" "));
        var okQuery = !query || haystack.indexOf(query) !== -1;
        var okGenre = !genre || haystack.indexOf(genre) !== -1;
        var okYear = !year || text(card.getAttribute("data-year")) === year;
        card.hidden = !(okQuery && okGenre && okYear);
      });
    }

    [queryInput, genreSelect, yearSelect].forEach(function (item) {
      if (item) {
        item.addEventListener("input", filterCards);
        item.addEventListener("change", filterCards);
      }
    });
  });
})();
