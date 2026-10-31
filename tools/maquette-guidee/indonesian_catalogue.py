"""Append the independently reviewed Indonesian target to the existing export.

Card assignments are explicit source indices, never translation or word joins.
The German reference supplies topic definitions and existing pictures only.
"""
import argparse
import copy
import hashlib
import json
from pathlib import Path

DIRECTORY = 'tools/maquette-guidee/imports/indonesian-v1'
SOURCE = DIRECTORY + '/id-deck-v1.json'
SOURCE_SHA256 = '382e23fe0e4cd4328fb577f651416ef0afdedf9ccfca7fb1df781c7266cda391'
PLACEMENTS = DIRECTORY + '/id-themes-v1.json'
NATIVES = ['fr', 'en', 'es', 'it', 'zh', 'ja', 'ko']
FIELDS = {'t', 'py', 'pf', 'ps', 'pi', 'phon', 'cn', 'en', 'frm', 'esm', 'itm', 'jam', 'kom', 'lv', 'cat'}
RECEIVED = {
    'id_deck.json': '84704c83b3ce430c2d083035683855e024418877a916bddb01a3d5e86e637286',
    'id_tr_map.json': '01a372293195bdb215c078548891569236c84eb030d3311e88e4fdb18886be32',
    'id_phon.py': '8472b636d75ad97c9f8a039ca1753488922efe18dabd8580fdf5f11b5167faba',
    'ru_phon.py': '48e8e0043e8c267b72eaf65a74fd4cf5a6bcacab7ae84360e4d6ce8aeec04627',
    'de_phon.py': '37a80ce42789d23188ceb72a00059883faaeb1534b141b91e88cfa90ac5fdab3',
    'BRIEF_CODEX_INDONESIEN.md': 'ad9e20782fff94c25b1501ca75cf5a39f8ca80609c801ead93206eb8b001cd8e',
}


def require(value, message):
    if not value:
        raise ValueError('Indonesian import: ' + message)


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def encoded(data, pretty=False):
    return (json.dumps(data, ensure_ascii=False, indent=2 if pretty else None,
                       separators=None if pretty else (',', ':')) + '\n').encode()


def read(root, path):
    return json.loads((root / path).read_bytes())


def checked_cards(root):
    for name, fingerprint in RECEIVED.items():
        require(sha((root / DIRECTORY / name).read_bytes()) == fingerprint, 'received file changed: ' + name)
    raw = (root / SOURCE).read_bytes()
    require(sha(raw) == SOURCE_SHA256, 'reviewed cards changed')
    cards = json.loads(raw)
    require(len(cards) == len({c['t'] for c in cards}) == 4487, 'wrong inventory or duplicate text')
    require(all(set(c) == FIELDS and type(c['lv']) is int and 1 <= c['lv'] <= 10
                and all(isinstance(v, str) and v.strip() for k, v in c.items() if k != 'lv') for c in cards),
            'invalid fifteen-field model')
    original = read(root, DIRECTORY + '/id_deck.json')
    expected = copy.deepcopy(original)
    corrections = read(root, DIRECTORY + '/editorial-corrections-v1.json')
    require(corrections['sourceSha256'] == RECEIVED['id_deck.json']
            and corrections['correctedSourceSha256'] == SOURCE_SHA256, 'wrong correction provenance')
    changed = set()
    for row in corrections['changes']:
        i, field = row['index'], row['field']
        require(field in FIELDS - {'t', 'lv', 'cat'} and (i, field) not in changed
                and expected[i][field] == row['before'], 'unreviewed or duplicate field change')
        expected[i][field] = row['after']
        changed.add((i, field))
    require(cards == expected, 'cards differ beyond the explicit correction ledger')
    sample = read(root, DIRECTORY + '/sample-review-v1.json')['cards']
    require(len(sample) == len({r['index'] for r in sample}) == 500
            and all(sum(r['level'] == lv for r in sample) == 50 for lv in range(1, 11)), 'incomplete 500-card sample')
    for row in sample:
        require(row['level'] == original[row['index']]['lv']
                and row['sourceCardSha256'] == sha(json.dumps(original[row['index']], ensure_ascii=False,
                    sort_keys=True, separators=(',', ':')).encode()), 'sample identity changed')
    return cards


