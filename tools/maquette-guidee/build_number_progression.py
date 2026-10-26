#!/usr/bin/env python3
"""Propose a common first numerical repertoire, preserving whole source entries."""
import argparse
from collections import Counter
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DOCS = ROOT / 'docs/niveaux-progressifs'
OUTPUT = DOCS / 'corrections-themes/introductions-nombres.json'


def sha(value):
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True,
                                     separators=(',', ':')).encode()).hexdigest()


CARDINALS = dict(zip(
    ('zéro un deux trois quatre cinq six sept huit neuf dix onze douze treize quatorze quinze seize dix-sept dix-huit dix-neuf vingt trente quarante cinquante soixante soixante-dix quatre-vingts quatre-vingt-dix cent').split(),
    list(range(21)) + [30, 40, 50, 60, 70, 80, 90, 100]))
CARDINALS.update({'deux cents': 200, 'mille': 1000, 'un million': 1000000})
ORDINALS = {'premier': 1, 'le premier': 1, 'deuxième': 2, 'troisième': 3,
            'quatrième': 4, 'cinquième': 5}
FRACTIONS = {'demi': (1, 2), 'moitié': (1, 2), 'la moitié': (1, 2),
             'un tiers': (1, 3), 'un quart': (1, 4)}
APPROXIMATIONS = {'une dizaine': 10}
COLLECTIVE_QUANTITIES = {'une douzaine': 12}
MULTIPLIERS = {'double': 2, 'le double': 2}
LEXICAL_NUMERIC_GLOSSES = {
    ('fr-zh', 2246): ('新', '« Neuf » signifie ici nouveau, et non le nombre neuf.'),
    ('fr-en', 3038): ('the first one', 'Groupe nominal référentiel conservé entier dans le vocabulaire, distinct du numéral ordinal.'),
    ('fr-it', 2632): ('il primo', 'Groupe nominal référentiel conservé entier dans le vocabulaire, distinct du numéral ordinal.'),
    ('fr-ja', 3017): ('最初の', 'Forme adnominale initial/premier, sans fabrication d’un nombre autonome ni suppression de の.'),
    ('fr-ko', 2169): ('첫 번째', 'Groupe lexical de position ordinale conservé entier, sans le remplacer par le numéral de la série.'),
}


def make():
    line = next(line for line in (ROOT / 'melunga_deploy/app.html').read_text().splitlines()
                if line.startswith('var DECKS = '))
    decks = json.loads(line.split('=', 1)[1].strip().rstrip(';'))
    items, summaries, lexical_exceptions = [], [], []
    known_labels = set(CARDINALS) | set(ORDINALS) | set(FRACTIONS) | set(APPROXIMATIONS) | set(COLLECTIVE_QUANTITIES) | set(MULTIPLIERS)
    for path in sorted((DOCS / 'types-contenu').glob('*.json')):
        partition = json.loads(path.read_text())
        pair, language = partition['pair'], partition['studyLanguage']
        assert partition['sourceDeckSha256'] == sha(decks[language])
        counts = Counter()
        for assignment in partition['assignments']:
            index = assignment['sourceIndex']
            card = decks[language][index]
            label = (card['t'] if language == 'fr' else card['frm']).casefold().strip(' .!?')
            if assignment['contentType'] != 'number':
                if label in known_labels:
                    exception = LEXICAL_NUMERIC_GLOSSES.get((pair, index))
                    assert exception and card['t'] == exception[0], ('Numerical meaning left outside numbers without review', pair, index, card['t'], label)
                    lexical_exceptions.append({'pair': pair, 'sourceIndex': index,
                        'sourceSha256': sha(card), 'study': card['t'], 'reason': exception[1]})
                continue
            if label in CARDINALS:
                kind, value = 'cardinal', CARDINALS[label]
                level = 1 if value <= 10 else 2 if value <= 100 else 3 if value <= 1000 else 4
                order = [0, value]
            elif label in ORDINALS:
                kind, value, level = 'ordinal', ORDINALS[label], 2
                order = [1, value]
            elif label in FRACTIONS:
                kind, value, level = 'fraction', list(FRACTIONS[label]), 3
                order = [2, value[1]]
            elif label in APPROXIMATIONS:
                kind, value, level = 'approximate-quantity', APPROXIMATIONS[label], 4
                order = [3, value]
            elif label in COLLECTIVE_QUANTITIES:
                kind, value, level = 'collective-quantity', COLLECTIVE_QUANTITIES[label], 4
                order = [3, value]
            elif label in MULTIPLIERS:
                kind, value, level = 'multiplier', MULTIPLIERS[label], 3
                order = [4, value]
            else:
                raise ValueError(f'Unreviewed numerical meaning: {pair}:{index}:{label}')
            mapping = {'study': 't', 'native': 'cn' if language == 'fr' else 'frm',
                       'phon': 'phon' if language == 'fr' else 'phf' if language == 'zh' else 'pf'}
            if language in ('zh', 'ja', 'ko'):
                mapping['reading'] = 'py'
            fields = {field: card[original] for field, original in mapping.items()}
            item = {'pair': pair, 'sourceIndex': index, 'sourceLevel': card['lv'],
                    'sourceSha256': sha(card), 'proposedLevel': level,
                    'contentType': 'number', 'numberKind': kind, 'numberValue': value,
                    'numberOrder': order, 'reviewStatus': 'reviewed', **fields,
                    'reason': 'Première rencontre numérique cohérente : 1–10 en L1 ; nombres composés, dizaines et premiers ordinaux en L2 ; grands nombres et fractions en L3 ; million et groupes de quantité en L4. Une douzaine désigne un lot de douze, sans imposer une approximation. Chaque forme source est apprise entière, sans règle de construction universelle.'}
            item['lexicalConceptId'] = 'number:' + kind + ':' + ('/'.join(map(str, value)) if isinstance(value, list) else str(value))
            if language == 'ko':
                item['numberSystem'] = ('native-Korean' if kind == 'cardinal' and value < 100
                                        else 'Sino-Korean' if kind == 'cardinal' else 'whole-source-form')
            items.append(item)
            counts[level] += 1
        summaries.append({'pair': pair, 'firstEncountersByLevel': {str(k): v for k, v in sorted(counts.items())}})
    return {'version': 1, 'status': 'explicit-editorial-number-progression',
            'sourceDecksSha256': sha(decks), 'sourceLevelChanges': 0,
            'newPhonetics': 0, 'newStudyEntries': 0, 'publicationApproved': False,
            'notes': ['Source levels retain historical access; proposedLevel is editorial only.',
                      'Numerical order applies inside a theme; it does not imply that a learner has acquired earlier numbers.',
                      'Whole source pronunciation and reading are copied; Korean systems remain identified.',
                      'A dozen is a collective quantity of twelve; approximate quantities are recorded separately.',
                      'Missing numerals are not fabricated from other phonetic entries.'],
            'items': items, 'pairs': summaries, 'reviewedLexicalNumericGlosses': lexical_exceptions,
            'checks': {'sourceEntries': len(items),
                       'reviewedNonNumericGlossExceptions': len(lexical_exceptions),
                       'proposedLevelChangesFromSource': sum(row['proposedLevel'] != row['sourceLevel'] for row in items)}}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    data = make()
    content = json.dumps(data, ensure_ascii=False, indent=2) + '\n'
    if args.check:
        assert OUTPUT.read_text() == content, 'Out of date numerical progression'
    else:
        OUTPUT.parent.mkdir(parents=True, exist_ok=True)
        OUTPUT.write_text(content)
    print(json.dumps(data['checks']))


if __name__ == '__main__':
    main()
