/* ============================================================================
   Ecovillage Atlas — an interactive 3D globe that ranks every country (and 159
   scouted regions) for founding a new international ecovillage / universal
   township in the spirit of Auroville. 24 criteria in five pillars; set your own
   priorities and must-haves and the world re-ranks around them.
   Engine: globe.gl. Data: data/eco.js (built by tools/build.py — see About).
   ========================================================================== */
'use strict';

/* ----------------------------- pillars & criteria ------------------------ */
const PILLARS = [
  {key:'setup',  name:'Setup & legal',          short:'Setup & legal', ic:'🏗️', color:'#e8b64c', desc:'Can a foreign-founded community get land, form a legal body and receive funds?'},
  {key:'visas',  name:'Visas & residency',      short:'Visas',         ic:'🛂', color:'#6fb7ff', desc:'Can volunteers and new residents from many nations come — and stay?'},
  {key:'secure', name:'Safety & stability',     short:'Safety',        ic:'🛡️', color:'#b9a3f0', desc:'Will the community be safe, free and left in peace for decades?'},
  {key:'nature', name:'Land, beauty & climate', short:'Land & climate',ic:'🏞️', color:'#34d27a', desc:'Water, soil, climate comfort, long-term resilience and natural beauty'},
  {key:'living', name:'Community & daily life', short:'Community',     ic:'🌱', color:'#ff8a65', desc:'Ecovillage scene, freedom to self-build, cost, healthcare, access & culture'},
];
const PIL = {}; PILLARS.forEach(p => PIL[p.key] = p);

const DIMS = [
  {key:'land',      p:'setup',  ic:'🏡', name:'Land for foreigners',  desc:'Can a foreign-founded community buy and securely hold rural land?', src:'Review of national land law on foreign & foreign-controlled ownership of rural/agricultural land (2025–26)'},
  {key:'entity',    p:'setup',  ic:'📜', name:'Legal vehicles',       desc:'Ease of forming an association, foundation, cooperative or trust to hold the project', src:'National nonprofit, foundation & cooperative law; registration practice; foreign founders allowed'},
  {key:'funding',   p:'setup',  ic:'💸', name:'Foreign funding',      desc:'Freedom for a nonprofit to receive donations from abroad', src:'Foreign-funding laws for NGOs (FCRA-style licences, foreign-agent laws, bans)'},
  {key:'rule',      p:'setup',  ic:'⚖️', name:'Rule of law',          desc:'Courts, contracts and property rights you can rely on', src:'World Bank WGI 2025 Rule of Law (percentile computed from the published estimates) + Heritage 2026 property rights'},
  {key:'landcost',  p:'setup',  ic:'🪙', name:'Affordable land',      desc:'Typical price of rural land per hectare (cheaper = higher)', src:'Typical rural land price, USD/ha — Eurostat 2024 & USDA 2026 where available, listings & estimates elsewhere; log-scaled $500→100 · $60k→0'},
  {key:'shortstay', p:'visas',  ic:'🛬', name:'Easy arrival',         desc:'How easily the world\'s people can arrive and stay a few months', src:'Visa rules for 197 passports (Wikipedia, Sep 2026, via the 42-apps Passports atlas): visa-free > eTA > on arrival > eVisa > embassy visa, × length of stay; half one-vote-per-passport, half population-weighted'},
  {key:'longstay',  p:'visas',  ic:'🛂', name:'Long-stay visas',      desc:'Volunteer, nomad, retirement, passive-income & residence routes for 1+ years', src:'Government immigration sources, 2025–26'},
  {key:'pr',        p:'visas',  ic:'🪪', name:'Path to permanence',   desc:'Years and difficulty to permanent residence & citizenship', src:'Residence & nationality law: years to PR, tests, dual citizenship'},
  {key:'safety',    p:'secure', ic:'🛡️', name:'Personal safety',      desc:'Low crime and violence, peace', src:'Global Peace Index + Numbeo Safety (via the 42-apps Best Countries map)'},
  {key:'stability', p:'secure', ic:'🏛️', name:'Political stability',  desc:'Low risk of unrest, coups, conflict or terrorism', src:'World Bank WGI 2025 Political Stability & Absence of Violence (percentile computed from the published estimates)'},
  {key:'civic',     p:'secure', ic:'🕊️', name:'Civic & spiritual freedom', desc:'Freedom to associate, speak and practise any (or no) spiritual path', src:'CIVICUS Monitor (Dec 2025) + WGI 2025 Voice & Accountability + Freedom in the World 2026 religious freedom (D2)'},
  {key:'hazard',    p:'secure', ic:'🌋', name:'Low natural hazards',  desc:'Earthquakes, cyclones, floods, drought and fire — and the capacity to cope', src:'INFORM Risk Mid-2026 + WorldRiskIndex 2025, inverted'},
  {key:'beauty',    p:'nature', ic:'🏔️', name:'Natural beauty',       desc:'Scenic landscapes, mountains, coasts, forests', src:'Landscape & nature score (UNESCO natural sites, protected land + expert) via the Best Countries map'},
  {key:'climate',   p:'nature', ic:'☀️', name:'Climate comfort',      desc:'Pleasant, liveable weather today', src:'Climate score (Numbeo climate index + expert) via the Best Countries map'},
  {key:'water',     p:'nature', ic:'💧', name:'Water security',       desc:'Low water stress, reliable rain, renewable freshwater', src:'WRI Aqueduct 4.0 baseline water stress (FAO SDG 6.4.2 for gaps) + annual rainfall + renewable freshwater per person (World Bank WDI)'},
  {key:'growing',   p:'nature', ic:'🌾', name:'Soil & growing',       desc:'Growing season, soil fertility and rainfall reliability for food self-sufficiency', src:'Growing-conditions assessment guided by CRU monthly climate data + arable-land share (World Bank 2024)'},
  {key:'future',    p:'nature', ic:'🌡️', name:'Climate resilience',   desc:'How well the country is placed for 2050+ heat, drought and climate shocks', src:'ND-GAIN 2026 (data 2024) + 2040–59 heat stress from World Bank Climate Knowledge Portal projections (SSP2-4.5)'},
  {key:'community', p:'living', ic:'🏘️', name:'Ecovillage scene',     desc:'Existing ecovillages, networks and permaculture know-how to learn from', src:'Global Ecovillage Network map (1,337 listings), FIC directory, national networks (Coopérative Oasis, Diggers & Dreamers, LØS, GEN Deutschland)'},
  {key:'offgrid',   p:'living', ic:'🔆', name:'Self-build & off-grid',desc:'Freedom to build naturally, live off-grid and run your own school; solar potential', src:'Building/zoning flexibility for natural building & off-grid (expert); solar PV potential (Solargis / World Bank); homeschooling law'},
  {key:'cost',      p:'living', ic:'💰', name:'Cost of living',       desc:'Everyday prices for residents (cheaper = higher)', src:'Numbeo Cost of Living Index, inverted & log-scaled (cheaper = higher); GDP-PPP per capita as a proxy where Numbeo has no data'},
  {key:'health',    p:'living', ic:'🏥', name:'Healthcare',           desc:'Quality and reach of medical care', src:'Numbeo Health Care Index via the Best Countries map'},
  {key:'access',    p:'living', ic:'✈️', name:'Access & internet',    desc:'Transport links, utilities and internet', src:'World Bank Logistics Performance + internet speed via the Best Countries map'},
  {key:'openness',  p:'living', ic:'🤝', name:'Welcome & English',    desc:'Acceptance of newcomers and ease of communicating', src:'Gallup Migrant Acceptance + EF English Proficiency via the Best Countries map'},
  {key:'spirit',    p:'living', ic:'🕉️', name:'Spiritual culture',    desc:'A living contemplative culture and sacred landscape', src:'Spirituality score (religiosity, sacred geography + expert) via the Best Countries map'},
];
const DIM = {}; DIMS.forEach(d => DIM[d.key] = d);
const dimsOf = pk => DIMS.filter(d => d.p === pk);

/* priority presets — weights 0..5; anything unlisted uses the preset's base */
const PRESETS = [
  {id:'balanced',  name:'Balanced',            ic:'⚖️', base:3, w:{}},
  {id:'auroville', name:'Universal township',  ic:'🌅', base:3, w:{land:5,entity:5,funding:5,rule:4,landcost:4,shortstay:4,longstay:5,pr:4,stability:5,civic:5,water:5,growing:4,future:4,openness:4,spirit:4,health:2,cost:2}},
  {id:'volunteer', name:'Volunteer hub',       ic:'🤝', base:2, w:{shortstay:5,longstay:5,openness:5,access:4,cost:4,safety:4,community:4,health:3,civic:3}},
  {id:'permaculture', name:'Permaculture farm', ic:'🌾', base:2, w:{growing:5,water:5,landcost:5,land:5,offgrid:5,climate:4,future:4,hazard:3,beauty:3,community:3}},
  {id:'haven',     name:'Climate haven 2050+', ic:'🌡️', base:2, w:{future:5,water:5,hazard:5,stability:5,growing:4,rule:4,safety:4,land:3,climate:3}},
  {id:'spiritual', name:'Spiritual retreat',   ic:'🕉️', base:2, w:{spirit:5,beauty:5,civic:4,safety:4,climate:4,openness:3,community:3,land:3}},
  {id:'budget',    name:'Shoestring pioneers', ic:'🪙', base:2, w:{landcost:5,cost:5,land:4,longstay:4,offgrid:4,entity:3,shortstay:3,growing:3}},
  {id:'family',    name:'Families & children', ic:'👨‍👩‍👧', base:2, w:{safety:5,health:5,stability:4,hazard:4,rule:4,offgrid:4,community:4,access:3,climate:3,pr:3}},
  {id:'freedom',   name:'Autonomy & freedom',  ic:'🕊️', base:2, w:{civic:5,rule:5,funding:5,entity:5,offgrid:5,land:4,stability:4,pr:3}},
];

/* must-haves — hard filters that grey out countries (and their sites) */
const MUSTS = [
  {id:'ownland',   ic:'🏡', name:'Foreigners can own land',  test:c => c.s.land >= 55},
  {id:'safe',      ic:'🛡️', name:'Safe & peaceful',          test:c => c.s.safety >= 45 && c.s.stability >= 30},
  {id:'volunteer', ic:'🤝', name:'Volunteer / NGO visa',     test:c => !!c.f.volunteer},
  {id:'nomad',     ic:'💻', name:'Digital-nomad visa',       test:c => !!c.f.nomad},
  {id:'civic',     ic:'🕊️', name:'Open civic space',         test:c => c.f.civicus === 'open' || c.f.civicus === 'narrowed'},
  {id:'school',    ic:'🎓', name:'Own schooling allowed',    test:c => c.f.homeschool === 'legal' || c.f.homeschool === 'regulated'},
  {id:'water',     ic:'💧', name:'Not water-stressed',       test:c => c.s.water >= 50 && (c.x.waterStress == null || c.x.waterStress < 3)},
  {id:'funds',     ic:'💸', name:'Foreign donations free',   test:c => c.s.funding >= 60},
];

