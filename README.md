# Ecovillage Atlas 🌱

**Where on Earth to found the next Auroville — every country, and 159 specific regions, ranked
for starting a new international ecovillage or universal township.**

An interactive 3D globe that scores all 196 countries on **24 criteria in five pillars** — from
whether foreigners can own rural land and whether a nonprofit may receive money from abroad, to
visas for volunteers, political stability, water security, soil, climate resilience and natural
beauty. Set your own priorities, switch on hard **must-haves**, and the world re-ranks around them.
Gold pins mark **candidate sites** scouted for climate, water, soil, land price and access; white
pins mark **existing ecovillages** for precedent. A **Lessons from Auroville** panel explains why
each criterion is there.

Part of the [42-apps](https://42-apps.github.io/) collection, built with [globe.gl](https://globe.gl).

**Live:** https://42-apps.github.io/ecovillage/  ·  **v0.1.1**

## The five pillars

| Pillar | Criteria |
|--------|----------|
| 🏗️ **Setup & legal** | Land for foreigners · Legal vehicles · Foreign funding · Rule of law · Affordable land |
| 🛂 **Visas & residency** | Easy arrival · Long-stay visas · Path to permanence |
| 🛡️ **Safety & stability** | Personal safety · Political stability · Civic & spiritual freedom · Low natural hazards |
| 🏞️ **Land, beauty & climate** | Natural beauty · Climate comfort · Water security · Soil & growing · Climate resilience |
| 🌱 **Community & daily life** | Ecovillage scene · Self-build & off-grid · Cost of living · Healthcare · Access & internet · Welcome & English · Spiritual culture |

Each criterion is 0–100 (100 = most favourable). A pillar is the weighted mean of its criteria;
the overall score averages the five pillars, each counting by the mean weight of its criteria, so
the *Balanced* preset gives every pillar an equal say.

**Presets:** Balanced · Universal township (Auroville-style) · Volunteer hub · Permaculture farm ·
Climate haven 2050+ · Spiritual retreat · Shoestring pioneers · Families & children · Autonomy & freedom.

**Must-haves:** foreigners can own land · safe & peaceful · volunteer/NGO visa · digital-nomad visa ·
open civic space · own schooling allowed · not water-stressed · foreign donations free.

## Data & method

| Criterion | Source |
|-----------|--------|
| Land for foreigners, legal vehicles, foreign funding | Research review of national land, nonprofit and NGO-funding law (2025–26) |
| Rule of law · Political stability | World Bank Worldwide Governance Indicators (+ property-rights index) |
| Affordable land | Typical rural land price per hectare (Eurostat, USDA, national statistics, listings), log-scaled |
| Easy arrival | Visa rules for 197 passports (Wikipedia, Sep 2026) via the 42-apps [Passports](https://42-apps.github.io/passports/) atlas — entry type × length of stay, half one-vote-per-passport, half population-weighted |
| Long-stay visas · Path to permanence | Government immigration sources (2025–26) |
| Civic & spiritual freedom | CIVICUS Monitor + WGI Voice & Accountability + Freedom House religious freedom |
| Low natural hazards | INFORM Risk Index + WorldRiskIndex |
| Water security | WRI Aqueduct water stress + rainfall + renewable freshwater per person (World Bank) |
| Soil & growing | Growing-conditions assessment + arable-land share (World Bank) |
| Climate resilience | ND-GAIN Country Index + projected 2050 heat stress |
| Ecovillage scene | Global Ecovillage Network, ic.org, national networks |
| Self-build & off-grid | Building/zoning flexibility, solar PV potential (Global Solar Atlas), homeschooling law |
| Safety, natural beauty, climate comfort, cost, healthcare, access, welcome, spiritual culture | the 42-apps [Best Countries to Live Map](https://42-apps.github.io/best-countries-map/) dataset |

Existing-ecovillage pins merge a fresh research sweep with the 42-apps
[CEDAR Explorer](https://42-apps.github.io/cedar/) community records.

This is an **opinionated research atlas and a conversation starter, not legal advice.** National
scores hide large regional differences, and land, NGO and visa law changes fast — check every point
with a local lawyer. Criteria that rest mainly on expert estimates are marked "est." in profiles.
Corrections are warmly welcome.

## Run it

Static site — no build step needed to view.

```bash
python3 -m http.server 8790
# open http://localhost:8790
```

## Rebuild the data

```bash
python3 tools/shortstay.py   # visa matrix → data/raw/shortstay.json
python3 tools/build.py       # data/raw/*.json → data/eco.js
```

## Files

| File | Purpose |
|------|---------|
| `index.html` · `app.css` · `app.js` | Markup, styling, globe + scoring engine |
| `data/eco.js` | Built dataset: countries × 24 criteria, notes, sites, ecovillages, Auroville lessons |
| `data/countries.geojson` | Natural Earth country boundaries |
| `data/raw/*.json` | Research inputs (provenance) |
| `tools/shortstay.py` · `tools/build.py` | Data pipeline |
| `lib/globe.gl.min.js` | 3D globe engine |
