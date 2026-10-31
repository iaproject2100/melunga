#!/usr/bin/env python3
"""Export original native views, the German target, and German-native meanings.

No reviewed runtime is rewritten. --check compares deterministic output bytes;
only the DECKS/PEDAGOGY literals and relevant source functions pin app.html, so
unrelated entry-shell changes do not invalidate this catalogue export.
"""
from __future__ import annotations

import argparse
from collections import Counter
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys
from imported_target_catalogues import augment
from native_locale_catalogues import augment_native_locales

ROOT = Path(__file__).resolve().parents[2]
SOURCE_COMMIT = 'ef147deacf85b4a5631c1b05ff8050de7918ea1f'
LANGUAGES = ('fr', 'en', 'es', 'it', 'zh', 'ja', 'ko')
STUDY_LANGUAGES = LANGUAGES + ('de',)
NATIVE_LANGUAGES = STUDY_LANGUAGES
GERMAN_SOURCE = 'tools/maquette-guidee/imports/de-deck-v3.1.json'
GERMAN_SOURCE_SHA256 = '49d6f1cd3b2a44b4ab4efcbae4c5f58988ebc7e142ebb74b1505d4ce9e39d789'
GERMAN_PLACEMENTS = 'tools/maquette-guidee/imports/de-themes-v1.json'
GERMAN_PLACEMENTS_SHA256 = '48d8125233e7159ad267550d2e61ccc2c99fb6d90fd78538bf54fcf74776a0cf'
GERMAN_FIELDS = {'t', 'py', 'pf', 'ps', 'pi', 'phon', 'cn', 'en', 'frm', 'esm', 'itm', 'jam', 'kom', 'lv', 'cat'}
GERMAN_MEANINGS = 'tools/maquette-guidee/imports/de-native-meanings-v1.json'
GERMAN_MEANINGS_SHA256 = 'ebd452b242949aa77f066d0181c7536860b7a1d7456e78b4190b71e7bf29d0a8'
REVIEWED = ('fr-en', 'fr-es', 'fr-it', 'fr-zh', 'fr-ja', 'fr-ko', 'zh-fr')
PAIRS = tuple(f'{native}-{study}' for native in NATIVE_LANGUAGES for study in STUDY_LANGUAGES if native != study)
BASE_PAIRS = {pair.split('-')[1]: pair for pair in REVIEWED}
APP = 'melunga_deploy/app.html'
RUNTIME = 'melunga_deploy/content/niveaux-progressifs'
OUTPUT = 'melunga_deploy/content/native-catalogue'
LOADER = 'melunga_deploy/course-native.js'
MEANING_FIELDS = {'fr': 'frm', 'en': 'en', 'es': 'esm', 'it': 'itm', 'zh': 'cn', 'ja': 'jam', 'ko': 'kom'}
PHON_FIELDS = {'fr': 'pf', 'en': 'py', 'es': 'ps', 'it': 'pi', 'zh': 'phon', 'ja': 'pj', 'ko': 'pk'}
ZH_PHON_FIELDS = {'fr': 'phf', 'en': 'phe', 'es': 'phs', 'it': 'phi', 'zh': 'phon', 'ja': 'pj', 'ko': 'pk'}
SOURCING = ('biz', 'textile', 'elec', 'furniture', 'lighting', 'toys', 'shoes', 'bags', 'machinery')
SOURCE_FUNCTIONS = ('meaningOf', 'phonOf', 'sourcingRelevant', 'activeDeck', 'guidedActiveDeck', 'guidedPool', 'isFreeCard')
THEME_FIELDS = ('id', 'title', 'domain', 'section', 'visualId', 'photo', 'scene', 'icon', 'optional', 'isTemplateCollection')


def require(condition, message):
    if not condition:
        raise ValueError('Native catalogue export: ' + message)


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()


def encoded(value):
    return (json.dumps(value, ensure_ascii=False, separators=(',', ':')) + '\n').encode()