/* ----------------------------- data -------------------------------------- */
const ECO = window.ECO || [];
const PLACES = window.ECO_PLACES || [];
const VILLAGES = window.ECO_VILLAGES || [];
const AV = window.ECO_AV || null;
const byIso = {}; ECO.forEach(c => byIso[c.iso] = c);
const placeById = {}; PLACES.forEach(p => placeById[p.id] = p);
const placesByIso = {}; PLACES.forEach(p => (placesByIso[p.iso] = placesByIso[p.iso] || []).push(p));
const villagesByIso = {}; VILLAGES.forEach(v => (villagesByIso[v.iso] = villagesByIso[v.iso] || []).push(v));

/* ----------------------------- helpers ----------------------------------- */
const esc = s => (s == null ? '' : ('' + s).replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c])));
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const lerp = (a, b, t) => a + (b - a) * t;
const r0 = v => v == null || isNaN(v) ? '—' : Math.round(v);
const fmtUSD = v => v == null ? '—' : v >= 1e6 ? '$' + (v / 1e6).toFixed(1) + 'M' : v >= 10000 ? '$' + Math.round(v / 1000) + 'k' : v >= 1000 ? '$' + (v / 1000).toFixed(1) + 'k' : '$' + Math.round(v);
function hexA(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; }

const SCALE = [[0,[120,20,15]],[28,[192,57,43]],[42,[230,126,34]],[52,[241,196,15]],[62,[163,201,58]],[74,[52,210,122]],[88,[26,152,80]],[100,[20,130,70]]];
const NODATA = [43,58,51];
function rgbOf(v) {
  if (v == null || isNaN(v)) return NODATA;
  if (v <= SCALE[0][0]) return SCALE[0][1];
  if (v >= 100) return SCALE[SCALE.length - 1][1];
  for (let i = 0; i < SCALE.length - 1; i++) {
    const [a, ca] = SCALE[i], [b, cb] = SCALE[i + 1];
    if (v >= a && v <= b) { const t = (v - a) / (b - a); return [0,1,2].map(k => Math.round(lerp(ca[k], cb[k], t))); }
  }
  return NODATA;
}
const col = (v, alpha) => { const [r,g,b] = rgbOf(v); return alpha == null ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${alpha})`; };

const REGION_CHIPS = [
  ['all','🌍 All'],['Europe & Central Asia','Europe & C. Asia'],['Latin America & Caribbean','Latin America'],
  ['East Asia & Pacific','Asia–Pacific'],['South Asia','S. Asia'],['Sub-Saharan Africa','Africa'],
  ['Middle East & North Africa','MENA'],['North America','N. America'],
];
const shortRegion = r => ((REGION_CHIPS.find(c => c[0] === r) || [, r])[1] || r || '').replace('🌍 ', '');

/* ----------------------------- state ------------------------------------- */
const state = { metric:'overall', weights:{}, preset:'balanced', musts:new Set(), sel:null, selPin:null,
  filter:'all', tab:'countries', mode:'globe', relief:true, sites:true, villages:true, hoverIso:null };
DIMS.forEach(d => state.weights[d.key] = 3);

let globe, spinOn = true, panelOn = true, GEO = null, LAND = [];
const elViz = document.getElementById('globeViz');
const elFlat = document.getElementById('flatViz');
const tooltip = document.getElementById('tooltip');

/* ----------------------------- scoring ----------------------------------- */
/* two-level: a pillar = weighted mean of its criteria; overall = mean of pillars,
   each pillar counting by the average weight of its criteria (so Balanced gives
   all five pillars an equal say, however many criteria each holds). */
function pillarOf(c, pk) {
  let num = 0, den = 0;
  for (const d of dimsOf(pk)) { const w = state.weights[d.key]; if (w > 0 && c.s[d.key] != null) { num += c.s[d.key] * w; den += w; } }
  return den ? num / den : null;
}
const pillarWeight = pk => { const ds = dimsOf(pk); return ds.reduce((s, d) => s + state.weights[d.key], 0) / ds.length; };
function compositeOf(c) {
  let num = 0, den = 0;
  for (const p of PILLARS) { const W = pillarWeight(p.key), v = pillarOf(c, p.key); if (W > 0 && v != null) { num += v * W; den += W; } }
  return den ? num / den : 0;
}
const isPillar = m => !!PIL[m];
function valOf(c) {
  if (state.metric === 'overall') return compositeOf(c);
  if (isPillar(state.metric)) return pillarOf(c, state.metric);
  return c.s[state.metric];
}
const metricLabel = () => state.metric === 'overall' ? 'Overall suitability' : isPillar(state.metric) ? PIL[state.metric].name : DIM[state.metric].name;
const metricIcon = () => state.metric === 'overall' ? '🌍' : isPillar(state.metric) ? PIL[state.metric].ic : DIM[state.metric].ic;
const metricColor = () => state.metric === 'overall' ? '#ffd84d' : isPillar(state.metric) ? PIL[state.metric].color : PIL[DIM[state.metric].p].color;

const passes = c => { for (const id of state.musts) { const m = MUSTS.find(x => x.id === id); if (m && !m.test(c)) return false; } return true; };
const failedMusts = c => [...state.musts].map(id => MUSTS.find(x => x.id === id)).filter(m => m && !m.test(c));

/* site score: the scout's judgement of the spot, blended with its country under your priorities */
function siteVal(p) {
  const c = byIso[p.iso];
  if (!c) return p.score;
  return 0.55 * p.score + 0.45 * compositeOf(c);
}

let rankMap = {}, rankList = [], siteList = [], siteRank = {};
function rebuildRanks() {
  rankList = ECO.map(c => ({ c, v: valOf(c), ok: passes(c) })).sort((a, b) => (b.ok - a.ok) || (b.v - a.v));
  rankMap = {}; let k = 0; rankList.forEach(x => { if (x.ok) rankMap[x.c.iso] = ++k; });
  siteList = PLACES.map(p => ({ p, v: siteVal(p), ok: !byIso[p.iso] || passes(byIso[p.iso]) })).sort((a, b) => (b.ok - a.ok) || (b.v - a.v));
  siteRank = {}; k = 0; siteList.forEach(x => { if (x.ok) siteRank[x.p.id] = ++k; });
}
const nRanked = () => rankList.filter(x => x.ok).length;

/* ----------------------------- flags ------------------------------------- */
const ALIAS = { KOS:'XKX', PSX:'PSE', SDS:'SSD', CNM:'CYP', SAH:'MAR', KAS:'IND', SOL:'SOM' };
const ISO2_FALLBACK = { XKX:'XK', PSE:'PS', HKG:'HK', MAC:'MO', TWN:'TW', SGP:'SG', AND:'AD', MCO:'MC', SMR:'SM', LIE:'LI', NOR:'NO', FRA:'FR', CYP:'CY', SSD:'SS', COD:'CD', COG:'CG' };
let ISO2 = {};
function flag(iso3) {
  const i2 = ISO2[iso3] || ISO2_FALLBACK[iso3];
  if (!i2 || i2.length !== 2 || i2 === '-9') return '🏳️';
  return String.fromCodePoint(...[...i2.toUpperCase()].map(ch => 0x1F1E6 + ch.charCodeAt(0) - 65));
}

/* ----------------------------- polygons ---------------------------------- */
function polyIso(f) {
  const p = f.properties;
  let iso = p.ADM0_A3;
  if (byIso[iso]) return iso;
  iso = ALIAS[p.ADM0_A3] || p.ISO_A3_EH || p.ISO_A3;
  if (byIso[iso]) return iso;
  return p.ADM0_A3;
}
const polyCountry = f => byIso[polyIso(f)];
const polyVal = f => { const c = polyCountry(f); return c && passes(c) ? valOf(c) : null; };

function capColor(f) {
  const iso = polyIso(f), v = polyVal(f);
  if (state.hoverIso === iso || state.sel === iso) return col(v, 1);
  return col(v, v == null ? 0.55 : 0.9);
}
function altOfVal(v) { return (state.relief && v != null) ? 0.012 + clamp(v / 100, 0, 1) * 0.12 : 0.012; }
function polyAlt(f) {
  const base = altOfVal(polyVal(f));
  if (state.sel === polyIso(f)) return base + 0.04;
  if (state.hoverIso === polyIso(f)) return base + 0.02;
  return base;
}
function countryAlt(iso) {
  const c = byIso[iso]; const v = c && passes(c) ? valOf(c) : null;
  return altOfVal(v) + (state.sel === iso ? 0.04 : 0);
}

/* ----------------------------- pins -------------------------------------- */
function pinData() {
  const out = [];
  if (state.sites) siteList.forEach(x => out.push({ kind:'site', id:x.p.id, lat:x.p.lat, lng:x.p.lon, iso:x.p.iso, v:x.v, ok:x.ok, d:x.p }));
  if (state.villages) VILLAGES.forEach((v, i) => out.push({ kind:'village', id:'v' + i, lat:v.lat, lng:v.lon, iso:v.iso, d:v }));
  return out;
}
const pinAlt = p => countryAlt(p.iso) + (p.kind === 'site' ? 0.02 + (p.ok ? clamp((p.v - 40) / 50, 0, 1) * 0.07 : 0) : 0.015);
function pinColor(p) {
  const on = state.selPin === p.id;
  if (p.kind === 'village') return on ? '#ffffff' : 'rgba(240,248,244,0.92)';
  if (!p.ok) return 'rgba(140,150,145,0.45)';
  return on ? '#fff3b0' : '#ffd84d';
}
function refreshPins() {
  if (!globe) return;
  globe.pointsData(state.mode === 'globe' ? pinData() : []);
  const sp = state.selPin && pinById(state.selPin);
  globe.ringsData(sp ? [{ lat: sp.lat, lng: sp.lng ?? sp.lon, alt: 0 }] : []);
}
function pinById(id) {
  if (!id) return null;
  const p = placeById[id];
  if (p) return { kind:'site', id, lat:p.lat, lng:p.lon, iso:p.iso, d:p };
  const m = /^v(\d+)$/.exec(id), v = m && VILLAGES[+m[1]];          // villages are 'v<index>'; site ids may also start with v
  return v ? { kind:'village', id, lat:v.lat, lng:v.lon, iso:v.iso, d:v } : null;
}

function initGlobe() {
  LAND = GEO.features.filter(f => (f.properties.ADMIN || f.properties.NAME) !== 'Antarctica');
  globe = Globe()(elViz)
    .backgroundColor('rgba(0,0,0,0)')
    .showAtmosphere(true).atmosphereColor('#4fd39c').atmosphereAltitude(0.15)
    .polygonsData(LAND)
    .polygonCapColor(capColor)
    .polygonSideColor(f => polyVal(f) == null ? 'rgba(28,40,34,0.5)' : hexA('#06170f', 0.65))
    .polygonStrokeColor(() => 'rgba(180,230,200,0.16)')
    .polygonAltitude(polyAlt).polygonsTransitionDuration(0)
    .polygonLabel(() => '')
    .onPolygonHover(onPolyHover).onPolygonClick(f => selectCountry(polyIso(f), true))
    .pointsData([]).pointLat('lat').pointLng('lng').pointAltitude(pinAlt).pointColor(pinColor)
    .pointRadius(p => p.kind === 'site' ? (state.selPin === p.id ? 0.42 : 0.3) : (state.selPin === p.id ? 0.3 : 0.2))
    .pointResolution(10).pointsMerge(false).pointsTransitionDuration(0).pointLabel(() => '')
    .onPointHover(onPinHover).onPointClick(p => selectPin(p.id, true))
    .ringsData([]).ringLat('lat').ringLng('lng').ringColor(() => t => `rgba(255,216,77,${1 - t})`)
    .ringMaxRadius(2.6).ringPropagationSpeed(1.6).ringRepeatPeriod(1100).ringAltitude(0.01);
  try { const m = globe.globeMaterial(); m.color.set('#0a1d16'); m.emissive.set('#05120d'); m.emissiveIntensity = 0.9; m.shininess = 3; } catch (e) {}
  const ctr = globe.controls();
  ctr.autoRotate = true; ctr.autoRotateSpeed = 0.3; ctr.enableDamping = true; ctr.dampingFactor = 0.14;
  ctr.minDistance = 101; ctr.maxDistance = 600;
  const setZoom = () => { ctr.zoomSpeed = 2.0; }; setZoom(); setTimeout(setZoom, 300); ctr.addEventListener('change', setZoom);
  globe.pointOfView({ lat: 22, lng: 10, altitude: 2.5 }, 0);
  try { globe.renderer().setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); } catch (e) {}
  sizeGlobe(); requestAnimationFrame(sizeGlobe);
  if (window.ResizeObserver) new ResizeObserver(sizeGlobe).observe(elViz);
  refreshPins();
}
function sizeGlobe() { if (globe) globe.width(elViz.clientWidth || window.innerWidth).height(elViz.clientHeight || (window.innerHeight - 142)); }
function refreshGlobe() {
  if (state.mode === 'flat') { drawFlat(); return; }
  if (!globe) return;
  globe.polygonCapColor(capColor).polygonAltitude(polyAlt);
  refreshPins();
}
function refreshAll() {
  rebuildRanks(); refreshGlobe(); buildRank();
  const st = detailCard.scrollTop;                // re-render the open card in place, keeping its scroll
  if (state.sel) showDetail(byIso[state.sel]);
  else if (state.selPin) showPin(state.selPin);
  detailCard.scrollTop = st;
}

/* ----------------------------- tooltip ----------------------------------- */
function showTip(html, x, y) { tooltip.innerHTML = html; tooltip.classList.remove('hidden'); if (x != null) { tooltip.style.left = x + 'px'; tooltip.style.top = y + 'px'; } }
const hideTip = () => tooltip.classList.add('hidden');
let lastMouse = { x: innerWidth / 2, y: innerHeight / 2 };
document.addEventListener('mousemove', e => { lastMouse = { x: e.clientX, y: e.clientY }; if (!tooltip.classList.contains('hidden')) { tooltip.style.left = e.clientX + 'px'; tooltip.style.top = e.clientY + 'px'; } });

function tipHTML(c) {
  const ok = passes(c), v = valOf(c), rk = rankMap[c.iso];
  const pills = PILLARS.map(p => { const pv = pillarOf(c, p.key); return `<span class="tt-pill" style="color:${col(pv)}" title="${esc(p.name)}">${p.ic} ${r0(pv)}</span>`; }).join('');
  return `<div class="tt-name"><span class="tt-flag">${flag(c.iso)}</span>${esc(c.name)}</div>` +
    `<div class="tt-sub">${metricIcon()} ${esc(metricLabel())}</div>` +
    (ok ? `<div class="tt-score"><b style="color:${col(v)}">${r0(v)}</b><span class="u">/ 100 · rank <b style="color:var(--txt)">#${rk}</b> of ${nRanked()}</span></div>`
        : `<div class="tt-score"><span class="u" style="color:#f0a98f">Excluded: ${esc(failedMusts(c).map(m => m.name).join(', '))}</span></div>`) +
    `<div class="tt-spark">${pills}</div>` +
    `<div class="tt-hint">${(placesByIso[c.iso] || []).length ? `📍 ${(placesByIso[c.iso] || []).length} candidate site(s) · ` : ''}Click for the full profile ↗</div>`;
}
function pinTipHTML(p) {
  if (p.kind === 'village') {
    const v = p.d;
    return `<div class="tt-name">🏘️ ${esc(v.name)}</div><div class="tt-sub">${flag(v.iso)} ${esc(byIso[v.iso]?.name || v.iso)}${v.founded ? ' · since ' + v.founded : ''}${v.pop ? ' · ~' + v.pop.toLocaleString() + ' people' : ''}</div>` +
      `<div class="tt-hint">Existing ecovillage · click for details</div>`;
  }
  const s = p.d, sv = siteVal(s);
  return `<div class="tt-name">📍 ${esc(s.name)}</div><div class="tt-sub">${flag(s.iso)} ${esc(byIso[s.iso]?.name || s.iso)} · ${esc(s.climate || '')}</div>` +
    `<div class="tt-score"><b style="color:${col(sv)}">${r0(sv)}</b><span class="u">/ 100 · site #${siteRank[s.id] || '—'} of ${siteList.filter(x => x.ok).length}</span></div>` +
    `<div class="tt-hint">Candidate site · click for the scout's notes</div>`;
}
let overGlobe = false;                            // globe.gl re-raycasts its last pointer position even after the mouse leaves
elViz.addEventListener('pointerenter', () => { overGlobe = true; });
elViz.addEventListener('pointerleave', () => { overGlobe = false; onPolyHover(null); onPinHover(null); });
function onPolyHover(f) {
  if (!overGlobe) f = null;
  state.hoverIso = f ? polyIso(f) : null;
  if (globe) { globe.controls().autoRotate = !f && spinOn; globe.polygonCapColor(capColor).polygonAltitude(polyAlt); }
  if (!f) { hideTip(); return; }
  const c = polyCountry(f);
  if (c) showTip(tipHTML(c), lastMouse.x, lastMouse.y);
  else showTip(`<div class="tt-name">${esc(f.properties.ADMIN || f.properties.NAME)}</div><div class="tt-sub">Not ranked (no data)</div>`, lastMouse.x, lastMouse.y);
}
let pinHover = null;
function onPinHover(p) {
  if (!overGlobe) p = null;
  pinHover = p || null;
  if (globe) globe.controls().autoRotate = !p && spinOn;
  if (p) showTip(pinTipHTML(p), lastMouse.x, lastMouse.y); else if (!state.hoverIso) hideTip();
  elViz.style.cursor = p ? 'pointer' : '';
}

