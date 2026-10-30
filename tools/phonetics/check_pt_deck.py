"""Reproduce the supplied Portuguese phonetics without changing a card."""
import argparse
import collections
import hashlib
import json
from pathlib import Path
from pt_phon import GR

ROOT = Path(__file__).resolve().parents[2]
PHONETICS = ('py', 'pf', 'ps', 'pi', 'phon')
FIELDS = {'t', *PHONETICS, 'cn', 'en', 'frm', 'esm', 'itm', 'jam', 'kom', 'cat', 'lv'}

def check():
    source = ROOT / 'tools/maquette-guidee/imports/pt-deck-v1.json'
    mapping = source.with_name('pt-tr-map-v1.json')
    cards = json.loads(source.read_text(encoding='utf-8'))
    tr_map = json.loads(mapping.read_text(encoding='utf-8'))
    assert len(cards) == 4487 and len({c['t'] for c in cards}) == 4487
    assert all(set(c) == FIELDS and type(c['lv']) is int and 1 <= c['lv'] <= 10
               and all(isinstance(v, str) and v.strip() for k,v in c.items() if k != 'lv') for c in cards)
    differences = []
    for number, card in enumerate(cards, 1):
        if not isinstance(tr_map.get(card['t']), str) or not tr_map[card['t']].strip():
            differences.append({'num':number, 't':card['t'], 'field':'transliteration', 'problem':'missing'})
            continue
        generated = GR(card['t'], tr_map[card['t']], **{k:card[k] for k in
            ('cn','en','frm','esm','itm','jam','kom','cat','lv')})
        for field in PHONETICS:
            if generated[field] != card[field]:
                differences.append({'num':number, 'lv':card['lv'], 't':card['t'], 'field':field,
                    'deck':card[field], 'generated':generated[field]})
    fingerprint = lambda path: hashlib.sha256(path.read_bytes()).hexdigest()
    return {'status':'passed' if not differences else 'failed', 'cards':len(cards),
        'phoneticFieldsCompared':len(cards)*5, 'differences':differences,
        'transliterationEntries':len(tr_map),
        'unusedTransliterationKeys':sorted(set(tr_map)-{c['t'] for c in cards}),
        'sourceSha256':fingerprint(source), 'trMapSha256':fingerprint(mapping),
        'generatorSha256':{p.name:fingerprint(p) for p in [Path(__file__).with_name(n)
            for n in ('pt_phon.py','ru_phon.py','de_phon.py')]},
        'levels':dict(sorted(collections.Counter(c['lv'] for c in cards).items())),
        'categories':dict(collections.Counter(c['cat'] for c in cards)),
        'sourceModified':False, 'nativePronunciationCertified':False}

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--report', type=Path)
    args = parser.parse_args()
    report = check()
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    print(json.dumps({k:report[k] for k in ('status','cards','phoneticFieldsCompared')}, ensure_ascii=False))
    raise SystemExit(0 if report['status'] == 'passed' else 1)
