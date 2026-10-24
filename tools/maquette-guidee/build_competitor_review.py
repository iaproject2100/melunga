#!/usr/bin/env python3
"""Assemble public research and exact Melunga examples; never edit runtime data."""
import argparse
from collections import defaultdict
import hashlib
import json
from pathlib import Path
import re
import unicodedata
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[2]
DOCS = ROOT / 'docs/niveaux-progressifs'
RESEARCH = DOCS / 'recherche-concurrents'
INPUTS = ('babbel-pimsleur.json', 'busuu-memrise.json', 'duolingo.json')
PAIRS = {'fr-en': 'en', 'fr-es': 'es', 'fr-it': 'it', 'fr-zh': 'zh',
         'fr-ja': 'ja', 'fr-ko': 'ko', 'zh-fr': 'fr'}


def digest(value):
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True,
                                     separators=(',', ':')).encode()).hexdigest()


def meaning_key(value):
    # Search only. Accents are retained (sur != sûr); no output is normalized.
    return re.sub(r'\s+', ' ', unicodedata.normalize('NFC', value).casefold()
                  .replace('’', "'")).strip(' .!?;:。！？')


def make(verify_snapshots=False):
    line = next(line for line in (ROOT / 'melunga_deploy/app.html').read_text().splitlines()
                if line.startswith('var DECKS = '))
    decks = json.loads(line.split('=', 1)[1].strip().rstrip(';'))
    assignments, lookup = {}, defaultdict(list)
    for pair, language in PAIRS.items():
        partition = json.loads((DOCS / f'types-contenu/{pair}.json').read_text())
        assert partition['sourceDeckSha256'] == digest(decks[language])
        assignments[pair] = {row['sourceIndex']: row for row in partition['assignments']}
        for index, card in enumerate(decks[language]):
            kind = assignments[pair][index]['contentType']
            if kind in ('utterance', 'vocabulary', 'number'):
                gloss = card['t'] if language == 'fr' else card['frm']
                lookup[(kind, meaning_key(gloss))].append((pair, index))
    sources, proposals, input_hashes = {}, [], {}
    fields_compared = 0
    for filename in INPUTS:
        path = RESEARCH / filename
        input_hashes[filename] = hashlib.sha256(path.read_bytes()).hexdigest()
        document = json.loads(path.read_text())
        for source in document['sources']:
            url = source['url']
            hostname = urlparse(url).hostname or ''
            assert hostname in ('www.babbel.com', 'www.pimsleur.com', 'www.busuu.com',
                                'www.memrise.com', 'blog.duolingo.com', 'www.duolingo.com')
            assert source.get('httpStatus', source.get('status')) == 200
            fingerprint = source.get('snapshotSha256', source.get('htmlSha256', source.get('sha256')))
            assert isinstance(fingerprint, str) and re.fullmatch('[0-9a-f]{64}', fingerprint)
            if verify_snapshots:
                snapshot = Path(source.get('snapshotPath', source.get('htmlPath', ''))).resolve()
                assert snapshot.is_relative_to('/tmp') and snapshot.is_file()
                assert hashlib.sha256(snapshot.read_bytes()).hexdigest() == fingerprint
            sources[url] = {'url': url, 'title': source['title'], 'httpStatus': 200,
                            'snapshotSha256': fingerprint, 'researchFile': filename}
        for proposal in document['proposals']:
            assert isinstance(proposal['proposedLevel'], int) and 1 <= proposal['proposedLevel'] <= 10
            assert proposal['sourceURLs'] and all(url in sources for url in proposal['sourceURLs'])
            examples, candidates = [], set()
            for example in proposal['existingExamples']:
                pair, index = example['pair'], example['sourceIndex']
                assert pair in PAIRS and type(index) is int
                language = PAIRS[pair]
                card = decks[language][index]
                mapping = {'study': 't', 'native': 'cn' if language == 'fr' else 'frm',
                           'phon': 'phon' if language == 'fr' else 'phf' if language == 'zh' else 'pf'}
                if language in ('zh', 'ja', 'ko'):
                    mapping['reading'] = 'py'
                for field, original in mapping.items():
                    assert example[field] == card[original], (proposal['id'], pair, index, field)
                    fields_compared += 1
                assert example['contentType'] == assignments[pair][index]['contentType']
                assert example['contentType'] in ('utterance', 'vocabulary', 'number')
                examples.append({'pair': pair, 'sourceIndex': index,
                                 'sourceSha256': digest(card), 'sourceLevel': card['lv'],
                                 'contentType': example['contentType'],
                                 **{field: card[original] for field, original in mapping.items()}})
                gloss = card['t'] if language == 'fr' else card['frm']
                candidates.update(lookup[(example['contentType'], meaning_key(gloss))])
            assert any(row['contentType'] == 'utterance' for row in examples)
            proposals.append({'id': proposal['id'], 'title': proposal['title'],
                              'proposedLevel': proposal['proposedLevel'],
                              'operation': proposal['operation'], 'sourceURLs': proposal['sourceURLs'],
                              'curatedExamples': examples,
                              'crossPairSearchCandidates': [
                                  {'pair': pair, 'sourceIndex': index,
                                   'sourceSha256': digest(decks[PAIRS[pair]][index]),
                                   'status': 'same-French-meaning-search-result-not-semantic-equivalence'}
                                  for pair, index in sorted(candidates)],
                              'gaps': proposal.get('gaps', []),
                              'status': 'source-supports-for-review-not-an-activated-lesson',
                              'levelFitVerified': False, 'newPhonetics': 0})
    assert len({row['id'] for row in proposals}) == len(proposals)
    proposals.sort(key=lambda row: (row['proposedLevel'], row['id']))
    curated = [row for proposal in proposals for row in proposal['curatedExamples']]
    candidate_pairs = sorted({row['pair'] for proposal in proposals
                              for row in proposal['crossPairSearchCandidates']})
    return {'version': 1, 'status': 'researched-enrichment-supports-awaiting-review',
            'publicationApproved': False, 'runtimeChanges': 0, 'newWrittenStudyPhrases': 0,
            'newPhonetics': 0, 'sourceDecksSha256': digest(decks), 'inputFiles': input_hashes,
            'sources': list(sources.values()), 'proposals': proposals,
            'limits': ['Public pages were read; no complete competitor course or comparative efficacy trial was played.',
                       'Curated examples cover three pairs, not a completed seven-pair lesson rollout.',
                       'Cross-pair matches retain accents and are search candidates only; no equivalence or phonetic choice is inferred.',
                       'Source support does not validate its proposed level, prerequisite coverage, dialogue or native formulation.',
                       'No theme is activated or source level changed by this research.'],
            'checks': {'officialPublicPages': len(sources), 'proposals': len(proposals),
                       'curatedExampleReferences': len(curated), 'exactFieldsCompared': fields_compared,
                       'sourceFieldDifferences': 0, 'curatedPairs': sorted({row['pair'] for row in curated}),
                       'crossPairSearchCoverage': candidate_pairs}}