/* ----------------------------- selection --------------------------------- */
function flyTo(lat, lng, alt) { spinOn = false; syncSpin(); if (globe && state.mode === 'globe') { globe.controls().autoRotate = false; globe.pointOfView({ lat, lng, altitude: alt || 1.6 }, 850); } }
function selectCountry(iso, doFly) {
  if (pinHover) return;                       // a pin click sits on top of its country
  const c = byIso[iso]; if (!c) return;
  state.sel = iso; state.selPin = null; refreshGlobe(); showDetail(c); markActive();
  if (doFly && c.lat != null) flyTo(c.lat, c.lon, 1.5);
}
function selectPin(id, doFly) {
  const p = pinById(id); if (!p) return;
  state.selPin = id; state.sel = null; refreshGlobe(); showPin(id); markActive();
  if (doFly) flyTo(p.lat, p.lng, 0.9);
}
function clearSel() { state.sel = null; state.selPin = null; detailCard.classList.add('hidden'); refreshGlobe(); markActive(); }

/* ============================== Detail card ============================== */
const detailCard = document.getElementById('detailCard');
const detailBody = document.getElementById('detailBody');
document.getElementById('detailClose').addEventListener('click', clearSel);

function radarSVG(c) {
  const N = DIMS.length, cx = 130, cy = 122, R = 94;
  const ang = i => -Math.PI / 2 + i * 2 * Math.PI / N;
  const pt = (i, r) => [cx + Math.cos(ang(i)) * r, cy + Math.sin(ang(i)) * r];
  let grid = '';
  [25, 50, 75, 100].forEach(g => {
    const pts = DIMS.map((_, i) => pt(i, R * g / 100).map(n => n.toFixed(1)).join(',')).join(' ');
    grid += `<polygon points="${pts}" fill="none" stroke="rgba(150,210,180,.12)" stroke-width="1"/>`;
  });
  let spokes = '', labels = '', arcs = '';
  DIMS.forEach((d, i) => {
    const [x, y] = pt(i, R), [lx, ly] = pt(i, R + 13);
    spokes += `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${hexA(PIL[d.p].color, .22)}" stroke-width="1"/>`;
    labels += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" font-size="10">${d.ic}</text>`;
    const [ax, ay] = pt(i - 0.5, R + 3), [bx, by] = pt(i + 0.5, R + 3);
    arcs += `<path d="M${ax.toFixed(1)} ${ay.toFixed(1)} A${R + 3} ${R + 3} 0 0 1 ${bx.toFixed(1)} ${by.toFixed(1)}" stroke="${PIL[d.p].color}" stroke-width="2.5" fill="none" opacity=".7"/>`;
  });
  const v = k => clamp(c.s[k] == null ? 0 : c.s[k], 0, 100);
  const poly = DIMS.map((d, i) => pt(i, R * v(d.key) / 100).map(n => n.toFixed(1)).join(',')).join(' ');
  const ovr = compositeOf(c);
  return `<svg class="d-radar" viewBox="0 0 260 250" preserveAspectRatio="xMidYMid meet">${grid}${spokes}${arcs}` +
    `<polygon points="${poly}" fill="${col(ovr, 0.26)}" stroke="${col(ovr)}" stroke-width="2" stroke-linejoin="round"/>` +
    DIMS.map((d, i) => { const [x, y] = pt(i, R * v(d.key) / 100); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.2" fill="${col(c.s[d.key])}"/>`; }).join('') +
    `${labels}</svg>`;
}
const estTag = (c, k) => (c.est || []).includes(k) ? '<span class="est" title="Mostly an expert estimate">estimate</span>' : '';

function pillarRowsHTML(c) {
  return PILLARS.map(p => {
    const v = pillarOf(c, p.key);
    const rk = ECO.map(x => ({ i: x.iso, v: pillarOf(x, p.key) })).sort((a, b) => b.v - a.v).findIndex(x => x.i === c.iso) + 1;
    return `<div class="pl-row${state.metric === p.key ? ' on' : ''}" data-m="${p.key}" style="--pc:${p.color}" title="${esc(p.desc)} — click to map">` +
      `<span class="pl-ic">${p.ic}</span><span class="pl-name">${esc(p.name)}</span>` +
      `<span class="pl-bar"><i style="width:${clamp(v || 0, 2, 100)}%;background:${col(v)}"></i></span>` +
      `<span class="pl-v" style="color:${col(v)}">${r0(v)}</span><span class="pl-rk">#${rk}</span></div>`;
  }).join('');
}
function dimRowsHTML(c) {
  return PILLARS.map(p => {
    const rows = dimsOf(p.key).map(d => {
      const v = c.s[d.key], on = state.metric === d.key;
      return `<div class="dim-row${on ? ' on' : ''}" data-m="${d.key}" title="${esc(d.desc)} — click to map">` +
        `<span class="dim-ic">${d.ic}</span><span class="dim-name">${esc(d.name)}${(c.est || []).includes(d.key) ? ' <span style="color:var(--earth);font-size:10px">est.</span>' : ''}</span>` +
        `<span class="dim-bar"><i style="width:${clamp(v || 0, 2, 100)}%;background:${col(v)}"></i></span>` +
        `<span class="dim-v" style="color:${col(v)}">${r0(v)}</span></div>`;
    }).join('');
    return `<div class="d-group-h" style="color:${p.color}">${p.ic} ${esc(p.name)}</div>${rows}`;
  }).join('');
}
function note(pk, ic, title, score, body, est) {
  const p = PIL[pk];
  return `<div class="nt" style="--pc:${p.color}"><div class="nt-h">${ic} ${esc(title)}${est || ''}${score != null ? `<span class="nt-sc" style="color:${col(score)}">${r0(score)}</span>` : ''}</div>${body}</div>`;
}
const tag = (txt, cls) => `<span class="tag${cls ? ' ' + cls : ''}">${esc(txt)}</span>`;
const HS = { legal:['Homeschool legal','yes'], regulated:['Homeschool regulated','yes'], restricted:['Homeschool restricted','warn'], banned:['Homeschool banned','no'], unclear:['Homeschool unclear','warn'] };
const CIV = { open:['Civic space: open','yes'], narrowed:['Civic space: narrowed','yes'], obstructed:['Civic space: obstructed','warn'], repressed:['Civic space: repressed','no'], closed:['Civic space: closed','no'] };

function showDetail(c) {
  const x = c.x || {}, f = c.f || {};
  const ovr = compositeOf(c), ok = passes(c);
  const oRank = ECO.filter(passes).map(e => ({ i: e.iso, v: compositeOf(e) })).sort((a, b) => b.v - a.v).findIndex(e => e.i === c.iso) + 1;
  let h = `<div class="d-flagrow"><span class="d-flag">${flag(c.iso)}</span><div><div class="d-name">${esc(c.name)}</div><div class="d-sub">${esc(shortRegion(c.region))}${(placesByIso[c.iso] || []).length ? ` · 📍 ${(placesByIso[c.iso] || []).length} candidate site(s)` : ''}${(villagesByIso[c.iso] || []).length ? ` · 🏘️ ${(villagesByIso[c.iso] || []).length} mapped ecovillage(s)` : ''}</div></div></div>`;
  if (!ok) h += `<div class="excluded-note">Excluded by your must-haves: <b>${esc(failedMusts(c).map(m => m.ic + ' ' + m.name).join(', '))}</b></div>`;
  h += `<div class="d-hero"><div><span class="d-bignum" style="color:${col(ovr)}">${r0(ovr)}</span><span class="d-bigu"> / 100</span></div>` +
    `<div class="d-heror"><span class="d-tier" style="color:${col(ovr)};border:1px solid ${col(ovr)}">${tierLabel(ovr)}</span>` +
    `<div class="d-rank">Overall suitability${ok ? ` · rank <b>#${oRank}</b>/${nRanked()}` : ''}</div></div></div>`;
  h += `<div class="d-sec"><div class="d-sec-h"><span>Five pillars</span><span style="font-weight:600;color:var(--dim)">tap to map ↗</span></div>${pillarRowsHTML(c)}</div>`;

  /* the research notes */
  h += `<div class="d-sec"><div class="d-sec-h"><span>Research notes</span></div>`;
  h += note('setup', '🏡', 'Land for foreigners', c.s.land, `<p>${esc(x.landNote || '—')}</p>` +
    (x.landPrice ? `<p style="color:var(--muted)">Typical rural land: <b style="color:var(--txt)">${fmtUSD(x.landPrice)}/ha</b>${x.landPriceNote ? ' — ' + esc(x.landPriceNote) : ''}</p>` : ''), estTag(c, 'land'));
  h += note('setup', '📜', 'Legal vehicles', c.s.entity, `<p>${esc(x.entityNote || '—')}</p>`, estTag(c, 'entity'));
  h += note('setup', '💸', 'Foreign funding', c.s.funding, `<p>${esc(x.fundingNote || '—')}</p>`, estTag(c, 'funding'));
  const ss = x.ss || {};
  h += note('visas', '🛂', 'Visas & residency', pillarOf(c, 'visas'),
    (ss.freeCount != null ? `<p><b>${ss.freeCount}</b> of ${ss.passports} passports enter visa-free, with an eTA or on arrival${ss.typDays ? `, typically for <b>${ss.typDays >= 365 ? 'a year' : ss.typDays + ' days'}</b>` : ''}.</p>` : '') +
    `<div class="tags">${(x.freeMove || []).map(b => tag('Free movement: ' + b, 'yes')).join('')}${tag(f.volunteer ? 'Volunteer/NGO visa' : 'No volunteer visa', f.volunteer ? 'yes' : 'no')}${tag(f.nomad ? 'Nomad visa' : 'No nomad visa', f.nomad ? 'yes' : '')}${tag(f.retire ? 'Retirement visa' : 'No retirement visa', f.retire ? 'yes' : '')}${x.prYears === 0 ? tag('Permanent from the start', 'yes') : x.prYears ? tag('PR ≈ ' + x.prYears + ' yrs', '') : ''}</div>` +
    ((x.routes || []).length ? `<p style="margin-top:5px">Routes: ${x.routes.map(esc).join(' · ')}</p>` : '') +
    (x.visaNote ? `<p style="color:var(--muted)">${esc(x.visaNote)}</p>` : ''), estTag(c, 'longstay'));
  h += note('secure', '🛡️', 'Safety, freedom & hazards', pillarOf(c, 'secure'),
    `<div class="tags">${f.civicus && CIV[f.civicus] ? tag(...CIV[f.civicus]) : ''}${(x.hazards || []).map(z => tag(z, 'warn')).join('')}</div>` +
    (x.riskNote ? `<p style="margin-top:5px">${esc(x.riskNote)}</p>` : ''), '');
  const facts = [];
  if (x.rain != null) facts.push(['Rainfall', Math.round(x.rain).toLocaleString() + ' <small>mm/yr</small>']);
  if (x.waterStress != null) facts.push(['Water stress', x.waterStress.toFixed(1) + ' <small>/ 5</small>']);
  if (x.pvout != null) facts.push(['Solar', x.pvout.toFixed(1) + ' <small>kWh/kWp/day</small>']);
  if (x.forest != null) facts.push(['Forest cover', Math.round(x.forest) + '<small>%</small>']);
  if (x.ndgain != null) facts.push(['ND-GAIN', x.ndgain.toFixed(1) + ' <small>readiness</small>']);
  if (x.density != null) facts.push(['Density', Math.round(x.density).toLocaleString() + ' <small>/km²</small>']);
  h += note('nature', '🏞️', 'Land, water & climate', pillarOf(c, 'nature'),
    (facts.length ? `<div class="facts">${facts.map(([k, v]) => `<div class="fact"><div class="fact-k">${k}</div><div class="fact-v">${v}</div></div>`).join('')}</div>` : '') +
    (x.climateNote ? `<p>${esc(x.climateNote)}</p>` : ''), '');
  h += note('living', '🏘️', 'Community & daily life', pillarOf(c, 'living'),
    `<div class="tags">${x.ecoCount != null ? tag('~' + x.ecoCount + ' known communities', '') : ''}${f.homeschool && HS[f.homeschool] ? tag(...HS[f.homeschool]) : ''}</div>` +
    ((x.examples || []).length ? `<p style="margin-top:5px">Examples: ${x.examples.map(esc).join(' · ')}</p>` : '') +
    (x.ecoNote ? `<p style="color:var(--muted)">${esc(x.ecoNote)}</p>` : ''), estTag(c, 'community'));
  h += `</div>`;

  const sites = (placesByIso[c.iso] || []).slice().sort((a, b) => siteVal(b) - siteVal(a));
  if (sites.length) h += `<div class="d-sec"><div class="d-sec-h"><span>📍 Candidate sites here</span></div>` +
    sites.map(p => { const v = siteVal(p); return `<div class="sl-row" data-pin="${esc(p.id)}"><span class="sl-dot" style="background:#ffd84d"></span><span class="sl-main"><span class="sl-name">${esc(p.name)}</span><span class="sl-meta">${esc(p.climate || '')}</span></span><span class="sl-v" style="color:${col(v)}">${r0(v)}</span></div>`; }).join('') + `</div>`;
  const vills = villagesByIso[c.iso] || [];
  if (vills.length) h += `<div class="d-sec"><div class="d-sec-h"><span>🏘️ Existing ecovillages</span></div>` +
    vills.map(v => `<div class="sl-row" data-pin="v${VILLAGES.indexOf(v)}"><span class="sl-dot" style="background:#f0f6f2"></span><span class="sl-main"><span class="sl-name">${esc(v.name)}</span><span class="sl-meta">${v.founded ? 'since ' + v.founded : ''}${v.pop ? ' · ~' + v.pop.toLocaleString() + ' people' : ''}${v.type ? ' · ' + esc(v.type) : ''}</span></span></div>`).join('') + `</div>`;

  h += `<div class="d-sec"><div class="d-sec-h"><span>Profile</span><b>${esc(metricLabel())}</b></div>${radarSVG(c)}</div>`;
  h += `<div class="d-sec"><div class="d-sec-h"><span>All ${DIMS.length} criteria</span><span style="font-weight:600;color:var(--dim)">tap to map ↗</span></div>${dimRowsHTML(c)}</div>`;
  h += `<div class="d-src">Scores are 0–100 (100 = most favourable for an ecovillage). "est." marks criteria that rest mainly on expert estimates. Not legal advice — see About for sources and caveats.</div>`;
  detailBody.innerHTML = h;
  detailCard.classList.remove('hidden'); detailCard.scrollTop = 0;
}
function tierLabel(v) { return v >= 74 ? 'Exceptional' : v >= 66 ? 'Excellent' : v >= 58 ? 'Very promising' : v >= 50 ? 'Promising' : v >= 42 ? 'Mixed' : v >= 33 ? 'Challenging' : 'Very hard'; }

function showPin(id) {
  const p = pinById(id); if (!p) return;
  const c = byIso[p.iso];
  let h = '';
  if (p.kind === 'village') {
    const v = p.d;
    h = `<div class="pc-kicker">🏘️ Existing ecovillage</div><div class="d-flagrow"><span class="d-flag">${flag(v.iso)}</span><div><div class="d-name">${esc(v.name)}</div><div class="d-sub">${esc(c ? c.name : v.iso)}${v.founded ? ' · founded ' + v.founded : ''}</div></div></div>` +
      `<div class="facts">${v.pop ? `<div class="fact"><div class="fact-k">Residents</div><div class="fact-v">~${v.pop.toLocaleString()}</div></div>` : ''}${v.type ? `<div class="fact"><div class="fact-k">Type</div><div class="fact-v" title="${esc(v.type)}">${esc(v.type)}</div></div>` : ''}</div>` +
      (v.note ? `<p class="pc-why">${esc(v.note)}</p>` : '') +
      (v.url ? `<p><a class="pc-link" href="${esc(v.url)}" target="_blank" rel="noopener">Visit website ↗</a></p>` : '');
  } else {
    const s = p.d, sv = siteVal(s), ok = !c || passes(c);
    h = `<div class="pc-kicker">📍 Candidate site</div><div class="d-flagrow"><span class="d-flag">${flag(s.iso)}</span><div><div class="d-name">${esc(s.name)}</div><div class="d-sub">${esc(c ? c.name : s.iso)}${(s.tags || []).length ? ' · ' + s.tags.map(esc).join(', ') : ''}</div></div></div>`;
    if (!ok) h += `<div class="excluded-note">Its country fails your must-haves: <b>${esc(failedMusts(c).map(m => m.name).join(', '))}</b></div>`;
    h += `<div class="d-hero"><div><span class="d-bignum" style="color:${col(sv)}">${r0(sv)}</span><span class="d-bigu"> / 100</span></div>` +
      `<div class="d-heror"><span class="d-tier" style="color:${col(sv)};border:1px solid ${col(sv)}">${tierLabel(sv)}</span>` +
      `<div class="d-rank">${ok ? `Site rank <b>#${siteRank[s.id]}</b>/${siteList.filter(x => x.ok).length}` : 'Not ranked'}</div>` +
      `<div class="d-rank" style="margin-top:2px">Scout ${r0(s.score)} · country ${c ? r0(compositeOf(c)) : '—'}</div></div></div>`;
    const facts = [
      ['Elevation', s.elev != null ? Math.round(s.elev).toLocaleString() + ' <small>m</small>' : '—'],
      ['Climate zone', s.koppen ? esc(s.koppen) : '—'],
      ['Water', s.water ? esc(s.water) : '—'],
      ['Land price', s.landPrice ? fmtUSD(s.landPrice) + ' <small>/ha</small>' : '—'],
    ];
    h += `<div class="facts">${facts.map(([k, v]) => `<div class="fact"><div class="fact-k">${k}</div><div class="fact-v">${v}</div></div>`).join('')}</div>`;
    h += note('nature', '☀️', 'Climate & terrain', null, `<p>${esc(s.climate || '')}</p>${s.terrain ? `<p style="color:var(--muted)">${esc(s.terrain)}</p>` : ''}`, '');
    h += note('nature', '✅', 'Why here', null, `<p>${esc(s.why || '')}</p>`, '');
    if (s.cautions) h += note('living', '⚠️', 'Cautions', null, `<p>${esc(s.cautions)}</p>`, '');
    if (s.nearby) h += note('visas', '🧭', 'Nearby', null, `<p>${esc(s.nearby)}</p>`, '');
    if (c) h += `<div class="d-sec" style="margin-top:12px"><div class="d-sec-h"><span>${flag(c.iso)} ${esc(c.name)} — the five pillars</span></div>${pillarRowsHTML(c)}</div>`;
  }
  if (c) h += `<button class="pc-btn" data-country="${c.iso}">${flag(c.iso)} Open the ${esc(c.name)} profile</button>`;
  detailBody.innerHTML = h;
  detailCard.classList.remove('hidden'); detailCard.scrollTop = 0;
}

detailBody.addEventListener('click', e => {
  const pin = e.target.closest('[data-pin]'); if (pin) return selectPin(pin.dataset.pin, true);
  const ct = e.target.closest('[data-country]'); if (ct) { pinHover = null; return selectCountry(ct.dataset.country, true); }
  const m = e.target.closest('[data-m]'); if (m) setMetric(m.dataset.m);
});

/* ============================== Metric bars ============================== */
const pillarBar = document.getElementById('pillarBar'), dimBar = document.getElementById('dimBar');
function activePillar() { return isPillar(state.metric) ? state.metric : DIM[state.metric] ? DIM[state.metric].p : null; }
function buildMetricBar() {
  const ap = activePillar();
  pillarBar.innerHTML = `<button class="metric-chip overall${state.metric === 'overall' ? ' on' : ''}" data-m="overall"><span class="mc-ic">🌍</span>Overall</button>` +
    PILLARS.map(p => `<button class="metric-chip pillar${state.metric === p.key ? ' on' : ''}" data-m="${p.key}" style="--pc:${p.color}" title="${esc(p.desc)}"><span class="pc-bar" style="background:${p.color}"></span><span class="mc-ic">${p.ic}</span>${esc(p.short)}</button>`).join('');
  dimBar.innerHTML = PILLARS.map((p, i) => (i ? '<span class="dim-sep"></span>' : '') + dimsOf(p.key).map(d =>
    `<button class="dim-chip${ap === p.key ? ' in' : ''}${state.metric === d.key ? ' on' : ''}" data-m="${d.key}" style="--pc:${p.color}" title="${esc(d.desc)}"><span class="pc-dot" style="background:${p.color}"></span>${d.ic} ${esc(d.name)}</button>`).join('')).join('');
}
pillarBar.addEventListener('click', e => { const b = e.target.closest('[data-m]'); if (b) setMetric(b.dataset.m); });
dimBar.addEventListener('click', e => { const b = e.target.closest('[data-m]'); if (b) setMetric(b.dataset.m); });
function setMetric(m) {
  if (m !== 'overall' && !isPillar(m) && !DIM[m]) return;
  state.metric = m;
  buildMetricBar();
  document.getElementById('lgTitle').textContent = metricLabel();
  refreshAll();
  const act = dimBar.querySelector('.dim-chip.on') || dimBar.querySelector('.dim-chip.in');
  if (act) act.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
}

/* ============================== Ranking panel ============================ */
const rankListEl = document.getElementById('rankList');
const rpStat = document.getElementById('rpStat'), rpSub = document.getElementById('rpSub'), rpTitle = document.getElementById('rpTitle');
function buildFilters() {
  document.getElementById('rpFilters').innerHTML =
    REGION_CHIPS.filter(([k]) => k === 'all' || ECO.some(c => c.region === k))
      .map(([k, lab]) => `<button class="fchip${state.filter === k ? ' on' : ''}" data-k="${esc(k)}">${esc(lab)}</button>`).join('');
}
const regionOk = iso => state.filter === 'all' || (byIso[iso] && byIso[iso].region === state.filter);
function buildRank() {
  document.querySelectorAll('.rp-tab').forEach(b => b.classList.toggle('on', b.dataset.t === state.tab));
  const mustTxt = state.musts.size ? ` · <b style="color:var(--earth)">${state.musts.size} must-have${state.musts.size > 1 ? 's' : ''}</b>` : '';
  if (state.tab === 'sites') {
    rpTitle.innerHTML = `<span class="rp-ic">📍</span>Candidate sites`;
    rpSub.innerHTML = `Scout's site score blended with its country's overall score under <b>${esc(PRESETS.find(p => p.id === state.preset)?.name || 'Custom')}</b> priorities${mustTxt}`;
    const list = siteList.filter(x => regionOk(x.p.iso));
    const okN = list.filter(x => x.ok).length;
    rpStat.innerHTML = `<b>${okN}</b> sites ranked${list.length - okN ? ` · ${list.length - okN} excluded` : ''} in <b>${new Set(list.map(x => x.p.iso)).size}</b> countries`;
    let i = 0;
    rankListEl.innerHTML = list.map(x => {
      const n = x.ok ? ++i : null, c = byIso[x.p.iso];
      return `<div class="rk-row${n && n <= 3 ? ' top' + n : ''}${x.ok ? '' : ' ex'}${state.selPin === x.p.id ? ' active' : ''}" data-pin="${esc(x.p.id)}">` +
        `<span class="rk-rank">${n || '·'}</span><span class="rk-flag">${flag(x.p.iso)}</span>` +
        `<span class="rk-main"><span class="rk-name">${esc(x.p.name)}</span><span class="rk-meta">${esc(c ? c.name : x.p.iso)}${x.p.koppen ? ' · ' + esc(x.p.koppen) : ''}${x.p.elev != null ? ' · ' + Math.round(x.p.elev) + ' m' : ''}</span></span>` +
        `<span class="rk-right"><span class="rk-le" style="color:${col(x.v)}">${r0(x.v)}</span><span class="rk-bar"><i style="width:${clamp(x.v, 3, 100)}%;background:${col(x.v)}"></i></span></span></div>`;
    }).join('') || `<div class="rp-stat">No sites in this view.</div>`;
    return;
  }
  rpTitle.innerHTML = `<span class="rp-ic">${metricIcon()}</span>${esc(state.metric === 'overall' ? 'Overall ranking' : metricLabel())}`;
  rpSub.innerHTML = state.metric === 'overall'
    ? `Five pillars · <b>${esc(PRESETS.find(p => p.id === state.preset)?.name || 'Custom')}</b> priorities${mustTxt}`
    : esc(isPillar(state.metric) ? PIL[state.metric].desc : DIM[state.metric].desc) + mustTxt;
  const list = rankList.filter(x => regionOk(x.c.iso));
  const okL = list.filter(x => x.ok);
  const avg = okL.reduce((s, x) => s + x.v, 0) / (okL.length || 1);
  rpStat.innerHTML = `<b>${okL.length}</b> ${state.filter === 'all' ? 'countries' : 'shown'}${list.length - okL.length ? ` · ${list.length - okL.length} excluded` : ''} · average <b>${r0(avg)}</b>/100`;
  let i = 0;
  rankListEl.innerHTML = list.map(x => {
    const n = x.ok ? ++i : null, ns = (placesByIso[x.c.iso] || []).length;
    return `<div class="rk-row${n && n <= 3 ? ' top' + n : ''}${x.ok ? '' : ' ex'}${state.sel === x.c.iso ? ' active' : ''}" data-iso="${x.c.iso}">` +
      `<span class="rk-rank">${n || '·'}</span><span class="rk-flag">${flag(x.c.iso)}</span>` +
      `<span class="rk-main"><span class="rk-name">${esc(x.c.name)}</span><span class="rk-meta">${esc(shortRegion(x.c.region))}${ns ? ` · 📍${ns}` : ''}</span></span>` +
      `<span class="rk-right"><span class="rk-le" style="color:${col(x.ok ? x.v : null)}">${x.ok ? r0(x.v) : '—'}</span><span class="rk-bar"><i style="width:${clamp(x.v || 0, 3, 100)}%;background:${col(x.ok ? x.v : null)}"></i></span></span></div>`;
  }).join('') || `<div class="rp-stat">No countries in this view.</div>`;
}
rankListEl.addEventListener('click', e => {
  const r = e.target.closest('.rk-row'); if (!r) return;
  if (r.dataset.pin) selectPin(r.dataset.pin, true); else { pinHover = null; selectCountry(r.dataset.iso, true); }
});
document.getElementById('rpFilters').addEventListener('click', e => { const b = e.target.closest('.fchip'); if (b) { state.filter = b.dataset.k; buildFilters(); buildRank(); } });
document.getElementById('rpTabs').addEventListener('click', e => { const b = e.target.closest('.rp-tab'); if (b) { state.tab = b.dataset.t; buildRank(); if (state.tab === 'sites' && !state.sites) setSites(true); } });
function markActive() {
  rankListEl.querySelectorAll('.rk-row').forEach(r => r.classList.toggle('active', (!!r.dataset.iso && r.dataset.iso === state.sel) || (!!r.dataset.pin && r.dataset.pin === state.selPin)));
  const el = rankListEl.querySelector('.rk-row.active'); if (el) el.scrollIntoView({ block: 'nearest' });
}
const rankPanel = document.getElementById('rankPanel'), rpShow = document.getElementById('rpShow');
function setPanel(on) { panelOn = on; rankPanel.classList.toggle('hidden', !on); rpShow.classList.toggle('hidden', on); syncMenu('miPanel', on); }
document.getElementById('rpCollapse').addEventListener('click', () => setPanel(false));
rpShow.addEventListener('click', () => setPanel(true));

/* ============================== Weights drawer =========================== */
const weightbar = document.getElementById('weightbar'), wbBody = document.getElementById('wbBody'), wbShow = document.getElementById('wbShow');
function buildPresets() {
  document.getElementById('wbPresets').innerHTML = PRESETS.map(p =>
    `<button class="preset-chip${state.preset === p.id ? ' on' : ''}" data-p="${p.id}">${p.ic} ${esc(p.name)}</button>`).join('');
}
function buildMusts() {
  document.getElementById('wbMust').innerHTML = `<span class="wm-lab">Must-haves</span>` + MUSTS.map(m => {
    const n = ECO.filter(c => m.test(c)).length;
    return `<button class="must-chip${state.musts.has(m.id) ? ' on' : ''}" data-must="${m.id}" title="${n} of ${ECO.length} countries pass">${m.ic} ${esc(m.name)}</button>`;
  }).join('');
}
function buildWeights() {
  wbBody.innerHTML = PILLARS.map(p =>
    `<div class="w-group" style="--pc:${p.color}"><div class="w-group-h">${p.ic} ${esc(p.name)}</div>` +
    dimsOf(p.key).map(d => {
      const w = state.weights[d.key];
      return `<div class="w-item${w === 0 ? ' off' : ''}" data-dim="${d.key}"><span class="w-ic">${d.ic}</span><span class="w-name" title="${esc(d.name)} — ${esc(d.desc)}">${esc(d.name)}</span>` +
        `<input class="w-slider" type="range" min="0" max="5" step="1" value="${w}" data-dim="${d.key}" aria-label="${esc(d.name)} weight"><span class="w-val">${w}</span></div>`;
    }).join('') + `</div>`).join('');
}
wbBody.addEventListener('input', e => {
  const s = e.target.closest('.w-slider'); if (!s) return;
  const k = s.dataset.dim, w = +s.value;
  state.weights[k] = w;
  s.closest('.w-item').classList.toggle('off', w === 0);
  s.parentElement.querySelector('.w-val').textContent = w;
  state.preset = matchPreset(); buildPresets();
  if (state.metric !== 'overall' && !isPillar(state.metric)) { state.metric = 'overall'; buildMetricBar(); document.getElementById('lgTitle').textContent = metricLabel(); }
  refreshAll();
});
document.getElementById('wbMust').addEventListener('click', e => {
  const b = e.target.closest('.must-chip'); if (!b) return;
  const id = b.dataset.must;
  if (state.musts.has(id)) state.musts.delete(id); else state.musts.add(id);
  buildMusts(); refreshAll();
  const m = MUSTS.find(x => x.id === id);
  toast(state.musts.has(id) ? `${m.ic} Must-have on — ${nRanked()} countries left` : `${m.ic} Must-have off`);
});
const presetW = (p, k) => p.w[k] != null ? p.w[k] : p.base;
function applyPreset(id, quiet) {
  const p = PRESETS.find(x => x.id === id); if (!p) return;
  DIMS.forEach(d => state.weights[d.key] = presetW(p, d.key));
  state.preset = id; state.metric = 'overall';
  buildPresets(); buildWeights(); buildMetricBar();
  document.getElementById('lgTitle').textContent = metricLabel();
  refreshAll();
  if (!quiet) toast(`${p.ic} ${p.name} priorities applied`);
}
function matchPreset() {
  for (const p of PRESETS) if (DIMS.every(d => state.weights[d.key] === presetW(p, d.key))) return p.id;
  return 'custom';
}
document.getElementById('wbPresets').addEventListener('click', e => { const b = e.target.closest('.preset-chip'); if (b) applyPreset(b.dataset.p); });
document.getElementById('wbReset').addEventListener('click', () => { state.musts.clear(); buildMusts(); applyPreset('balanced'); });
function setWeightbar(on) { weightbar.classList.toggle('hidden', !on); wbShow.classList.toggle('hidden', on); document.getElementById('btnWeights').classList.toggle('active', on); syncMenu('miWeights', on); }
document.getElementById('wbCollapse').addEventListener('click', () => weightbar.classList.toggle('collapsed'));
document.getElementById('btnWeights').addEventListener('click', () => { const hidden = weightbar.classList.contains('hidden'); setWeightbar(hidden); if (hidden) weightbar.classList.remove('collapsed'); });
wbShow.addEventListener('click', () => { setWeightbar(true); weightbar.classList.remove('collapsed'); });

/* ============================== Layers =================================== */
function setSites(on) { state.sites = on; document.getElementById('btnSites').classList.toggle('active', on); syncMenu('miSites', on); refreshPins(); if (state.mode === 'flat') drawFlat(); }
function setVillages(on) { state.villages = on; document.getElementById('btnVillages').classList.toggle('active', on); syncMenu('miVillages', on); refreshPins(); if (state.mode === 'flat') drawFlat(); }
document.getElementById('btnSites').addEventListener('click', () => setSites(!state.sites));
document.getElementById('btnVillages').addEventListener('click', () => setVillages(!state.villages));

/* ============================== Flat map ================================= */
let fctx, fX = 0, fY = 0, fPW = 0, fPH = 0, flatW = 0, flatH = 0;
const projX = lon => fX + (lon + 180) / 360 * fPW;
const projY = lat => fY + (90 - lat) / 180 * fPH;
function eachRing(geom, cb) { if (!geom) return; if (geom.type === 'Polygon') geom.coordinates.forEach(cb); else if (geom.type === 'MultiPolygon') geom.coordinates.forEach(p => p.forEach(cb)); }
function sizeFlat() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  flatW = elFlat.clientWidth; flatH = elFlat.clientHeight;
  elFlat.width = flatW * dpr; elFlat.height = flatH * dpr;
  fctx = elFlat.getContext('2d'); fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  fPW = Math.min(flatW * 0.98, flatH * 2 * 0.98); fPH = fPW / 2; fX = (flatW - fPW) / 2; fY = (flatH - fPH) / 2;
}
function drawFlat() {
  if (!fctx || !GEO) return;
  fctx.clearRect(0, 0, flatW, flatH);
  const oc = fctx.createLinearGradient(0, fY, 0, fY + fPH); oc.addColorStop(0, '#0a241a'); oc.addColorStop(1, '#06140f');
  fctx.fillStyle = oc; fctx.fillRect(fX, fY, fPW, fPH);
  fctx.strokeStyle = 'rgba(150,210,180,.06)'; fctx.lineWidth = 1;
  for (let lon = -150; lon <= 150; lon += 30) { fctx.beginPath(); fctx.moveTo(projX(lon), fY); fctx.lineTo(projX(lon), fY + fPH); fctx.stroke(); }
  for (let lat = -60; lat <= 60; lat += 30) { fctx.beginPath(); fctx.moveTo(fX, projY(lat)); fctx.lineTo(fX + fPW, projY(lat)); fctx.stroke(); }
  fctx.lineWidth = 0.5; fctx.strokeStyle = 'rgba(180,230,200,.16)';
  for (const f of LAND) {
    const v = polyVal(f), sel = state.sel === polyIso(f);
    fctx.fillStyle = col(v, v == null ? 0.45 : 0.9);
    eachRing(f.geometry, ring => {
      fctx.beginPath(); ring.forEach((c, i) => { const x = projX(c[0]), y = projY(c[1]); i ? fctx.lineTo(x, y) : fctx.moveTo(x, y); }); fctx.closePath(); fctx.fill();
      if (sel) { fctx.save(); fctx.strokeStyle = '#fff'; fctx.lineWidth = 1.5; fctx.stroke(); fctx.restore(); } else fctx.stroke();
    });
  }
  for (const p of pinData()) {
    const x = projX(p.lng), y = projY(p.lat), on = state.selPin === p.id;
    fctx.beginPath(); fctx.arc(x, y, p.kind === 'site' ? (on ? 5.5 : 3.8) : (on ? 4.5 : 2.6), 0, Math.PI * 2);
    fctx.fillStyle = pinColor(p); fctx.fill();
    fctx.lineWidth = 1; fctx.strokeStyle = 'rgba(6,20,15,.85)'; fctx.stroke();
  }
}
function pointInRing(x, y, ring) { let inside = false; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const xi = projX(ring[i][0]), yi = projY(ring[i][1]), xj = projX(ring[j][0]), yj = projY(ring[j][1]); if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) inside = !inside; } return inside; }
function flatCountryAt(x, y) { for (const f of LAND) { let inside = false; eachRing(f.geometry, ring => { if (pointInRing(x, y, ring)) inside = !inside; }); if (inside) return f; } return null; }   // even-odd, so holes (Lesotho in South Africa) work
function flatPinAt(x, y) { let best = null, bd = 49; for (const p of pinData()) { const d = (projX(p.lng) - x) ** 2 + (projY(p.lat) - y) ** 2; if (d < bd) { bd = d; best = p; } } return best; }
elFlat.addEventListener('mousemove', e => {
  if (state.mode !== 'flat') return;
  const rect = elFlat.getBoundingClientRect(), x = e.clientX - rect.left, y = e.clientY - rect.top;
  const pin = flatPinAt(x, y);
  if (pin) { elFlat.style.cursor = 'pointer'; return showTip(pinTipHTML(pin), e.clientX, e.clientY); }
  const f = flatCountryAt(x, y);
  if (f && polyCountry(f)) { elFlat.style.cursor = 'pointer'; showTip(tipHTML(polyCountry(f)), e.clientX, e.clientY); }
  else { elFlat.style.cursor = 'grab'; hideTip(); }
});
elFlat.addEventListener('mouseleave', hideTip);
elFlat.addEventListener('click', e => {
  const rect = elFlat.getBoundingClientRect(), x = e.clientX - rect.left, y = e.clientY - rect.top;
  const pin = flatPinAt(x, y); if (pin) { selectPin(pin.id, false); drawFlat(); return; }
  const f = flatCountryAt(x, y); if (f && polyCountry(f)) { pinHover = null; selectCountry(polyIso(f), false); drawFlat(); }
});
function setMode(m) {
  state.mode = m;
  elViz.classList.toggle('hidden', m !== 'globe');
  elFlat.classList.toggle('hidden', m !== 'flat');
  document.getElementById('btnMap').classList.toggle('active', m === 'flat');
  document.getElementById('btnMap').querySelector('.mb-tx').textContent = m === 'flat' ? 'Globe' : 'Flat map';
  syncMenu('miMap', m === 'flat');
  if (m === 'flat') { sizeFlat(); drawFlat(); } else { sizeGlobe(); refreshGlobe(); }
}
document.getElementById('btnMap').addEventListener('click', () => setMode(state.mode === 'flat' ? 'globe' : 'flat'));

