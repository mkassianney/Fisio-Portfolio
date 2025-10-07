const toggle = document.getElementById("menu-toggle");
const menu = document.getElementById("menu");
const links = document.querySelectorAll("nav a");
const content = document.getElementById("content");

toggle.addEventListener("click", () => {
  menu.classList.toggle("hidden");
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
      section.style.opacity = 0; 
      content.appendChild(section);

      
      requestAnimationFrame(() => {
        section.style.transition = "opacity 0.5s ease-in-out, transform 0.5s ease-in-out";
        section.style.opacity = 1;
        section.style.transform = "translateY(0)";
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
  if (!section) return;
  section.scrollIntoView({ behavior: "smooth" });
}

function animateSection(id) {
  const section = document.getElementById(id);
  if (!section) return;

  section.style.opacity = 0;
  section.style.transform = "translateY(20px)";
  requestAnimationFrame(() => {
    section.style.transition = "opacity 0.7s ease, transform 0.7s ease";
    section.style.opacity = 1;
    section.style.transform = "translateY(0)";
  });
}

function initMap() {
  const mapContainer = document.getElementById('map');
  if (!mapContainer) return;

  mapContainer.style.width = '100%';
  mapContainer.style.height = '400px';

  const map = L.map('map', {
    center: [-23.55052, -46.633308],
    zoom: 12,
    scrollWheelZoom: false
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OSM &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);

  const locations = [
    { name: "Clínica Centro", coords: [-23.55052, -46.633308] },
    { name: "Clínica Bairro", coords: [-23.56789, -46.62500] }
  ];

  const markers = locations.map(loc =>
    L.marker(loc.coords).addTo(map).bindPopup(`<b>${loc.name}</b>`)
  );

  const group = new L.featureGroup(markers);
  map.fitBounds(group.getBounds().pad(0.3));

  setTimeout(() => map.invalidateSize(), 100);
}

const pages = ["sobre.html", "formacoes.html", "servicos.html", "localizacao.html", "contato.html"];

document.addEventListener("DOMContentLoaded", async () => {
  await loadAllPages(pages);

      if (id === "localizacao") {
        requestAnimationFrame(() => initMap());
      }

  links.forEach(link => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const id = link.dataset.page;

      scrollToSection(id);  
      animateSection(id);   

      if (!menu.classList.contains("hidden")) menu.classList.add("hidden");
      history.pushState({ page: id }, "", `#${id}`);
    });
  });


  window.addEventListener("popstate", (event) => {
    const id = event.state ? event.state.page : "index";
    scrollToSection(id);
    animateSection(id);
    if (id === "localizacao") requestAnimationFrame(() => initMap());
  });


  const initialHash = location.hash.replace("#", "") || "index";
  scrollToSection(initialHash);
  animateSection(initialHash);
  if (initialHash === "localizacao") requestAnimationFrame(() => initMap());
});