def git(root, path):
    return subprocess.check_output(['git', 'show', SOURCE_COMMIT + ':' + path], cwd=root)


def literal(raw, name):
    prefix = ('var ' + name + ' = ').encode()
    rows = [line for line in raw.splitlines() if line.startswith(prefix)]
    require(len(rows) == 1, 'expected one ' + name + ' literal')
    return rows[0], json.loads(rows[0][len(prefix):].removesuffix(b';'))


def function_source(raw, name):
    """Read a bounded existing JS function, ignoring quoted/commented braces."""
    text = raw.decode()
    match = re.search(r'\bfunction\s+' + re.escape(name) + r'\s*\([^)]*\)\s*\{', text)
    require(match is not None, 'missing policy function ' + name)
    start, depth, state, escaped, i = match.start(), 0, 'code', False, match.end() - 1
    while i < len(text):
        char, following = text[i], text[i:i+2]
        if state in ("'", '"', '`'):
            if escaped:escaped = False
            elif char == '\\':escaped = True
            elif char == state:state = 'code'
        elif state == 'line':
            if char == '\n':state = 'code'
        elif state == 'block':
            if following == '*/':state = 'code';i += 1
        elif following == '//':state = 'line';i += 1
        elif following == '/*':state = 'block';i += 1
        elif char in ("'", '"', '`'):state = char
        elif char == '{':depth += 1
        elif char == '}':
            depth -= 1
            if depth == 0:return text[start:i+1].encode()
        i += 1
    raise ValueError('Unclosed policy function ' + name)


def source_paths():
    return [RUNTIME + '/manifest.json'] + [f'{RUNTIME}/{pair}/L{level}.json' for pair in REVIEWED for level in range(1, 11)] + [
        f'{RUNTIME}/repertoires/{pair}.json' for pair in REVIEWED]