/* ============================== Table view =============================== */
const tableOverlay = document.getElementById('tableOverlay'), dataTable = document.getElementById('dataTable');
let tblSort = { key: 'overall', dir: -1 }, tblQuery = '';
function openTable() { buildTable(); tableOverlay.classList.remove('hidden'); }
function tblVal(c, k) { return k === 'overall' ? compositeOf(c) : isPillar(k) ? pillarOf(c, k) : c.s[k]; }
function buildTable() {
  const cols = [{ k: 'overall', ic: '🌍', name: 'Overall', color: '#ffd84d' }]
    .concat(PILLARS.map(p => ({ k: p.key, ic: p.ic, name: p.name, color: p.color, pil: true })))
    .concat(DIMS.map(d => ({ k: d.key, ic: d.ic, name: d.name, color: PIL[d.p].color })));
  const rows = ECO.filter(c => !tblQuery || c.name.toLowerCase().includes(tblQuery))
    .map(c => ({ c, ok: passes(c) }))
    .sort((a, b) => ((tblVal(a.c, tblSort.key) ?? -1) - (tblVal(b.c, tblSort.key) ?? -1)) * tblSort.dir);
  const head = `<thead><tr><th class="col-rank">#</th><th class="col-name">Country</th>` +
    cols.map(c => `<th data-sort="${c.k}" class="${tblSort.key === c.k ? 'sorted' : ''}" title="${esc(c.name)}" style="box-shadow:inset 0 -3px 0 ${c.color}${c.pil ? '' : '66'}"><span class="th-ic">${c.ic}</span>${tblSort.key === c.k ? (tblSort.dir < 0 ? '▾' : '▴') : ''}</th>`).join('') + `</tr></thead>`;
  let k = 0;
  const body = '<tbody>' + rows.map(r =>
    `<tr${r.ok ? '' : ' style="opacity:.5"'}><td class="col-rank tbl-rk">${r.ok ? ++k : '·'}</td><td class="col-name" data-iso="${r.c.iso}"><span class="tbl-flag">${flag(r.c.iso)}</span>${esc(r.c.name)}</td>` +
    cols.map(cl => { const v = tblVal(r.c, cl.k); const est = (r.c.est || []).includes(cl.k); return `<td class="cell${cl.k === 'overall' ? ' col-overall' : ''}" style="background:${col(v)}${est ? ';text-decoration:underline dotted;text-underline-offset:3px' : ''}">${r0(v)}</td>`; }).join('') + `</tr>`).join('') + '</tbody>';
  dataTable.innerHTML = head + body;
}
dataTable.addEventListener('click', e => {
  const th = e.target.closest('th[data-sort]');
  if (th) { const k = th.dataset.sort; if (tblSort.key === k) tblSort.dir *= -1; else tblSort = { key: k, dir: -1 }; buildTable(); return; }
  const nm = e.target.closest('.col-name[data-iso]');
  if (nm) { tableOverlay.classList.add('hidden'); pinHover = null; selectCountry(nm.dataset.iso, true); }
});
document.getElementById('tblSearch').addEventListener('input', e => { tblQuery = e.target.value.trim().toLowerCase(); buildTable(); });
document.getElementById('tableClose').addEventListener('click', () => tableOverlay.classList.add('hidden'));
tableOverlay.addEventListener('click', e => { if (e.target === tableOverlay) tableOverlay.classList.add('hidden'); });
document.getElementById('btnTable').addEventListener('click', openTable);

