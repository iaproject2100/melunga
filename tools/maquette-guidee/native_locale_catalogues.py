"""Export supplied native meanings without rewriting any studied card or right."""
import hashlib
import json

NATIVE_LOCALES = ('ru', 'pt', 'ar', 'hi')
SOURCE = 'tools/maquette-guidee/imports/native-meanings-ru-pt-ar-hi-v1.json'
SOURCE_SHA256 = '9be14824ddde403c10bdf13752afecdae09aa6b78da8cc32c142579baccf352f'


def sha(data):
    return hashlib.sha256(data).hexdigest()


def encode(data):
    return (json.dumps(data, ensure_ascii=False, separators=(',', ':')) + '\n').encode()


def augment_native_locales(root, outputs, manifest):
    raw = (root / SOURCE).read_bytes()
    assert sha(raw) == SOURCE_SHA256, 'Received native meaning file changed'
    source = json.loads(raw)
    assert source['version'] == 1 and source['nativeLanguagesToComplete'] == list(NATIVE_LOCALES)
    concepts = source['concepts']
    assert len(concepts) == 29077 and [c['id'] for c in concepts] == list(range(29077))
    assert list(source['banks']) == manifest['studyLanguageIds']
    for study, indices in source['banks'].items():
        bank = json.loads(outputs['melunga_deploy/content/native-catalogue/' + study + '.json'])
        assert len(indices) == len(bank['cards'])
        for index, (card, concept_id) in enumerate(zip(bank['cards'], indices)):
            assert type(concept_id) is int and 0 <= concept_id < len(concepts)
            concept = concepts[concept_id]
            assert [study, index] in concept['sources'], 'Meaning source identity differs'
            assert concept['en'] == (card['t'] if study == 'en' else card['en'])
            assert concept['frm'] == (card['t'] if study == 'fr' else card['frm'])
    assert not any(code in manifest['nativeLanguageIds'] for code in NATIVE_LOCALES)
    descriptors = {}
    provenance = {'type': 'supplied-native-meanings', 'sourcePath': SOURCE,
                  'sourceSha256': SOURCE_SHA256, 'conceptCount': len(concepts),
                  'genderAndRegisterAnnotations': 'preserved from supplied meanings',
                  'newPhoneticsCreated': 0}
    for native in NATIVE_LOCALES:
        texts = [c[native] for c in concepts]
        assert all(isinstance(text, str) and text.strip() for text in texts)
        targets = [study for study in manifest['studyLanguageIds'] if study != native]
        banks = {study: {'sourceBankSha256': manifest['banks'][study]['sha256'],
                         'conceptIds': source['banks'][study]} for study in targets}
        data = {'version': 1, 'id': 'native-locale-meanings-' + native,
                'nativeLanguage': native, 'sourcePath': SOURCE, 'sourceSha256': SOURCE_SHA256,
                'conceptCount': len(concepts), 'concepts': texts, 'banks': banks,
                'sourceCardCount': sum(manifest['banks'][s]['sourceCardCount'] for s in targets),
                'translationProvenance': provenance}
        path = 'content/native-catalogue/' + native + '-native-meanings.json'
        encoded = encode(data)
        outputs['melunga_deploy/' + path] = encoded
        descriptors[native] = {'path': path, 'sha256': sha(encoded), 'bytes': len(encoded),
                               'sourcePath': SOURCE, 'sourceSha256': SOURCE_SHA256,
                               'conceptCount': len(concepts), 'sourceCardCount': data['sourceCardCount'],
                               'studyLanguageIds': targets, 'translationProvenance': provenance}
        for study in targets:
            pair = native + '-' + study
            donor_pair = ('de' if study in ('fr', 'en', 'es', 'it', 'zh', 'ja', 'ko') else 'fr') + '-' + study
            donor = manifest['pairs'][donor_pair]
            manifest['pairs'][pair] = {**donor, 'nativeLanguage': native,
                                       'sourceType': 'native-locale-translation', 'meaningSourcePath': path}
            manifest['coverageByPair'][pair] = {**manifest['coverageByPair'][donor_pair]}
            eligible = manifest['eligibilityGroups'][donor['eligibilityGroup']]
            bank = json.loads(outputs['melunga_deploy/content/native-catalogue/' + study + '.json'])
            phonetic_count = sum(bool(bank['cards'][index].get('py')) for index in eligible)
            manifest['coverageByPair'][pair].update(missingAdaptedPhoneticCount=len(eligible),
                phoneticFallbackCount=phonetic_count, missingAnyPhoneticCount=len(eligible)-phonetic_count)
    old_pairs = manifest['pairIds'][:]
    manifest['nativeLocaleMeanings'] = descriptors
    manifest['languageIds'] += list(NATIVE_LOCALES)
    manifest['nativeLanguageIds'] += list(NATIVE_LOCALES)
    manifest['pairIds'] = old_pairs + [n + '-' + s for n in NATIVE_LOCALES
                                      for s in manifest['studyLanguageIds'] if n != s]
    manifest['derivedPairIds'] = [p for p in manifest['pairIds'] if p not in manifest['reviewedPairIds']]
    assert len(manifest['pairIds']) == len(set(manifest['pairIds'])) == 128
    manifest['nativeMeaningTranslationsAdded'] = len(concepts) * len(NATIVE_LOCALES)
    outputs['melunga_deploy/content/native-catalogue/manifest.json'] = encode(manifest)
