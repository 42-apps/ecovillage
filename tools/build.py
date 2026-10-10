"""Build data/eco.js — the Ecovillage Atlas dataset — from the research files in data/raw/.

    python3 tools/shortstay.py   # visa matrix → data/raw/shortstay.json
    python3 tools/build.py       # everything  → data/eco.js

Inputs (data/raw/):
  livability.json   country rows from the 42-apps Best Countries map (safety, climate, landscape, …)
  shortstay.json    short-stay entry score per destination (tools/shortstay.py)
  legal.json        land for foreigners, legal vehicles, foreign-funding freedom (+ notes)
  visa.json         long-stay routes, path to permanence (+ flags & notes)
  wgi.json          WGI percentiles, CIVICUS rating, property rights, religious freedom
  risk.json         ND-GAIN, INFORM, WorldRiskIndex, hazards, 2050 heat
  resources.json    rain, water stress, renewable water, arable, forest, solar, land price, growing
  community.json    ecovillage scene, homeschooling, off-grid friendliness (+ examples)
  places.json       candidate sites          → window.ECO_PLACES
  ecovillages.json  existing ecovillages      → window.ECO_VILLAGES (merged with cedar.json, the
                    42-apps CEDAR Explorer's community records, deduplicated)
  auroville.json    lessons & timeline        → window.ECO_AV
Every criterion ends up 0–100, higher = more favourable for founding an ecovillage.
"""
import json, math, os, re, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, 'data', 'raw')

def load(name, default=None):
    p = os.path.join(RAW, name)
    if not os.path.exists(p):
        print(f'  (missing {name})')
        return {} if default is None else default
    with open(p, encoding='utf-8') as f:
        return json.load(f)

def num(v):
    if v is None or isinstance(v, bool): return None
    try:
        v = float(v)
        return None if math.isnan(v) else v
    except (TypeError, ValueError):
        return None

clamp = lambda v, lo=0.0, hi=100.0: max(lo, min(hi, v))
def lin(v, lo, hi):
    """map v from [lo,hi] onto 0..100 (clamped); None passes through"""
    v = num(v)
    return None if v is None else clamp((v - lo) / (hi - lo) * 100)
def logscale(v, lo, hi):
    v = num(v)
    if v is None or v <= 0: return None
    return clamp((math.log10(v) - math.log10(lo)) / (math.log10(hi) - math.log10(lo)) * 100)
def blend(*pairs):
    """weighted mean over the (value, weight) pairs that have a value"""
    num_ = den = 0.0
    for v, w in pairs:
        if v is not None: num_ += v * w; den += w
    return num_ / den if den else None
def pct_rank(values):
    """iso -> percentile (0..100) of a dict of iso -> number"""
    items = sorted((v, k) for k, v in values.items() if v is not None)
    n = len(items)
    return {k: (i / (n - 1) * 100 if n > 1 else 50) for i, (v, k) in enumerate(items)}

BC = load('livability.json', [])
SS = load('shortstay.json')
LEG = load('legal.json')
VIS = load('visa.json')
GOV = load('wgi.json')
RSK = load('risk.json')
RES = load('resources.json')
COM = load('community.json')
PLACES = load('places.json', [])
VILL = load('ecovillages.json', [])
CEDAR = load('cedar.json', [])
AV = load('auroville.json', None)

REGION_FIX = {'Middle East, North Africa, Afghanistan & Pakistan': 'Middle East & North Africa'}
REGION_ISO = {'MLT': 'Europe & Central Asia'}           # World Bank files Malta under MENA
NAME_FIX = {'Somalia, Fed. Rep.': 'Somalia', "Cote d'Ivoire": "Côte d'Ivoire", 'Turkiye': 'Türkiye',
            'Bahamas, The': 'Bahamas', 'Gambia, The': 'Gambia', 'Yemen, Rep.': 'Yemen', 'Micronesia, Fed. Sts.': 'Micronesia',
            'St. Kitts and Nevis': 'Saint Kitts and Nevis', 'St. Lucia': 'Saint Lucia', 'St. Vincent and the Grenadines': 'Saint Vincent and the Grenadines'}
CIVICUS = {'open': 100, 'narrowed': 75, 'obstructed': 45, 'repressed': 18, 'closed': 3}
HOMESCHOOL = {'legal': 100, 'regulated': 75, 'unclear': 50, 'restricted': 30, 'banned': 0}

wri_pct = pct_rank({iso: num((RSK.get(iso) or {}).get('wri')) for iso in RSK if not iso.startswith('_')})
ss_vals = [v['score'] for v in SS.values()]
ss_lo, ss_hi = (min(ss_vals), max(ss_vals)) if ss_vals else (0, 100)

out, missing = [], {}
def note_missing(dim, iso): missing.setdefault(dim, []).append(iso)