/* ============================== Search =================================== */
const searchEl = document.getElementById('search'), searchRes = document.getElementById('searchResults');
let hits = [];
function runSearch() {
  const q = searchEl.value.trim().toLowerCase();
  if (!q) { searchRes.classList.add('hidden'); hits = []; return; }
  const ch = ECO.filter(c => c.name.toLowerCase().includes(q)).sort((a, b) => compositeOf(b) - compositeOf(a)).slice(0, 6).map(c => ({ t: 'c', c }));
  const sh = PLACES.filter(p => p.name.toLowerCase().includes(q) || (p.nearby || '').toLowerCase().includes(q)).slice(0, 5).map(p => ({ t: 'p', p }));
  const vh = VILLAGES.filter(v => v.name.toLowerCase().includes(q)).slice(0, 4).map(v => ({ t: 'v', v }));
  hits = ch.concat(sh, vh);
  searchRes.innerHTML = hits.length ? hits.map((h, i) => {
    if (h.t === 'c') { const v = valOf(h.c); return `<div class="sr-item${i === 0 ? ' sel' : ''}" data-i="${i}"><span class="sr-ic">${flag(h.c.iso)}</span><span class="sr-name">${esc(h.c.name)}</span><span class="sr-score" style="color:${col(v)}">${r0(v)}</span></div>`; }
    if (h.t === 'p') { const v = siteVal(h.p); return `<div class="sr-item${i === 0 ? ' sel' : ''}" data-i="${i}"><span class="sr-ic">📍</span><span class="sr-name">${esc(h.p.name)} <span class="sr-sub">${esc(byIso[h.p.iso]?.name || '')}</span></span><span class="sr-score" style="color:${col(v)}">${r0(v)}</span></div>`; }
    return `<div class="sr-item${i === 0 ? ' sel' : ''}" data-i="${i}"><span class="sr-ic">🏘️</span><span class="sr-name">${esc(h.v.name)} <span class="sr-sub">${esc(byIso[h.v.iso]?.name || '')}</span></span></div>`;
  }).join('') : '<div class="sr-none">No match</div>';
  searchRes.classList.remove('hidden');
}
function pickHit(i) {
  const h = hits[i] || hits[0]; if (!h) return;
  searchEl.value = ''; searchRes.classList.add('hidden'); hits = []; searchEl.blur(); pinHover = null;
  if (h.t === 'c') selectCountry(h.c.iso, true);
  else if (h.t === 'p') { if (!state.sites) setSites(true); selectPin(h.p.id, true); }
  else { if (!state.villages) setVillages(true); selectPin('v' + VILLAGES.indexOf(h.v), true); }
}
searchEl.addEventListener('input', runSearch);
searchEl.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); pickHit(0); } else if (e.key === 'Escape') { searchEl.value = ''; searchRes.classList.add('hidden'); searchEl.blur(); } });
searchRes.addEventListener('click', e => { const it = e.target.closest('.sr-item'); if (it) pickHit(+it.dataset.i); });
document.addEventListener('click', e => { if (!document.getElementById('searchWrap').contains(e.target)) searchRes.classList.add('hidden'); });

