const KEY="wildlifeExplorerAnimals";
const starters=[
{id:"american-kestrel",commonName:"American Kestrel",scientificName:"Falco sparverius",category:"Birds",order:"Falconiformes",orderCommon:"Falcons",family:"Falconidae",familyCommon:"Falcons",genus:"Falco",genusCommon:"Falcons",countries:"Canada, United States, Mexico, and much of Central and South America",habitat:"Open country, grasslands, agricultural areas, deserts, and urban edges",rangeMap:"",generationLength:"About 3 years",migratory:"Partially migratory",status:"Least Concern",trend:"Generally stable",threats:"Habitat change, pesticides, collisions, and competition for nest sites",diet:"Mostly insects and other arthropods, plus small mammals, reptiles, and birds.",facts:"One of North America's smallest falcons.\nOften hunts from a perch or hovers in place.",photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Falco_sparverius_-Fort_Rock%2C_Oregon%2C_USA-8.jpg/800px-Falco_sparverius_-Fort_Rock%2C_Oregon%2C_USA-8.jpg",gallery:[]},
{id:"axolotl",commonName:"Axolotl",scientificName:"Ambystoma mexicanum",category:"Amphibians",order:"Urodela",orderCommon:"Salamanders",family:"Ambystomatidae",familyCommon:"Mole salamanders",genus:"Ambystoma",genusCommon:"Mole salamanders",countries:"Mexico",habitat:"High-elevation freshwater lakes and canals",rangeMap:"",generationLength:"About 2–4 years",migratory:"Resident",status:"Critically Endangered",trend:"Decreasing",threats:"Habitat loss, pollution, introduced fish, and disease",diet:"Worms, insects, crustaceans, small fish, and other aquatic prey.",facts:"Axolotls can regenerate many tissues.\nThey retain juvenile characteristics into adulthood.",photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Axolotl_ganz.jpg/800px-Axolotl_ganz.jpg",gallery:[]}
];
const esc=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
const lines=v=>String(v||"").split(/\n/).map(x=>x.trim()).filter(Boolean);
function norm(a){let x={...a};if(!x.category)x.category=x.group||"Other";if(!Array.isArray(x.gallery))x.gallery=x.photo?[x.photo]:[];if(x.photo&&!x.gallery.includes(x.photo))x.gallery.unshift(x.photo);return x}
const dbConfig=window.WILDLIFE_DB||{};
const database=dbConfig.url&&dbConfig.publishableKey&&window.supabase?window.supabase.createClient(dbConfig.url,dbConfig.publishableKey):null;
function localGet(){let a;try{a=JSON.parse(localStorage.getItem(KEY)||"null")}catch(e){}if(!Array.isArray(a)){a=starters;localStorage.setItem(KEY,JSON.stringify(a))}return a.map(norm)}
async function get(){if(!database)return localGet();let {data,error}=await database.from("species").select("data").order("created_at",{ascending:true});if(error)throw error;return data.map(row=>norm(row.data))}
async function saveOne(a){if(!database){let all=localGet();localStorage.setItem(KEY,JSON.stringify([...all.filter(x=>x.id!==a.id),a]));return}let {error}=await database.from("species").upsert({id:a.id,data:a});if(error)throw error}
async function removeOne(id){if(!database){localStorage.setItem(KEY,JSON.stringify(localGet().filter(x=>x.id!==id)));return}let {error}=await database.from("species").delete().eq("id",id);if(error)throw error}
async function random(){let a=await get();location.href="animal.html?id="+encodeURIComponent(a[Math.floor(Math.random()*a.length)].id)}
function card(a){let img=a.photo||(a.gallery||[])[0];return `<a class="card" href="animal.html?id=${encodeURIComponent(a.id)}">${img?`<img src="${esc(img)}" alt="${esc(a.commonName)}">`:"<div class=empty>No photograph</div>"}<div><span class=tag>${esc(a.category)}</span><h3>${esc(a.commonName)}</h3><div class=sci>${esc(a.scientificName||"")}</div></div></a>`}
async function home(){let a=await get(),cs=["Birds","Mammals","Fish","Reptiles","Amphibians","Invertebrates","Other"];cats.innerHTML=cs.map((c,i)=>{let n=a.filter(x=>x.category===c).length;return `<a class="cat" href="animals.html?category=${encodeURIComponent(c)}"><span class="cat-top"><span class="cat-index">${String(i+1).padStart(2,"0")}</span><span class="cat-arrow" aria-hidden="true">↗</span></span><span class="cat-name">${c}</span><span class="cat-count">${n} species in the journal</span></a>`}).join("");recent.innerHTML=a.slice(-6).reverse().map(card).join("");document.getElementById("random").onclick=random;go.onclick=()=>location.href="animals.html?search="+encodeURIComponent(q.value);q.onkeydown=e=>e.key==="Enter"&&go.click()}
async function explore(){
  const all = await get();
  const searchEl = document.getElementById("search");
  const catEl = document.getElementById("cat");
  const groupsEl = document.getElementById("exploreGroups");
  const countEl = document.getElementById("count");
  const clearEl = document.getElementById("clear");

  const params = new URLSearchParams(location.search);
  searchEl.value = params.get("search") || "";
  catEl.value = params.get("category") || "";

  const categoryOrder = ["Birds","Mammals","Fish","Reptiles","Amphibians","Invertebrates","Other"];

  function taxonKey(species, rank){
    return String(species[rank] || species[rank + "Common"] || "unspecified").trim().toLocaleLowerCase();
  }

  function taxonName(species, rank){
    const sci = String(species[rank] || "").trim();
    const common = String(species[rank + "Common"] || "").trim();
    if (!sci && !common) return "Unspecified " + rank;
    if (sci && common && sci.toLocaleLowerCase() !== common.toLocaleLowerCase()) return sci + " — " + common;
    return sci || common;
  }

  function scientificGenus(species){
    const recorded = String(species.genus || "").trim();
    if (recorded) return recorded;
    const name = String(species.scientificName || "").trim();
    const match = name.match(/^([A-Z][a-z]+)\s+[a-z]/);
    return match ? match[1] : "";
  }

  function matches(species, query, category){
    if (category && String(species.category || "Other") !== category) return false;
    if (!query) return true;
    const searchable = [
      species.commonName, species.scientificName, species.category,
      species.order, species.orderCommon, species.suborder, species.suborderCommon, species.superfamily, species.superfamilyCommon, species.family, species.familyCommon,
      species.subfamily, species.subfamilyCommon, species.tribe, species.tribeCommon,
      species.genus, species.genusCommon, species.countries, species.habitat,
      species.system, species.biomes, species.climateZones, species.lifespan, species.length, species.weight, species.sociality, species.socialNotes, species.livingDetails, species.offspringCount, species.breedingFrequency, species.offspringNotes, species.feedingHabits, species.courtship, species.breeding,
      species.generationLength, species.migratory, species.diet,
      species.status, species.trend, species.threats,
      species.useTrade, species.conservationActions, species.facts
    ].map(v => String(v || "")).join(" ").toLowerCase();
    return searchable.includes(query);
  }

  function grouped(list, rank){
    const groups = new Map();
    list.forEach(species => {
      const key = taxonKey(species, rank);
      if (!groups.has(key)) groups.set(key, {name:taxonName(species,rank), species:[]});
      groups.get(key).species.push(species);
    });
    return [...groups.values()].sort((a,b) => a.name.localeCompare(b.name));
  }

  function optionalRank(list, rank, label, renderChildren){
    const hasRank = species => String(species[rank] || species[rank + "Common"] || "").trim();
    const direct = list.filter(species => !hasRank(species));
    return (direct.length ? renderChildren(direct) : "") + grouped(list.filter(hasRank), rank).map(group =>
      '<section class="optional-rank optional-rank-' + rank + '"><h4 class="optional-rank-label">' + label + ' <span>' + esc(group.name) +
      '</span></h4>' + renderChildren(group.species) + '</section>'
    ).join("");
  }

  function renderGenera(list){
    const genera = new Map();
    list.forEach(species => {
      const name = scientificGenus(species), key = name.toLocaleLowerCase();
      if (!genera.has(key)) genera.set(key, {name:name || "Genus unknown", common:"", species:[]});
      const group = genera.get(key);
      if (!group.common && name) group.common = String(species.genusCommon || "").trim();
      group.species.push(species);
    });
    return [...genera.values()].sort((a,b) => a.name.localeCompare(b.name)).map(genus =>
      '<div class="genus-group"><div class="genus-label">Genus <i>' + esc(genus.name) + '</i>' +
      (genus.common && genus.common.toLocaleLowerCase() !== genus.name.toLocaleLowerCase() ?
        ' <span class="genus-common">· ' + esc(genus.common) + '</span>' : '') + '</div>' +
      '<div class="family-species">' + genus.species.slice().sort((a,b) => String(a.commonName || "").localeCompare(String(b.commonName || ""))).map(card).join("") + '</div></div>'
    ).join("");
  }

  function renderFamilies(list){
    return grouped(list, "family").map(family =>
      '<section class="family-group"><div class="family-head"><h3>' + esc(family.name) + '</h3><span>' +
      family.species.length + ' species</span></div>' +
      optionalRank(family.species, "subfamily", "Subfamily", members => optionalRank(members, "tribe", "Tribe", renderGenera)) + '</section>'
    ).join("");
  }

  function render(){
    const query = searchEl.value.trim().toLowerCase();
    const category = catEl.value;
    const filtered = all.filter(x => matches(x, query, category));

    countEl.textContent = filtered.length + " species found";

    if (!filtered.length){
      groupsEl.innerHTML = '<div class="empty">No species match those filters.</div>';
      return;
    }

    const categories = [...new Set(filtered.map(x => String(x.category || "Other")))]
      .sort((a,b) => {
        const ai = categoryOrder.indexOf(a), bi = categoryOrder.indexOf(b);
        return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi) || a.localeCompare(b);
      });

    groupsEl.innerHTML = categories.map(categoryName => {
      const categorySpecies = filtered.filter(x => String(x.category || "Other") === categoryName);
      const orderMap = new Map();
      categorySpecies.forEach(species => {
        const key = taxonKey(species, "order");
        if (!orderMap.has(key)) orderMap.set(key, {name:taxonName(species,"order"), species:[], count:0});
        orderMap.get(key).species.push(species);
        orderMap.get(key).count++;
      });

      const orders = [...orderMap.values()].sort((a,b) => a.name.localeCompare(b.name));

      return '<section class="explore-category">' +
        '<div class="explore-category-head"><h2>' + esc(categoryName) + '</h2><span>' +
        categorySpecies.length + ' species</span></div>' +
        '<div class="order-groups">' +
        orders.map(order => {
          const familyCount = new Set(order.species.map(species => taxonKey(species,"family"))).size;
          return '<details class="order-group">' +
            '<summary><span class="order-title">' + esc(order.name) + '</span>' +
            '<span class="order-count">' + familyCount + ' ' + (familyCount === 1 ? 'family' : 'families') + ' · ' + order.count + ' species</span></summary>' +
            '<div class="family-groups">' + optionalRank(order.species, "suborder", "Suborder", members => optionalRank(members, "superfamily", "Superfamily", renderFamilies)) + '</div></details>';
        }).join("") +
        '</div></section>';
    }).join("");
  }

  searchEl.addEventListener("input", render);
  catEl.addEventListener("change", render);
  clearEl.addEventListener("click", () => {
    searchEl.value = "";
    catEl.value = "";
    render();
  });

  render();
}
function tax(label,s,c){return s||c?`<div class=taxrow><span class=taxlabel>${label}</span>${s?`<span class=taxsci>${esc(s)}</span>`:""}${s&&c?" · ":""}${c?`<span class=taxcommon>${esc(c)}</span>`:""}</div>`:""}
function box(t,v){return String(v || "").trim()?`<div class=box><h3>${t}</h3><div>${esc(v).replace(/\n/g,"<br>")}</div></div>`:""}
function safeMediaUrl(value){
  try { const url = new URL(String(value).trim()); return ["https:", "http:"].includes(url.protocol) ? url.href : ""; }
  catch { return ""; }
}
const recordMedia = [];
function mediaEntries(value, type, fallback){
  const entries = Array.isArray(value) ? value : lines(value);
  return entries.map((line,index) => {
    const split = String(line).indexOf("|");
    const title = split < 0 ? "" : String(line).slice(0,split).trim();
    const url = safeMediaUrl(split < 0 ? line : String(line).slice(split+1));
    return url ? {type,url,title:title || fallback + " " + (index+1)} : null;
  }).filter(Boolean);
}
function mediaCard(item, className=""){
  const index = recordMedia.push(item)-1;
  return `<button type="button" class="media-card ${className}" data-media-index="${index}" aria-label="Enlarge ${esc(item.title)}">${item.type === "photo" ? `<img loading="lazy" src="${esc(item.url)}" alt="${esc(item.title)}">` : '<span class="video-preview">▶ Watch video</span>'}<span class="media-headline">${esc(item.title)}</span></button>`;
}
function sectionMedia(photos, videos, speciesName, topic){
  const items = [...mediaEntries(photos,"photo",topic + " photo"), ...mediaEntries(videos,"video",topic + " video")];
  return items.length ? `<div class="topic-gallery">${items.map(item=>mediaCard(item)).join("")}</div>` : "";
}
function videoEmbed(url){
  const parsed = new URL(url), host = parsed.hostname.toLowerCase().replace(/^www\./, "");
  let id;
  if (["youtube.com","m.youtube.com","youtube-nocookie.com"].includes(host))
    id = parsed.searchParams.get("v") || parsed.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1];
  if (host === "youtu.be") id = parsed.pathname.slice(1).split("/")[0];
  if (id && /^[A-Za-z0-9_-]{11}$/.test(id)) return "https://www.youtube.com/embed/" + id;
  if (host === "tiktok.com" || host.endsWith(".tiktok.com")) {
    id = parsed.pathname.match(/\/video\/(\d+)/)?.[1];
    if (id) return "https://www.tiktok.com/player/v1/" + id;
  }
  return "";
}
function installMediaViewer(recordEl){
  document.getElementById("mediaViewer")?.remove();
  const dialog = document.createElement("dialog");
  dialog.id = "mediaViewer";
  dialog.className = "media-viewer";
  dialog.setAttribute("aria-labelledby","mediaViewerTitle");
  dialog.innerHTML = `<div class="viewer-header"><h2 id="mediaViewerTitle"></h2><button type="button" class="btn alt" data-close>Close ×</button></div><div class="viewer-stage"></div><div class="viewer-nav"><button type="button" class="btn alt" data-prev>← Previous</button><span class="viewer-count" aria-live="polite"></span><button type="button" class="btn alt" data-next>Next →</button></div><a class="viewer-source" target="_blank" rel="noopener noreferrer">Open original ↗</a>`;
  document.body.append(dialog);
  const stage = dialog.querySelector(".viewer-stage");
  const title = dialog.querySelector("h2");
  const previous = dialog.querySelector("[data-prev]");
  const next = dialog.querySelector("[data-next]");
  const source = dialog.querySelector(".viewer-source");
  let index = 0, returnFocus;
  function show(position){
    index = position;
    const item = recordMedia[index];
    title.textContent = item.title;
    source.href = item.url;
    stage.replaceChildren();
    let content;
    if (item.type === "photo") {
      content = document.createElement("img"); content.src = item.url; content.alt = item.title;
    } else {
      const embed = videoEmbed(item.url);
      if (embed) {
        content = document.createElement("iframe"); content.src = embed; content.title = item.title;
        content.allow = "fullscreen; picture-in-picture; encrypted-media"; content.allowFullscreen = true;
      } else if (/\.(mp4|webm|ogv|mov)$/i.test(new URL(item.url).pathname)) {
        content = document.createElement("video"); content.src = item.url; content.controls = true; content.playsInline = true;
      } else {
        content = document.createElement("p"); content.textContent = "Watch this video using the Open original link below.";
      }
    }
    stage.append(content);
    dialog.querySelector(".viewer-count").textContent = (index+1) + " / " + recordMedia.length;
    previous.disabled = index === 0;
    next.disabled = index === recordMedia.length-1;
  }
  recordEl.addEventListener("click", event => {
    const trigger = event.target.closest("[data-media-index]");
    if (!trigger) return;
    returnFocus = trigger;
    show(Number(trigger.dataset.mediaIndex));
    dialog.showModal();
  });
  previous.onclick = () => { if(index > 0) show(index-1); };
  next.onclick = () => { if(index < recordMedia.length-1) show(index+1); };
  dialog.querySelector("[data-close]").onclick = () => dialog.close();
  dialog.addEventListener("close", () => { stage.replaceChildren(); returnFocus?.focus(); });
  dialog.addEventListener("click", event => { if(event.target === dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();} });
  dialog.addEventListener("keydown", event => {
    if (["VIDEO","IFRAME"].includes(event.target.tagName)) return;
    if(event.key === "ArrowLeft" && index > 0){event.preventDefault();show(index-1);}
    if(event.key === "ArrowRight" && index < recordMedia.length-1){event.preventDefault();show(index+1);}
  });
}
function optionalSection(title, boxes, media=""){
  return boxes || media ? `<section class="section"><h2>${esc(title)}</h2>${boxes ? `<div class="boxes">${boxes}</div>` : ""}${media}</section>` : "";
}
async function renderRecord(){let recordEl=document.getElementById("record"),id=new URLSearchParams(location.search).get("id"),a=(await get()).find(x=>x.id===id);if(!a){recordEl.innerHTML="<div class=empty>Species not found.</div>";return}recordMedia.length=0;let gal=[...(a.gallery||[])];if(a.photo&&!gal.includes(a.photo))gal.unshift(a.photo);recordEl.innerHTML=`<div class=recordhero><div>${a.photo?`${mediaCard({type:"photo",url:a.photo,title:a.photoHeadline || a.commonName},"main-media")}`:"<div class=empty>No main photograph</div>"}</div><div><span class=tag>${esc(a.category)}</span><h1>${esc(a.commonName)}</h1><div class=sci>${esc(a.scientificName)}</div><div class=tax>${tax("Order",a.order,a.orderCommon)}${tax("Suborder",a.suborder,a.suborderCommon)}${tax("Superfamily",a.superfamily,a.superfamilyCommon)}${tax("Family",a.family,a.familyCommon)}${tax("Subfamily",a.subfamily,a.subfamilyCommon)}${tax("Tribe",a.tribe,a.tribeCommon)}${tax("Genus",a.genus,a.genusCommon)}</div><a class="btn alt" href="add-animal.html?edit=${encodeURIComponent(a.id)}">Edit species</a></div></div>${optionalSection("Where they live",
box("Countries",a.countries)+box("System",a.system)+box("Habitat",a.habitat)+box("Biomes",a.biomes)+box("Climate zones",a.climateZones)+box("Migratory",a.migratory)+box("Living spaces",a.livingDetails),
sectionMedia(a.livingPhotos,"",a.commonName,"Habitat") +
(a.rangeMap?`<h2>Range map</h2><img class=map src="${esc(a.rangeMap)}" alt="Range map for ${esc(a.commonName)}">`:""))}
${optionalSection("Size & lifespan",box("Length",a.length)+box("Weight",a.weight)+box("Lifespan",a.lifespan))}
${optionalSection("Social behavior",box("Sociality",a.sociality)+box("Social behavior",a.socialNotes))}
${optionalSection("Feeding",box("Diet",a.diet)+box("Feeding habits",a.feedingHabits),sectionMedia(a.feedingPhotos,a.feedingVideos,a.commonName,"Feeding"))}
${optionalSection("Reproduction",box("Mating rituals",a.courtship),sectionMedia(a.matingPhotos,a.matingVideos,a.commonName,"Reproduction"))}
${optionalSection("Offspring",box("Number of offspring",a.offspringCount)+box("Breeding frequency",a.breedingFrequency)+box("Breeding & parental care",a.breeding)+box("Offspring notes",a.offspringNotes)+box("Generational length",a.generationLength))}
${optionalSection("Conservation",box("Status",a.status)+box("Population trend",a.trend)+box("Threats",a.threats)+box("Use and trade",a.useTrade)+box("Conservation actions",a.conservationActions))}${a.facts?`<section class=section><h2>Facts</h2><ul>${lines(a.facts).map(x=>`<li>${esc(x)}</li>`).join("")}</ul></section>`:""}${gal.length?`<section class=section><h2>Photo gallery</h2><div class=gallery>${mediaEntries(gal,"photo",a.commonName + " photo").map(item=>mediaCard(item)).join("")}</div></section>`:""}`;installMediaViewer(recordEl)}
function showError(message){let el=document.getElementById("formError");el.textContent=message;el.classList.remove("hidden")}
function installTaxonomyAutofill(formEl, speciesList){
  const ranks = ["order", "suborder", "superfamily", "family", "subfamily", "tribe", "genus"];
  const fields = formEl.elements;
  const automatic = new Map();
  const key = value => String(value || "").trim().toLocaleLowerCase();
  let categoryChosen = new URLSearchParams(location.search).has("edit");
  const unique = (records, field) => {
    const values = new Map(records.map(record => String(record[field] || "").trim())
      .filter(Boolean).map(value => [key(value), value]));
    return values.size === 1 ? [...values.values()][0] : "";
  };
  const canFill = field => !key(fields[field].value) || fields[field].value === automatic.get(field);
  function assign(field, value){
    if (!canFill(field)) return;
    fields[field].value = value;
    automatic.set(field, value);
  }
  function update(source){
    const index = ranks.indexOf(source);
    const parents = index < 0 ? [] : ranks.slice(0, index);
    // Clear only earlier suggestions, keeping anything the editor typed.
    parents.forEach(rank => {
      [rank, rank + "Common"].forEach(field => {
        if (automatic.has(field) && canFill(field)) assign(field, "");
      });
    });
    const name = key(fields[source].value);
    const records = name ? speciesList.filter(record =>
      key(record[source]) === name &&
      (!categoryChosen || !key(fields.category.value) || key(record.category) === key(fields.category.value)) &&
      parents.every(rank => !key(fields[rank].value) || key(record[rank]) === key(fields[rank].value))
    ) : [];
    if (records.length && !categoryChosen){
      const category = unique(records, "category");
      if (category) fields.category.value = category;
    }
    parents.forEach(rank => {
      const value = unique(records, rank);
      assign(rank, value);
      // A common name belongs to the scientific name that was selected.
      assign(rank + "Common", value ? unique(records.filter(record => key(record[rank]) === key(fields[rank].value)), rank + "Common") : "");
    });
    const common = source === "scientificName" ? "commonName" : source + "Common";
    assign(common, unique(records, common));
  }
  ["scientificName", ...ranks].forEach(rank => {
    fields[rank].addEventListener("input", () => {
      automatic.delete(rank);
      update(rank);
    });
    const common = rank === "scientificName" ? "commonName" : rank + "Common";
    fields[common].addEventListener("input", () => automatic.delete(common));
  });
  fields.category.addEventListener("change", () => { categoryChosen = true; });
}