def prepare_placements(root, cards):
    reference_path = 'tools/maquette-guidee/imports/de-themes-v1.json'
    reference = read(root, reference_path)
    generic = reference['levelThemes']['1']
    # Reuse topic definitions and the approved image atlases, not any placements.
    domains = list(generic) + ['loisirs', 'nature', 'numerique', 'vocab-numerique']
    definitions = {}
    for level in range(1, 11):
        themes = {}
        for domain in domains:
            donor = {'loisirs': 'vocab-loisirs', 'nature': 'vocab-nature',
                     'numerique': 'comprendre', 'vocab-numerique': 'vocab-travail'}.get(domain, domain)
            definition = copy.deepcopy(reference['levelThemes'][str(level)][donor])
            definition['id'] = domain if level == 1 and not domain.startswith('vocab-') and domain != 'nombres' else f'L{level}-{domain}'
            definition['domain'] = domain
            definition['visualId'] = definition['id']
            definition['title'] = generic[donor]['title']
            if domain == 'travail':
                definition['title'] = 'Travail, études et démarches'
            if domain in ('numerique', 'vocab-numerique'):
                definition['title'] = 'Communications et numérique'
            if domain in ('loisirs', 'nature', 'numerique'):
                definition.update(section='situations', isTemplateCollection=False, optional=False)
            if level >= 7 and definition['section'] == 'situations':
                if domain in generic:
                    definition['skillSubtitle'] = reference['levelThemes'][str(level)][domain]['title']
                else:
                    definition['skillSubtitleLevel'] = level
            require((root / 'melunga_deploy' / definition['photo']['asset']).is_file(), 'missing existing illustration')
            themes[domain] = definition
        definitions[str(level)] = themes
    review_path = DIRECTORY + '/domain-review-v1.json'
    review = read(root, review_path)
    assignments = {}
    for chunk in review['chunks'].values():
        for group in chunk:
            require(group['domain'] in domains, 'unknown explicit domain')
            for index in group['indices']:
                require(type(index) is int and 0 <= index < len(cards) and index not in assignments
                        and cards[index]['cat'] != 'template', 'duplicate, unknown, or reserved assignment')
                assignments[index] = group['domain']
    refined = set()
    for row in review['refinements']:
        index = row['index']
        require(index not in refined and assignments[index] == row['from'] and row['domain'] in domains,
                'invalid reviewed refinement')
        assignments[index] = row['domain']
        refined.add(index)
    require(len(assignments) == 4410, 'unreviewed card has no domain; no fallback is allowed')
    rows = []
    for i, card in enumerate(cards):
        template = card['cat'] == 'template'
        domain = None if template else assignments[i]
        kind = 'incomplete' if template else 'number' if domain == 'nombres' else (
            'vocabulary' if card['cat'] in ('vocab', 'basics') else 'utterance')
        require(template or (kind in ('vocabulary', 'number')) == (definitions[str(card['lv'])][domain]['section'] == 'vocabulary'),
                'utterance/lexical section mismatch')
        rows.append({'index': i, 'domain': domain, 'contentType': kind, 'lexicalClass': None, 'isTemplate': template})
    return {'version': 1, 'id': 'id-independent-domain-placements-v1', 'sourcePath': SOURCE,
            'sourceSha256': SOURCE_SHA256, 'sourceCardCount': 4487,
            'policy': 'Indonesian semantic reading and explicit source-index decisions for L1-L10; no translated-text joins, word rules, automatic conversation fallback, or placements borrowed from another bank; all 77 templates reserved.',
            'reviewSourcePath': review_path, 'reviewSourceSha256': sha((root / review_path).read_bytes()),
            'definitionReferencePath': reference_path, 'definitionReferenceSha256': sha((root / reference_path).read_bytes()),
            'levelThemes': definitions, 'placements': rows}