/* ============================== Legend =================================== */
const legend = document.getElementById('legend');
document.getElementById('legendToggle').addEventListener('click', () => legend.classList.toggle('collapsed'));

/* ============================== Lessons ================================== */
const lessonsOverlay = document.getElementById('lessonsOverlay');
function buildLessons() {
  if (!AV) { document.getElementById('lessonsBody').innerHTML = '<p>Lessons are loading…</p>'; return; }
  const fx = AV.facts || {};
  const factRows = [['Founded', fx.founded], ['Residents', fx.residents], ['Nations', fx.nations], ['Area', fx.area], ['Land owned', fx.landOwned], ['Planned for', fx.plannedPop ? fx.plannedPop.toLocaleString() + ' people' : null]].filter(r => r[1]);
  let h = `<p>Auroville, founded in 1968 on an eroded plateau near Puducherry, is the boldest experiment of its kind: a township meant to belong to humanity as a whole. Over half a century its successes and struggles map almost one-to-one onto the criteria in this atlas. Each lesson below links to the criterion it inspired.</p>`;
  if (factRows.length) h += `<div class="ls-facts">${factRows.map(([k, v]) => `<div class="fact"><div class="fact-k">${esc(k)}</div><div class="fact-v" title="${esc(v)}">${esc(v)}</div></div>`).join('')}</div>`;
  h += `<h3>What Auroville teaches</h3><div class="ls-grid">${(AV.lessons || []).map(l => {
    const d = DIM[l.criterion], p = d ? PIL[d.p] : null;
    return `<div class="ls-card" style="--pc:${p ? p.color : '#34d27a'}"><h4><span>${d ? d.ic : '🌅'}</span><span>${esc(l.factor)}</span></h4><p>${esc(l.lesson)}</p>${d ? `<button class="ls-map" data-m="${d.key}">Map ${esc(d.name)} →</button>` : ''}</div>`;
  }).join('')}</div>`;
  h += `<h3>Timeline</h3><div class="tl">${(AV.timeline || []).map(t => `<div class="tl-item"><span class="tl-yr">${esc(t.year)}</span><span class="tl-t">${esc(t.title)}</span><div class="tl-x">${esc(t.text)}${t.src ? ` <a href="${esc(t.src)}" target="_blank" rel="noopener">source ↗</a>` : ''}</div></div>`).join('')}</div>`;
  h += `<p class="ov-cav">A neutral summary from public sources; several episodes remain contested and are attributed as such. For the full satellite record see <a href="https://42-apps.github.io/historical-auroville/" target="_blank" rel="noopener">Historical Auroville</a>.</p>`;
  document.getElementById('lessonsBody').innerHTML = h;
}
function openLessons() { buildLessons(); lessonsOverlay.classList.remove('hidden'); lessonsOverlay.querySelector('.ov-box').scrollTop = 0; }
document.getElementById('lessonsBody').addEventListener('click', e => { const b = e.target.closest('[data-m]'); if (b) { lessonsOverlay.classList.add('hidden'); setMetric(b.dataset.m); } });
document.getElementById('lessonsClose').addEventListener('click', () => lessonsOverlay.classList.add('hidden'));
lessonsOverlay.addEventListener('click', e => { if (e.target === lessonsOverlay) lessonsOverlay.classList.add('hidden'); });
document.getElementById('btnLessons').addEventListener('click', openLessons);
document.getElementById('miLessons').addEventListener('click', () => { menu.classList.add('hidden'); openLessons(); });

