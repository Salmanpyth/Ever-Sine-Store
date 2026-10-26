const appGrid = document.getElementById("appGrid");
const searchInput = document.getElementById("searchInput");
const categories = document.getElementById("categories");
const emptyMessage = document.getElementById("emptyMessage");
const yearElement = document.getElementById("year");

let apps = [];
let selectedCategory = "All";

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

function renderApps() {
  const searchText = searchInput.value.trim().toLowerCase();

  const filteredApps = apps.filter((app) => {
    const matchesSearch = [
      app.name,
      app.category,
      app.description
    ].some((value) =>
      String(value || "").toLowerCase().includes(searchText)
    );

    const matchesCategory =
      selectedCategory === "All" ||
      String(app.category || "").toLowerCase() ===
        selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  appGrid.innerHTML = "";

  if (filteredApps.length === 0) {
    emptyMessage.hidden = false;
    return;
  }

  emptyMessage.hidden = true;

  filteredApps.forEach((app) => {
    const card = document.createElement("article");
    card.className = "app-card";

    const top = document.createElement("div");
    top.className = "app-top";

    const icon = document.createElement("img");
    icon.className = "app-icon";
    icon.src = app.icon || "https://placehold.co/100x100/242e44/ffffff?text=App";
    icon.alt = "";
    icon.loading = "lazy";
    icon.onerror = () => {
      icon.onerror = null;
      icon.src = "https://placehold.co/100x100/242e44/ffffff?text=App";
    };

    const info = document.createElement("div");
    info.className = "app-info";

    const name = document.createElement("h3");
    name.textContent = app.name || "Unnamed App";

    const category = document.createElement("div");
    category.className = "app-category";
    category.textContent = app.category || "Apps";

    info.append(name, category);
    top.append(icon, info);

    const description = document.createElement("p");
    description.className = "app-description";
    description.textContent = app.description || "Discover this app.";

    const meta = document.createElement("p");
    meta.className = "app-meta";
    meta.textContent = app.version
      ? `Version ${app.version}`
      : "Available to explore";

    const download = document.createElement("a");
    download.className = "download-btn";
    download.textContent = "Download";

    if (app.downloadUrl) {
      download.href = app.downloadUrl;
      download.target = "_blank";
      download.rel = "noopener noreferrer";
    } else {
      download.href = "mailto:ever-sine@outlook.com";
      download.textContent = "Request App";
    }

    card.append(top, description, meta, download);
    appGrid.appendChild(card);
  });
}

searchInput.addEventListener("input", renderApps);

categories.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;

  selectedCategory = button.dataset.category;

  categories.querySelectorAll(".category").forEach((item) => {
    item.classList.toggle("active", item === button);
  });

  renderApps();
});

async function loadApps() {
  try {
    const response = await fetch("apps.json");

    if (!response.ok) {
      throw new Error("Could not load apps.json");
    }

    const data = await response.json();
    apps = Array.isArray(data) ? data : [];
    renderApps();
  } catch (error) {
    appGrid.innerHTML = "";
    emptyMessage.hidden = false;
    emptyMessage.textContent =
      "Apps could not be loaded. Please check the apps.json file.";
  }
}

loadApps();