def german_bank(root):
    """Apply the reviewed thematic placements without changing accepted cards.

    Themes reuse the existing curriculum labels and photographs. Source IDs,
    levels and whole card fields stay fixed; order is stable within each theme.
    """
    raw = (root / GERMAN_SOURCE).read_bytes()
    require(sha(raw) == GERMAN_SOURCE_SHA256, 'German v3.1 import fingerprint differs')
    cards = json.loads(raw)
    require(isinstance(cards, list) and len(cards) == 4519, 'German import inventory differs')
    for card in cards:
        require(isinstance(card, dict) and set(card) == GERMAN_FIELDS
                and type(card['lv']) is int and 1 <= card['lv'] <= 10
                and card['cat'] in ('core', 'vocab', 'template', 'basics', 'bonus')
                and all(isinstance(value, str) and value.strip() for key, value in card.items() if key != 'lv'),
                'invalid original German source block')
    placement_raw = (root / GERMAN_PLACEMENTS).read_bytes()
    require(sha(placement_raw) == GERMAN_PLACEMENTS_SHA256, 'German thematic placement fingerprint differs')
    placement = json.loads(placement_raw)
    require(placement.get('version') == 1 and placement.get('id') == 'german-reviewed-theme-placements'
            and placement.get('sourcePath') == GERMAN_SOURCE and placement.get('sourceSha256') == GERMAN_SOURCE_SHA256,
            'German thematic source differs')
    rows = placement.get('placements')
    require(isinstance(rows, list) and len(rows) == len(cards), 'German placements are not exhaustive')
    definitions = placement.get('levelThemes')
    require(isinstance(definitions, dict) and set(definitions) == {str(level) for level in range(1, 11)},
            'German thematic levels differ')
    locations, levels = [], []
    classes = {'adjective', 'adverb', 'color', 'other', 'preposition', 'uncertain'}
    for index, (card, row) in enumerate(zip(cards, rows)):
        require(isinstance(row, dict) and set(row) == {'index', 'domain', 'contentType', 'lexicalClass', 'isTemplate'}
                and type(row['index']) is int and row['index'] == index
                and type(row['isTemplate']) is bool and row['isTemplate'] == (card['cat'] == 'template'),
                'German placement identity or template differs')
        domain, kind, lexical, reserve = row['domain'], row['contentType'], row['lexicalClass'], row['isTemplate']
        require((reserve and domain is None and kind == 'incomplete' and lexical is None)
                or (not reserve and isinstance(domain, str) and domain in definitions[str(card['lv'])]
                    and kind in ('utterance', 'vocabulary', 'number')
                    and (lexical in classes if kind == 'vocabulary' else lexical is None)),
                'German thematic type or domain differs')
        definition = None if reserve else definitions[str(card['lv'])][domain]
        locations.append([card['lv'], None if reserve else definition['id'], kind, lexical, reserve, None])
    for level in range(1, 11):
        themes = []
        for domain, definition in definitions[str(level)].items():
            active = [f'catalogue:de:{index}' for index, card in enumerate(cards)
                      if card['lv'] == level and rows[index]['domain'] == domain]
            if not active:
                continue
            require(definition['domain'] == domain and isinstance(definition['title'], str)
                    and definition['section'] in ('situations', 'vocabulary')
                    and isinstance(definition['photo'], dict)
                    and (root / 'melunga_deploy' / definition['photo']['asset']).is_file(),
                    'German theme metadata or photograph differs')
            themes.append({**definition, 'phraseIds': active})
        reserved = [f'catalogue:de:{index}' for index, card in enumerate(cards)
                    if card['lv'] == level and card['cat'] == 'template']
        require(len(themes) > 1, 'German level must expose meaningful thematic choices')
        levels.append({'level': level, 'sourceTitle': 'L' + str(level), 'themes': themes, 'reserveIds': reserved})
    return {'version': 1, 'id': 'native-catalogue-de', 'studyLanguage': 'de', 'reviewedPairId': None,
            'sourceType': 'validated-import', 'importedSourcePath': GERMAN_SOURCE,
            'importedSourceSha256': GERMAN_SOURCE_SHA256, 'sourceDeckSha256': sha(canonical(cards)),
            'placementPolicy': placement['policy'], 'placementSourcePath': GERMAN_PLACEMENTS,
            'placementSourceSha256': GERMAN_PLACEMENTS_SHA256,
            'cards': cards,
            'locationFields': ['editorialLevel', 'themeId', 'contentType', 'lexicalClass', 'isTemplate', 'lexicalConceptId'],
            'locations': locations, 'levels': levels}


def german_meanings(root, banks, outputs):
    """German meanings are separate; the seven complete source banks stay exact."""
    raw = (root / GERMAN_MEANINGS).read_bytes()
    require(sha(raw) == GERMAN_MEANINGS_SHA256, 'German native meanings fingerprint differs')
    source = json.loads(raw)
    require(source.get('version') == 1 and source.get('id') == 'german-native-meanings-source'
            and source.get('nativeLanguage') == 'de' and isinstance(source.get('concepts'), list)
            and len(source['concepts']) == 15869 and set(source.get('banks', {})) == set(LANGUAGES),
            'German native meanings inventory differs')
    values = []
    for index, concept in enumerate(source['concepts']):
        require(concept.get('id') == index and all(isinstance(concept.get(key), str) and concept[key].strip()
                for key in ('en', 'frm', 'de')), 'German native concept incomplete')
        values.append(concept['de'])
    references = {}
    for study in LANGUAGES:
        entry = source['banks'][study]
        ids = entry.get('conceptIds')
        require(entry.get('sourceBankSha256') == banks[study]['sha256'] and isinstance(ids, list)
                and len(ids) == banks[study]['sourceCardCount']
                and all(type(index) is int and 0 <= index < len(values) for index in ids),
                'German meanings must cover an exact whole original source bank')
        references[study] = {'sourceBankSha256': entry['sourceBankSha256'], 'conceptIds': ids}
    require(sum(len(row['conceptIds']) for row in references.values()) == 32115,
            'German native source coverage differs')
    path = OUTPUT + '/de-native-meanings.json'
    document = {'version': 1, 'id': 'german-native-meanings', 'nativeLanguage': 'de',
                'sourcePath': GERMAN_MEANINGS, 'sourceSha256': GERMAN_MEANINGS_SHA256,
                'sourceCardCount': 32115, 'conceptCount': len(values),
                'newTranslationCount': 15249, 'reusedValidatedTranslationCount': 620,
                'concepts': values, 'banks': references}
    outputs[path] = encoded(document)
    return {'path': path.removeprefix('melunga_deploy/'), 'sha256': sha(outputs[path]),
            'sourcePath': GERMAN_MEANINGS, 'sourceSha256': GERMAN_MEANINGS_SHA256,
            'sourceCardCount': 32115, 'conceptCount': len(values), 'newTranslationCount': 15249,
            'reusedValidatedTranslationCount': 620}