async function form(){let formEl=document.getElementById("form"),id=new URLSearchParams(location.search).get("edit"),all=await get(),old=id&&all.find(x=>x.id===id);if(database){let panel=document.getElementById("loginPanel"),status=document.getElementById("editorStatus");async function check(){let {data:{user}}=await database.auth.getUser();panel.classList.toggle("hidden",!!user);formEl.classList.toggle("hidden",!user);status.textContent=user?"Signed in as "+user.email:"Sign in to edit species.";document.getElementById("importPanel").classList.toggle("hidden",!user||!localStorage.getItem(KEY))}document.getElementById("loginButton").onclick=async()=>{let email=document.getElementById("loginEmail").value,password=document.getElementById("loginPassword").value;let {error}=await database.auth.signInWithPassword({email,password});if(error)document.getElementById("loginError").textContent=error.message;else await check()};await check();document.getElementById("importButton").onclick=async()=>{let label=document.getElementById("importStatus");try{let entries=localGet();let {error}=await database.from("species").upsert(entries.map(a=>({id:a.id,data:a})));if(error)throw error;label.textContent=entries.length+" species imported. Refresh Explore to see them."}catch(err){label.textContent="Import failed: "+err.message}}}installTaxonomyAutofill(formEl,all);let keys=["commonName","scientificName","category","order","orderCommon","suborder","suborderCommon","superfamily","superfamilyCommon","family","familyCommon","subfamily","subfamilyCommon","tribe","tribeCommon","genus","genusCommon","countries","habitat","system","biomes","climateZones","lifespan","length","weight","sociality","socialNotes","livingDetails","livingPhotos","offspringCount","breedingFrequency","offspringNotes","feedingHabits","feedingPhotos","feedingVideos","courtship","breeding","matingPhotos","matingVideos","rangeMap","generationLength","migratory","diet","status","trend","threats","useTrade","conservationActions","photo","photoHeadline","facts"];if(old){document.getElementById("title").textContent="Edit species";document.getElementById("save").textContent="Save changes";let deleteBtn=document.getElementById("delete");deleteBtn.classList.remove("hidden");keys.forEach(k=>{if(formEl.elements[k])formEl.elements[k].value=old[k]||""});formEl.elements.gallery.value=(old.gallery||[]).filter(x=>x!==old.photo).join("\n");deleteBtn.onclick=async()=>{if(confirm(`Delete "${old.commonName}"? This cannot be undone.`)){try{await removeOne(id);location.href="animals.html"}catch(err){showError("Could not delete this species. Check that browser storage is available.")}}}}formEl.onsubmit=async e=>{e.preventDefault();let a=Object.fromEntries(new FormData(formEl));a.gallery=lines(a.gallery);if(a.photo&&!a.gallery.includes(a.photo))a.gallery.unshift(a.photo);try{if(old){a.id=old.id;await saveOne(a)}else{let base=(a.commonName||"species").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"species",nid=base,n=2;while(all.some(x=>x.id===nid))nid=base+"-"+n++;a.id=nid;await saveOne(a)}location.href="animal.html?id="+encodeURIComponent(a.id)}catch(err){showError("Could not save this species. Check browser storage and available space, then try again.")}}}
function showPageError(error){let main=document.querySelector("main");main.insertAdjacentHTML("afterbegin",`<p role="alert">Could not load species: ${esc(error.message)}</p>`)}
document.addEventListener("DOMContentLoaded",()=>{if(document.getElementById("cats"))home().catch(showPageError);if(document.getElementById("exploreGroups"))explore().catch(showPageError);if(document.getElementById("record"))renderRecord().catch(showPageError);if(document.getElementById("form"))form().catch(showPageError)})