/* ============================== Menu / misc ============================== */
const menu = document.getElementById('menu'), menuBtn = document.getElementById('menuBtn');
menuBtn.addEventListener('click', e => { e.stopPropagation(); menu.classList.toggle('hidden'); });
document.addEventListener('click', e => { if (!menu.classList.contains('hidden') && !menu.contains(e.target) && e.target !== menuBtn) menu.classList.add('hidden'); });
function syncMenu(id, on) { const el = document.getElementById(id); if (!el) return; const s = el.querySelector('.mi-state'); if (s) s.textContent = on ? 'On' : 'Off'; el.classList.toggle('on', on); }
function syncSpin() { syncMenu('miSpin', spinOn); }
document.getElementById('miSpin').addEventListener('click', () => { spinOn = !spinOn; if (globe && !state.hoverIso && state.mode === 'globe') globe.controls().autoRotate = spinOn; syncSpin(); });
syncSpin();
let toastT = null;
function toast(msg) { const t = document.getElementById('toast'); if (!msg) { t.classList.remove('show'); return; } t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2400); }

function resetView() {
  clearSel(); spinOn = true; syncSpin(); state.filter = 'all'; state.musts.clear(); buildMusts(); applyPreset('balanced', true); buildFilters();
  if (globe && state.mode === 'globe') { globe.controls().autoRotate = true; globe.pointOfView({ lat: 22, lng: 10, altitude: 2.5 }, 800); }
}
document.getElementById('miReset').addEventListener('click', () => { resetView(); menu.classList.add('hidden'); });
document.getElementById('brandHome').addEventListener('click', resetView);
document.getElementById('miFull').addEventListener('click', () => { if (!document.fullscreenElement) document.documentElement.requestFullscreen(); else document.exitFullscreen(); menu.classList.add('hidden'); });
document.getElementById('miPanel').addEventListener('click', () => { setPanel(!panelOn); menu.classList.add('hidden'); });
document.getElementById('miWeights').addEventListener('click', () => { setWeightbar(weightbar.classList.contains('hidden')); menu.classList.add('hidden'); });
document.getElementById('miSites').addEventListener('click', () => setSites(!state.sites));
document.getElementById('miVillages').addEventListener('click', () => setVillages(!state.villages));
document.getElementById('miTable').addEventListener('click', () => { openTable(); menu.classList.add('hidden'); });
document.getElementById('miRelief').addEventListener('click', () => { state.relief = !state.relief; syncMenu('miRelief', state.relief); refreshGlobe(); });
document.getElementById('miMap').addEventListener('click', () => { setMode(state.mode === 'flat' ? 'globe' : 'flat'); menu.classList.add('hidden'); });

