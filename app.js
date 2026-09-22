const STORAGE_KEY = "wildlifeExplorerAnimals";

const starterAnimals = [
  {
    id: "american-kestrel",
    commonName: "American Kestrel",
    scientificName: "Falco sparverius",
    group: "Birds",
    family: "Falconidae",
    genus: "Falco",
    photo: "https://upload.wikimedia.org/wikipedia/commons/1/1b/Falco_sparverius_-California-8.jpg",
    identification: "A small, colorful falcon with a rusty back and tail, blue-gray wings in males, and a distinctive pair of dark facial marks. Often seen perched on wires or hovering while hunting.",
    habitat: "Open country, grasslands, farmland, deserts, parks, and other areas with scattered perches.",
    diet: "Mostly insects and other arthropods, along with small mammals, reptiles, amphibians, and birds.",
    facts: "One of North America's smallest falcons. It can hunt by hovering in place, especially when searching open ground.",
    notes: "",
    sources: "Wikimedia Commons; general natural-history references."
  },
  {
    id: "axolotl",
    commonName: "Axolotl",
    scientificName: "Ambystoma mexicanum",
    group: "Amphibians",
    family: "Ambystomatidae",
    genus: "Ambystoma",
    photo: "https://upload.wikimedia.org/wikipedia/commons/0/0a/Axolotl_ganz.jpg",
    identification: "A fully aquatic salamander with feathery external gills, a broad head, and a long finned tail. Wild individuals are usually dark and mottled rather than the pale color common in captive varieties.",
    habitat: "Historically associated with the freshwater canals and lakes of the Valley of Mexico.",
    diet: "Aquatic invertebrates, small fish, larvae, and other small prey.",
    facts: "Axolotls retain juvenile characteristics into adulthood, a phenomenon called neoteny. They are also famous for their remarkable regenerative abilities.",
    notes: "",
    sources: "Wikimedia Commons; general amphibian references."
  }
];

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[char]));
}

function loadAnimals() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved) && saved.length) return saved;
  } catch (_) {}
  localStorage.setItem(STORAGE_KEY, JSON.stringify(starterAnimals));
  return starterAnimals;
}

function saveAnimals(animals) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(animals));
}

function animalCard(animal) {
  const photo = animal.photo || "https://images.unsplash.com/photo-1452570053594-1b985d6ea890?auto=format&fit=crop&w=1000&q=80";
  return `
    <article class="animal-card">
      <a href="animal.html?id=${encodeURIComponent(animal.id)}">
        <img src="${escapeHTML(photo)}" alt="${escapeHTML(animal.commonName)}" loading="lazy" onerror="this.style.display='none'">
        <div class="animal-card-body">
          <span class="tag">${escapeHTML(animal.group || "Animal")}</span>
          <h3>${escapeHTML(animal.commonName)}</h3>
          <div class="scientific">${escapeHTML(animal.scientificName || "")}</div>
          <span class="card-link">Open field record →</span>
        </div>
      </a>
    </article>`;
}

function setupHome() {
  const groups = document.getElementById("groupGrid");
  const recent = document.getElementById("recentAnimals");
  if (!groups || !recent) return;

  const animals = loadAnimals();
  const counts = {};
  animals.forEach(a => counts[a.group || "Other"] = (counts[a.group || "Other"] || 0) + 1);

  groups.innerHTML = Object.entries(counts).sort((a,b) => a[0].localeCompare(b[0])).map(([group, count]) => `
    <a class="group-card" href="animals.html?group=${encodeURIComponent(group)}">
      <h3>${escapeHTML(group)}</h3><p>${count} journal ${count === 1 ? "entry" : "entries"}</p>
    </a>`).join("");

  recent.innerHTML = animals.slice(-6).reverse().map(animalCard).join("");

  document.getElementById("randomButton")?.addEventListener("click", () => {
    const animal = animals[Math.floor(Math.random() * animals.length)];
    location.href = `animal.html?id=${encodeURIComponent(animal.id)}`;
  });

  const search = document.getElementById("homeSearch");
  const go = () => {
    const q = search.value.trim();
    location.href = `animals.html${q ? "?q=" + encodeURIComponent(q) : ""}`;
  };
  document.getElementById("searchButton")?.addEventListener("click", go);
  search?.addEventListener("keydown", e => { if (e.key === "Enter") go(); });
}

