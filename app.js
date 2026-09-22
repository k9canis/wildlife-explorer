const STORAGE_KEY = "wildlifeExplorerAnimals";

const starterAnimals = [
  {
    id:"american-kestrel", name:"American Kestrel", scientificName:"Falco sparverius",
    group:"Birds", family:"Falconidae",
    image:"https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Falco_sparverius_-Michigan%2C_USA-8.jpg/640px-Falco_sparverius_-Michigan%2C_USA-8.jpg",
    description:"A small North American falcon famous for hovering while hunting and for its colorful plumage.",
    habitat:"Open country, grasslands, farmland, deserts, and areas with scattered trees.",
    diet:"Mostly insects and other invertebrates, along with small vertebrates.",
    facts:"American Kestrels are one of the smallest falcons in North America and can hover nearly in place while hunting."
  },
  {
    id:"axolotl", name:"Axolotl", scientificName:"Ambystoma mexicanum",
    group:"Amphibians", family:"Ambystomatidae",
    image:"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Axolotl_ganz.jpg/640px-Axolotl_ganz.jpg",
    description:"A salamander known for retaining juvenile features throughout its life, including external gills.",
    habitat:"Historically associated with freshwater lakes and canals around Mexico City.",
    diet:"Small aquatic animals such as worms, crustaceans, and insect larvae.",
    facts:"Axolotls can regenerate several body structures, making them important animals in scientific research."
  }
];

function getAnimals() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : starterAnimals;
}
function saveAnimals(animals) { localStorage.setItem(STORAGE_KEY, JSON.stringify(animals)); }

function randomAnimal() {
  const animals = getAnimals();
  const animal = animals[Math.floor(Math.random() * animals.length)];
  location.href = `animal.html?id=${encodeURIComponent(animal.id)}`;
}

function searchFromHome() {
  const q = document.getElementById("homeSearch").value.trim();
  location.href = `animals.html${q ? "?search=" + encodeURIComponent(q) : ""}`;
}

function animalCard(a) {
  return `<a class="animal-card" href="animal.html?id=${encodeURIComponent(a.id)}">
    <img src="${escapeHtml(a.image || "")}" alt="${escapeHtml(a.name)}" onerror="this.style.display='none'">
    <div class="card-body">
      <h2>${escapeHtml(a.name)}</h2>
      <div class="scientific">${escapeHtml(a.scientificName || "")}</div>
      <span class="badge">${escapeHtml(a.group)}</span>
    </div>
  </a>`;
}

function renderAnimals() {
  const results = document.getElementById("results");
  if (!results) return;
  const params = new URLSearchParams(location.search);
  const group = params.get("group");
  const initialSearch = params.get("search") || "";
  const search = document.getElementById("animalSearch");
  search.value = initialSearch;
  if (group) document.getElementById("pageTitle").textContent = group;

  function update() {
    const q = search.value.toLowerCase().trim();
    const filtered = getAnimals().filter(a =>
      (!group || a.group === group) &&
      (!q || [a.name,a.scientificName,a.family,a.group].join(" ").toLowerCase().includes(q))
    );
    results.innerHTML = filtered.length ? filtered.map(animalCard).join("") :
      `<p>No animals found. Try another search or add an animal.</p>`;
  }
  search.addEventListener("input", update);
  update();
}

function renderAnimalPage() {
  const target = document.getElementById("animalPage");
  if (!target) return;
  const id = new URLSearchParams(location.search).get("id");
  const a = getAnimals().find(x => x.id === id);
  if (!a) { target.innerHTML = "<h1>Animal not found</h1><p>Try returning to the animal list.</p>"; return; }

  document.title = `${a.name} — Wildlife Explorer`;
  target.innerHTML = `
    <article class="animal-detail">
      ${a.image ? `<img src="${escapeHtml(a.image)}" alt="${escapeHtml(a.name)}">` : ""}
      <div class="detail-content">
        <p class="eyebrow">${escapeHtml(a.group)}</p>
        <h1>${escapeHtml(a.name)}</h1>
        <p class="scientific">${escapeHtml(a.scientificName || "")}</p>
        <p>${escapeHtml(a.description || "")}</p>
        <div class="info-grid">
          <div class="info-box"><h3>Classification</h3><p><strong>Family:</strong> ${escapeHtml(a.family || "—")}</p></div>
          <div class="info-box"><h3>Habitat</h3><p>${escapeHtml(a.habitat || "—")}</p></div>
          <div class="info-box"><h3>Diet</h3><p>${escapeHtml(a.diet || "—")}</p></div>
          <div class="info-box"><h3>Fun facts</h3><p>${escapeHtml(a.facts || "—")}</p></div>
        </div>
      </div>
    </article>`;
}

function setupForm() {
  const form = document.getElementById("animalForm");
  if (!form) return;
  form.addEventListener("submit", e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const id = slugify(data.name);
    const animals = getAnimals();
    const animal = {...data, id};
    const existing = animals.findIndex(a => a.id === id);
    if (existing >= 0) animals[existing] = animal; else animals.push(animal);
    saveAnimals(animals);
    document.getElementById("saveMessage").textContent = `Saved ${data.name}! Opening its page...`;
    setTimeout(() => location.href = `animal.html?id=${encodeURIComponent(id)}`, 500);
  });
}

function slugify(s) { return s.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""); }
function escapeHtml(s) { return String(s ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])); }

renderAnimals();
renderAnimalPage();
setupForm();
