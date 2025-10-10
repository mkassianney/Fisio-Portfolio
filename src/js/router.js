const toggle = document.getElementById("menu-toggle");
const menu = document.getElementById("menu");
const links = document.querySelectorAll("nav a");
const content = document.getElementById("content");

toggle.addEventListener("click", () => {
  if (menu.classList.contains("hidden")) {
    menu.classList.remove("hidden");
    menu.classList.add("flex");
    menu.style.maxHeight = menu.scrollHeight + "px";
    menu.style.opacity = "1";
  } else {
    menu.classList.add("hidden");
    menu.classList.remove("flex");
    menu.style.maxHeight = "0";
    menu.style.opacity = "0";
  }
});

async function loadAllPages(pages) {
  for (const page of pages) {
    try {
      const response = await fetch(`/src/views/${page}`);
      if (!response.ok) throw new Error(`Página ${page} não encontrada`);

      const html = await response.text();
      const section = document.createElement("section");
      section.id = page.replace(".html", "");
      section.innerHTML = html;
      section.classList.add("transition-all", "duration-500", "opacity-0", "translate-y-4");

      content.appendChild(section);

      requestAnimationFrame(() => {
        section.classList.remove("opacity-0", "translate-y-4");
      });

    } catch (err) {
      console.error(err);
      const section = document.createElement("section");
      section.innerHTML = `<h2 class="text-center text-red-600 py-12">Erro ao carregar ${page}</h2>`;
      content.appendChild(section);
    }
  }
}

function scrollToSection(id) {
  const section = document.getElementById(id);
  if (section) {
    section.scrollIntoView({ behavior: "smooth" });
  }
}

function animateSection(id) {
  const section = document.getElementById(id);
  if (!section) return;
  section.classList.add("opacity-0", "translate-y-4");

  requestAnimationFrame(() => {
    section.classList.remove("opacity-0", "translate-y-4");
  });
}

let mapInitialized = false;

function initMap() {
  if (mapInitialized) return;
  const mapContainer = document.getElementById("map");
  if (!mapContainer) return;

  const map = L.map("map", {
    center: [-23.55052, -46.633308],
    zoom: 12,
    scrollWheelZoom: false
  });

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OSM &copy; CARTO",
    subdomains: "abcd",
    maxZoom: 19
  }).addTo(map);

  const locations = [
    { name: "Studio Mormaii", coords: [-12.991286619807747, -38.45513581874054] }
  ];

  const markers = locations.map(loc =>
    L.marker(loc.coords).addTo(map).bindPopup(`<b>${loc.name}</b>`)
  );

  const group = new L.featureGroup(markers);
  map.fitBounds(group.getBounds().pad(0.3));

  setTimeout(() => map.invalidateSize(), 200);
  mapInitialized = true;
}

function observeMapSection() {
  const target = document.getElementById("localizacao");
  if (!target) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        initMap();
        observer.disconnect();
      }
    });
  });

  observer.observe(target);
}

const pages = ["sobre.html", "formacoes.html", "servicos.html", "localizacao.html", "contato.html"];

document.addEventListener("DOMContentLoaded", async () => {
  await loadAllPages(pages);
  observeMapSection();

  
  links.forEach(link => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const id = link.dataset.page;

      scrollToSection(id);
      animateSection(id);

      if (id === "localizacao") setTimeout(() => initMap(), 500);

      if (!menu.classList.contains("hidden")) menu.classList.add("hidden");
      history.pushState({ page: id }, "", `#${id}`);
    });
  });

  const initialHash = location.hash.replace("#", "") || "index";
  scrollToSection(initialHash);
  animateSection(initialHash);

  if (initialHash === "localizacao") setTimeout(() => initMap(), 500);

  window.addEventListener("popstate", (event) => {
    const id = event.state ? event.state.page : "index";
    scrollToSection(id);
    animateSection(id);
    if (id === "localizacao") setTimeout(() => initMap(), 500);
  });
});