function setupExplore() {
  const grid = document.getElementById("animalGrid");
  if (!grid) return;

  const animals = loadAnimals();
  const search = document.getElementById("animalSearch");
  const filter = document.getElementById("groupFilter");
  const count = document.getElementById("resultCount");
  const empty = document.getElementById("emptyState");

  [...new Set(animals.map(a => a.group).filter(Boolean))].sort().forEach(group => {
    filter.insertAdjacentHTML("beforeend", `<option value="${escapeHTML(group)}">${escapeHTML(group)}</option>`);
  });

  const params = new URLSearchParams(location.search);
  search.value = params.get("q") || "";
  filter.value = params.get("group") || "";

  function render() {
    const q = search.value.trim().toLowerCase();
    const group = filter.value;
    const matches = animals.filter(a => {
      const haystack = [a.commonName,a.scientificName,a.family,a.genus,a.group,a.habitat].join(" ").toLowerCase();
      return (!q || haystack.includes(q)) && (!group || a.group === group);
    });
    count.textContent = `${matches.length} ${matches.length === 1 ? "entry" : "entries"}`;
    grid.innerHTML = matches.map(animalCard).join("");
    empty.classList.toggle("hidden", matches.length !== 0);
  }

  search.addEventListener("input", render);
  filter.addEventListener("change", render);
  document.getElementById("clearFilters")?.addEventListener("click", () => {
    search.value = ""; filter.value = ""; render();
  });
  render();
}

function setupAnimalPage() {
  const page = document.getElementById("animalPage");
  if (!page) return;
  const animals = loadAnimals();
  const id = new URLSearchParams(location.search).get("id");
  const animal = animals.find(a => a.id === id);

  if (!animal) {
    page.innerHTML = `<section class="empty-state"><h1>Species not found</h1><p>That field record does not exist in this journal.</p><a class="button button-primary" href="animals.html">Return to collection</a></section>`;
    return;
  }

  document.title = `${animal.commonName} · Wildlife Field Journal`;
  const photo = animal.photo || "https://images.unsplash.com/photo-1452570053594-1b985d6ea890?auto=format&fit=crop&w=1400&q=80";
  const tax = [
    ["Group", animal.group], ["Family", animal.family], ["Genus", animal.genus]
  ].filter(x => x[1]);

  page.innerHTML = `
    <a class="back-link" href="animals.html">← Back to collection</a>
    <article class="record">
      <div class="record-hero">
        <div class="record-photo"><img src="${escapeHTML(photo)}" alt="${escapeHTML(animal.commonName)}" onerror="this.style.display='none'"></div>
        <div class="record-heading">
          <span class="record-label">FIELD RECORD · ${escapeHTML(animal.group || "ANIMAL")}</span>
          <h1>${escapeHTML(animal.commonName)}</h1>
          <div class="scientific">${escapeHTML(animal.scientificName || "Scientific name not recorded")}</div>
        </div>
      </div>
      <div class="record-sections">
        ${tax.length ? `<section class="record-section"><h2>Classification</h2><div class="taxonomy">${tax.map(([k,v]) => `<div class="taxon"><span>${escapeHTML(k)}</span><strong>${escapeHTML(v)}</strong></div>`).join("")}</div></section>` : ""}
        ${animal.identification ? `<section class="record-section"><h2>Identification</h2><p>${escapeHTML(animal.identification)}</p></section>` : ""}
        ${animal.habitat ? `<section class="record-section"><h2>Habitat</h2><p>${escapeHTML(animal.habitat)}</p></section>` : ""}
        ${animal.diet ? `<section class="record-section"><h2>Diet</h2><p>${escapeHTML(animal.diet)}</p></section>` : ""}
        ${animal.facts ? `<section class="record-section"><h2>Field notes & facts</h2><p>${escapeHTML(animal.facts)}</p></section>` : ""}
        ${animal.notes ? `<section class="record-section"><h2>My notes</h2><p>${escapeHTML(animal.notes)}</p></section>` : ""}
        ${animal.sources ? `<section class="record-section"><h2>Sources</h2><p>${escapeHTML(animal.sources)}</p></section>` : ""}
      </div>
    </article>`;
}

function setupForm() {
  const form = document.getElementById("animalForm");
  if (!form) return;
  form.addEventListener("submit", e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const animals = loadAnimals();
    const base = data.commonName.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    let id = base || `animal-${Date.now()}`;
    let n = 2;
    while (animals.some(a => a.id === id)) id = `${base}-${n++}`;
    animals.push({ id, ...data });
    saveAnimals(animals);
    location.href = `animal.html?id=${encodeURIComponent(id)}`;
  });
}

setupHome();
setupExplore();
setupAnimalPage();
setupForm();
