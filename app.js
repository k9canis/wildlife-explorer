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

  function orderName(species){
    const sci = String(species.order || "").trim();
    const common = String(species.orderCommon || "").trim();
    if (!sci && !common) return "Unspecified order";
    if (sci && common && sci.toLowerCase() !== common.toLowerCase()) return sci + " — " + common;
    return sci || common;
  }

  function matches(species, query, category){
    if (category && String(species.category || "Other") !== category) return false;
    if (!query) return true;
    const searchable = [
      species.commonName, species.scientificName, species.category,
      species.order, species.orderCommon, species.family, species.familyCommon,
      species.genus, species.genusCommon, species.countries, species.habitat,
      species.generationLength, species.migratory, species.diet,
      species.status, species.trend, species.threats,
      species.useTrade, species.conservationActions, species.facts
    ].map(v => String(v || "")).join(" ").toLowerCase();
    return searchable.includes(query);
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
        const key = orderName(species);
        if (!orderMap.has(key)) orderMap.set(key, []);
        orderMap.get(key).push(species);
      });

      const orders = [...orderMap.entries()].sort((a,b) => a[0].localeCompare(b[0]));

      return '<section class="explore-category">' +
        '<div class="explore-category-head"><h2>' + esc(categoryName) + '</h2><span>' +
        categorySpecies.length + ' species</span></div>' +
        '<div class="order-groups">' +
        orders.map(([name, species]) =>
          '<details class="order-group">' +
          '<summary><span class="order-title">' + esc(name) + '</span>' +
          '<span class="order-count">' + species.length + ' ' + (species.length === 1 ? 'species' : 'species') + '</span></summary>' +
          '<div class="order-species">' + species.map(card).join("") + '</div>' +
          '</details>'
        ).join("") +
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
function box(t,v){return v?`<div class=box><h3>${t}</h3><div>${esc(v).replace(/\n/g,"<br>")}</div></div>`:""}
async function renderRecord(){let recordEl=document.getElementById("record"),id=new URLSearchParams(location.search).get("id"),a=(await get()).find(x=>x.id===id);if(!a){recordEl.innerHTML="<div class=empty>Species not found.</div>";return}let gal=[...(a.gallery||[])];if(a.photo&&!gal.includes(a.photo))gal.unshift(a.photo);recordEl.innerHTML=`<div class=recordhero><div>${a.photo?`<img class=mainphoto src="${esc(a.photo)}" alt="${esc(a.commonName)}">`:"<div class=empty>No main photograph</div>"}</div><div><span class=tag>${esc(a.category)}</span><h1>${esc(a.commonName)}</h1><div class=sci>${esc(a.scientificName)}</div><div class=tax>${tax("Order",a.order,a.orderCommon)}${tax("Family",a.family,a.familyCommon)}${tax("Genus",a.genus,a.genusCommon)}</div><a class="btn alt" href="add-animal.html?edit=${encodeURIComponent(a.id)}">Edit species</a></div></div><section class=section><h2>Range & natural history</h2><div class=boxes>${box("Countries",a.countries)}${box("Habitat",a.habitat)}${box("Generational length",a.generationLength)}${box("Migratory",a.migratory)}</div>${a.rangeMap?`<h2>Range map</h2><img class=map src="${esc(a.rangeMap)}" alt="Range map for ${esc(a.commonName)}">`:""}</section><section class=section><h2>Natural history</h2><div class=boxes>${box("Diet",a.diet)}</div></section><section class=section><h2>Conservation</h2><div class=boxes>${box("Status",a.status)}${box("Population trend",a.trend)}${box("Threats",a.threats)}${box("Use and trade",a.useTrade)}${box("Conservation actions",a.conservationActions)}</div></section>${a.facts?`<section class=section><h2>Facts</h2><ul>${lines(a.facts).map(x=>`<li>${esc(x)}</li>`).join("")}</ul></section>`:""}${gal.length?`<section class=section><h2>Photo gallery</h2><div class=gallery>${gal.map(x=>`<img src="${esc(x)}" alt="${esc(a.commonName)}">`).join("")}</div></section>`:""}`}
function showError(message){let el=document.getElementById("formError");el.textContent=message;el.classList.remove("hidden")}
async function form(){let formEl=document.getElementById("form"),id=new URLSearchParams(location.search).get("edit"),all=await get(),old=id&&all.find(x=>x.id===id);if(database){let panel=document.getElementById("loginPanel"),status=document.getElementById("editorStatus");async function check(){let {data:{user}}=await database.auth.getUser();panel.classList.toggle("hidden",!!user);formEl.classList.toggle("hidden",!user);status.textContent=user?"Signed in as "+user.email:"Sign in to edit species.";document.getElementById("importPanel").classList.toggle("hidden",!user||!localStorage.getItem(KEY))}document.getElementById("loginButton").onclick=async()=>{let email=document.getElementById("loginEmail").value,password=document.getElementById("loginPassword").value;let {error}=await database.auth.signInWithPassword({email,password});if(error)document.getElementById("loginError").textContent=error.message;else await check()};await check();document.getElementById("importButton").onclick=async()=>{let label=document.getElementById("importStatus");try{let entries=localGet();let {error}=await database.from("species").upsert(entries.map(a=>({id:a.id,data:a})));if(error)throw error;label.textContent=entries.length+" species imported. Refresh Explore to see them."}catch(err){label.textContent="Import failed: "+err.message}}}let keys=["commonName","scientificName","category","order","orderCommon","family","familyCommon","genus","genusCommon","countries","habitat","rangeMap","generationLength","migratory","diet","status","trend","threats","useTrade","conservationActions","photo","facts"];if(old){title.textContent="Edit species";document.getElementById("save").textContent="Save changes";let deleteBtn=document.getElementById("delete");deleteBtn.classList.remove("hidden");keys.forEach(k=>{if(formEl.elements[k])formEl.elements[k].value=old[k]||""});formEl.elements.gallery.value=(old.gallery||[]).filter(x=>x!==old.photo).join("\n");deleteBtn.onclick=async()=>{if(confirm(`Delete "${old.commonName}"? This cannot be undone.`)){try{await removeOne(id);location.href="animals.html"}catch(err){showError("Could not delete this species. Check that browser storage is available.")}}}}formEl.onsubmit=async e=>{e.preventDefault();let a=Object.fromEntries(new FormData(formEl));a.gallery=lines(a.gallery);if(a.photo&&!a.gallery.includes(a.photo))a.gallery.unshift(a.photo);try{if(old){a.id=old.id;await saveOne(a)}else{let base=(a.commonName||"species").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"species",nid=base,n=2;while(all.some(x=>x.id===nid))nid=base+"-"+n++;a.id=nid;await saveOne(a)}location.href="animal.html?id="+encodeURIComponent(a.id)}catch(err){showError("Could not save this species. Check browser storage and available space, then try again.")}}}
function showPageError(error){let main=document.querySelector("main");main.insertAdjacentHTML("afterbegin",`<p role="alert">Could not load species: ${esc(error.message)}</p>`)}
document.addEventListener("DOMContentLoaded",()=>{if(document.getElementById("cats"))home().catch(showPageError);if(document.getElementById("exploreGroups"))explore().catch(showPageError);if(document.getElementById("record"))renderRecord().catch(showPageError);if(document.getElementById("form"))form().catch(showPageError)})