for row in BC:
    iso = row['iso']; b = row['s']
    L, V, G, R, S, C = (d.get(iso) or {} for d in (LEG, VIS, GOV, RSK, RES, COM))
    s, est = {}, []

    # ---- Setup & legal
    s['land'] = num(L.get('land')); s['entity'] = num(L.get('entity')); s['funding'] = num(L.get('funding'))
    if L.get('est'): est += ['land', 'entity', 'funding']
    s['rule'] = blend((num(G.get('rule')), 0.7), (num(G.get('prop')), 0.3)) if G else None
    if s['rule'] is None: s['rule'] = b.get('governance'); est.append('rule')
    s['landcost'] = None
    lp = num(S.get('landPrice'))
    if lp: s['landcost'] = 100 - logscale(lp, 500, 60000)
    sest = set((RES.get('_estFields') or {}).get(iso, []))     # per-field estimate flags from the resources sweep
    if 'landPrice' in sest: est.append('landcost')
    if 'waterStress' in sest: est.append('water')
    est.append('growing')                                       # growing conditions are a judgement score everywhere

    # ---- Visas & residency
    ssr = SS.get(iso)
    s['shortstay'] = lin(ssr['score'], ss_lo, ss_hi * 0.94) if ssr else None
    s['longstay'] = num(V.get('longstay')); s['pr'] = num(V.get('pr'))
    if V.get('est'): est += ['longstay', 'pr']

    # ---- Safety & stability
    s['safety'] = b.get('safety')
    s['stability'] = num(G.get('stab'))
    if s['stability'] is None: s['stability'] = b.get('safety'); est.append('stability')
    civ = CIVICUS.get((G.get('civicus') or '').lower())
    s['civic'] = blend((civ, 0.5), (num(G.get('voice')), 0.25), (num(G.get('relig')), 0.25))
    if s['civic'] is None: s['civic'] = b.get('freedom'); est.append('civic')
    inform = num(R.get('inform'))
    s['hazard'] = blend((lin(inform, 7.5, 1.0) if inform is not None else None, 0.6),
                        (100 - wri_pct[iso] if iso in wri_pct else None, 0.4))
    if R.get('est') and inform is None: est.append('hazard')

    # ---- Land, beauty & climate
    s['beauty'] = b.get('landscape'); s['climate'] = b.get('climate')
    ws = num(S.get('waterStress'))
    s['water'] = blend(((5 - ws) / 5 * 100 if ws is not None else None, 0.5),
                       (logscale(S.get('rain'), 150, 2500), 0.25),
                       (logscale(S.get('renewWater'), 300, 30000), 0.25))
    s['growing'] = blend((num(S.get('growing')), 0.8), (clamp(num(S.get('arable')) * 3) if num(S.get('arable')) is not None else None, 0.2))
    s['future'] = blend((lin(R.get('ndgain'), 25, 72), 0.55), (num(R.get('heat')), 0.45))

    # ---- Community & daily life
    s['community'] = num(C.get('eco'))
    hs = (C.get('homeschool') or '').lower()
    s['offgrid'] = blend((num(C.get('offgrid')), 0.6), (lin(S.get('pvout'), 2.6, 5.2), 0.25), (HOMESCHOOL.get(hs), 0.15))
    if C.get('est'): est += ['community', 'offgrid']
    s['cost'] = b.get('affordability'); s['health'] = b.get('healthcare'); s['access'] = b.get('infrastructure')
    s['openness'] = b.get('openness'); s['spirit'] = b.get('spirituality')

    for k, v in list(s.items()):
        if v is None:
            note_missing(k, iso)
        else:
            s[k] = round(v, 1)

    x = {
        'landNote': L.get('landNote'), 'entityNote': L.get('entityNote'), 'fundingNote': L.get('fundingNote'),
        'visaNote': V.get('note'), 'routes': V.get('routes') or [], 'prYears': num(V.get('prYears')),
        'freeMove': V.get('freeMove') or [],
        'ss': {'freeCount': ssr['freeCount'], 'passports': ssr['passports'], 'typDays': ssr['typDays']} if ssr else None,
        'hazards': R.get('hazards') or [], 'riskNote': R.get('note'),
        'ndgain': num(R.get('ndgain')), 'inform': inform,
        'rain': num(S.get('rain')), 'waterStress': ws, 'pvout': num(S.get('pvout')), 'forest': num(S.get('forest')),
        'density': num(S.get('density')), 'landPrice': lp, 'landPriceNote': S.get('landPriceNote'),
        'ecoCount': num(C.get('ecoCount')), 'examples': C.get('examples') or [], 'ecoNote': C.get('note'),
    }
    if x['ecoCount'] is not None: x['ecoCount'] = int(x['ecoCount'])
    x = {k: v for k, v in x.items() if v not in (None, [], '')}
    f = {'volunteer': bool(V.get('volunteer')), 'nomad': bool(V.get('nomad')), 'retire': bool(V.get('retire')),
         'homeschool': hs or None, 'civicus': (G.get('civicus') or '').lower() or None}
    out.append({'iso': iso, 'name': NAME_FIX.get(row['name'], row['name']), 'region': REGION_ISO.get(iso) or REGION_FIX.get(row['region'].strip(), row['region'].strip()),
                'lat': row.get('lat'), 'lon': row.get('lon'), 's': s, 'est': sorted(set(est)), 'f': f, 'x': x})

