"""Append user-provided targets without rewriting the established source banks."""
import hashlib
import json

IMPORTS = {
    'hi': ('5c0be1bed4d66bfecd56d4cb5f320756bb770e4e871931cbaefb7d9b547479c3', 4487),
    'ru': ('751f8774365882775f8b2b640980c872e9a91bb9f2bf985cd568427be0253ca8', 4488),
    'pt': ('3fb7a5ffea38e4444d4cf5b3fe44a0e6cb9758a3d95f5f60cafa9d0877fe914b', 4487),
    'ar': ('fd566528f263b2a4a43d87292ba8f7150bf2652b7f23dcdfedbd9ce7195909d1', 4487),
}
FIELDS = {'t','py','pf','ps','pi','phon','cn','en','frm','esm','itm','jam','kom','lv','cat'}

def sha(data):
    return hashlib.sha256(data).hexdigest()

def encode(data):
    return (json.dumps(data, ensure_ascii=False, separators=(',', ':'))+'\n').encode()

def augment(root, outputs, manifest):
    native_codes = manifest['nativeLanguageIds']
    original_native_codes = [code for code in native_codes if code != 'de']
    for code, (fingerprint, count) in IMPORTS.items():
        source_path = f'tools/maquette-guidee/imports/{code}-deck-'+('v3.2' if code=='ar' else 'v1')+'.json'
        raw = (root/source_path).read_bytes()
        assert sha(raw) == fingerprint
        cards = json.loads(raw)
        assert len(cards) == count and len({c['t'] for c in cards}) == count
        assert all(set(c) == FIELDS and type(c['lv']) is int and 1 <= c['lv'] <= 10
                   and all(isinstance(v,str) and v.strip() for k,v in c.items() if k != 'lv') for c in cards)
        placement_path = f'tools/maquette-guidee/imports/{code}-themes-v1.json'
        placement_raw = (root/placement_path).read_bytes()
        placement = json.loads(placement_raw)
        assert placement['sourceSha256'] == fingerprint and len(placement['placements']) == count
        rows = placement['placements']
        locations = []
        levels = []
        for i,(card,row) in enumerate(zip(cards,rows)):
            assert row['index'] == i and row['isTemplate'] == (card['cat']=='template')
            definition = None if row['isTemplate'] else placement['levelThemes'][str(card['lv'])][row['domain']]
            locations.append([card['lv'],definition['id'] if definition else None,row['contentType'],row['lexicalClass'],row['isTemplate'],None])
        for lv in range(1,11):
            themes = []
            for domain,definition in placement['levelThemes'][str(lv)].items():
                ids = [f'catalogue:{code}:{i}' for i,c in enumerate(cards) if c['lv']==lv and rows[i]['domain']==domain]
                if ids:
                    assert (root/'melunga_deploy'/definition['photo']['asset']).is_file()
                    themes.append({**definition,'phraseIds':ids})
            assert len(themes) > 1
            reserve = [f'catalogue:{code}:{i}' for i,c in enumerate(cards) if c['lv']==lv and c['cat']=='template']
            levels.append({'level':lv,'sourceTitle':f'L{lv}','themes':themes,'reserveIds':reserve})
        reserved = sum(c['cat']=='template' for c in cards)
        deck_sha = sha(json.dumps(cards,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode())
        bank = {'version':1,'id':f'native-catalogue-{code}','studyLanguage':code,'reviewedPairId':None,
                'sourceType':'provided-import','importedSourcePath':source_path,'importedSourceSha256':fingerprint,
                'sourceDeckSha256':deck_sha,'placementPolicy':placement['policy'],
                'placementSourcePath':placement_path,'placementSourceSha256':sha(placement_raw),
                'cards':cards,'locationFields':['editorialLevel','themeId','contentType','lexicalClass','isTemplate','lexicalConceptId'],
                'locations':locations,'levels':levels}
        path = f'melunga_deploy/content/native-catalogue/{code}.json'
        outputs[path] = encode(bank)
        manifest['banks'][code] = {'path':path.removeprefix('melunga_deploy/'),'sha256':sha(outputs[path]),'bytes':len(outputs[path]),
            'sourceCardCount':count,'activeCatalogueCount':count-reserved,'reservedCatalogueCount':reserved,
            'excludedModernExtraCount':0,'reviewedPairId':None,'sourceType':'provided-import',
            'importedSourcePath':source_path,'importedSourceSha256':fingerprint,
            'placementSourcePath':placement_path,'placementSourceSha256':sha(placement_raw)}
        manifest['source']['importedSources'][code] = {'path':source_path,'sha256':fingerprint,'sourceCardCount':count,'sourceDeckSha256':deck_sha}
        eligible = list(range(count))
        free = [i for i,c in enumerate(cards) if c['lv']==1]
        eg = 'import-'+code;fg = 'import-'+code+'-L1'
        manifest['eligibilityGroups'][eg] = eligible
        manifest['historicalFreeGroups'][fg] = free
        for native in original_native_codes:
            pair = native+'-'+code
            manifest['pairs'][pair] = {'nativeLanguage':native,'studyLanguage':code,'eligibilityGroup':eg,'historicalFreeGroup':fg,
                'eligibleCount':count,'historicalFreeCount':len(free),'classicActiveDeckCount':0,'guidedPoolUniqueCount':0,'guidedOnlyCount':0,
                'sourceType':'provided-import','importedEligibleCount':count,'freePolicy':'original imported source lv=1'}
            primary = manifest['policies']['phoneticFields'][native]
            fallback = sum(not c.get(primary) and native!='zh' and bool(c.get('py')) for c in cards)
            manifest['coverageByPair'][pair] = {**{k:manifest['pairs'][pair][k] for k in ['classicActiveDeckCount','guidedPoolUniqueCount','guidedOnlyCount','eligibleCount','historicalFreeCount','importedEligibleCount']},
                'eligibleActiveCatalogueCount':count-reserved,'eligibleReservedCatalogueCount':reserved,
                'missingAdaptedPhoneticCount':sum(not c.get(primary) for c in cards),'phoneticFallbackCount':fallback,
                'missingAnyPhoneticCount':0,'historicalFreeOutsideEligibilityCount':0}
    manifest['studyLanguageIds'] += list(IMPORTS)
    # No German translation is supplied in these 15-field packs. Do not fabricate
    # a German meaning or silently label an English meaning as German.
    manifest['pairIds'] = [n+'-'+s for n in native_codes for s in manifest['studyLanguageIds']
                           if n!=s and not (n=='de' and s in IMPORTS)]
    manifest['derivedPairIds'] = [p for p in manifest['pairIds'] if p not in manifest['reviewedPairIds']]
    manifest['id'] = 'native-catalogue-imported-source-views'
    for key in ['sourceCardCount','activeCatalogueCount','reservedCatalogueCount','excludedModernExtraCount']:
        manifest[key] = sum(b[key] for b in manifest['banks'].values())
    outputs['melunga_deploy/content/native-catalogue/manifest.json'] = encode(manifest)