/* about / welcome */
const aboutOverlay = document.getElementById('aboutOverlay'), welcome = document.getElementById('welcomeOverlay');
function buildAbout() {
  document.getElementById('abDimCount').textContent = DIMS.length;
  document.getElementById('abDims').innerHTML = `<h3>The five pillars &amp; ${DIMS.length} criteria</h3>` +
    `<p class="ab-method">Every criterion is scored 0–100 (100 = most favourable for an ecovillage). A pillar is the weighted average of its criteria; the overall score averages the five pillars, each counting by the mean weight of its criteria — so <i>Balanced</i> gives every pillar an equal say. Must-haves remove countries outright.</p>` +
    PILLARS.map(p => `<div class="ab-pillar" style="--pc:${p.color}">${p.ic} ${esc(p.name)} <span style="font-weight:600;color:var(--muted);font-size:12px">— ${esc(p.desc)}</span></div>` +
      dimsOf(p.key).map(d => `<div class="ab-dim"><span>${d.ic}</span><span><b>${esc(d.name)}</b></span><span>${esc(d.src)}</span></div>`).join('')).join('') +
    `<p class="ab-method" style="margin-top:12px"><b>Candidate sites</b> were scouted for climate, water, soil, land price, beauty, access and nearby communities; their ranking blends the scout's score (55%) with the country's overall score under your priorities (45%). <b>Existing ecovillages</b> come from the Global Ecovillage Network, ic.org and national networks.</p>`;
  const b = window.ECO_BUILT ? ` · data built ${window.ECO_BUILT}` : '';
  document.getElementById('abBuilt').innerHTML = `v0.1.1${b} · Built with globe.gl · boundaries © Natural Earth · part of the <a href="https://42-apps.github.io/" target="_blank" rel="noopener">42-apps</a> collection.`;
}
document.getElementById('miAbout').addEventListener('click', () => { menu.classList.add('hidden'); buildAbout(); aboutOverlay.classList.remove('hidden'); });
document.getElementById('aboutClose').addEventListener('click', () => aboutOverlay.classList.add('hidden'));
aboutOverlay.addEventListener('click', e => { if (e.target === aboutOverlay) aboutOverlay.classList.add('hidden'); });
const SEEN = 'ecovillageatlas_seen_v1';
document.getElementById('welCount').textContent = ECO.length + '';
document.getElementById('welSites').textContent = PLACES.length + '';
function hideWelcome() { welcome.classList.add('hidden'); try { localStorage.setItem(SEEN, '1'); } catch (e) {} }
document.getElementById('welStart').addEventListener('click', hideWelcome);
welcome.addEventListener('click', e => { if (e.target === welcome) hideWelcome(); });
document.getElementById('miHelp').addEventListener('click', () => { menu.classList.add('hidden'); welcome.classList.remove('hidden'); });

/* keyboard */
document.addEventListener('keydown', e => {
  if (e.target && e.target.tagName === 'INPUT') return;
  if (e.key === 'Escape') {
    menu.classList.add('hidden');
    for (const ov of [tableOverlay, lessonsOverlay, aboutOverlay]) if (!ov.classList.contains('hidden')) return ov.classList.add('hidden');
    if (!welcome.classList.contains('hidden')) return hideWelcome();
    if (!detailCard.classList.contains('hidden')) clearSel();
  } else if ((e.key === ' ' || e.code === 'Space') && !(e.target.closest && e.target.closest('button, a, select, textarea, [contenteditable]'))) { e.preventDefault(); spinOn = !spinOn; if (globe && !state.hoverIso && state.mode === 'globe') globe.controls().autoRotate = spinOn; syncSpin(); }
});

/* ============================== Boot ===================================== */
window.addEventListener('resize', () => { if (state.mode === 'globe') sizeGlobe(); else { sizeFlat(); drawFlat(); } });
buildMetricBar(); buildFilters(); buildPresets(); buildMusts(); buildWeights(); rebuildRanks(); buildRank();
document.getElementById('lgTitle').textContent = metricLabel();
document.getElementById('btnSites').classList.add('active'); document.getElementById('btnVillages').classList.add('active');
syncMenu('miSites', true); syncMenu('miVillages', true); syncMenu('miRelief', true);
const SMALL = window.matchMedia('(max-width:760px)').matches;
setWeightbar(!SMALL); weightbar.classList.add('collapsed');   // drawer starts folded: presets & sliders one click away
if (SMALL) setPanel(false);
fetch('data/countries.geojson').then(r => r.json()).then(geo => {
  GEO = geo;
  GEO.features.forEach(f => { const p = f.properties; const i2 = (p.ISO_A2_EH && p.ISO_A2_EH !== '-99') ? p.ISO_A2_EH : (p.ISO_A2 && p.ISO_A2 !== '-99' ? p.ISO_A2 : null); if (i2) ISO2[p.ADM0_A3] = i2; });
  buildRank();
  initGlobe();
  try {
    const q = new URLSearchParams(location.search);
    if (q.get('preset')) applyPreset(q.get('preset'), true);
    if (q.get('must')) { q.get('must').split(',').forEach(id => { if (MUSTS.some(m => m.id === id)) state.musts.add(id); }); buildMusts(); refreshAll(); }
    if (q.get('m')) setMetric(q.get('m'));
    if (q.get('tab') === 'sites') { state.tab = 'sites'; buildRank(); }
    const c = q.get('c'); if (c && byIso[c]) { selectCountry(c, true); hideWelcome(); }
    const s = q.get('site'); if (s && placeById[s]) { selectPin(s, true); hideWelcome(); }
    if (q.get('lessons') != null) { hideWelcome(); openLessons(); }
  } catch (e) {}
}).catch(err => { console.error('Failed to load map data', err); elViz.innerHTML = '<div style="color:var(--muted);text-align:center;padding-top:34vh">Could not load map data.</div>'; });
try { if (!localStorage.getItem(SEEN) && !location.search) welcome.classList.remove('hidden'); } catch (e) { welcome.classList.remove('hidden'); }