# impute any remaining gaps from the country's other criteria in the same pillar (marked as estimates)
PILLAR = {'setup': ['land', 'entity', 'funding', 'rule', 'landcost'], 'visas': ['shortstay', 'longstay', 'pr'],
          'secure': ['safety', 'stability', 'civic', 'hazard'], 'nature': ['beauty', 'climate', 'water', 'growing', 'future'],
          'living': ['community', 'offgrid', 'cost', 'health', 'access', 'openness', 'spirit']}
for c in out:
    for pk, ks in PILLAR.items():
        have = [c['s'][k] for k in ks if c['s'].get(k) is not None]
        for k in ks:
            if c['s'].get(k) is None:
                c['s'][k] = round(sum(have) / len(have), 1) if have else 40.0
                c['est'] = sorted(set(c['est'] + [k]))

iso_set = {c['iso'] for c in out}
places = [p for p in PLACES if p.get('iso') in iso_set and num(p.get('lat')) is not None]
vills = [v for v in VILL if num(v.get('lat')) is not None and v.get('iso') in iso_set]

# fold in CEDAR Explorer communities not already listed (same country and same name or within ~3 km)
name_iso = {row['name']: row['iso'] for row in BC}
norm = lambda n: re.sub(r'[^a-z0-9]', '', re.sub(r'^(kibbutz|ecovillage|eco-village)\s+', '', (n or '').lower()))
def near(a, b, d=0.03): return abs(a['lat'] - b['lat']) < d and abs(a['lon'] - b['lon']) < d
STOP = {'the', 'of', 'and', 'community', 'communities', 'ecovillage', 'eco', 'village', 'center', 'centre', 'federation', 'farm', 'kibbutz', 'project'}
def toks(n): return {t for t in re.findall(r'[a-z0-9]+', (n or '').lower()) if t not in STOP}
def same_place(a, b):
    """one name's distinctive words contained in the other's, within ~30 km — e.g. 'Damanhur' / 'Federation of Damanhur'"""
    ta, tb = toks(a['name']), toks(b['name'])
    return bool(ta and tb) and (ta <= tb or tb <= ta) and near(a, b, 0.3)
def short(t, n=220):
    t = (t or '').strip()
    if len(t) <= n: return t or None
    first = re.split(r'(?<=[.!?])\s', t)[0]
    return first if len(first) <= n else t[:t.rfind(' ', 0, n - 1)] + '…'
for cd in CEDAR:
    iso = name_iso.get(cd.get('country'))
    if not iso or num(cd.get('lat')) is None: continue
    if cd.get('type') == 'kibbutz' and not re.search(r'eco|green|environment|organic|desert|solar|permacult', cd.get('desc') or '', re.I):
        continue                                   # keep the ecologically-minded kibbutzim, not all of them
    rec = {'name': cd['name'], 'iso': iso, 'lat': cd['lat'], 'lon': cd['lon'], 'founded': cd.get('founded'), 'pop': cd.get('pop'),
           'type': cd.get('type'), 'url': cd.get('url'), 'note': short(cd.get('desc')), 'src': 'cedar'}
    dup = next((v for v in vills if v['iso'] == iso and (norm(v['name']) == norm(rec['name']) or near(v, rec) or same_place(v, rec))), None)
    if dup:
        for k in ('founded', 'pop', 'url', 'note'):
            if not dup.get(k) and rec.get(k): dup[k] = rec[k]
        dup['src'] = 'both'
    else:
        vills.append(rec)
for v in vills:
    if isinstance(v.get('pop'), float): v['pop'] = int(v['pop'])

built = datetime.date.today().isoformat()
with open(os.path.join(ROOT, 'data', 'eco.js'), 'w', encoding='utf-8') as fh:
    fh.write('/* Ecovillage Atlas — built by tools/build.py from data/raw/*.json. s = 24 criteria, each 0-100\n'
             '   (higher = more favourable for founding an ecovillage). est = criteria resting mainly on expert\n'
             '   estimates. f = flags for must-have filters. x = facts & research notes. */\n')
    fh.write(f'window.ECO_BUILT = "{built}";\n')
    fh.write('window.ECO = [\n' + ',\n'.join(json.dumps(c, ensure_ascii=False, separators=(',', ':')) for c in out) + '\n];\n')
    fh.write('window.ECO_PLACES = ' + json.dumps(places, ensure_ascii=False, separators=(',', ':')) + ';\n')
    fh.write('window.ECO_VILLAGES = ' + json.dumps(vills, ensure_ascii=False, separators=(',', ':')) + ';\n')
    fh.write('window.ECO_AV = ' + json.dumps(AV, ensure_ascii=False, separators=(',', ':')) + ';\n')

print(f'{len(out)} countries · {len(places)} sites · {len(vills)} ecovillages → data/eco.js')
for k, v in sorted(missing.items()):
    print(f'  imputed {k}: {len(v)} {v[:12]}{"…" if len(v) > 12 else ""}')