def markdown(data):
    lines = ['# Nouveaux thèmes : sources publiques et appuis Melunga', '',
             'Recherche du 24 octobre 2026 : Babbel, Busuu, Duolingo, Memrise et Pimsleur.',
             'Les pages publiques ont été consultées ; leurs déclarations pédagogiques ne prouvent pas une efficacité comparée.', '',
             f"{len(data['sources'])} pages officielles, {len(data['proposals'])} propositions et {data['checks']['curatedExampleReferences']} appuis source sont réunis ici.",
             'Chaque exemple Melunga conserve son texte et sa phonétique. Les exemples inspectés portent sur fr→en, fr→zh et zh→fr ; les recherches dans les sept stocks fournissent des candidats à vérifier, sans prétendre à une déclinaison terminée.', '',
             '| Niveau proposé | Thème à préparer | Phrase entière déjà disponible |',
             '|---|---|---|']
    for proposal in data['proposals']:
        phrase = next(row for row in proposal['curatedExamples'] if row['contentType'] == 'utterance')
        lines.append(f"| L{proposal['proposedLevel']} | {proposal['title']} | {phrase['study'].replace('|', '/')} ({phrase['pair']}, index {phrase['sourceIndex']}) |")
    lines += ['', 'Ces appuis servent à préparer les nouvelles leçons. Il reste à choisir les premières rencontres ou reprises, compléter les échanges, vérifier les catégories et adapter chaque couple. Le niveau proposé n’écrit jamais le niveau du catalogue.', '',
              'Les listes, objectifs et explications des concurrents ne sont pas ajoutés à l’écran des leçons. L’architecture validée reste celle des cartes de thèmes, avec aide discrète.', '',
              '## Sources réellement consultées', '']
    for source in data['sources']:
        lines.append(f"- [{source['title']}]({source['url']})")
    lines += ['', 'Les trois relevés voisins conservent les dates, courts extraits, empreintes HTML et limites de chaque observation. Les instantanés HTML sont dans /tmp de cet environnement ; ils ne sont pas distribués avec le dépôt.', '',
              '## Vérifier les appuis', '', '```sh',
              'python3 -B tools/maquette-guidee/build_competitor_review.py --check',
              '# Dans cet environnement, avec les captures encore présentes :',
              'python3 -B tools/maquette-guidee/build_competitor_review.py --check --verify-snapshots', '```', '']
    return '\n'.join(lines)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    parser.add_argument('--verify-snapshots', action='store_true')
    args = parser.parse_args()
    result = make(args.verify_snapshots)
    outputs = {RESEARCH / 'SYNTHESE.json': json.dumps(result, ensure_ascii=False, indent=2) + '\n',
               RESEARCH / 'README.md': markdown(result)}
    for path, contents in outputs.items():
        if args.check:
            assert path.read_text() == contents, f'Out of date: {path}'
        else:
            path.write_text(contents)
    print(json.dumps(result['checks'], ensure_ascii=False))


if __name__ == '__main__':
    main()
