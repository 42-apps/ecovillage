"""Short-stay entry score for every destination, from the passports app's visa matrix.

For each destination we ask: how easily can the world's people simply arrive and stay a
few months? Every passport's entry rule is scored (visa-free > eTA > visa on arrival >
eVisa > embassy visa > refused) and scaled by how long it lets you stay, then averaged
two ways — one vote per passport (Auroville's "all nations" ideal) and weighted by
population — and blended 50/50.

    python3 tools/shortstay.py   # reads data/raw/visa-*.js + data/countries.geojson
                                 # writes data/raw/shortstay.json
"""
import json, os, re, statistics

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, 'data', 'raw')

def load_js(path, start='{'):
    s = open(path, encoding='utf-8').read()
    return s

mtx_src = load_js(os.path.join(RAW, 'visa-matrix.js'))
MATRIX = json.loads(mtx_src[mtx_src.index('{'):mtx_src.rindex('}') + 1])
dst_src = load_js(os.path.join(RAW, 'visa-dests.js'))
DESTS = json.loads(dst_src[dst_src.index('['):dst_src.index(']') + 1])

geo = json.load(open(os.path.join(ROOT, 'data', 'countries.geojson'), encoding='utf-8'))
I2_TO_I3, POP = {}, {}
for f in geo['features']:
    p = f['properties']
    i2 = p.get('ISO_A2_EH') if p.get('ISO_A2_EH') not in (None, '-99') else p.get('ISO_A2')
    i3 = p.get('ADM0_A3')
    if i2 and i2 != '-99':
        I2_TO_I3.setdefault(i2, i3)
        POP[i2] = POP.get(i2, 0) + (p.get('POP_EST') or 0)
I2_TO_I3.update({'XK': 'XKX', 'TW': 'TWN', 'HK': 'HKG', 'PS': 'PSE', 'SS': 'SSD'})

EASE = {'f': 1.0, 't': 0.9, 'o': 0.85, 'e': 0.62, 'v': 0.12, 'u': 0.3, 'b': 0.0, 's': 0.0}

def stay_factor(days):
    if days is None: return 0.8          # length unstated
    if days == 'U' or days >= 180: return 1.0
    if days >= 90: return 0.88
    if days >= 60: return 0.75
    if days >= 30: return 0.6
    if days >= 14: return 0.42
    return 0.3

def parse(cell):
    if not cell or cell == 'h': return None
    code = cell[0]
    m = re.match(r'[a-z](\d+|U)?', cell)
    d = m.group(1) if m else None
    days = 'U' if d == 'U' else (int(d) if d else None)
    return code, days

rows = {}
passports = [p for p in MATRIX if len(p) == 2 and not p.startswith('X')]
for di, dest in enumerate(DESTS):
    i3 = I2_TO_I3.get(dest)
    if not i3: continue
    eq_num = eq_den = pw_num = pw_den = 0.0
    free = 0; days_free = []
    for p in passports:
        cells = MATRIX[p].split(',')
        if di >= len(cells): continue
        c = parse(cells[di])
        if c is None: continue
        code, days = c
        if code not in EASE: continue
        v = EASE[code] * (stay_factor(days) if code in 'ftoe' else 1.0)
        pop = POP.get(p, 0)
        eq_num += v; eq_den += 1
        pw_num += v * pop; pw_den += pop
        if code in 'fto':
            free += 1
            if isinstance(days, int): days_free.append(days)
            elif days == 'U': days_free.append(365)
    if eq_den < 40: continue
    eq = eq_num / eq_den * 100
    pw = (pw_num / pw_den * 100) if pw_den else eq
    rows[i3] = {
        'score': round(0.5 * eq + 0.5 * pw, 1),
        'eq': round(eq, 1), 'pop': round(pw, 1),
        'freeCount': free, 'passports': int(eq_den),
        'typDays': int(statistics.median(days_free)) if days_free else None,
    }

json.dump(rows, open(os.path.join(RAW, 'shortstay.json'), 'w'), indent=0, sort_keys=True)
top = sorted(rows.items(), key=lambda kv: -kv[1]['score'])
print(len(rows), 'destinations scored')
print('top', [(k, v['score'], v['freeCount'], v['typDays']) for k, v in top[:15]])
print('bottom', [(k, v['score']) for k, v in top[-10:]])
for k in ['IND', 'PRT', 'CRI', 'USA', 'THA', 'IDN', 'BRA', 'NZL', 'GEO', 'MEX']:
    print(k, rows.get(k))