def make(root):
    app = (root / APP).read_bytes()
    original_app = git(root, APP)
    decks_raw, decks = literal(app, 'DECKS')
    pedagogy_raw, pedagogy = literal(app, 'PEDAGOGY_FAMILIES')
    require(decks_raw == literal(original_app, 'DECKS')[0], 'original DECKS literal changed')
    require(pedagogy_raw == literal(original_app, 'PEDAGOGY_FAMILIES')[0], 'original pedagogy literal changed')
    require(set(decks) == set(LANGUAGES) and sum(map(len, decks.values())) == 32115, 'source catalogue scope changed')
    function_hashes = {}
    for name in SOURCE_FUNCTIONS:
        current = function_source(app, name)
        require(current == function_source(original_app, name), 'source policy function changed: ' + name)
        function_hashes[name] = sha(current)
    documents, input_hashes = {}, {}
    for path in source_paths():
        raw = (root / path).read_bytes()
        require(raw == git(root, path), 'reviewed runtime input changed: ' + path)
        documents[path] = json.loads(raw);input_hashes[path] = sha(raw)
    require(len(input_hashes) == 78, 'expected exactly 78 reviewed input documents')
    rights_path = 'melunga_deploy/content/course-access.json'
    rights_raw = (root / rights_path).read_bytes()
    require(rights_raw == git(root, rights_path), 'seven reviewed access lists changed')
    reviewed_rights = {pair['id']: set(pair['historicalFreeIds']) for pair in json.loads(rights_raw)['pairs']}
    require(set(reviewed_rights) == set(REVIEWED), 'reviewed access pair scope changed')
    require(sum(map(len, reviewed_rights.values())) == 2218, 'reviewed historical free total changed')
    eligibility_groups, free_groups, pair_policies = {}, {}, {}
    eligibility_keys, free_keys = {}, {}
    def group(values, groups, keys, prefix):
        identity = tuple(sorted(values))
        if identity not in keys:
            key = prefix + str(len(keys));keys[identity] = key;groups[key] = list(identity)
        return keys[identity]
    for pair in PAIRS:
        native, study = pair.split('-')
        if study == 'de' or native == 'de':continue
        cards = decks[study]
        translated = [i for i, card in enumerate(cards) if isinstance(card.get(MEANING_FIELDS[native]), str) and card[MEANING_FIELDS[native]].strip()]
        require(len(translated) == len(cards), 'a native meaning is missing: ' + pair)
        sourcing = native == 'zh' or study == 'zh' or native in ('fr', 'es') and study == 'en'
        classic_active = {i for i in translated if sourcing or cards[i].get('th') not in SOURCING}
        free = {i for i in classic_active if cards[i].get('lv') == 1}
        first_by_text = {}
        for i in translated:first_by_text.setdefault(cards[i]['t'], i)
        guided = set()
        for family in pedagogy['languages'].get(study, {}).get('families', []):
            for reference in family['cards']:
                if reference['target'] not in first_by_text:continue
                index = first_by_text[reference['target']]
                guided.add(index)
                if family['pathLv'] == 1:free.add(index)
        eligible = sorted(classic_active | guided)
        require(free <= set(eligible), 'historical free source escaped combined native eligibility: ' + pair)
        if pair in reviewed_rights:
            require({f'catalogue:{study}:{index}' for index in free} == reviewed_rights[pair], 'historical IDs differ: ' + pair)
        pair_policies[pair] = {'nativeLanguage': native, 'studyLanguage': study,
            'eligibilityGroup': group(eligible, eligibility_groups, eligibility_keys, 'eligible-'),
            'historicalFreeGroup': group(free, free_groups, free_keys, 'free-'),
            'eligibleCount': len(eligible), 'historicalFreeCount': len(free),
            'classicActiveDeckCount': len(classic_active), 'guidedPoolUniqueCount': len(guided),
            'guidedOnlyCount': len(guided - classic_active)}
    policies = {'meaningFields': MEANING_FIELDS, 'phoneticFields': PHON_FIELDS, 'chinesePhoneticFields': ZH_PHON_FIELDS,
        'sourceFunctionSha256': function_hashes, 'sourcingThemes': list(SOURCING),
        'sourcingAllowed': 'native=zh OR study=zh OR (native IN [fr,es] AND study=en)',
        'nativeMeaningRequired': True, 'eligibility': 'activeDeck UNION guidedPool(guidedActiveDeck), FIRST native-translated same-text source',
        'historicalFreeMayReferenceSourcesOutsideActiveDeck': True, 'historicalFreeMustBeEligible': True, 'historicalFree': 'eligible source lv=1 UNION guided pathLv=1, FIRST eligible same-text source',
        'studyNativePhonBlock': 'original classic whole fields; never mix corrected modern study with classic native/phon',
        'missingAdaptedPhonetic': 'use exact classic py fallback, distinguish english-fallback/pinyin-fallback; empty stays empty',
        'reading': 'original py only when study=zh; otherwise empty',
        'extraModernEntries': 'not exported as translated catalogue', 'reservedCanonicalSources': 'retained in bank, never primary exercises'}
    outputs, banks, coverage = {}, {}, {}
    for study in LANGUAGES:
        pair = BASE_PAIRS[study];cards = decks[study]
        locations = [None] * len(cards);levels = [];seen = set();extras = active = reserved = 0
        for level in range(1, 11):
            cell = documents[f'{RUNTIME}/{pair}/L{level}.json'];themes = []
            for field in ('themes', 'heldThemes'):
                for theme in cell[field]:
                    ids = []
                    for phrase in theme['phrases']:
                        if phrase['source']['collection'] != 'DECKS.' + study:extras += 1;continue
                        index = phrase['source']['sourceIndex']
                        require(type(index) is int and 0 <= index < len(cards) and phrase['id'] == f'catalogue:{study}:{index}' and index not in seen, 'invalid catalogue identity')
                        seen.add(index)
                        is_active = field == 'themes'
                        locations[index] = [level, theme['id'] if is_active else None, phrase['contentType'],
                            phrase.get('lexicalClass'), phrase['isTemplate'], phrase.get('lexicalConceptId')]
                        if is_active:ids.append(phrase['id']);active += 1
                        else:reserved += 1
                    if field == 'themes' and ids:
                        themes.append({**{key: theme[key] for key in THEME_FIELDS if key in theme}, 'phraseIds': ids})
            reserve_ids = []
            for phrase in cell['reserve']:
                require(phrase['source']['collection'] == 'DECKS.' + study, 'unexpected non-catalogue reserve source')
                index = phrase['source']['sourceIndex']
                require(type(index) is int and 0 <= index < len(cards) and phrase['id'] == f'catalogue:{study}:{index}' and index not in seen, 'invalid reserve identity')
                seen.add(index);reserved += 1
                locations[index] = [level, None, phrase['contentType'], phrase.get('lexicalClass'), phrase['isTemplate'], phrase.get('lexicalConceptId')]
                reserve_ids.append(phrase['id'])
            levels.append({'level': level, 'sourceTitle': cell['levelTitle'], 'themes': themes, 'reserveIds': reserve_ids})
        require(len(seen) == len(cards) and all(value is not None for value in locations), 'catalogue location partition is incomplete: ' + study)
        for index, card in enumerate(cards):
            require(isinstance(card.get('t'), str) and card['t'] and type(card.get('lv')) is int and 1 <= card['lv'] <= 10, 'invalid whole source block')
        path = OUTPUT + '/' + study + '.json'
        document = {'version': 1, 'id': 'native-catalogue-' + study, 'studyLanguage': study, 'reviewedPairId': pair,
            'decksLiteralSha256': sha(decks_raw), 'sourceDeckSha256': sha(canonical(cards)), 'cards': cards,
            'locationFields': ['editorialLevel', 'themeId', 'contentType', 'lexicalClass', 'isTemplate', 'lexicalConceptId'],
            'locations': locations, 'levels': levels}
        outputs[path] = encoded(document)
        for candidate, policy in pair_policies.items():
            native, target = candidate.split('-')
            if target != study:continue
            eligible = eligibility_groups[policy['eligibilityGroup']]
            primary_phon = (ZH_PHON_FIELDS if study == 'zh' else PHON_FIELDS)[native]
            fallback = [index for index in eligible if not cards[index].get(primary_phon) and native != 'zh' and cards[index].get('py')]
            without_phon = [index for index in eligible if not cards[index].get(primary_phon) and not (native != 'zh' and cards[index].get('py'))]
            coverage[candidate] = {key: policy[key] for key in ('classicActiveDeckCount', 'guidedPoolUniqueCount', 'guidedOnlyCount', 'eligibleCount', 'historicalFreeCount')}
            coverage[candidate].update(eligibleActiveCatalogueCount=sum(locations[index][1] is not None for index in eligible),
                eligibleReservedCatalogueCount=sum(locations[index][1] is None for index in eligible),
                missingAdaptedPhoneticCount=sum(not cards[index].get(primary_phon) for index in eligible),
                phoneticFallbackCount=len(fallback), missingAnyPhoneticCount=len(without_phon), historicalFreeOutsideEligibilityCount=0)
        banks[study] = {'path': path.removeprefix('melunga_deploy/'), 'sha256': sha(outputs[path]),
            'bytes': len(outputs[path]), 'sourceCardCount': len(cards), 'activeCatalogueCount': active,
            'reservedCatalogueCount': reserved, 'excludedModernExtraCount': extras, 'reviewedPairId': pair}
    imported = german_bank(root);cards = imported['cards']
    imported_path = OUTPUT + '/de.json';outputs[imported_path] = encoded(imported)
    reserved = sum(card['cat'] == 'template' for card in cards)
    banks['de'] = {'path': imported_path.removeprefix('melunga_deploy/'), 'sha256': sha(outputs[imported_path]),
        'bytes': len(outputs[imported_path]), 'sourceCardCount': len(cards),
        'activeCatalogueCount': len(cards) - reserved, 'reservedCatalogueCount': reserved,
        'excludedModernExtraCount': 0, 'reviewedPairId': None, 'sourceType': 'validated-import',
        'importedSourcePath': GERMAN_SOURCE, 'importedSourceSha256': GERMAN_SOURCE_SHA256,
        'placementSourcePath': GERMAN_PLACEMENTS, 'placementSourceSha256': GERMAN_PLACEMENTS_SHA256}
    eligible = list(range(len(cards)));free = [index for index, card in enumerate(cards) if card['lv'] == 1]
    for native in LANGUAGES:
        pair = native + '-de';primary = PHON_FIELDS[native]
        require(all(cards[index][MEANING_FIELDS[native]].strip() for index in eligible), 'German native meaning missing: ' + pair)
        policy = {'nativeLanguage': native, 'studyLanguage': 'de',
            'eligibilityGroup': group(eligible, eligibility_groups, eligibility_keys, 'eligible-'),
            'historicalFreeGroup': group(free, free_groups, free_keys, 'free-'),
            'eligibleCount': len(cards), 'historicalFreeCount': len(free),
            'classicActiveDeckCount': 0, 'guidedPoolUniqueCount': 0, 'guidedOnlyCount': 0,
            'sourceType': 'validated-import', 'importedEligibleCount': len(cards),
            'freePolicy': 'original imported source lv=1'}
        pair_policies[pair] = policy
        fallback = [index for index in eligible if not cards[index].get(primary) and native != 'zh' and cards[index].get('py')]
        without_phon = [index for index in eligible if not cards[index].get(primary) and not (native != 'zh' and cards[index].get('py'))]
        coverage[pair] = {key: policy[key] for key in ('classicActiveDeckCount', 'guidedPoolUniqueCount', 'guidedOnlyCount', 'eligibleCount', 'historicalFreeCount', 'importedEligibleCount')}
        coverage[pair].update(eligibleActiveCatalogueCount=len(cards) - reserved, eligibleReservedCatalogueCount=reserved,
            missingAdaptedPhoneticCount=sum(not cards[index].get(primary) for index in eligible),
            phoneticFallbackCount=len(fallback), missingAnyPhoneticCount=len(without_phon), historicalFreeOutsideEligibilityCount=0)
    policies['importedSourceEligibility'] = 'all original validated-import identities; same seven native meaning and phonetic selectors'
    policies['importedSourceFree'] = 'original imported source lv=1; no historical reviewed access IDs modified'
    native_meanings = german_meanings(root, banks, outputs)
    for study in LANGUAGES:
        pair = 'de-' + study
        # German has the same non-Chinese source eligibility as the existing
        # English native view (Italian native for the English target itself).
        donor = ('it' if study == 'en' else 'en') + '-' + study
        prior = pair_policies[donor]
        pair_policies[pair] = {**prior, 'nativeLanguage': 'de', 'sourceType': 'german-native-translation',
                              'meaningSourcePath': native_meanings['path']}
        eligible = eligibility_groups[prior['eligibilityGroup']]
        bank = json.loads(outputs[OUTPUT + '/' + study + '.json'])
        native_cards = bank['cards'];native_locations = bank['locations']
        fallback = sum(bool(native_cards[index].get('py')) for index in eligible)
        coverage[pair] = {key: pair_policies[pair][key] for key in ('classicActiveDeckCount', 'guidedPoolUniqueCount', 'guidedOnlyCount', 'eligibleCount', 'historicalFreeCount')}
        coverage[pair].update(eligibleActiveCatalogueCount=sum(native_locations[index][1] is not None for index in eligible),
            eligibleReservedCatalogueCount=sum(native_locations[index][1] is None for index in eligible),
            missingAdaptedPhoneticCount=len(eligible), phoneticFallbackCount=fallback,
            missingAnyPhoneticCount=len(eligible) - fallback, historicalFreeOutsideEligibilityCount=0)
    manifest = {'version': 1, 'id': 'native-catalogue-49-source-views', 'sourceSnapshotCommit': SOURCE_COMMIT,
        'languageIds': list(NATIVE_LANGUAGES), 'nativeLanguageIds': list(NATIVE_LANGUAGES), 'studyLanguageIds': list(STUDY_LANGUAGES),
        'pairIds': list(PAIRS), 'reviewedPairIds': list(REVIEWED),
        'derivedPairIds': [pair for pair in PAIRS if pair not in REVIEWED],
        'source': {'appPath': APP, 'decksLiteralSha256': sha(decks_raw), 'pedagogyLiteralSha256': sha(pedagogy_raw),
            'reviewedRuntimeSha256ByPath': dict(sorted(input_hashes.items())), 'historicalAccessPath': rights_path,
            'historicalAccessSha256': sha(rights_raw), 'reviewedHistoricalFreeIdsVerified': 2218,
            'importedSources': {'de': {'path': GERMAN_SOURCE, 'sha256': GERMAN_SOURCE_SHA256,
                'sourceCardCount': len(cards), 'sourceDeckSha256': imported['sourceDeckSha256']}}},
        'policies': policies, 'policiesSha256': sha(canonical(policies)), 'germanNativeMeanings': native_meanings,
        'eligibilityGroups': eligibility_groups, 'historicalFreeGroups': free_groups,
        'pairs': {pair: pair_policies[pair] for pair in PAIRS}, 'banks': banks,
        'coverageByPair': {pair: coverage[pair] for pair in PAIRS}, 'sourceCardCount': 36634,
        'activeCatalogueCount': sum(row['activeCatalogueCount'] for row in banks.values()),
        'reservedCatalogueCount': sum(row['reservedCatalogueCount'] for row in banks.values()),
        'excludedModernExtraCount': sum(row['excludedModernExtraCount'] for row in banks.values()),
        'newTranslationsCreated': 15249, 'newPhoneticsCreated': 0, 'reviewedRuntimeModified': False,
        'doesNotMeasureAcquisition': True}
    require(len(manifest['derivedPairIds']) == 49 and manifest['activeCatalogueCount'] == 35353
            and manifest['reservedCatalogueCount'] == 1281 and manifest['excludedModernExtraCount'] == 1539, 'whole export inventory differs')
    outputs[OUTPUT + '/manifest.json'] = encoded(manifest)
    augment(root, outputs, manifest)
    augment_native_locales(root, outputs, manifest)
    for path, checksum in input_hashes.items():require(sha((root / path).read_bytes()) == checksum, 'reviewed input changed during export: ' + path)
    require(literal((root / APP).read_bytes(), 'DECKS')[0] == decks_raw, 'DECKS changed during export')
    return outputs, manifest


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=ROOT)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args();root = args.root.resolve()
    try:
        outputs, manifest = make(root)
        manifest_sha = sha(outputs[OUTPUT + '/manifest.json'])
        loader = root / LOADER
        source = loader.read_text()
        pattern = r"const MANIFEST_SHA256 = '[0-9a-f]{64}';"
        require(len(re.findall(pattern, source)) == 1, 'loader has no unique manifest pin')
        expected_loader = re.sub(pattern, "const MANIFEST_SHA256 = '" + manifest_sha + "';", source)
        if args.check:
            require(source == expected_loader, 'loader manifest pin is stale')
            require({p.name for p in (root / OUTPUT).iterdir() if p.is_file()} == {Path(path).name for path in outputs}, 'export file set differs')
            for path, raw in outputs.items():require((root / path).read_bytes() == raw, 'deterministic export differs: ' + path)
        else:
            (root / OUTPUT).mkdir(parents=True, exist_ok=True)
            for path, raw in outputs.items():(root / path).write_bytes(raw)
            if source != expected_loader:loader.write_text(expected_loader)
        print(json.dumps({'status': 'checked' if args.check else 'exported', 'banks': len(manifest['banks']), 'derivedPairs': len(manifest['derivedPairIds']),
            'sourceCards': manifest['sourceCardCount'], 'activeCatalogue': manifest['activeCatalogueCount'],
            'reservedCatalogue': manifest['reservedCatalogueCount'], 'excludedModernExtras': manifest['excludedModernExtraCount'],
            'reviewedHistoricalFreeIdsVerified': 2218, 'manifestSha256': manifest_sha,
            'decksLiteralSha256': manifest['source']['decksLiteralSha256'], 'policiesSha256': manifest['policiesSha256'],
            'eligibleCountsByPair': {pair: row['eligibleCount'] for pair, row in manifest['coverageByPair'].items()},
            'activeCountsByPair': {pair: row['eligibleActiveCatalogueCount'] for pair, row in manifest['coverageByPair'].items()}}))
        return 0
    except (ValueError, OSError, KeyError, subprocess.CalledProcessError) as error:
        print(str(error), file=sys.stderr);return 1


if __name__ == '__main__':raise SystemExit(main())