def augment_indonesian(root, outputs, manifest):
    cards = checked_cards(root)
    placement = prepare_placements(root, cards)
    placement_raw = encoded(placement, True)
    require((root / PLACEMENTS).read_bytes() == placement_raw, 'authoritative placement source needs review or regeneration')
    locations, levels = [], []
    for card, row in zip(cards, placement['placements']):
        definition = None if row['isTemplate'] else placement['levelThemes'][str(card['lv'])][row['domain']]
        locations.append([card['lv'], definition['id'] if definition else None,
                          row['contentType'], row['lexicalClass'], row['isTemplate'], None])
    for lv in range(1, 11):
        themes = []
        for domain, definition in placement['levelThemes'][str(lv)].items():
            ids = [f'catalogue:id:{i}' for i, card in enumerate(cards)
                   if card['lv'] == lv and placement['placements'][i]['domain'] == domain]
            if ids:
                themes.append({**definition, 'phraseIds': ids})
        levels.append({'level': lv, 'sourceTitle': f'L{lv}', 'themes': themes,
                       'reserveIds': [f'catalogue:id:{i}' for i, card in enumerate(cards) if card['lv'] == lv and card['cat'] == 'template']})
    deck_sha = sha(json.dumps(cards, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode())
    bank = {'version': 1, 'id': 'native-catalogue-id', 'studyLanguage': 'id', 'reviewedPairId': None,
            'sourceType': 'provided-import', 'importedSourcePath': SOURCE, 'importedSourceSha256': SOURCE_SHA256,
            'sourceDeckSha256': deck_sha, 'placementPolicy': placement['policy'],
            'placementSourcePath': PLACEMENTS, 'placementSourceSha256': sha(placement_raw),
            'cards': cards, 'locationFields': ['editorialLevel', 'themeId', 'contentType', 'lexicalClass', 'isTemplate', 'lexicalConceptId'],
            'locations': locations, 'levels': levels}
    path = 'content/native-catalogue/id.json'
    raw = encoded(bank)
    outputs['melunga_deploy/' + path] = raw
    manifest['banks']['id'] = {'path': path, 'sha256': sha(raw), 'bytes': len(raw), 'sourceCardCount': 4487,
        'activeCatalogueCount': 4410, 'reservedCatalogueCount': 77, 'excludedModernExtraCount': 0,
        'reviewedPairId': None, 'sourceType': 'provided-import', 'importedSourcePath': SOURCE,
        'importedSourceSha256': SOURCE_SHA256, 'placementSourcePath': PLACEMENTS, 'placementSourceSha256': sha(placement_raw)}
    manifest['source']['importedSources']['id'] = {'path': SOURCE, 'sha256': SOURCE_SHA256, 'sourceCardCount': 4487, 'sourceDeckSha256': deck_sha}
    manifest['studyLanguageIds'].append('id')
    manifest['eligibilityGroups']['import-id'] = list(range(4487))
    free = [i for i, card in enumerate(cards) if card['lv'] == 1]
    manifest['historicalFreeGroups']['import-id-L1'] = free
    for native in NATIVES:
        pair = native + '-id'
        policy = {'nativeLanguage': native, 'studyLanguage': 'id', 'eligibilityGroup': 'import-id',
            'historicalFreeGroup': 'import-id-L1', 'eligibleCount': 4487, 'historicalFreeCount': 283,
            'classicActiveDeckCount': 0, 'guidedPoolUniqueCount': 0, 'guidedOnlyCount': 0,
            'sourceType': 'provided-import', 'importedEligibleCount': 4487, 'freePolicy': 'original imported source lv=1'}
        manifest['pairs'][pair] = policy
        missing = sum(not c.get(manifest['policies']['phoneticFields'][native]) for c in cards)
        manifest['coverageByPair'][pair] = {**{k: policy[k] for k in ['classicActiveDeckCount', 'guidedPoolUniqueCount',
            'guidedOnlyCount', 'eligibleCount', 'historicalFreeCount', 'importedEligibleCount']},
            'eligibleActiveCatalogueCount': 4410, 'eligibleReservedCatalogueCount': 77,
            'missingAdaptedPhoneticCount': missing, 'phoneticFallbackCount': missing, 'missingAnyPhoneticCount': 0,
            'historicalFreeOutsideEligibilityCount': 0}
    manifest['pairIds'] = [n + '-' + s for n in manifest['nativeLanguageIds'] for s in manifest['studyLanguageIds']
                           if n + '-' + s in manifest['pairs']]
    manifest['derivedPairIds'] = [p for p in manifest['pairIds'] if p not in manifest['reviewedPairIds']]
    for key in ['sourceCardCount', 'activeCatalogueCount', 'reservedCatalogueCount', 'excludedModernExtraCount']:
        manifest[key] = sum(b[key] for b in manifest['banks'].values())
    require(len(manifest['pairIds']) == 135 and manifest['sourceCardCount'] == 59070, 'unexpected expanded inventory')
    outputs['melunga_deploy/content/native-catalogue/manifest.json'] = encoded(manifest)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--prepare', required=True, action='store_true')
    parser.parse_args()
    root = Path(__file__).resolve().parents[2]
    cards = checked_cards(root)
    (root / PLACEMENTS).write_bytes(encoded(prepare_placements(root, cards), True))
    print(json.dumps({'sourceCards': 4487, 'activeCards': 4410, 'reservedTemplates': 77,
                      'independentPlacements': 4410, 'reviewSample': 500}))
