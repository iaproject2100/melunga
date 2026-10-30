"""Reproduce every Arabic phonetic value and audit the finite editorial delta."""
import argparse
import collections
import hashlib
import json
from pathlib import Path
from ar_phon import GA

ROOT = Path(__file__).resolve().parents[2]
PHONETICS = ('py', 'pf', 'ps', 'pi', 'phon')
FIELDS = {'t', *PHONETICS, 'cn', 'en', 'frm', 'esm', 'itm', 'jam', 'kom', 'cat', 'lv'}
RECEIVED_SHA = 'd70df1ac7c05797c8040768cdf0fe4dd78a784d0d517810e22332623f39e8138'
GENERATOR_SHA = '36d898bf883c06ab1f9b1e2adb07f5d6c4fe945561b9745affa9450712082b90'
PREPARED_SHA = 'fd566528f263b2a4a43d87292ba8f7150bf2652b7f23dcdfedbd9ce7195909d1'

def fingerprint(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def check():
    folder = ROOT / 'tools/maquette-guidee/imports'
    received_path = folder / 'ar-deck-v3.2-received.json'
    prepared_path = folder / 'ar-deck-v3.2.json'
    mapping_path = folder / 'ar-tr-map-v3.2.json'
    received, prepared, tr_map = [json.loads(p.read_text(encoding='utf-8')) for p in
        (received_path, prepared_path, mapping_path)]
    assert fingerprint(received_path) == RECEIVED_SHA
    assert fingerprint(prepared_path) == PREPARED_SHA
    assert fingerprint(Path(__file__).with_name('ar_phon.py')) == GENERATOR_SHA
    patches = json.loads((folder/'ar-editorial-cleanup-v3.2.json').read_text(encoding='utf-8'))
    assert len(patches) == 8
    allowed = {(p['num']-1, p['field']):p for p in patches}
    assert len(allowed) == 8
    actual = []
    for index, (a,b) in enumerate(zip(received, prepared)):
        for field in FIELDS:
            if a[field] == b[field]: continue
            patch = allowed[(index, field)]
            assert field in ('cn','en','frm','esm','itm','jam','kom')
            assert (a['t'], a[field], b[field]) == (patch['t'], patch['before'], patch['after'])
            actual.append({'num':index+1, 'field':field, 'reviewId':patch['id']})
    assert len(actual) == 8
    results = {}
    for label,cards in [('received',received),('prepared',prepared)]:
        assert len(cards) == 4487 and len({c['t'] for c in cards}) == 4487
        assert all(set(c) == FIELDS and type(c['lv']) is int and 1 <= c['lv'] <= 10
            and all(isinstance(v,str) and v.strip() for k,v in c.items() if k != 'lv') for c in cards)
        differences = []
        for number,card in enumerate(cards,1):
            assert isinstance(tr_map.get(card['t']),str) and tr_map[card['t']].strip()
            generated = GA(card['t'],tr_map[card['t']],**{k:card[k] for k in
                ('cn','en','frm','esm','itm','jam','kom','cat','lv')})
            for field in PHONETICS:
                if generated[field] != card[field]:
                    differences.append({'num':number,'lv':card['lv'],'t':card['t'],'field':field,
                        'deck':card[field],'generated':generated[field]})
        results[label] = {'cards':len(cards),'phoneticFieldsCompared':len(cards)*5,'differences':differences}
    return {'status':'passed' if not any(r['differences'] for r in results.values()) else 'failed',
        'runs':results,'receivedSha256':fingerprint(received_path),'preparedSha256':fingerprint(prepared_path),
        'trMapSha256':fingerprint(mapping_path),'generatorSha256':{name:fingerprint(Path(__file__).with_name(name))
            for name in ('ar_phon.py','de_phon.py')},'transliterationEntries':len(tr_map),
        'unusedTransliterationKeys':sorted(set(tr_map)-{c['t'] for c in received}),
        'editorialChanges':actual,'levels':dict(sorted(collections.Counter(c['lv'] for c in received).items())),
        'categories':dict(collections.Counter(c['cat'] for c in received)),
        'nativePronunciationCertified':False,'sourceOrderLevelCategoryTextPhoneticsPreserved':True}

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--report',type=Path)
    args=parser.parse_args();report=check()
    if args.report:
        args.report.parent.mkdir(parents=True,exist_ok=True)
        args.report.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({'status':report['status'],'runs':{k:{f:v[f] for f in ('cards','phoneticFieldsCompared')} for k,v in report['runs'].items()},'editorialChanges':len(report['editorialChanges'])}))
    raise SystemExit(0 if report['status']=='passed' else 1)
