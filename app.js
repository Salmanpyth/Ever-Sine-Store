(function () {
  "use strict";

  var CONTACT_EMAIL = "ever-sine@outlook.com";
  var CATALOG_URL = "./apps.json";

  var allApps = [];
  var activeCategory = "All";
  var searchTerm = "";

  var grid = document.getElementById("app-grid");
  var message = document.getElementById("message");
  var countEl = document.getElementById("result-count");
  var searchInput = document.getElementById("search");
  var filterButtons = document.querySelectorAll(".chip");

  function asText(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function normalizeApp(raw) {
    if (!raw || typeof raw !== "object") return null;
    var name = asText(raw.name);
    if (!name) return null;
    return {
      name: name,
      category: asText(raw.category) || "Apps",
      description: asText(raw.description) || "No description available.",
      version: asText(raw.version),
      icon: asText(raw.icon),
      downloadUrl: asText(raw.downloadUrl)
    };
  }

  function isSafeUrl(url) {
    return /^(https?:\/\/|\.\/|\.\.\/|[A-Za-z0-9_\-][^:]*$)/.test(url);
  }

  function buildIcon(app) {
    var wrap = document.createElement("div");
    wrap.className = "app-icon";
    wrap.setAttribute("aria-hidden", "true");

    var fallback = app.name.charAt(0).toUpperCase();
    wrap.textContent = fallback;

    if (app.icon && isSafeUrl(app.icon)) {
      var img = document.createElement("img");
      img.alt = "";
      img.loading = "lazy";
      img.decoding = "async";
      img.addEventListener("load", function () {
        wrap.textContent = "";
        wrap.appendChild(img);
      });
      img.addEventListener("error", function () {
        img.remove();
        wrap.textContent = fallback;
      });
      img.src = app.icon;
    }
    return wrap;
  }

  function buildAction(app) {
    var link = document.createElement("a");
    if (app.downloadUrl && isSafeUrl(app.downloadUrl)) {
      link.className = "btn btn-primary";
      link.href = app.downloadUrl;
      link.textContent = "Download";
      link.setAttribute("download", "");
      link.rel = "noopener noreferrer";
      link.setAttribute("aria-label", "Download " + app.name);
    } else {
      link.className = "btn btn-secondary";
      var subject = "App request: " + app.name;
      link.href = "mailto:" + CONTACT_EMAIL + "?subject=" + encodeURIComponent(subject);
      link.textContent = "Request App";
      link.setAttribute("aria-label", "Request " + app.name + " by email");
    }
    return link;
  }

  function buildCard(app, index) {
    var card = document.createElement("article");
    card.className = "card";
    card.style.animationDelay = Math.min(index, 8) * 50 + "ms";

    var top = document.createElement("div");
    top.className = "card-top";
    top.appendChild(buildIcon(app));

    var titleWrap = document.createElement("div");
    titleWrap.className = "card-title";
    var title = document.createElement("h3");
    title.textContent = app.name;
    var badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = app.category;
    titleWrap.appendChild(title);
    titleWrap.appendChild(badge);
    top.appendChild(titleWrap);

    var desc = document.createElement("p");
    desc.className = "card-desc";
    desc.textContent = app.description;

    var foot = document.createElement("div");
    foot.className = "card-foot";
    var version = document.createElement("span");
    version.className = "version";
    version.textContent = app.version ? "Version " + app.version : "Version not listed";
    foot.appendChild(version);
    foot.appendChild(buildAction(app));

    card.appendChild(top);
    card.appendChild(desc);
    card.appendChild(foot);
    return card;
  }

  function showMessage(title, body, isError) {
    message.textContent = "";
    message.classList.toggle("is-error", !!isError);
    var strong = document.createElement("strong");
    strong.textContent = title;
    var span = document.createElement("span");
    span.textContent = body;
    message.appendChild(strong);
    message.appendChild(span);
    message.hidden = false;
  }

  function hideMessage() {
    message.hidden = true;
    message.textContent = "";
    message.classList.remove("is-error");
  }

  function getFiltered() {
    var term = searchTerm.toLowerCase();
    return allApps.filter(function (app) {
      var categoryOk = activeCategory === "All" || app.category.toLowerCase() === activeCategory.toLowerCase();
      if (!categoryOk) return false;
      if (!term) return true;
      var haystack = (app.name + " " + app.category + " " + app.description).toLowerCase();
      return haystack.indexOf(term) !== -1;
    });
  }

  function render() {
    var results = getFiltered();
    grid.textContent = "";

    if (results.length === 0) {
      countEl.textContent = "";
      if (allApps.length === 0) {
        showMessage("No apps yet", "The catalog is empty right now. Please check back soon.", false);
      } else {
        showMessage("No matching apps found", "Try a different search word or choose another category.", false);
      }
      return;
    }

    hideMessage();
    countEl.textContent = results.length + (results.length === 1 ? " app found" : " apps found");
    var fragment = document.createDocumentFragment();
    results.forEach(function (app, i) {
      fragment.appendChild(buildCard(app, i));
    });
    grid.appendChild(fragment);
  }

  function setCategory(category) {
    activeCategory = category;
    filterButtons.forEach(function (btn) {
      var active = btn.getAttribute("data-category") === category;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
    render();
  }

  function bindEvents() {
    searchInput.addEventListener("input", function () {
      searchTerm = searchInput.value.trim();
      render();
    });
    filterButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        setCategory(btn.getAttribute("data-category"));
      });
    });
  }

  function loadCatalog() {
    showMessage("Loading apps", "Please wait a moment.", false);
    fetch(CATALOG_URL, { cache: "no-cache" })
      .then(function (response) {
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.json();
      })
      .then(function (data) {
        if (!Array.isArray(data)) throw new Error("apps.json must contain a list of apps");
        allApps = data.map(normalizeApp).filter(Boolean);
        render();
      })
      .catch(function () {
        grid.textContent = "";
        countEl.textContent = "";
        showMessage(
          "Could not load the app catalog",
          "Please check your internet connection and refresh the page. If you opened the file directly from your computer, run it through a web server or GitHub Pages instead.",
          true
        );
      });
  }

  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  bindEvents();
  loadCatalog();
})();
